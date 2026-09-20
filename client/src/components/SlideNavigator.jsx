import React, { useState } from 'react';
import { Plus, BarChart2, HelpCircle, FileText, CheckCircle2, Trash2 } from 'lucide-react';
import AddSlideModal from './AddSlideModal';

export default function SlideNavigator({ 
  slides, 
  currentSlideIndex, 
  onSelectSlide, 
  onAddSlide,
  onDeleteSlide
}) {
  const [showAddModal, setShowAddModal] = useState(false);

  const getIconForLayout = (layout) => {
    switch (layout) {
      case 'poll':
        return <BarChart2 size={13} className="text-purple-600" />;
      case 'quiz':
        return <HelpCircle size={13} className="text-amber-500" />;
      case 'stats':
        return <CheckCircle2 size={13} className="text-emerald-600" />;
      default:
        return <FileText size={13} className="text-indigo-500" />;
    }
  };

  return (
    <aside className="w-56 shrink-0 border-r border-purple-100 bg-white p-3 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Slides ({slides.length})
        </span>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-1 rounded-md text-purple-600 hover:bg-purple-50 transition cursor-pointer"
          title="Add Slide"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-3 flex-1">
        {slides.map((slide, index) => {
          const isActive = index === currentSlideIndex;
          return (
            <div
              key={slide.id || index}
              onClick={() => onSelectSlide(index)}
              className={`group relative rounded-xl p-2.5 transition cursor-pointer select-none border-2 ${
                isActive
                  ? 'border-purple-600 bg-purple-50/50 shadow-sm ring-2 ring-purple-600/10'
                  : 'border-slate-100 bg-white hover:border-purple-200 hover:bg-slate-50/50'
              }`}
            >
              {/* Thumbnail header */}
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {index + 1}
                </span>

                <div className="flex items-center space-x-1.5">
                  <div className="flex items-center space-x-1">
                    {getIconForLayout(slide.layout)}
                    <span className="text-[10px] font-medium text-slate-400 uppercase">
                      {slide.tag || slide.layout}
                    </span>
                  </div>

                  {onDeleteSlide && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (slides.length <= 1) {
                          if (window.confirm("Delete this slide and reset to a clean title slide?")) {
                            onDeleteSlide(index, slide.id);
                          }
                        } else {
                          if (window.confirm(`Delete slide ${index + 1}: "${slide.title}"?`)) {
                            onDeleteSlide(index, slide.id);
                          }
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Delete Slide"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Thumbnail mini mock canvas */}
              <div className="w-full h-16 rounded-lg bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 p-2 flex flex-col justify-between overflow-hidden shadow-inner">
                <p className="text-[10px] font-semibold text-white/90 line-clamp-2 leading-tight">
                  {slide.title}
                </p>
                {slide.layout === 'poll' && (
                  <div className="flex space-x-1 items-end h-4 opacity-80">
                    <div className="w-1/4 h-2 bg-purple-400 rounded-xs"></div>
                    <div className="w-1/4 h-3.5 bg-indigo-400 rounded-xs"></div>
                    <div className="w-1/4 h-2.5 bg-pink-400 rounded-xs"></div>
                    <div className="w-1/4 h-1 bg-cyan-400 rounded-xs"></div>
                  </div>
                )}
                {slide.layout === 'quiz' && (
                  <div className="w-full bg-amber-500/30 rounded py-0.5 px-1 text-[8px] text-amber-200 truncate">
                    ⏱️ Quiz Question
                  </div>
                )}
                {slide.layout === 'stats' && (
                  <div className="flex justify-around text-[9px] font-bold text-cyan-300">
                    <span>3.4x</span>
                    <span>92%</span>
                  </div>
                )}
                {slide.layout === 'title' && (
                  <div className="w-8 h-1 bg-purple-400 rounded-full opacity-60"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Add Slide Button at bottom */}
      <button
        onClick={() => setShowAddModal(true)}
        className="mt-3 w-full py-2.5 border border-dashed border-purple-200 rounded-xl text-purple-600 hover:border-purple-400 hover:bg-purple-50 text-xs font-medium flex items-center justify-center space-x-1.5 transition cursor-pointer"
      >
        <Plus size={14} />
        <span>Add interactive slide</span>
      </button>

      {/* Add Slide Modal */}
      <AddSlideModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddSlide={onAddSlide}
        slideCount={slides.length}
      />
    </aside>
  );
}
