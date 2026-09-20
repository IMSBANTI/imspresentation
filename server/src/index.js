import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInitialPresentation } from './mockData.js';

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

// Presentation room storage
const rooms = new Map();

function getOrCreateRoom(roomId = "claper") {
  const normalizedId = roomId.toLowerCase();
  if (!rooms.has(normalizedId)) {
    rooms.set(normalizedId, createInitialPresentation());
  }
  return rooms.get(normalizedId);
}

// REST Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/presentation/:roomId', (req, res) => {
  const room = getOrCreateRoom(req.params.roomId);
  res.json(room);
});

// Socket.io Real-time Event Handlers
io.on('connection', (socket) => {
  let currentRoomId = null;
  let userRole = 'audience'; // 'presenter' | 'audience' | 'display'
  let userName = 'Anonymous';

  socket.on('join-room', ({ roomId = 'claper', role = 'audience', name = 'Guest' }) => {
    currentRoomId = roomId.toLowerCase();
    userRole = role;
    userName = name;
    socket.join(currentRoomId);

    const room = getOrCreateRoom(currentRoomId);

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

  // Slide navigation
  socket.on('change-slide', ({ roomId, slideIndex }) => {
    const room = getOrCreateRoom(roomId);
    if (slideIndex >= 0 && slideIndex < room.slides.length) {
      room.currentSlideIndex = slideIndex;
      io.to(roomId.toLowerCase()).emit('slide-changed', {
        currentSlideIndex: room.currentSlideIndex,
        slide: room.slides[room.currentSlideIndex]
      });
    }
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
    }
  });

  // Reveal quiz results
  socket.on('reveal-quiz', ({ roomId, quizId, revealed }) => {
    const room = getOrCreateRoom(roomId);
    const quiz = room.quizzes[quizId];
    if (quiz) {
      quiz.revealed = revealed !== undefined ? revealed : true;
      io.to(roomId.toLowerCase()).emit('quiz-updated', quiz);
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
  socket.on('add-slide', ({ roomId, slide }) => {
    const room = getOrCreateRoom(roomId);
    const newSlide = {
      id: 'slide-' + (room.slides.length + 1),
      title: slide.title || 'New Interactive Slide',
      subtitle: slide.subtitle || 'Add engagement interactions here',
      layout: slide.layout || 'title',
      tag: slide.tag || 'NEW SLIDE',
      notes: slide.notes || '',
      background: 'from-purple-950 via-slate-900 to-indigo-950',
    };
    room.slides.push(newSlide);
    io.to(roomId.toLowerCase()).emit('slide-list-updated', {
      slides: room.slides,
      currentSlideIndex: room.currentSlideIndex
    });
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
  console.log(`Claper Server running on http://localhost:${PORT}`);
});
