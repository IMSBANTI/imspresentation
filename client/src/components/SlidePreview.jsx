import React from 'react';
import { Eye, ChevronLeft, ChevronRight, Maximize2, Mic, Sparkles } from 'lucide-react';
import { resolveSlideBackground } from '../utils/themeUtils';

export default function SlidePreview({
  slide,
  currentIndex,
  totalSlides,
  onPrevSlide,
  onNextSlide,
  poll,
  quiz,
  subtitles,
  showResultsOnPresentation,
  onOpenFullscreen
}) {
  const calculatePercentage = (votes, total) => {
    if (!total || total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const totalPollVotes = poll?.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;
  const resolvedBg = resolveSlideBackground(slide?.background);

  return (
    <div className="bg-white rounded-2xl border border-purple-100 p-4 shadow-xs flex flex-col">
      {/* Top Header of Preview */}
      <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <Eye size={15} className="text-purple-600" />
          <span className="font-semibold text-slate-700">Preview</span>
          {subtitles?.active && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping mr-1"></span>
              LIVE SUBTITLES ON
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-600">
            {currentIndex + 1} / {totalSlides}
          </span>
          <button
            onClick={onOpenFullscreen}
            className="p-1 rounded text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition"
            title="Fullscreen Presenter Display"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Main Slide Canvas */}
      <div 
        className={`relative aspect-video w-full rounded-xl ${resolvedBg.className} ${resolvedBg.isLight ? 'text-slate-900' : 'text-white'} p-4 sm:p-6 flex flex-col justify-between overflow-hidden shadow-md select-none transition-all duration-500`}
        style={resolvedBg.style}
      >
        {/* Decorative ambient gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Slide Category Tag & Code */}
        <div className="relative z-10 flex items-center justify-between text-xs">
          <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-purple-200 font-semibold tracking-wide uppercase text-[10px] sm:text-[11px] border border-white/10">
            {slide?.tag || "PRESENTATION"}
          </span>
          <div className="flex items-center space-x-2 text-white/60 text-xs">
            <span className="hidden sm:inline">{typeof window !== 'undefined' ? window.location.host : 'ims'}</span>
            <span className="px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 font-mono font-bold text-[11px]">
              #{slide?.code || "IMSPRESENTATION"}
            </span>
          </div>
        </div>

        {/* Center Content based on layout */}
        <div className="relative z-10 my-auto py-1 sm:py-2">
          {/* Layout: Poll View (as shown in screenshot) */}
          {slide?.layout === 'poll' && poll ? (
            <div className="max-w-xl mx-auto w-full">
              <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white text-center mb-0.5 sm:mb-1 drop-shadow-sm line-clamp-2">
                {poll.question || slide.title}
              </h2>
              <p className="text-[11px] sm:text-xs text-purple-200/80 text-center mb-2 sm:mb-4">
                {totalPollVotes} responses recorded in real time
              </p>

              {/* Bar Chart Visualizer matching screenshot purple/blue gradient */}
              <div className="h-24 sm:h-32 flex items-end justify-center space-x-2 sm:space-x-4 md:space-x-6 px-2">
                {poll.options.map((opt, idx) => {
                  const pct = calculatePercentage(opt.votes, totalPollVotes);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group max-w-[80px]">
                      <span className="text-[10px] sm:text-xs font-bold text-purple-200 mb-1 opacity-90 transition group-hover:scale-110">
                        {pct}%
                      </span>
                      <div className="w-full bg-white/10 rounded-t-lg h-16 sm:h-24 flex items-end p-0.5 overflow-hidden">
                        <div
                          className="w-full rounded-t bg-gradient-to-t from-purple-600 via-indigo-500 to-cyan-400 transition-all duration-700 shadow-lg shadow-purple-500/20"
                          style={{ height: `${Math.max(8, pct)}%` }}
                        ></div>
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-white/70 mt-1 sm:mt-1.5 text-center line-clamp-2 leading-tight w-full font-medium">
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : slide?.layout === 'quiz' && quiz ? (
            /* Layout: Quiz View */
            <div className="max-w-xl mx-auto w-full text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-3 border border-amber-500/30">
                ⏱️ TIME REMAINING: {quiz.timeLimit}s
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
                {quiz.question}
              </h2>

              <div className="grid grid-cols-2 gap-3 text-left">
                {quiz.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center space-x-2.5 transition ${
                      quiz.revealed && opt.correct
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                        : 'bg-white/5 border-white/10 text-white/90'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">
                      {['A', 'B', 'C', 'D'][idx]}
                    </span>
                    <span className="truncate">{opt.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : slide?.layout === 'stats' ? (
            /* Layout: Stats */
            <div className="max-w-xl mx-auto w-full text-center">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                {slide.title}
              </h2>
              <p className="text-xs text-purple-200/80 mb-6 max-w-md mx-auto">
                {slide.subtitle}
              </p>
              <div className="grid grid-cols-3 gap-3">
                {slide.stats?.map((stat, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                    <div className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-[10px] text-white/70 mt-1 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Default Slide Layout */
            <div className="max-w-xl mx-auto w-full text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-3">
                {slide?.title}
              </h2>
              <p className="text-sm text-purple-200/80 max-w-md mx-auto leading-relaxed">
                {slide?.subtitle}
              </p>
            </div>
          )}
        </div>

        {/* Live Subtitle Banner Preview (if active) */}
        {subtitles?.active && subtitles?.text && (
          <div className="relative z-20 w-full px-4 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-purple-500/30 text-center animate-fadeIn">
            <span className="text-xs md:text-sm font-medium text-white/95">
              "{subtitles.text}"
            </span>
          </div>
        )}

        {/* Navigation Arrow Overlays */}
        <button
          onClick={onPrevSlide}
          disabled={currentIndex === 0}
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition ${
            currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-80 hover:opacity-100'
          }`}
          title="Previous Slide"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={onNextSlide}
          disabled={currentIndex >= totalSlides - 1}
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition ${
            currentIndex >= totalSlides - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-80 hover:opacity-100'
          }`}
          title="Next Slide"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
