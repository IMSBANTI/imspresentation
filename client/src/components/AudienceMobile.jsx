import React, { useState } from 'react';
import { 
  Send, 
  ThumbsUp, 
  HelpCircle, 
  BarChart2, 
  MessageSquare, 
  Flame, 
  Heart, 
  Smile, 
  Sparkles, 
  CheckCircle2, 
  Radio, 
  Volume2 
} from 'lucide-react';

export default function AudienceMobile({
  presentation,
  currentSlide,
  poll,
  quiz,
  questions = [],
  messages = [],
  subtitles,
  audienceCount = 1,
  onVote,
  onAnswerQuiz,
  onSubmitQuestion,
  onUpvoteQuestion,
  onSendReaction,
  voterId = 'user-mobile',
  isSimulator = false,
}) {
  const [activeTab, setActiveTab] = useState('interact'); // 'interact' | 'qa' | 'subtitles'
  const [inputText, setInputText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [userName, setUserName] = useState('Anonymous');
  const [selectedPollOption, setSelectedPollOption] = useState(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [hasSubmittedQuiz, setHasSubmittedQuiz] = useState(false);

  // Poll votes calculations
  const totalVotes = poll?.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;
  const userVotedOption = poll?.voters?.[voterId];

  const handleSendQuestionOrMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSubmitQuestion(inputText.trim(), isAnonymous ? 'Anonymous' : userName, isAnonymous);
    setInputText('');
  };

  const handleVote = (optionIndex) => {
    if (presentation?.options?.lockResponses) return;
    setSelectedPollOption(optionIndex);
    onVote(poll.id, optionIndex);
  };

  const handleQuizAnswer = (optionIndex) => {
    if (hasSubmittedQuiz || presentation?.options?.lockResponses) return;
    setSelectedQuizOption(optionIndex);
    setHasSubmittedQuiz(true);
    onAnswerQuiz(quiz.id, optionIndex);
  };

  const containerClasses = isSimulator
    ? "w-[310px] sm:w-[325px] h-[640px] bg-slate-950 text-white rounded-[38px] p-3.5 shadow-2xl border-4 border-slate-800 flex flex-col justify-between overflow-hidden relative select-none"
    : "w-full max-w-md min-h-screen bg-slate-950 text-white p-4 flex flex-col justify-between select-none mx-auto";

  return (
    <div className={containerClasses}>
      {/* Phone Notch (only in simulator mode) */}
      {isSimulator && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-3.5 bg-slate-900 rounded-full z-30"></div>
      )}

      {/* Top Header of Mobile Screen */}
      <div className={`${isSimulator ? 'pt-4' : 'pt-2'} pb-2 border-b border-white/10 flex items-center justify-between relative z-20`}>
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-xs">
          <span>#{presentation?.code || "IMSPRESENTATION"}</span>
        </div>

        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white/90 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-semibold">{audienceCount}</span>
        </div>
      </div>

      {/* Navigation tabs inside phone */}
      <div className="flex items-center justify-around py-1.5 border-b border-white/10 text-xs">
        <button
          onClick={() => setActiveTab('interact')}
          className={`px-3 py-1 rounded-full font-medium transition flex items-center space-x-1 ${
            activeTab === 'interact'
              ? 'bg-purple-600 text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <BarChart2 size={13} />
          <span>Interact</span>
        </button>

        <button
          onClick={() => setActiveTab('qa')}
          className={`px-3 py-1 rounded-full font-medium transition flex items-center space-x-1 ${
            activeTab === 'qa'
              ? 'bg-purple-600 text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <MessageSquare size={13} />
          <span>Q&A ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subtitles')}
          className={`px-3 py-1 rounded-full font-medium transition flex items-center space-x-1 ${
            activeTab === 'subtitles'
              ? 'bg-purple-600 text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Radio size={13} className={subtitles?.active ? 'text-red-400 animate-pulse' : ''} />
          <span>Subtitles</span>
        </button>
      </div>

      {/* Phone Body Content */}
      <div className="flex-1 overflow-y-auto py-2 px-1 space-y-3">
        {/* INTERACT TAB: Poll / Quiz Active Cards */}
        {activeTab === 'interact' && (
          <div className="space-y-3">
            {/* Active Slide Info */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                Current Slide ({currentSlide?.tag || "LIVE"})
              </span>
              <h3 className="text-sm font-bold text-white mt-1">
                {currentSlide?.title}
              </h3>
            </div>

            {/* LIVE POLL CARD */}
            {poll && poll.active && (
              <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-900/40 to-slate-900/80 border border-purple-500/30 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300">
                    LIVE POLL
                  </span>
                  <span className="text-[10px] text-white/50">{totalVotes} votes</span>
                </div>

                <h4 className="text-sm font-semibold text-white mb-3">
                  {poll.question}
                </h4>

                <div className="space-y-2">
                  {poll.options.map((option, idx) => {
                    const isSelected = (selectedPollOption === idx) || (userVotedOption === idx);
                    const pct = totalVotes > 0 ? Math.round(((option.votes || 0) / totalVotes) * 100) : 0;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleVote(idx)}
                        className={`w-full relative overflow-hidden p-3 rounded-xl text-left text-xs font-medium transition border ${
                          isSelected
                            ? 'border-purple-400 bg-purple-600/30 text-white font-bold'
                            : 'border-white/10 bg-white/5 hover:bg-white/10 text-white/80'
                        }`}
                      >
                        {/* Progress fill animation */}
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-purple-500/20 -z-10 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                        <div className="flex items-center justify-between relative z-10">
                          <span>{option.text}</span>
                          <span className="font-bold text-purple-300 ml-2">{pct}%</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LIVE QUIZ CARD */}
            {quiz && quiz.active && (
              <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/40 to-slate-900/80 border border-amber-500/30 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300">
                    ⏱️ TIME REMAINING
                  </span>
                  <span className="text-[11px] font-mono text-amber-300 font-bold">
                    {quiz.timeLimit}s
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-white mb-3">
                  {quiz.question}
                </h4>

                <div className="space-y-2">
                  {quiz.options.map((option, idx) => {
                    const isChosen = selectedQuizOption === idx;
                    const showFeedback = hasSubmittedQuiz && quiz.revealed;
                    let borderStyle = 'border-white/10 bg-white/5';

                    if (showFeedback) {
                      if (option.correct) borderStyle = 'border-emerald-400 bg-emerald-500/20 text-emerald-200';
                      else if (isChosen && !option.correct) borderStyle = 'border-red-400 bg-red-500/20 text-red-200';
                    } else if (isChosen) {
                      borderStyle = 'border-amber-400 bg-amber-500/20 text-amber-200 font-bold';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleQuizAnswer(idx)}
                        disabled={hasSubmittedQuiz}
                        className={`w-full p-2.5 rounded-xl text-left text-xs font-medium transition border flex items-center justify-between ${borderStyle}`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">
                            {['A', 'B', 'C', 'D'][idx]}
                          </span>
                          <span>{option.text}</span>
                        </div>
                        {isChosen && <CheckCircle2 size={14} className="text-amber-300 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Live Q&A preview cards as seen in screenshot */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                Recent Questions & Highlights
              </span>

              {questions.slice(0, 3).map((q) => (
                <div
                  key={q.id}
                  className={`p-3 rounded-xl border text-xs leading-relaxed transition ${
                    q.pinned
                      ? 'bg-amber-400/15 border-amber-400/50 text-amber-100'
                      : 'bg-white/5 border-white/10 text-white/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white/90">{q.author}</span>
                    {q.pinned && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                        PINNED
                      </span>
                    )}
                  </div>
                  <p>{q.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Q&A TAB */}
        {activeTab === 'qa' && (
          <div className="space-y-2.5">
            {questions.map((q) => (
              <div
                key={q.id}
                className={`p-3 rounded-2xl border text-xs transition ${
                  q.pinned
                    ? 'bg-amber-400/15 border-amber-400/40 text-amber-100'
                    : 'bg-white/5 border-white/10 text-white/90'
                }`}
              >
                <div className="flex items-center justify-between mb-1 text-[11px]">
                  <span className="font-bold text-white/90">{q.author}</span>
                  <span className="text-white/40">{q.time}</span>
                </div>
                <p className="mb-2 text-white/80">{q.text}</p>
                <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
                  <button
                    onClick={() => onUpvoteQuestion(q.id)}
                    className="flex items-center space-x-1.5 px-2 py-1 rounded bg-white/10 hover:bg-purple-600/50 transition text-purple-300"
                  >
                    <ThumbsUp size={12} />
                    <span className="font-bold">{q.upvotes || 0}</span>
                  </button>
                  {q.pinned && (
                    <span className="text-[10px] text-amber-300 font-semibold">
                      ★ Displayed on screen
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SUBTITLES TAB */}
        {activeTab === 'subtitles' && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
              <Volume2 size={20} />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Live Real-Time Audio Transcription
            </h4>
            <p className="text-xs text-white/80 italic font-mono bg-black/40 p-3 rounded-xl border border-white/10">
              "{subtitles?.text || "Waiting for presenter speech..."}"
            </p>
          </div>
        )}
      </div>

      {/* Floating Reaction Bar matching mobile engagement */}
      <div className="py-2 flex items-center justify-around border-t border-white/10">
        {[
          { emoji: '👏', label: 'Clap' },
          { emoji: '❤️', label: 'Heart' },
          { emoji: '🔥', label: 'Fire' },
          { emoji: '👍', label: 'Thumb' },
        ].map((item) => (
          <button
            key={item.emoji}
            onClick={() => onSendReaction(item.emoji)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-125 transition flex items-center justify-center text-lg shadow-sm"
            title={item.label}
          >
            {item.emoji}
          </button>
        ))}
      </div>

      {/* Bottom Message / Question Input Bar */}
      <form
        onSubmit={handleSendQuestionOrMessage}
        className="pt-1 flex items-center space-x-2 relative z-20"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask, comment..."
          className="flex-1 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-white/40 focus:outline-hidden focus:border-purple-400 transition"
        />
        <button
          type="submit"
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center transition active:scale-95 shadow-sm"
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );
}
