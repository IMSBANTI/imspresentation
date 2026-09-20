import React, { useState } from 'react';
import { X, BarChart2, HelpCircle, MessageSquare, FileText, Plus, Sparkles } from 'lucide-react';

export default function AddSlideModal({
  isOpen,
  onClose,
  onAddSlide,
  slideCount
}) {
  const [slideType, setSlideType] = useState('poll'); // 'poll' | 'quiz' | 'qa' | 'content'
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [options, setOptions] = useState(['Option 1', 'Option 2', 'Option 3']);
  const [correctOption, setCorrectOption] = useState(0);
  const [timeLimit, setTimeLimit] = useState(20);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, `Option ${options.length + 1}`]);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const next = [...options];
    next[index] = value;
    setOptions(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextNum = (slideCount || 1) + 1;

    let slidePayload = {
      title: title.trim() || (slideType === 'poll' ? 'Live Audience Poll' : (slideType === 'quiz' ? 'Quiz Challenge' : `Slide #${nextNum}`)),
      subtitle: subtitle.trim() || '',
      layout: slideType,
      tag: slideType.toUpperCase(),
    };

    if (slideType === 'poll') {
      slidePayload.layout = 'poll';
      slidePayload.tag = 'LIVE POLL';
      slidePayload.poll = {
        question: title.trim() || 'Audience Poll',
        options: options.map(opt => ({ text: opt, votes: 0 })),
      };
    } else if (slideType === 'quiz') {
      slidePayload.layout = 'quiz';
      slidePayload.tag = 'LIVE QUIZ';
      slidePayload.timeLimit = parseInt(timeLimit) || 20;
      slidePayload.quiz = {
        title: title.trim() || 'Knowledge Check',
        question: title.trim() || 'Knowledge Check',
        options: options.map((opt, idx) => ({
          text: opt,
          correct: idx === correctOption
        })),
        timeLimit: parseInt(timeLimit) || 20,
      };
    } else if (slideType === 'qa') {
      slidePayload.layout = 'qa';
      slidePayload.tag = 'OPEN Q&A';
    } else {
      slidePayload.layout = 'title';
      slidePayload.tag = `SLIDE ${nextNum}`;
    }

    onAddSlide(slidePayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-purple-100 shadow-2xl p-6 space-y-4 animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-purple-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <Plus size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add New Slide</h3>
              <p className="text-xs text-slate-400">Choose slide type & interactions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Slide Type Grid */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'poll', label: 'Live Poll', icon: BarChart2, color: 'text-purple-600' },
            { id: 'quiz', label: 'Quiz', icon: HelpCircle, color: 'text-amber-500' },
            { id: 'qa', label: 'Q&A Floor', icon: MessageSquare, color: 'text-indigo-500' },
            { id: 'content', label: 'Content', icon: FileText, color: 'text-emerald-500' },
          ].map((type) => {
            const Icon = type.icon;
            const isSelected = slideType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setSlideType(type.id)}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-purple-200 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} className={`mb-1 ${type.color}`} />
                <span className={`text-xs font-bold ${isSelected ? 'text-purple-900' : 'text-slate-600'}`}>
                  {type.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {slideType === 'poll' ? 'Poll Question' : (slideType === 'quiz' ? 'Quiz Question' : 'Slide Title')}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                slideType === 'poll'
                  ? 'e.g. What is your primary goal today?'
                  : (slideType === 'quiz'
                    ? 'e.g. Which metric grew the fastest?'
                    : 'e.g. Key Takeaways & Discussion')
              }
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-xs text-slate-800 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Subtitle or Instructions (Optional)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Select the answer that applies to you"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-purple-600 text-xs text-slate-800 outline-hidden"
            />
          </div>

          {/* Dynamic Options for Poll or Quiz */}
          {(slideType === 'poll' || slideType === 'quiz') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {slideType === 'quiz' ? 'Options (Select the correct one)' : 'Poll Choices'}
                </label>
                {options.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center space-x-1"
                  >
                    <Plus size={12} />
                    <span>Add Choice</span>
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    {slideType === 'quiz' && (
                      <input
                        type="radio"
                        name="correctOption"
                        checked={correctOption === idx}
                        onChange={() => setCorrectOption(idx)}
                        className="text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                        title="Mark as correct answer"
                      />
                    )}
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 focus:border-purple-600 text-xs text-slate-800 outline-hidden"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="p-1 rounded text-slate-400 hover:text-red-500 transition"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {slideType === 'quiz' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Timer Limit (Seconds)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 focus:border-purple-600 text-xs text-slate-800 outline-hidden font-mono"
              />
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition flex items-center space-x-1 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Slide</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
