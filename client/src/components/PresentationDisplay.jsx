import React, { useEffect, useState } from 'react';
import { QrCode, Sparkles, Trophy, Users, Pin, Mic } from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import QRCodeModal from './QRCodeModal';

export default function PresentationDisplay({
  presentation,
  currentSlide,
  poll,
  quiz,
  questions = [],
  subtitles,
  audienceCount = 1216,
  reactions = [],
  onClose,
}) {
  const [activeReactions, setActiveReactions] = useState([]);
  const [showQrModal, setShowQrModal] = useState(false);

  // Trigger floating reactions
  useEffect(() => {
    if (reactions && reactions.length > 0) {
      const latest = reactions[reactions.length - 1];
      const id = Date.now() + Math.random();
      const xPos = 15 + Math.random() * 70; // random percentage 15% to 85%

      setActiveReactions((prev) => [
        ...prev.slice(-15),
        { id, emoji: latest.emoji, xPos }
      ]);

      const timer = setTimeout(() => {
        setActiveReactions((prev) => prev.filter((r) => r.id !== id));
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [reactions]);

  // Quiz podium celebration
  useEffect(() => {
    if (quiz?.revealed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [quiz?.revealed]);

  const pinnedQuestion = questions.find((q) => q.pinned);

  const calculatePercentage = (votes, total) => {
    if (!total || total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const totalPollVotes = poll?.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;

  return (
    <div className="fixed inset-0 bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none z-50">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Floating Reaction Particles Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
        {activeReactions.map((item) => (
          <div
            key={item.id}
            className="absolute bottom-12 text-4xl animate-floating-reaction drop-shadow-lg"
            style={{ left: `${item.xPos}%` }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Top Stage Bar / Join Banner */}
      {presentation?.options?.showInstructionsToJoin && (
        <header className="px-8 py-4 flex items-center justify-between border-b border-white/10 bg-black/30 backdrop-blur-md relative z-30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-sm font-black text-xs">
              IMS
            </div>
            <div>
              <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider block">
                Join from your phone
              </span>
              <span className="text-sm font-medium text-white/90">
                Go to <strong className="text-white underline">{typeof window !== 'undefined' ? window.location.host : 'your-site'}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-md cursor-pointer active:scale-95"
              title="Show large QR code for audience"
            >
              <QrCode size={14} />
              <span>Show QR Code</span>
            </button>

            <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-purple-600/30 border border-purple-400/30 text-purple-200">
              <span className="text-xs uppercase tracking-wider text-purple-300">Room Code:</span>
              <span className="font-mono text-base font-extrabold text-white">
                #{presentation?.code || "IMSPRESENTATION"}
              </span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs">
              <Users size={13} className="text-emerald-400" />
              <span>{audienceCount} online</span>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white/80 transition"
              >
                Exit Stage
              </button>
            )}
          </div>
        </header>
      )}

      {/* Main Presentation Stage Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 max-w-6xl mx-auto w-full relative z-20">
        {/* Layout: LIVE POLL */}
        {currentSlide?.layout === 'poll' && poll ? (
          <div className="w-full text-center space-y-8 animate-fadeIn">
            <div>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30">
                Live Audience Poll
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white mt-4 drop-shadow-md">
                {poll.question || currentSlide.title}
              </h1>
              <p className="text-sm text-purple-200/70 mt-2">
                {totalPollVotes} responses cast in real time
              </p>
            </div>

            {/* Presentation Poll Chart matching screenshot */}
            {presentation?.options?.showResultsOnPresentation && (
              <div className="h-64 flex items-end justify-center space-x-6 md:space-x-12 px-8 max-w-4xl mx-auto">
                {poll.options.map((opt, idx) => {
                  const pct = calculatePercentage(opt.votes, totalPollVotes);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group max-w-[140px]">
                      <span className="text-lg md:text-xl font-extrabold text-purple-200 mb-2 transition">
                        {pct}%
                      </span>
                      <div className="w-full bg-white/10 rounded-t-2xl h-52 flex items-end p-1 shadow-inner">
                        <div
                          className="w-full rounded-t-xl bg-gradient-to-t from-purple-600 via-indigo-500 to-cyan-400 transition-all duration-700 shadow-xl shadow-purple-600/30"
                          style={{ height: `${Math.max(10, pct)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs md:text-sm text-white/90 mt-3 text-center font-medium line-clamp-2">
                        {opt.text}
                      </span>
                      <span className="text-[11px] text-white/50 mt-0.5">
                        {opt.votes || 0} votes
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : currentSlide?.layout === 'quiz' && quiz ? (
          /* Layout: LIVE QUIZ */
          <div className="w-full text-center space-y-8 animate-fadeIn max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              <Trophy size={16} />
              <span>LIVE QUIZ QUESTION</span>
              <span>•</span>
              <span>{quiz.timeLimit}s</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              {quiz.question}
            </h1>

            <div className="grid grid-cols-2 gap-4 text-left">
              {quiz.options.map((opt, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border text-sm font-semibold flex items-center space-x-3 transition duration-500 ${
                    quiz.revealed && opt.correct
                      ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 shadow-lg shadow-emerald-500/20 scale-102'
                      : 'bg-white/10 border-white/10 text-white/90'
                  }`}
                >
                  <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold">
                    {['A', 'B', 'C', 'D'][idx]}
                  </span>
                  <span>{opt.text}</span>
                </div>
              ))}
            </div>
          </div>
        ) : currentSlide?.layout === 'stats' ? (
          /* Layout: STATS */
          <div className="w-full text-center space-y-8 animate-fadeIn max-w-4xl">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider border border-cyan-500/30">
              {currentSlide.tag || "INSIGHT"}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white">
              {currentSlide.title}
            </h1>
            <p className="text-base text-purple-200/80 max-w-2xl mx-auto">
              {currentSlide.subtitle}
            </p>
            <div className="grid grid-cols-3 gap-6 pt-4">
              {currentSlide.stats?.map((stat, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
                  <div className="text-4xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-white/70 mt-2 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Default Presentation Slide */
          <div className="w-full text-center space-y-6 animate-fadeIn max-w-3xl">
            <span className="px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30">
              {currentSlide?.tag || "SLIDE"}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              {currentSlide?.title}
            </h1>
            <p className="text-lg md:text-xl text-purple-200/80 max-w-2xl mx-auto leading-relaxed">
              {currentSlide?.subtitle}
            </p>

            {/* Embedded QR Code on Title/Welcome Slide */}
            {currentSlide?.layout === 'title' && (
              <div className="pt-2 flex flex-col items-center">
                <div 
                  onClick={() => setShowQrModal(true)}
                  className="p-3 bg-white rounded-2xl shadow-2xl border-2 border-purple-400/40 cursor-pointer hover:scale-105 transition"
                  title="Click to enlarge QR code"
                >
                  <QRCodeSVG
                    value={typeof window !== 'undefined' ? `${window.location.origin}/?view=audience&room=${presentation?.code || 'IMSPRESENTATION'}` : 'https://imspresentation.onrender.com'}
                    size={140}
                    bgColor="#ffffff"
                    fgColor="#1e1b4b"
                    level="Q"
                  />
                </div>
                <span className="text-xs font-semibold text-purple-200 mt-2 flex items-center space-x-1">
                  <span>📱 Scan with camera to join</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Pinned Audience Question Spotlight */}
        {pinnedQuestion && (
          <div className="mt-8 max-w-2xl w-full p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-purple-950/80 to-slate-900/90 border-2 border-amber-400/60 shadow-2xl backdrop-blur-md animate-fadeIn flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
              <Pin size={18} className="fill-current" />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-amber-300">
                  {pinnedQuestion.author} asked:
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300">
                  {pinnedQuestion.upvotes} upvotes
                </span>
              </div>
              <p className="text-sm font-medium text-white/95 mt-0.5">
                "{pinnedQuestion.text}"
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Live Subtitles Banner */}
      {subtitles?.active && (
        <footer className="w-full bg-black/80 backdrop-blur-xl border-t border-purple-500/30 px-8 py-3 text-center relative z-30">
          <div className="max-w-4xl mx-auto flex items-center justify-center space-x-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold shrink-0">
              <Mic size={11} className="mr-1 animate-pulse" />
              LIVE
            </span>
            <p className="text-base md:text-lg font-medium text-white/95 leading-snug">
              "{subtitles.text || "Listening for speaker..."}"
            </p>
          </div>
        </footer>
      )}

      {/* QR Code Scan to Join Modal */}
      <QRCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        presentation={presentation}
      />
    </div>
  );
}
