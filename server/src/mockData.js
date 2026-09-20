export function createNewPresentation({ id, code, title, author }) {
  const presId = id || ('pres-' + Math.random().toString(36).substring(2, 9));
  const presCode = (code || ('IMS-' + Math.floor(100 + Math.random() * 900))).toUpperCase();
  const presTitle = title || 'Untitled Presentation';

  const pollId = 'poll-' + Math.random().toString(36).substring(2, 8);
  const quizId = 'quiz-' + Math.random().toString(36).substring(2, 8);

  return {
    id: presId,
    code: presCode,
    title: presTitle,
    author: author || 'Presenter',
    currentSlideIndex: 0,
    options: {
      showResultsOnPresentation: true,
      showInstructionsToJoin: true,
      lockResponses: false,
    },
    slides: [
      {
        id: "slide-1",
        title: presTitle,
        subtitle: "Welcome everyone! Scan the QR code or enter the room code to participate live from your phone.",
        layout: "title",
        tag: "WELCOME",
        notes: "Welcome audience and encourage everyone to scan the QR code.",
        background: "from-purple-900 via-indigo-900 to-slate-950",
      },
      {
        id: "slide-2",
        title: "Live Audience Poll",
        subtitle: "What is your main objective for today's session?",
        layout: "poll",
        tag: "LIVE POLL",
        pollId: pollId,
        notes: "Give audience 30 seconds to vote live on their smartphones.",
        background: "from-slate-900 via-purple-950 to-slate-900",
      },
      {
        id: "slide-3",
        title: "Key Performance & Metrics",
        subtitle: "Real-time engagement transformed into actionable insights.",
        layout: "stats",
        tag: "INSIGHTS",
        stats: [
          { value: "4.9★", label: "Audience Satisfaction" },
          { value: "95%", label: "Live Engagement" },
          { value: "100%", label: "Instant Sync" },
        ],
        notes: "Highlight key performance numbers and session achievements.",
        background: "from-purple-950 via-slate-900 to-indigo-950",
      },
      {
        id: "slide-4",
        title: "Interactive Challenge Quiz",
        subtitle: "Test attendee knowledge with real-time countdown and leaderboard!",
        layout: "quiz",
        tag: "LIVE QUIZ",
        quizId: quizId,
        notes: "Run countdown timer and reveal top score leaderboard.",
        background: "from-violet-950 via-slate-900 to-purple-900",
      },
      {
        id: "slide-5",
        title: "Open Audience Q&A Floor",
        subtitle: "Ask questions from your phone. Upvote the best questions to spotlight them on screen.",
        layout: "qa",
        tag: "OPEN Q&A",
        notes: "Pin popular audience questions directly to the main stage canvas.",
        background: "from-slate-950 via-purple-950 to-indigo-950",
      },
      {
        id: "slide-6",
        title: "Thank You & Session Wrap-Up",
        subtitle: "Keep your audiences engaged on every slide with imspresentation.",
        layout: "closing",
        tag: "CONCLUSION",
        notes: "Collect final feedback and export session report.",
        background: "from-purple-900 via-indigo-900 to-slate-900",
      }
    ],
    polls: {
      [pollId]: {
        id: pollId,
        slideId: "slide-2",
        question: "What is your main objective for today's session?",
        options: [
          { text: "Learn practical techniques", votes: 0 },
          { text: "Experience interactive tools", votes: 0 },
          { text: "Collaborate and share ideas", votes: 0 },
          { text: "Discover new features", votes: 0 },
        ],
        voters: {},
        active: true,
        showResults: true,
      }
    },
    quizzes: {
      [quizId]: {
        id: quizId,
        slideId: "slide-4",
        title: "Interactive Challenge Quiz",
        question: "Which feature best drives live audience interaction?",
        options: [
          { text: "Passive monologues", correct: false },
          { text: "Real-time polls, quizzes & Q&A", correct: true },
          { text: "Static PDF slides", correct: false },
          { text: "Email surveys after the talk", correct: false },
        ],
        active: true,
        timeLimit: 20,
        revealed: false,
        answers: {},
      }
    },
    questions: [],
    messages: [],
    subtitles: {
      text: "",
      isFinal: true,
      active: false,
    },
    reactions: {
      clap: 0,
      heart: 0,
      fire: 0,
      thumbsUp: 0,
    }
  };
}

export function createInitialPresentation() {
  return {
    id: "imspresentation",
    code: "IMSPRESENTATION",
    title: "How to Craft Good Presentation",
    author: "Alex Rivera",
    currentSlideIndex: 3, // Slide 4 like in the screenshot (4/17 or 4/7)
    options: {
      showResultsOnPresentation: true,
      showInstructionsToJoin: true,
      lockResponses: false,
    },
    slides: [
      {
        id: "slide-1",
        title: "How to Craft Good Presentation",
        subtitle: "Captivate your audience with real-time interactivity, instant feedback, and seamless live subtitles.",
        layout: "title",
        tag: "WELCOME",
        notes: "Welcome everyone, encourage scanning the QR code or visiting the join URL on phone.",
        background: "from-purple-900 via-indigo-900 to-slate-950",
      },
      {
        id: "slide-2",
        title: "Audience Pulse: What is your biggest challenge?",
        subtitle: "Pick what you find hardest when speaking or presenting to a group.",
        layout: "poll",
        tag: "LIVE POLL",
        pollId: "poll-1",
        notes: "Give audience 30 seconds to vote on mobile.",
        background: "from-slate-900 via-purple-950 to-slate-900",
      },
      {
        id: "slide-3",
        title: "Why Interactivity Transforms Presentations",
        subtitle: "Traditional monologues lose 70% of audience attention in the first 10 minutes.",
        layout: "stats",
        tag: "KEY INSIGHT",
        stats: [
          { value: "3.4x", label: "Higher Attention Span" },
          { value: "92%", label: "Audience Participation" },
          { value: "4.8★", label: "Average Session Rating" },
        ],
        notes: "Emphasize turning passive listeners into active participants.",
        background: "from-purple-950 via-slate-900 to-indigo-950",
      },
      {
        id: "slide-4",
        title: "Favorite New Feature?",
        subtitle: "Experience the next generation of presentation engagement tools.",
        layout: "poll",
        tag: "INTERACTIVE POLL",
        pollId: "poll-2",
        notes: "Demonstrate live updating bar graph on the big screen as votes pour in.",
        background: "from-slate-900 via-indigo-950 to-purple-950",
      },
      {
        id: "slide-5",
        title: "Quick Knowledge Check",
        subtitle: "Test what you've learned so far! Speed counts for bonus points.",
        layout: "quiz",
        tag: "LIVE QUIZ",
        quizId: "quiz-2",
        notes: "Watch the countdown timer and celebrate the leaderboard top 3!",
        background: "from-violet-950 via-slate-900 to-purple-900",
      },
      {
        id: "slide-6",
        title: "Open Audience Q&A Floor",
        subtitle: "Ask questions anonymously or with your name. Upvote the best questions to spotlight them on screen.",
        layout: "qa",
        tag: "OPEN Q&A",
        notes: "Pin popular questions onto the presentation canvas using the presenter dashboard.",
        background: "from-slate-950 via-purple-950 to-indigo-950",
      },
      {
        id: "slide-7",
        title: "Thank You & Session Wrap-Up",
        subtitle: "Keep your audiences engaged on every slide with imspresentation.",
        layout: "closing",
        tag: "CONCLUSION",
        notes: "Collect final feedback and export session report.",
        background: "from-purple-900 via-indigo-900 to-slate-900",
      }
    ],
    polls: {
      "poll-1": {
        id: "poll-1",
        slideId: "slide-2",
        question: "What is your biggest challenge when presenting?",
        options: [
          { text: "Keeping audience attention", votes: 8 },
          { text: "Getting genuine questions", votes: 14 },
          { text: "Knowing if people understand", votes: 19 },
          { text: "Time management", votes: 5 },
        ],
        voters: {},
        active: true,
        showResults: true,
      },
      "poll-2": {
        id: "poll-2",
        slideId: "slide-4",
        question: "Favorite new feature?",
        options: [
          { text: "Real-time Live Subtitles", votes: 28 },
          { text: "Interactive Live Polls", votes: 42 },
          { text: "Timed Quizzes & Leaderboard", votes: 35 },
          { text: "Audience Q&A with Upvoting", votes: 51 },
        ],
        voters: {},
        active: true,
        showResults: true,
      }
    },
    quizzes: {
      "quiz-1": {
        id: "quiz-1",
        slideId: "slide-4",
        title: "Quick knowledge check",
        question: "How much higher is engagement when using interactive slides?",
        options: [
          { text: "15% increase", correct: false },
          { text: "50% increase", correct: false },
          { text: "Over 3x increase", correct: true },
          { text: "No difference", correct: false },
        ],
        active: false,
        timeLimit: 15,
        revealed: false,
        answers: {},
      },
      "quiz-2": {
        id: "quiz-2",
        slideId: "slide-5",
        title: "Interactive Retention Test",
        question: "What percentage of lecture content is forgotten after 24 hours without engagement?",
        options: [
          { text: "Around 20%", correct: false },
          { text: "Around 40%", correct: false },
          { text: "Up to 70%", correct: true },
          { text: "100%", correct: false },
        ],
        active: true,
        timeLimit: 20,
        revealed: false,
        answers: {
          "user-1": { optionIndex: 2, isCorrect: true, name: "Jordan Lee", score: 95 },
          "user-2": { optionIndex: 2, isCorrect: true, name: "Sarah Chen", score: 88 },
          "user-3": { optionIndex: 1, isCorrect: false, name: "Anonymous", score: 0 },
        },
      }
    },
    questions: [
      {
        id: "q-1",
        text: "Will the slides and recorded live transcript be shared after the session?",
        author: "Sarah Chen",
        time: "10:14 AM",
        upvotes: 14,
        upvotedBy: ["sarah-chen"],
        pinned: true,
        answered: false,
      },
      {
        id: "q-2",
        text: "I'd add that this is a great way to show real-time progress during team standups!",
        author: "Anonymous",
        time: "10:15 AM",
        upvotes: 9,
        upvotedBy: [],
        pinned: false,
        answered: false,
      },
      {
        id: "q-3",
        text: "This talk completely changed how I think about onboarding flows! 🔥",
        author: "Jordan Lee",
        time: "10:16 AM",
        upvotes: 21,
        upvotedBy: [],
        pinned: false,
        answered: false,
      },
      {
        id: "q-4",
        text: "How does the live subtitles feature handle noisy room environments or accents?",
        author: "Devon M.",
        time: "10:18 AM",
        upvotes: 12,
        upvotedBy: [],
        pinned: false,
        answered: false,
      }
    ],
    messages: [
      {
        id: "m-1",
        text: "Welcome everyone! Feel free to ask questions or drop comments here anytime.",
        author: "Alex Rivera (Host)",
        time: "10:10 AM",
        isPresenter: true,
      },
      {
        id: "m-2",
        text: "Testing mobile connection from London - works smoothly!",
        author: "Elena Rostova",
        time: "10:12 AM",
        isPresenter: false,
      },
      {
        id: "m-3",
        text: "Loving the live animations on the presentation screen!",
        author: "Marcus T.",
        time: "10:14 AM",
        isPresenter: false,
      }
    ],
    subtitles: {
      text: "Welcome everyone! Today we're exploring how real-time interactions turn passive listeners into an engaged community.",
      isFinal: true,
      active: false,
    },
    reactions: {
      clap: 432,
      heart: 388,
      fire: 245,
      thumbsUp: 151,
    }
  };
}
