import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import PresenterStudio from './components/PresenterStudio';
import PresentationDisplay from './components/PresentationDisplay';
import AudienceMobile from './components/AudienceMobile';
import DashboardView from './components/DashboardView';
import AuthModal from './components/AuthModal';
import { Laptop, Tv, Smartphone, Layers } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState('studio'); // 'dashboard' | 'studio' | 'present' | 'audience'
  const [presentation, setPresentation] = useState(null);
  const [audienceCount, setAudienceCount] = useState(1);
  const [reactions, setReactions] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [roomId, setRoomId] = useState('imspresentation');
  
  // Auth state
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userPresentations, setUserPresentations] = useState([]);

  const refreshUserPresentations = async () => {
    const token = localStorage.getItem('ims_token');
    const headers = {};
    if (token && token !== 'null' && token !== 'undefined') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    try {
      const res = await fetch('/api/presentations', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.token && (!token || token === 'null' || token === 'undefined')) {
          localStorage.setItem('ims_token', data.token);
        }
        setUserPresentations(data.presentations || []);
      }
    } catch (e) {
      console.error('Error fetching user presentations:', e);
    }
  };

  // Check URL params for view mode and room
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const room = params.get('room');

    if (room) {
      setRoomId(room);
    }
    if (view && ['dashboard', 'studio', 'present', 'audience'].includes(view)) {
      setViewMode(view);
    }
  }, []);

  // Check user token on mount
  useEffect(() => {
    const token = localStorage.getItem('ims_token');
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const room = params.get('room');

    if (token && token !== 'null' && token !== 'undefined') {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data && data.user) {
            setUser(data.user);
            if (data.token) localStorage.setItem('ims_token', data.token);
            refreshUserPresentations();
            if (!view && !room) {
              setViewMode('dashboard');
            }
          } else {
            localStorage.removeItem('ims_token');
            setUser(null);
            if (!view && !room) {
              setShowAuthModal(true);
            }
          }
        })
        .catch(() => {
          setUser(null);
          if (!view && !room) {
            setShowAuthModal(true);
          }
        });
    } else {
      setUser(null);
      if (!view && !room) {
        setShowAuthModal(true);
      }
    }
  }, []);

  // Connect to room via Socket.io
  useEffect(() => {
    if (!roomId) return;

    socket.emit('join-room', {
      roomId,
      role: viewMode === 'present' ? 'display' : (viewMode === 'audience' ? 'audience' : 'presenter'),
      name: user?.name || (viewMode === 'audience' ? 'Mobile Guest' : 'Host')
    });

    socket.on('sync-state', (state) => {
      setPresentation(state);
    });

    socket.on('audience-count-updated', ({ count }) => {
      setAudienceCount(count || 1); // exact live connected participant count
    });

    socket.on('slide-changed', ({ currentSlideIndex }) => {
      setPresentation((prev) => prev ? { ...prev, currentSlideIndex } : prev);
    });

    socket.on('options-updated', (options) => {
      setPresentation((prev) => prev ? { ...prev, options } : prev);
    });

    socket.on('poll-updated', (updatedPoll) => {
      setPresentation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          polls: {
            ...prev.polls,
            [updatedPoll.id]: updatedPoll
          }
        };
      });
    });

    socket.on('quiz-updated', (updatedQuiz) => {
      setPresentation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          quizzes: {
            ...prev.quizzes,
            [updatedQuiz.id]: updatedQuiz
          }
        };
      });
    });

    socket.on('question-added', (newQuestion) => {
      setPresentation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: [newQuestion, ...prev.questions]
        };
      });
    });

    socket.on('question-updated', (updatedQuestion) => {
      setPresentation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: prev.questions.map((q) => q.id === updatedQuestion.id ? updatedQuestion : q)
        };
      });
    });

    socket.on('questions-synced', (questions) => {
      setPresentation((prev) => prev ? { ...prev, questions } : prev);
    });

    socket.on('slide-list-updated', ({ slides, currentSlideIndex, polls, quizzes }) => {
      setPresentation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          slides,
          currentSlideIndex: currentSlideIndex !== undefined ? currentSlideIndex : prev.currentSlideIndex,
          polls: polls || prev.polls,
          quizzes: quizzes || prev.quizzes
        };
      });
    });

    socket.on('subtitles-updated', (subtitles) => {
      setPresentation((prev) => prev ? { ...prev, subtitles } : prev);
    });

    socket.on('presentation-title-updated', ({ title }) => {
      setPresentation((prev) => prev ? { ...prev, title } : prev);
    });

    socket.on('reaction-burst', (reaction) => {
      setReactions((prev) => [...prev, reaction]);
    });

    return () => {
      socket.off('sync-state');
      socket.off('audience-count-updated');
      socket.off('slide-changed');
      socket.off('slide-list-updated');
      socket.off('options-updated');
      socket.off('poll-updated');
      socket.off('quiz-updated');
      socket.off('question-added');
      socket.off('question-updated');
      socket.off('questions-synced');
      socket.off('subtitles-updated');
      socket.off('presentation-title-updated');
      socket.off('reaction-burst');
    };
  }, [roomId, viewMode]);

  // Actions
  const handleSelectSlide = (index) => {
    socket.emit('change-slide', { roomId, slideIndex: index });
  };

  const handlePrevSlide = () => {
    if (presentation && presentation.currentSlideIndex > 0) {
      handleSelectSlide(presentation.currentSlideIndex - 1);
    }
  };

  const handleNextSlide = () => {
    if (presentation && presentation.currentSlideIndex < presentation.slides.length - 1) {
      handleSelectSlide(presentation.currentSlideIndex + 1);
    }
  };

  const handleAddSlide = (slidePayload) => {
    const slideNumber = (presentation?.slides?.length || 0) + 1;
    const finalSlide = slidePayload || {
      title: `Interactive Discussion #${slideNumber}`,
      subtitle: 'Engage audience with live question prompt',
      layout: 'title',
      tag: `SLIDE ${slideNumber}`,
    };
    socket.emit('add-slide', {
      roomId,
      slide: finalSlide
    });
  };

  const handleDeleteSlide = (slideIndex, slideId) => {
    socket.emit('delete-slide', {
      roomId,
      slideIndex,
      slideId
    });
  };

  const handleToggleOption = (key, value) => {
    socket.emit('toggle-option', { roomId, key, value });
  };

  const handleToggleInteraction = (type, id, active) => {
    socket.emit('toggle-interaction', { roomId, type, id, active });
  };

  const handlePinQuestion = (questionId, pinned) => {
    socket.emit('pin-question', { roomId, questionId, pinned });
  };

  const handleAnswerQuestion = (questionId, answered) => {
    socket.emit('answer-question', { roomId, questionId, answered });
  };

  const handleDeleteQuestion = (questionId) => {
    socket.emit('delete-question', { roomId, questionId });
  };

  const handleUpvoteQuestion = (questionId) => {
    socket.emit('upvote-question', { roomId, questionId, voterId: 'guest-1' });
  };

  const handleVote = (pollId, optionIndex) => {
    socket.emit('submit-vote', {
      roomId,
      pollId,
      optionIndex,
      voterId: 'attendee-' + socket.id,
      voterName: 'Participant'
    });
  };

  const handleAnswerQuiz = (quizId, optionIndex) => {
    socket.emit('submit-quiz-answer', {
      roomId,
      quizId,
      optionIndex,
      voterId: 'attendee-' + socket.id,
      voterName: 'Participant',
      responseTimeMs: 3500
    });
  };

  const handleSubmitQuestion = (text, author, isAnonymous) => {
    socket.emit('submit-question', {
      roomId,
      text,
      author,
      isAnonymous
    });
  };

  const handleSendReaction = (emoji) => {
    socket.emit('send-reaction', { roomId, emoji });
  };

  const handleSendTranscript = (text, isFinal) => {
    socket.emit('send-subtitle', {
      roomId,
      text,
      isFinal,
      active: true
    });
  };

  const handleToggleListening = () => {
    const nextState = !isListening;
    setIsListening(nextState);
    socket.emit('toggle-subtitles', { roomId, active: nextState });
  };

  const handleUpdateTitle = (title) => {
    socket.emit('update-presentation-title', { roomId, title });
  };

  const handleLogout = () => {
    localStorage.removeItem('ims_token');
    setUser(null);
    setViewMode('studio');
  };

  const handleLaunchStudioFromDashboard = (presId) => {
    if (presId !== roomId) {
      setPresentation(null);
      setRoomId(presId);
    }
    setViewMode('studio');
    refreshUserPresentations();
  };

  const handleLaunchStageFromDashboard = (presId) => {
    if (presId !== roomId) {
      setPresentation(null);
      setRoomId(presId);
    }
    setViewMode('present');
    refreshUserPresentations();
  };

  const handleSwitchPresentation = (presId) => {
    if (!presId || presId === roomId) return;
    setPresentation(null);
    setRoomId(presId);
  };

  const currentSlide = presentation?.slides?.[presentation.currentSlideIndex] || presentation?.slides?.[0];
  const activePoll = currentSlide?.pollId ? presentation?.polls?.[currentSlide.pollId] : null;
  const activeQuiz = currentSlide?.quizId ? presentation?.quizzes?.[currentSlide.quizId] : null;

  return (
    <div>
      {/* Quick View Switcher Floating Pill - Only for authenticated presenters on desktop, NEVER for mobile audience */}
      {viewMode !== 'audience' && user && (
        <div className="hidden md:flex fixed bottom-3 right-4 z-50 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full shadow-2xl border border-white/20 items-center space-x-2 text-xs">
          <button
            onClick={() => {
              setViewMode('dashboard');
              refreshUserPresentations();
            }}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full transition ${
              viewMode === 'dashboard' ? 'bg-purple-600 text-white font-bold' : 'text-white/70 hover:text-white'
            }`}
            title="Presenter Dashboard"
          >
            <Layers size={12} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setViewMode('studio')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full transition ${
              viewMode === 'studio' ? 'bg-purple-600 text-white font-bold' : 'text-white/70 hover:text-white'
            }`}
            title="Presenter Control Studio"
          >
            <Laptop size={12} />
            <span>Studio</span>
          </button>

          <button
            onClick={() => setViewMode('present')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full transition ${
              viewMode === 'present' ? 'bg-purple-600 text-white font-bold' : 'text-white/70 hover:text-white'
            }`}
            title="Projector / Fullscreen Presentation"
          >
            <Tv size={12} />
            <span>Stage</span>
          </button>
        </div>
      )}

      {/* VIEW: DASHBOARD */}
      {viewMode === 'dashboard' && (
        <DashboardView
          user={user}
          onLogout={handleLogout}
          onOpenStudio={handleLaunchStudioFromDashboard}
          onOpenStage={handleLaunchStageFromDashboard}
          onOpenAuthModal={() => setShowAuthModal(true)}
          onOpenJoin={(code) => {
            setRoomId(code);
            setViewMode('audience');
          }}
        />
      )}

      {/* VIEW: STUDIO */}
      {viewMode === 'studio' && presentation && (
        <PresenterStudio
          presentation={presentation}
          audienceCount={audienceCount}
          onSelectSlide={handleSelectSlide}
          onPrevSlide={handlePrevSlide}
          onNextSlide={handleNextSlide}
          onAddSlide={handleAddSlide}
          onDeleteSlide={handleDeleteSlide}
          onToggleOption={handleToggleOption}
          onToggleInteraction={handleToggleInteraction}
          onPinQuestion={handlePinQuestion}
          onAnswerQuestion={handleAnswerQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onUpvoteQuestion={handleUpvoteQuestion}
          onOpenPresentation={() => setViewMode('present')}
          isListening={isListening}
          onToggleListening={handleToggleListening}
          onSendTranscript={handleSendTranscript}
          onVote={handleVote}
          onAnswerQuiz={handleAnswerQuiz}
          onSubmitQuestion={handleSubmitQuestion}
          onSendReaction={handleSendReaction}
          user={user}
          onOpenDashboard={() => {
            setViewMode('dashboard');
            refreshUserPresentations();
          }}
          onOpenAuthModal={() => setShowAuthModal(true)}
          onUpdateTitle={handleUpdateTitle}
          userPresentations={userPresentations}
          onSwitchPresentation={handleSwitchPresentation}
        />
      )}

      {/* VIEW: PRESENT STAGE */}
      {viewMode === 'present' && presentation && (
        <PresentationDisplay
          presentation={presentation}
          currentSlide={currentSlide}
          poll={activePoll}
          quiz={activeQuiz}
          questions={presentation.questions}
          subtitles={presentation.subtitles}
          audienceCount={audienceCount}
          reactions={reactions}
          onClose={() => setViewMode('studio')}
          onNextSlide={handleNextSlide}
          onPrevSlide={handlePrevSlide}
          onSelectSlide={handleSelectSlide}
          onOpenDashboard={() => {
            setViewMode('dashboard');
            refreshUserPresentations();
          }}
          userPresentations={userPresentations}
          onSwitchPresentation={handleSwitchPresentation}
        />
      )}

      {/* VIEW: AUDIENCE MOBILE */}
      {viewMode === 'audience' && presentation && (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start w-full">
          <AudienceMobile
            isSimulator={false}
            presentation={presentation}
            currentSlide={currentSlide}
            poll={activePoll}
            quiz={activeQuiz}
            questions={presentation.questions}
            messages={presentation.messages}
            subtitles={presentation.subtitles}
            audienceCount={audienceCount}
            onVote={handleVote}
            onAnswerQuiz={handleAnswerQuiz}
            onSubmitQuestion={handleSubmitQuestion}
            onUpvoteQuestion={handleUpvoteQuestion}
            onSendReaction={handleSendReaction}
            voterId={'attendee-' + (socket.id || 'mobile')}
          />
        </div>
      )}

      {/* Auth Modal (Sign In / Register) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(authenticatedUser) => {
          setUser(authenticatedUser);
          setViewMode('dashboard');
        }}
      />
    </div>
  );
}
