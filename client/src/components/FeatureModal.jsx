import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  HelpCircle, 
  BarChart2, 
  Mic, 
  FileText, 
  PlaySquare, 
  ShieldCheck, 
  LineChart, 
  Trophy, 
  Download, 
  ThumbsUp, 
  Pin, 
  Trash2, 
  CheckCircle2, 
  ExternalLink,
  Volume2,
  Lock,
  Unlock,
  AlertTriangle,
  Star,
  Sparkles
} from 'lucide-react';

export default function FeatureModal({
  isOpen,
  activeFeature,
  onClose,
  presentation,
  audienceCount,
  isListening,
  onToggleListening,
  onSendTranscript,
  onPinQuestion,
  onAnswerQuestion,
  onDeleteQuestion,
  onUpvoteQuestion,
  onToggleOption,
  onToggleInteraction
}) {
  const [qaFilter, setQaFilter] = useState('all'); // 'all' | 'pinned' | 'unanswered'
  const [webUrl, setWebUrl] = useState('');
  const [embedSaved, setEmbedSaved] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [profanityFilter, setProfanityFilter] = useState(true);
  const [requireName, setRequireName] = useState(false);

  if (!isOpen) return null;

  const questions = presentation?.questions || [];
  const polls = presentation?.polls || {};
  const quizzes = presentation?.quizzes || {};
  const options = presentation?.options || {};

  const filteredQuestions = questions.filter((q) => {
    if (qaFilter === 'pinned') return q.pinned;
    if (qaFilter === 'unanswered') return !q.answered;
    return true;
  });

  const getFeatureMeta = () => {
    switch (activeFeature) {
      case 'qa':
        return {
          title: 'Audience Q&A Hub',
          desc: 'Moderate, pin, and answer live questions submitted by the audience.',
          icon: MessageSquare,
          color: 'bg-purple-600'
        };
      case 'quizzes':
        return {
          title: 'Live Quiz & Leaderboard',
          desc: 'Monitor quiz challenges, review top score leaderboards, and reveal answers.',
          icon: HelpCircle,
          color: 'bg-amber-500'
        };
      case 'polls':
        return {
          title: 'Interactive Polls Manager',
          desc: 'Real-time voting counts, bar chart distribution, and poll response toggles.',
          icon: BarChart2,
          color: 'bg-purple-600'
        };
      case 'transcription':
        return {
          title: 'Real-Time Live Transcription',
          desc: 'Live audio speech-to-text subtitles displayed on projector and audience phones.',
          icon: Mic,
          color: 'bg-red-500'
        };
      case 'forms':
        return {
          title: 'Feedback & Evaluation Forms',
          desc: 'Collect attendee ratings, post-session satisfaction scores, and feedback.',
          icon: FileText,
          color: 'bg-indigo-600'
        };
      case 'webcontent':
        return {
          title: 'Web Content & Media Embeds',
          desc: 'Display interactive web tools, YouTube videos, or web pages on stage.',
          icon: PlaySquare,
          color: 'bg-blue-600'
        };
      case 'moderation':
        return {
          title: 'Audience Moderation & Controls',
          desc: 'Protect audience safety, enforce name requirements, and lock interactions.',
          icon: ShieldCheck,
          color: 'bg-emerald-600'
        };
      default:
        return {
          title: 'Presentation Tools',
          desc: 'Manage live interactions and audience engagement.',
          icon: Sparkles,
          color: 'bg-purple-600'
        };
    }
  };

  const meta = getFeatureMeta();
  const Icon = meta.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-purple-100 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fadeIn">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50/70 via-white to-purple-50/70">
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-2xl ${meta.color} text-white flex items-center justify-center shadow-xs`}>
              <Icon size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {meta.title}
              </h3>
              <p className="text-xs text-slate-500">
                {meta.desc}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* 1. Q&A HUB */}
          {activeFeature === 'qa' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setQaFilter('all')}
                    className={`px-3 py-1 rounded-lg transition ${
                      qaFilter === 'all' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({questions.length})
                  </button>
                  <button
                    onClick={() => setQaFilter('pinned')}
                    className={`px-3 py-1 rounded-lg transition ${
                      qaFilter === 'pinned' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Pinned ({questions.filter(q => q.pinned).length})
                  </button>
                  <button
                    onClick={() => setQaFilter('unanswered')}
                    className={`px-3 py-1 rounded-lg transition ${
                      qaFilter === 'unanswered' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Unanswered ({questions.filter(q => !q.answered).length})
                  </button>
                </div>

                <span className="text-xs text-slate-400">
                  {questions.reduce((sum, q) => sum + (q.upvotes || 0), 0)} total upvotes
                </span>
              </div>

              {filteredQuestions.length === 0 ? (
                <div className="p-8 text-center bg-purple-50/50 rounded-2xl border border-dashed border-purple-200 text-xs text-slate-500 space-y-1">
                  <MessageSquare size={28} className="mx-auto text-purple-300" />
                  <p className="font-semibold text-slate-700">No questions found</p>
                  <p className="text-slate-400">Audience questions will stream here in real time as they ask.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredQuestions.map((q) => (
                    <div
                      key={q.id}
                      className={`p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 ${
                        q.pinned
                          ? 'bg-amber-50/70 border-amber-300'
                          : 'bg-white border-slate-200/80 hover:border-purple-200 shadow-2xs'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-900">{q.author}</span>
                          <span className="text-[10px] text-slate-400">{q.time}</span>
                          {q.pinned && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-bold">
                              PINNED ON STAGE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-800 leading-relaxed font-medium">"{q.text}"</p>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => onPinQuestion(q.id, !q.pinned)}
                          className={`p-1.5 rounded-lg border text-xs transition ${
                            q.pinned
                              ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                              : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                          title={q.pinned ? "Unpin question" : "Spotlight/Pin onto stage screen"}
                        >
                          <Pin size={13} />
                        </button>

                        <button
                          onClick={() => onAnswerQuestion(q.id, !q.answered)}
                          className={`p-1.5 rounded-lg border text-xs transition ${
                            q.answered
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-300 font-bold'
                              : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                          title={q.answered ? "Mark as unanswered" : "Mark as answered"}
                        >
                          <CheckCircle2 size={13} />
                        </button>

                        <button
                          onClick={() => onDeleteQuestion(q.id)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete question"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. QUIZZES & LEADERBOARD */}
          {activeFeature === 'quizzes' && (
            <div className="space-y-4">
              {Object.keys(quizzes).length === 0 ? (
                <div className="p-8 text-center bg-amber-50/50 rounded-2xl border border-dashed border-amber-200 text-xs text-slate-500 space-y-1">
                  <Trophy size={28} className="mx-auto text-amber-400" />
                  <p className="font-semibold text-slate-700">No Quiz Created Yet</p>
                  <p className="text-slate-400">Add a Quiz slide from the left slide navigator to start live competitions.</p>
                </div>
              ) : (
                Object.values(quizzes).map((quiz) => {
                  const answersList = Object.entries(quiz.answers || {}).map(([uid, a]) => ({ uid, ...a }));
                  const sortedLeaderboard = answersList.sort((a, b) => (b.score || 0) - (a.score || 0));

                  return (
                    <div key={quiz.id} className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase">
                            Quiz Challenge
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">{quiz.question}</h4>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-700">
                          ⏱️ {quiz.timeLimit}s limit
                        </span>
                      </div>

                      {/* Options breakdown */}
                      <div className="grid grid-cols-2 gap-2">
                        {quiz.options?.map((opt, i) => (
                          <div
                            key={i}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                              opt.correct ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <span>{['A', 'B', 'C', 'D'][i]}. {opt.text}</span>
                            {opt.correct && <CheckCircle2 size={13} className="text-emerald-600" />}
                          </div>
                        ))}
                      </div>

                      {/* Podium / Leaderboard Top 3 */}
                      <div className="pt-2 border-t border-amber-200/60">
                        <span className="text-xs font-bold text-slate-800 flex items-center space-x-1 mb-2">
                          <Trophy size={14} className="text-amber-500" />
                          <span>Top Participants Leaderboard ({sortedLeaderboard.length})</span>
                        </span>

                        {sortedLeaderboard.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No responses recorded yet.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {sortedLeaderboard.slice(0, 5).map((entry, rank) => (
                              <div
                                key={entry.uid}
                                className="flex items-center justify-between p-2 rounded-xl bg-white border border-amber-100 text-xs"
                              >
                                <div className="flex items-center space-x-2">
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                    rank === 0 ? 'bg-amber-400 text-slate-950' : rank === 1 ? 'bg-slate-300 text-slate-900' : 'bg-amber-200 text-amber-900'
                                  }`}>
                                    {rank + 1}
                                  </span>
                                  <span className="font-semibold text-slate-800">{entry.name || 'Participant'}</span>
                                </div>
                                <span className="font-mono font-bold text-purple-700">{entry.score || 0} pts</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 3. POLLS MANAGER */}
          {activeFeature === 'polls' && (
            <div className="space-y-4">
              {Object.keys(polls).length === 0 ? (
                <div className="p-8 text-center bg-purple-50/50 rounded-2xl border border-dashed border-purple-200 text-xs text-slate-500 space-y-1">
                  <BarChart2 size={28} className="mx-auto text-purple-400" />
                  <p className="font-semibold text-slate-700">No Polls Active</p>
                  <p className="text-slate-400">Add a Poll slide to collect instant live votes from mobile audience.</p>
                </div>
              ) : (
                Object.values(polls).map((poll) => {
                  const totalPollVotes = poll.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;

                  return (
                    <div key={poll.id} className="p-4 rounded-2xl bg-purple-50/40 border border-purple-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 uppercase">
                            Live Audience Poll
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">{poll.question}</h4>
                        </div>
                        <span className="text-xs font-semibold text-purple-700">
                          {totalPollVotes} total votes
                        </span>
                      </div>

                      <div className="space-y-2">
                        {poll.options?.map((opt, idx) => {
                          const pct = totalPollVotes > 0 ? Math.round(((opt.votes || 0) / totalPollVotes) * 100) : 0;
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold text-slate-700">
                                <span>{opt.text}</span>
                                <span>{opt.votes || 0} votes ({pct}%)</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 4. REAL-TIME TRANSCRIPTION */}
          {activeFeature === 'transcription' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900 to-slate-900 text-white space-y-3 text-center">
                <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-purple-300'
                }`}>
                  <Mic size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold">
                    {isListening ? "Microphone is Streaming Live Subtitles" : "Speech Recognition is Paused"}
                  </h4>
                  <p className="text-xs text-purple-200/80 mt-1 max-w-md mx-auto">
                    Speak clearly into your device microphone. Real-time subtitles will display on the stage projector and attendee smartphones.
                  </p>
                </div>

                <button
                  onClick={onToggleListening}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition shadow-md ${
                    isListening
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white'
                  }`}
                >
                  {isListening ? "Stop Microphone" : "Start Live Transcription"}
                </button>
              </div>

              {presentation?.subtitles?.text && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Recent Captured Speech Transcript
                  </span>
                  <p className="text-xs text-slate-800 font-mono italic">
                    "{presentation.subtitles.text}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 5. FORMS & EVALUATIONS */}
          {activeFeature === 'forms' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900 uppercase">
                  Session Feedback Form
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  How would you rate today's presentation and interactivity?
                </h4>

                <div className="flex items-center space-x-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFormRating(star)}
                      className={`p-2 rounded-xl border transition ${
                        star <= formRating
                          ? 'bg-amber-100 border-amber-300 text-amber-500'
                          : 'bg-white border-slate-200 text-slate-300'
                      }`}
                    >
                      <Star size={20} className={star <= formRating ? 'fill-current' : ''} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {formRating} / 5 Stars
                  </span>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Attendee feedback notes:
                  </label>
                  <textarea
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    placeholder="Enter what you liked or how we can improve..."
                    rows={3}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden"
                  />
                </div>

                <button
                  onClick={() => {
                    setFormSubmitted(true);
                    setTimeout(() => setFormSubmitted(false), 3000);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                >
                  <CheckCircle2 size={14} />
                  <span>{formSubmitted ? "Feedback Recorded!" : "Save Feedback Template"}</span>
                </button>
              </div>
            </div>
          )}

          {/* 6. WEB CONTENT EMBED */}
          {activeFeature === 'webcontent' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200 text-blue-900 uppercase">
                  Media & URL Embed
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  Embed Video or Live Web App
                </h4>
                <p className="text-xs text-slate-600">
                  Paste a YouTube URL, Vimeo link, or website to spotlight on screen.
                </p>

                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={webUrl}
                    onChange={(e) => setWebUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden"
                  />
                  <button
                    onClick={() => {
                      if (webUrl.trim()) {
                        setEmbedSaved(true);
                        setTimeout(() => setEmbedSaved(false), 2500);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shrink-0"
                  >
                    {embedSaved ? "Loaded!" : "Embed on Stage"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 7. MODERATION TOOLS */}
          {activeFeature === 'moderation' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Profanity & Spam Filter</h4>
                  <p className="text-[11px] text-slate-500">Automatically filter offensive words from audience Q&A and comments.</p>
                </div>
                <button
                  onClick={() => setProfanityFilter(!profanityFilter)}
                  className={`w-11 h-6 rounded-full transition flex items-center px-0.5 ${
                    profanityFilter ? 'bg-purple-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-xs"></div>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Require Participant Name</h4>
                  <p className="text-[11px] text-slate-500">Disable anonymous postings; attendees must provide a display name.</p>
                </div>
                <button
                  onClick={() => setRequireName(!requireName)}
                  className={`w-11 h-6 rounded-full transition flex items-center px-0.5 ${
                    requireName ? 'bg-purple-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-xs"></div>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Lock Audience Responses</h4>
                  <p className="text-[11px] text-slate-500">Temporarily freeze all incoming poll votes, quiz answers, and questions.</p>
                </div>
                <button
                  onClick={() => onToggleOption('lockResponses', !options.lockResponses)}
                  className={`w-11 h-6 rounded-full transition flex items-center px-0.5 ${
                    options.lockResponses ? 'bg-red-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-xs"></div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition"
          >
            Close Tool
          </button>
        </div>
      </div>
    </div>
  );
}
