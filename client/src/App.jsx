import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import PresenterStudio from './components/PresenterStudio';
import PresentationDisplay from './components/PresentationDisplay';
import AudienceMobile from './components/AudienceMobile';
import { Laptop, Tv, Smartphone, Layers } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState('studio'); // 'studio' | 'present' | 'audience'
  const [presentation, setPresentation] = useState(null);
  const [audienceCount, setAudienceCount] = useState(24);
  const [reactions, setReactions] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const roomId = 'imspresentation';

  // Check URL params for view mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view && ['studio', 'present', 'audience'].includes(view)) {
      setViewMode(view);
    }
  }, []);

  // Connect to room via Socket.io
  useEffect(() => {
    socket.emit('join-room', {
      roomId,
      role: viewMode === 'present' ? 'display' : (viewMode === 'audience' ? 'audience' : 'presenter'),
      name: viewMode === 'audience' ? 'Mobile Guest' : 'Host'
    });

    socket.on('sync-state', (state) => {
      setPresentation(state);
    });

    socket.on('audience-count-updated', ({ count }) => {
      setAudienceCount(count + 23); // realistic audience base + actual connections
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

    socket.on('subtitles-updated', (subtitles) => {
      setPresentation((prev) => prev ? { ...prev, subtitles } : prev);
    });

    socket.on('reaction-burst', (reaction) => {
      setReactions((prev) => [...prev, reaction]);
    });

    return () => {
      socket.off('sync-state');
      socket.off('audience-count-updated');
      socket.off('slide-changed');
      socket.off('options-updated');
      socket.off('poll-updated');
      socket.off('quiz-updated');
      socket.off('question-added');
      socket.off('question-updated');
      socket.off('questions-synced');
      socket.off('subtitles-updated');
      socket.off('reaction-burst');
    };
  }, [viewMode]);

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

  const handleAddSlide = () => {
    const slideNumber = presentation?.slides?.length + 1 || 8;
    socket.emit('add-slide', {
      roomId,
      slide: {
        title: `Interactive Discussion #${slideNumber}`,
        subtitle: 'Engage audience with live question prompt',
        layout: 'title',
        tag: `SLIDE ${slideNumber}`,
      }
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

  if (!presentation) {
    return (
      <div className="min-h-screen bg-[#fcfaff] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3 text-purple-700">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold text-sm">Connecting to Claper Studio...</span>
        </div>
      </div>
    );
  }

  const currentSlide = presentation.slides[presentation.currentSlideIndex] || presentation.slides[0];
  const activePoll = currentSlide?.pollId ? presentation.polls[currentSlide.pollId] : null;
  const activeQuiz = currentSlide?.quizId ? presentation.quizzes[currentSlide.quizId] : null;

  return (
    <div>
      {/* Quick View Switcher Floating Pill (for pairing & live testing) */}
      <div className="fixed bottom-3 right-4 z-50 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full shadow-2xl border border-white/20 flex items-center space-x-2 text-xs">
        <span className="text-[10px] uppercase font-bold text-purple-400">View:</span>
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
          <span>Stage Display</span>
        </button>

        <button
          onClick={() => setViewMode('audience')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full transition ${
            viewMode === 'audience' ? 'bg-purple-600 text-white font-bold' : 'text-white/70 hover:text-white'
          }`}
          title="Mobile Audience View"
        >
          <Smartphone size={12} />
          <span>Audience Mobile</span>
        </button>
      </div>

      {/* RENDER VIEW */}
      {viewMode === 'studio' && (
        <PresenterStudio
          presentation={presentation}
          audienceCount={audienceCount}
          onSelectSlide={handleSelectSlide}
          onPrevSlide={handlePrevSlide}
          onNextSlide={handleNextSlide}
          onAddSlide={handleAddSlide}
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
        />
      )}

      {viewMode === 'present' && (
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
        />
      )}

      {viewMode === 'audience' && (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <AudienceMobile
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
          />
        </div>
      )}
    </div>
  );
}
