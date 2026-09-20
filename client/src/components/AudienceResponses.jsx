import React, { useState } from 'react';
import { MessageSquare, Pin, ThumbsUp, Check, Trash2 } from 'lucide-react';

export default function AudienceResponses({
  questions = [],
  messages = [],
  onPinQuestion,
  onAnswerQuestion,
  onDeleteQuestion,
  onUpvoteQuestion,
}) {
  const [activeTab, setActiveTab] = useState('questions'); // 'messages' | 'questions' | 'pinned'

  const pinnedQuestions = questions.filter(q => q.pinned);

  // Pick display list according to selected tab
  let displayList = [];
  if (activeTab === 'questions') {
    displayList = questions;
  } else if (activeTab === 'pinned') {
    displayList = pinnedQuestions;
  } else {
    displayList = messages;
  }

  const getAvatarColor = (name = '') => {
    const colors = [
      'bg-purple-600 text-white',
      'bg-indigo-600 text-white',
      'bg-cyan-600 text-white',
      'bg-pink-600 text-white',
      'bg-amber-600 text-white',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  };

  return (
    <div className="bg-white rounded-2xl border border-purple-100 p-4 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <MessageSquare size={14} className="text-purple-600" />
          <span>Audience Responses</span>
        </div>
      </div>

      {/* Tabs matching screenshot: Messages (12), Questions (3), Pinned (1) */}
      <div className="flex items-center space-x-1 border-b border-slate-100 pb-2 mb-3 text-xs">
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-2.5 py-1 rounded-lg font-medium transition ${
            activeTab === 'messages'
              ? 'bg-purple-100 text-purple-700 font-semibold'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          Messages ({messages.length})
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`px-2.5 py-1 rounded-lg font-medium transition ${
            activeTab === 'questions'
              ? 'bg-purple-100 text-purple-700 font-semibold'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          Questions ({questions.length})
        </button>

        <button
          onClick={() => setActiveTab('pinned')}
          className={`px-2.5 py-1 rounded-lg font-medium transition ${
            activeTab === 'pinned'
              ? 'bg-amber-100 text-amber-800 font-semibold'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          Pinned ({pinnedQuestions.length})
        </button>
      </div>

      {/* Incoming response feed */}
      <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[360px] pr-1">
        {displayList.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            No items in {activeTab} yet.
          </div>
        ) : (
          displayList.map((item) => {
            const isMsg = activeTab === 'messages';
            const isItemPinned = item.pinned;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition ${
                  isItemPinned
                    ? 'bg-gradient-to-r from-amber-50/80 to-purple-50/50 border-amber-300 shadow-xs'
                    : 'bg-white border-slate-100 hover:border-purple-100'
                }`}
              >
                {/* Author row */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${getAvatarColor(item.author)}`}>
                      {(item.author || 'A')[0]}
                    </div>
                    <span className="text-xs font-semibold text-slate-800">
                      {item.author}
                    </span>
                    {isItemPinned && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-400 text-amber-950 font-bold text-[9px] uppercase tracking-wider">
                        ★ PINNED
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">{item.time}</span>
                </div>

                {/* Text content */}
                <p className="text-xs text-slate-700 leading-relaxed pl-8">
                  {item.text}
                </p>

                {/* Question Actions (Upvotes, Pin, Mark Answered) */}
                {!isMsg && (
                  <div className="flex items-center justify-between pl-8 mt-2 pt-2 border-t border-slate-100/70 text-xs">
                    <div className="flex items-center space-x-1 text-slate-500">
                      <button
                        onClick={() => onUpvoteQuestion && onUpvoteQuestion(item.id)}
                        className="flex items-center space-x-1 px-1.5 py-0.5 rounded hover:bg-purple-50 text-purple-600 transition"
                      >
                        <ThumbsUp size={12} />
                        <span className="font-semibold text-[11px]">{item.upvotes || 0}</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onPinQuestion(item.id, !item.pinned)}
                        className={`p-1 rounded text-xs transition ${
                          item.pinned
                            ? 'text-amber-600 bg-amber-50'
                            : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                        }`}
                        title={item.pinned ? "Unpin from presentation" : "Pin to presentation"}
                      >
                        <Pin size={13} className={item.pinned ? "fill-current" : ""} />
                      </button>

                      <button
                        onClick={() => onAnswerQuestion(item.id, !item.answered)}
                        className={`p-1 rounded text-xs transition ${
                          item.answered
                            ? 'text-emerald-600 bg-emerald-50'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title="Mark answered"
                      >
                        <Check size={13} />
                      </button>

                      <button
                        onClick={() => onDeleteQuestion(item.id)}
                        className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition"
                        title="Delete question"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
