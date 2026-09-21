import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInitialPresentation, createNewPresentation } from './mockData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(clientDistPath));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

import fs from 'fs';
import { 
  initDb, 
  getUserPresentations, 
  createPresentation, 
  deletePresentation,
  getPresentationByIdOrCode, 
  savePresentationState 
} from './db.js';
import { 
  handleRegister, 
  handleLogin, 
  handleGetMe, 
  authMiddleware,
  generateToken
} from './auth.js';

// Initialize Database (Neon PostgreSQL or local fallback)
initDb().catch(console.error);

// Presentation room cache
const rooms = new Map();

async function getRoom(roomId = "imspresentation") {
  if (!roomId) roomId = "imspresentation";
  const normalizedId = roomId.toLowerCase();

  // 1. Check in-memory cache
  if (rooms.has(normalizedId)) {
    return rooms.get(normalizedId);
  }

  // 2. Query Database (Neon or fallback)
  try {
    const fromDb = await getPresentationByIdOrCode(normalizedId);
    if (fromDb) {
      rooms.set(fromDb.id.toLowerCase(), fromDb);
      if (fromDb.code) rooms.set(fromDb.code.toLowerCase(), fromDb);
      return fromDb;
    }
  } catch (e) {
    console.error("DB lookup error in getRoom:", e.message);
  }

  // 3. Demo template ONLY for "imspresentation"
  if (normalizedId === "imspresentation") {
    const demo = createInitialPresentation();
    rooms.set("imspresentation", demo);
    return demo;
  }

  // 4. Default fresh presentation with the requested code
  const fresh = createNewPresentation({
    id: normalizedId,
    code: normalizedId.toUpperCase(),
    title: 'New Presentation'
  });
  rooms.set(normalizedId, fresh);
  return fresh;
}

function getOrCreateRoom(roomId = "imspresentation") {
  const normalizedId = (roomId || "imspresentation").toLowerCase();
  if (rooms.has(normalizedId)) {
    return rooms.get(normalizedId);
  }

  if (normalizedId === "imspresentation") {
    const initial = createInitialPresentation();
    rooms.set(normalizedId, initial);
    return initial;
  }

  const fresh = createNewPresentation({
    id: normalizedId,
    code: normalizedId.toUpperCase(),
    title: 'New Presentation'
  });
  rooms.set(normalizedId, fresh);
  return fresh;
}

function persistRooms(roomId) {
  if (!roomId) return;
  const room = rooms.get(roomId.toLowerCase());
  if (room) {
    savePresentationState(room.id, room);
  }
}

// REST Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth Routes
app.post('/api/auth/register', handleRegister);
app.post('/api/auth/login', handleLogin);
app.get('/api/auth/me', authMiddleware, handleGetMe);
app.get('/api/auth/session', (req, res) => {
  res.status(401).json({ authenticated: false, message: 'Please sign in with your IMS account.' });
});

// User Presentations Dashboard Routes
app.get('/api/presentations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const list = await getUserPresentations(userId);
    const token = generateToken(req.user);
    res.json({ presentations: list, token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/presentations', authMiddleware, async (req, res) => {
  try {
    const { title, code, template = 'blank' } = req.body;
    const userId = req.user?.id || 1;
    const authorName = req.user?.name || 'Presenter';

    const newDeck = createNewPresentation({
      title: title || 'Untitled Presentation',
      code: code || undefined,
      author: authorName,
      template: template
    });

    const saved = await createPresentation({ userId, presentation: newDeck });
    rooms.set(saved.id.toLowerCase(), saved);
    rooms.set(saved.code.toLowerCase(), saved);
    const token = generateToken(req.user || { id: userId, name: authorName });
    res.status(201).json({ presentation: saved, token });
  } catch (e) {
    console.error("Create presentation error:", e);
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/presentations/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    await deletePresentation(id, req.user.id);
    rooms.delete(id.toLowerCase());
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/presentation/:roomId', async (req, res) => {
  const idOrCode = req.params.roomId;
  let room = rooms.get(idOrCode.toLowerCase());
  if (!room) {
    const fromDb = await getPresentationByIdOrCode(idOrCode);
    if (fromDb) {
      room = fromDb;
      rooms.set(room.id.toLowerCase(), room);
      rooms.set(room.code.toLowerCase(), room);
    } else {
      room = getOrCreateRoom(idOrCode);
    }
  }
  res.json(room);
});

// Downloadable Report (CSV or JSON)
app.get('/api/presentation/:roomId/export', (req, res) => {
  const room = getOrCreateRoom(req.params.roomId);
  const format = req.query.format || 'json';

  if (format === 'csv') {
    let csv = "CATEGORY,ITEM,DETAIL_1,DETAIL_2,VALUE\n";
    // Questions
    room.questions.forEach(q => {
      const sanitizedText = `"${(q.text || '').replace(/"/g, '""')}"`;
      csv += `Question,"${q.author}",${sanitizedText},${q.time},${q.upvotes} upvotes\n`;
    });
    // Polls
    Object.values(room.polls || {}).forEach(poll => {
      poll.options.forEach((opt, idx) => {
        csv += `Poll,"${poll.question}","Option ${idx + 1}: ${opt.text}",-,${opt.votes || 0} votes\n`;
      });
    });
    // Reactions
    Object.entries(room.reactions || {}).forEach(([reaction, count]) => {
      csv += `Reaction,${reaction},-,-,${count}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${room.id}-session-report.csv"`);
    return res.send(csv);
  }

  res.setHeader('Content-Disposition', `attachment; filename="${room.id}-session-report.json"`);
  res.json({
    exportedAt: new Date().toISOString(),
    presentationTitle: room.title,
    code: room.code,
    totalQuestions: room.questions.length,
    questions: room.questions,
    polls: room.polls,
    quizzes: room.quizzes,
    reactions: room.reactions
  });
});

// Socket.io Real-time Event Handlers
io.on('connection', (socket) => {
  let currentRoomId = null;
  let userRole = 'audience'; // 'presenter' | 'audience' | 'display'
  let userName = 'Anonymous';

  socket.on('join-room', async ({ roomId = 'imspresentation', role = 'audience', name = 'Guest' }) => {
    const newRoomId = (roomId || 'imspresentation').toLowerCase();

    // If socket was already joined to a different room, leave it properly
    if (currentRoomId && currentRoomId !== newRoomId) {
      socket.leave(currentRoomId);
      const oldRoomSockets = io.sockets.adapter.rooms.get(currentRoomId);
      io.to(currentRoomId).emit('audience-count-updated', {
        count: oldRoomSockets ? oldRoomSockets.size : 0
      });
    }

    currentRoomId = newRoomId;
    userRole = role;
    userName = name;
    socket.join(currentRoomId);

    const room = await getRoom(currentRoomId);

    // Broadcast updated presence count
    const roomSockets = io.sockets.adapter.rooms.get(currentRoomId);
    const participantCount = roomSockets ? roomSockets.size : 1;

    // Send initial snapshot to joining client
    socket.emit('sync-state', room);

    // Notify room about participant count change
    io.to(currentRoomId).emit('audience-count-updated', {
      count: participantCount,
      joinedUser: { name: userName, role: userRole }
    });
  });

  // Update presentation title
  socket.on('update-presentation-title', ({ roomId, title }) => {
    if (!title || !title.trim()) return;
    const room = getOrCreateRoom(roomId);
    room.title = title.trim();
    if (room.slides && room.slides[0] && room.slides[0].layout === 'title') {
      room.slides[0].title = title.trim();
    }
    io.to((roomId || '').toLowerCase()).emit('presentation-title-updated', { title: room.title });
    persistRooms(roomId);
  });

  // Slide navigation
  socket.on('change-slide', ({ roomId, slideIndex }) => {
    const room = getOrCreateRoom(roomId);
    if (slideIndex >= 0 && slideIndex < room.slides.length) {
      room.currentSlideIndex = slideIndex;
      io.to(roomId.toLowerCase()).emit('slide-changed', {
        currentSlideIndex: room.currentSlideIndex,
        slide: room.slides[room.currentSlideIndex]
      });
      persistRooms(roomId);
    }
  });

  // Add new slide
  socket.on('add-slide', ({ roomId, slide }) => {
    const room = getOrCreateRoom(roomId);
    if (!room.slides) room.slides = [];

    const newSlideId = 'slide-' + Date.now();
    const newSlide = {
      id: newSlideId,
      title: slide?.title || `Slide #${room.slides.length + 1}`,
      subtitle: slide?.subtitle || '',
      layout: slide?.layout || 'title',
      tag: slide?.tag || (slide?.layout || 'content').toUpperCase(),
      notes: slide?.notes || '',
      background: slide?.background || 'from-purple-900 via-indigo-900 to-slate-950',
      ...slide
    };

    if (slide?.poll) {
      const pollId = 'poll-' + Date.now();
      newSlide.pollId = pollId;
      if (!room.polls) room.polls = {};
      room.polls[pollId] = {
        id: pollId,
        slideId: newSlideId,
        question: slide.poll.question || slide.title,
        options: slide.poll.options || [
          { text: 'Option A', votes: 0 },
          { text: 'Option B', votes: 0 }
        ],
        voters: {},
        active: true,
        showResults: true
      };
    }

    if (slide?.quiz) {
      const quizId = 'quiz-' + Date.now();
      newSlide.quizId = quizId;
      if (!room.quizzes) room.quizzes = {};
      room.quizzes[quizId] = {
        id: quizId,
        slideId: newSlideId,
        title: slide.quiz.title || slide.title,
        question: slide.quiz.question || slide.title,
        options: slide.quiz.options || [
          { text: 'Option 1', correct: true },
          { text: 'Option 2', correct: false }
        ],
        active: true,
        timeLimit: slide.quiz.timeLimit || 20,
        revealed: false,
        answers: {}
      };
    }

    room.slides.push(newSlide);
    room.currentSlideIndex = room.slides.length - 1;

    io.to(roomId.toLowerCase()).emit('slide-list-updated', {
      slides: room.slides,
      currentSlideIndex: room.currentSlideIndex,
      polls: room.polls,
      quizzes: room.quizzes
    });
    persistRooms(roomId);
  });

  // Delete slide
  socket.on('delete-slide', ({ roomId, slideIndex, slideId }) => {
    const room = getOrCreateRoom(roomId);
    if (!room.slides || room.slides.length === 0) return;

    let targetIndex = slideIndex;
    if (slideId) {
      const found = room.slides.findIndex(s => s.id === slideId);
      if (found >= 0) targetIndex = found;
    }

    if (targetIndex >= 0 && targetIndex < room.slides.length) {
      const removed = room.slides.splice(targetIndex, 1)[0];
      if (removed) {
        if (removed.pollId && room.polls) delete room.polls[removed.pollId];
        if (removed.quizId && room.quizzes) delete room.quizzes[removed.quizId];
      }

      if (room.slides.length === 0) {
        room.slides.push({
          id: 'slide-1',
          title: room.title || 'Untitled Presentation',
          subtitle: 'Welcome to the presentation',
          layout: 'title',
          tag: 'WELCOME',
          background: 'from-purple-900 via-indigo-900 to-slate-950'
        });
        room.currentSlideIndex = 0;
      } else {
        if (room.currentSlideIndex >= room.slides.length) {
          room.currentSlideIndex = room.slides.length - 1;
        }
      }

      io.to(roomId.toLowerCase()).emit('slide-list-updated', {
        slides: room.slides,
        currentSlideIndex: room.currentSlideIndex,
        polls: room.polls,
        quizzes: room.quizzes
      });
      persistRooms(roomId);
    }
  });

  // Update slide background theme
  socket.on('update-slide-background', ({ roomId, slideIndex, slideId, background, applyToAll }) => {
    const room = getOrCreateRoom(roomId);
    if (!room.slides || room.slides.length === 0) return;

    if (applyToAll) {
      room.slides.forEach((s) => {
        s.background = background;
      });
      room.theme = { ...(room.theme || {}), background };
    } else {
      let targetIndex = slideIndex;
      if (slideId) {
        const found = room.slides.findIndex((s) => s.id === slideId);
        if (found >= 0) targetIndex = found;
      }
      if (targetIndex >= 0 && targetIndex < room.slides.length) {
        room.slides[targetIndex].background = background;
      }
    }

    io.to(roomId.toLowerCase()).emit('slide-list-updated', {
      slides: room.slides,
      currentSlideIndex: room.currentSlideIndex,
      polls: room.polls,
      quizzes: room.quizzes,
      theme: room.theme
    });
    persistRooms(roomId);
  });

  // Presentation option toggles
  socket.on('toggle-option', ({ roomId, key, value }) => {
    const room = getOrCreateRoom(roomId);
    if (room.options && key in room.options) {
      room.options[key] = value;
      io.to(roomId.toLowerCase()).emit('options-updated', room.options);
    }
  });

  // Toggle interaction on current slide
  socket.on('toggle-interaction', ({ roomId, type, id, active }) => {
    const room = getOrCreateRoom(roomId);
    if (type === 'poll' && room.polls[id]) {
      room.polls[id].active = active;
      io.to(roomId.toLowerCase()).emit('poll-updated', room.polls[id]);
    } else if (type === 'quiz' && room.quizzes[id]) {
      room.quizzes[id].active = active;
      io.to(roomId.toLowerCase()).emit('quiz-updated', room.quizzes[id]);
    }
  });

  // Submit poll vote
  socket.on('submit-vote', ({ roomId, pollId, optionIndex, voterId, voterName }) => {
    const room = getOrCreateRoom(roomId);
    const poll = room.polls[pollId];
    if (poll && !room.options.lockResponses) {
      if (!poll.voters) poll.voters = {};
      const previousVote = poll.voters[voterId];

      // If user already voted for this option, ignore
      if (previousVote === optionIndex) return;

      // Adjust counts
      if (previousVote !== undefined && poll.options[previousVote]) {
        poll.options[previousVote].votes = Math.max(0, poll.options[previousVote].votes - 1);
      }
      if (poll.options[optionIndex]) {
        poll.options[optionIndex].votes += 1;
        poll.voters[voterId] = optionIndex;
      }

      io.to(roomId.toLowerCase()).emit('poll-updated', poll);
      persistRooms();
    }
  });

  // Submit quiz answer
  socket.on('submit-quiz-answer', ({ roomId, quizId, optionIndex, voterId, voterName, responseTimeMs }) => {
    const room = getOrCreateRoom(roomId);
    const quiz = room.quizzes[quizId];
    if (quiz && !room.options.lockResponses) {
      if (!quiz.answers) quiz.answers = {};
      const isCorrect = quiz.options[optionIndex]?.correct || false;
      const score = isCorrect ? Math.max(10, Math.round(100 - (responseTimeMs / 200))) : 0;

      quiz.answers[voterId] = {
        optionIndex,
        isCorrect,
        name: voterName || 'Anonymous',
        score,
        time: Date.now()
      };

      io.to(roomId.toLowerCase()).emit('quiz-updated', quiz);
      persistRooms();
    }
  });

  // Reveal quiz results
  socket.on('reveal-quiz', ({ roomId, quizId, revealed }) => {
    const room = getOrCreateRoom(roomId);
    const quiz = room.quizzes[quizId];
    if (quiz) {
      quiz.revealed = revealed !== undefined ? revealed : true;
      io.to(roomId.toLowerCase()).emit('quiz-updated', quiz);
      persistRooms();
    }
  });

  // Questions and Q&A
  socket.on('submit-question', ({ roomId, text, author, isAnonymous }) => {
    const room = getOrCreateRoom(roomId);
    const newQuestion = {
      id: 'q-' + Date.now(),
      text,
      author: isAnonymous ? 'Anonymous' : (author || 'Participant'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      upvotes: 1,
      upvotedBy: [socket.id],
      pinned: false,
      answered: false,
    };
    room.questions.unshift(newQuestion);
    io.to(roomId.toLowerCase()).emit('question-added', newQuestion);
    persistRooms();
  });

  socket.on('upvote-question', ({ roomId, questionId, voterId }) => {
    const room = getOrCreateRoom(roomId);
    const q = room.questions.find(item => item.id === questionId);
    if (q) {
      if (!q.upvotedBy) q.upvotedBy = [];
      const hasUpvoted = q.upvotedBy.includes(voterId || socket.id);
      if (hasUpvoted) {
        q.upvotes = Math.max(0, q.upvotes - 1);
        q.upvotedBy = q.upvotedBy.filter(id => id !== (voterId || socket.id));
      } else {
        q.upvotes += 1;
        q.upvotedBy.push(voterId || socket.id);
      }
      io.to(roomId.toLowerCase()).emit('question-updated', q);
    }
  });

  socket.on('pin-question', ({ roomId, questionId, pinned }) => {
    const room = getOrCreateRoom(roomId);
    // Unpin other questions if this is pinned
    room.questions.forEach(q => {
      if (q.id === questionId) {
        q.pinned = pinned;
      } else if (pinned) {
        q.pinned = false;
      }
    });
    io.to(roomId.toLowerCase()).emit('questions-synced', room.questions);
  });

  socket.on('answer-question', ({ roomId, questionId, answered = true }) => {
    const room = getOrCreateRoom(roomId);
    const q = room.questions.find(item => item.id === questionId);
    if (q) {
      q.answered = answered;
      if (answered) q.pinned = false;
      io.to(roomId.toLowerCase()).emit('question-updated', q);
    }
  });

  socket.on('delete-question', ({ roomId, questionId }) => {
    const room = getOrCreateRoom(roomId);
    room.questions = room.questions.filter(q => q.id !== questionId);
    io.to(roomId.toLowerCase()).emit('questions-synced', room.questions);
  });

  // Audience Chat Messages
  socket.on('send-message', ({ roomId, text, author, isPresenter }) => {
    const room = getOrCreateRoom(roomId);
    const msg = {
      id: 'm-' + Date.now(),
      text,
      author: author || (isPresenter ? 'Presenter' : 'Audience Member'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isPresenter: !!isPresenter
    };
    room.messages.push(msg);
    io.to(roomId.toLowerCase()).emit('message-added', msg);
  });

  // Live Speech Transcription / Subtitles Relay
  socket.on('send-subtitle', ({ roomId, text, isFinal, active }) => {
    const room = getOrCreateRoom(roomId);
    room.subtitles = {
      text,
      isFinal: !!isFinal,
      active: active !== undefined ? active : true,
      timestamp: Date.now()
    };
    io.to(roomId.toLowerCase()).emit('subtitles-updated', room.subtitles);
  });

  socket.on('toggle-subtitles', ({ roomId, active }) => {
    const room = getOrCreateRoom(roomId);
    room.subtitles.active = active;
    io.to(roomId.toLowerCase()).emit('subtitles-updated', room.subtitles);
  });

  // Real-time floating reactions
  socket.on('send-reaction', ({ roomId, emoji = '👏' }) => {
    const room = getOrCreateRoom(roomId);
    const keyMap = { '👏': 'clap', '❤️': 'heart', '🔥': 'fire', '👍': 'thumbsUp' };
    const key = keyMap[emoji] || 'clap';
    if (room.reactions[key] !== undefined) {
      room.reactions[key] += 1;
    }
    // Broadcast burst to presentation display and presenter studio
    io.to(roomId.toLowerCase()).emit('reaction-burst', {
      emoji,
      id: Math.random().toString(36).substring(2, 9),
      total: room.reactions[key]
    });
  });

  // Add / Edit slides dynamically
  socket.on('add-slide', ({ roomId, slide = {} }) => {
    const room = getOrCreateRoom(roomId);
    const newSlideId = 'slide-' + (room.slides.length + 1) + '-' + Date.now().toString(36);
    const newSlide = {
      id: newSlideId,
      title: slide.title || 'New Interactive Slide',
      subtitle: slide.subtitle || 'Ask questions or present content',
      layout: slide.layout || 'title',
      tag: (slide.tag || slide.layout || 'SLIDE').toUpperCase(),
      notes: slide.notes || '',
      background: slide.background || 'from-purple-950 via-slate-900 to-indigo-950',
    };

    if (slide.layout === 'poll') {
      const pollId = 'poll-' + Date.now();
      newSlide.pollId = pollId;
      const pollData = slide.poll || {};
      const rawOptions = pollData.options || slide.options || [
        { text: 'Option A', votes: 0 },
        { text: 'Option B', votes: 0 },
        { text: 'Option C', votes: 0 },
      ];
      room.polls[pollId] = {
        id: pollId,
        slideId: newSlideId,
        question: pollData.question || slide.question || newSlide.title,
        options: rawOptions.map(t => typeof t === 'string' ? { text: t, votes: 0 } : (t.votes !== undefined ? t : { text: t.text, votes: 0 })),
        voters: {},
        active: true,
        showResults: true,
      };
    } else if (slide.layout === 'quiz') {
      const quizId = 'quiz-' + Date.now();
      newSlide.quizId = quizId;
      const quizData = slide.quiz || {};
      const rawOptions = quizData.options || slide.options || [
        { text: 'Choice 1', correct: false },
        { text: 'Choice 2 (Correct)', correct: true },
        { text: 'Choice 3', correct: false },
      ];
      room.quizzes[quizId] = {
        id: quizId,
        slideId: newSlideId,
        title: quizData.title || slide.title || 'Quiz Question',
        question: quizData.question || slide.question || newSlide.title,
        options: rawOptions.map(t => typeof t === 'string' ? { text: t, correct: false } : t),
        active: true,
        timeLimit: quizData.timeLimit || slide.timeLimit || 20,
        revealed: false,
        answers: {},
      };
    }

    room.slides.push(newSlide);
    room.currentSlideIndex = room.slides.length - 1; // Move to the new slide immediately

    io.to(roomId.toLowerCase()).emit('slide-list-updated', {
      slides: room.slides,
      currentSlideIndex: room.currentSlideIndex,
      polls: room.polls,
      quizzes: room.quizzes
    });
    persistRooms(roomId);
  });

  // Delete / Remove slide
  socket.on('delete-slide', ({ roomId, slideIndex, slideId }) => {
    const room = getOrCreateRoom(roomId);
    if (!room.slides || room.slides.length === 0) return;

    let targetIdx = slideIndex;
    if (slideId) {
      const found = room.slides.findIndex(s => s.id === slideId);
      if (found !== -1) targetIdx = found;
    }

    if (targetIdx >= 0 && targetIdx < room.slides.length) {
      const removedSlide = room.slides[targetIdx];
      // Clean up associated poll or quiz
      if (removedSlide.pollId && room.polls[removedSlide.pollId]) {
        delete room.polls[removedSlide.pollId];
      }
      if (removedSlide.quizId && room.quizzes[removedSlide.quizId]) {
        delete room.quizzes[removedSlide.quizId];
      }

      room.slides.splice(targetIdx, 1);

      // If all slides are deleted, maintain at least one default clean slide
      if (room.slides.length === 0) {
        room.slides.push({
          id: 'slide-1',
          title: 'Welcome to the Presentation',
          subtitle: 'Click + in the slide navigator to add interactive polls and quizzes',
          layout: 'title',
          tag: 'WELCOME',
        });
      }

      // Keep currentSlideIndex in valid bounds
      if (room.currentSlideIndex >= room.slides.length) {
        room.currentSlideIndex = Math.max(0, room.slides.length - 1);
      }

      io.to(roomId.toLowerCase()).emit('slide-list-updated', {
        slides: room.slides,
        currentSlideIndex: room.currentSlideIndex,
        polls: room.polls,
        quizzes: room.quizzes
      });
      persistRooms(roomId);
    }
  });

  socket.on('disconnect', () => {
    if (currentRoomId) {
      const roomSockets = io.sockets.adapter.rooms.get(currentRoomId);
      const participantCount = roomSockets ? roomSockets.size : 0;
      io.to(currentRoomId).emit('audience-count-updated', {
        count: participantCount
      });
    }
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`imspresentation Server running on http://localhost:${PORT}`);
});
