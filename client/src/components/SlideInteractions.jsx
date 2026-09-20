import React, { useState } from 'react';
import { Sparkles, BarChart2, HelpCircle, MessageSquare, MoreHorizontal, Plus, Check } from 'lucide-react';

export default function SlideInteractions({
  currentSlide,
  polls,
  quizzes,
  onToggleInteraction,
}) {
  const [activeTab, setActiveTab] = useState('all');

  const attachedPoll = currentSlide?.pollId ? polls[currentSlide.pollId] : null;
  const attachedQuiz = currentSlide?.quizId ? quizzes[currentSlide.quizId] : null;

  return (
    <div className="bg-white rounded-2xl border border-purple-100 p-4 shadow-xs flex flex-col">
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <Sparkles size={14} className="text-purple-600" />
          <span>Interactions</span>
        </div>
        <span className="text-[11px] font-medium text-slate-400">
          Slide #{currentSlide?.tag || "ACTIVE"}
        </span>
      </div>

      {/* Interaction category buttons matching screenshot */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-purple-50/50 rounded-xl mb-3 border border-purple-100/50">
        <button
          onClick={() => setActiveTab('poll')}
          className={`flex flex-col items-center justify-center py-2 rounded-lg text-[11px] font-semibold transition ${
            activeTab === 'poll'
              ? 'bg-white text-purple-700 shadow-xs border border-purple-100'
              : 'text-slate-600 hover:text-purple-600 hover:bg-white/60'
          }`}
        >
          <BarChart2 size={15} className="mb-1 text-purple-600" />
          <span>Poll</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex flex-col items-center justify-center py-2 rounded-lg text-[11px] font-semibold transition ${
            activeTab === 'quiz'
              ? 'bg-white text-purple-700 shadow-xs border border-purple-100'
              : 'text-slate-600 hover:text-purple-600 hover:bg-white/60'
          }`}
        >
          <HelpCircle size={15} className="mb-1 text-amber-500" />
          <span>Quiz</span>
        </button>

        <button
          onClick={() => setActiveTab('qa')}
          className={`flex flex-col items-center justify-center py-2 rounded-lg text-[11px] font-semibold transition ${
            activeTab === 'qa'
              ? 'bg-white text-purple-700 shadow-xs border border-purple-100'
              : 'text-slate-600 hover:text-purple-600 hover:bg-white/60'
          }`}
        >
          <MessageSquare size={15} className="mb-1 text-indigo-500" />
          <span>Q&A</span>
        </button>

        <button
          onClick={() => setActiveTab('more')}
          className={`flex flex-col items-center justify-center py-2 rounded-lg text-[11px] font-semibold transition ${
            activeTab === 'more'
              ? 'bg-white text-purple-700 shadow-xs border border-purple-100'
              : 'text-slate-600 hover:text-purple-600 hover:bg-white/60'
          }`}
        >
          <MoreHorizontal size={15} className="mb-1 text-slate-400" />
          <span>More</span>
        </button>
      </div>

      {/* Configured interactions list matching screenshot */}
      <div className="space-y-2.5 flex-1">
        {attachedPoll && (
          <div className="p-3 rounded-xl border border-purple-100 hover:border-purple-200 bg-white transition flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <BarChart2 size={16} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-800 leading-tight">
                  {attachedPoll.question}
                </h4>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-[10px] text-purple-600 font-bold uppercase">Poll</span>
                  <span className="text-[10px] text-slate-400">• {attachedPoll.options.length} options</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleInteraction('poll', attachedPoll.id, !attachedPoll.active)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                attachedPoll.active ? 'bg-purple-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  attachedPoll.active ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}

        {attachedQuiz && (
          <div className="p-3 rounded-xl border border-purple-100 hover:border-purple-200 bg-white transition flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <HelpCircle size={16} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-800 leading-tight">
                  {attachedQuiz.title || attachedQuiz.question}
                </h4>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-[10px] text-amber-600 font-bold uppercase">Quiz</span>
                  <span className="text-[10px] text-slate-400">• {attachedQuiz.timeLimit}s timer</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleInteraction('quiz', attachedQuiz.id, !attachedQuiz.active)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                attachedQuiz.active ? 'bg-purple-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  attachedQuiz.active ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}

        {!attachedPoll && !attachedQuiz && (
          <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
            No interactive elements attached to this slide yet.
          </div>
        )}
      </div>
    </div>
  );
}
