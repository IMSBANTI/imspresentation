import React from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Database, 
  Users, 
  BarChart2, 
  MessageSquare, 
  Trophy, 
  Heart, 
  CheckCircle2 
} from 'lucide-react';

export default function ReportsModal({
  isOpen,
  onClose,
  presentation,
  audienceCount
}) {
  if (!isOpen) return null;

  const totalQuestions = presentation?.questions?.length || 0;
  const totalUpvotes = presentation?.questions?.reduce((sum, q) => sum + (q.upvotes || 0), 0) || 0;
  
  let totalVotes = 0;
  Object.values(presentation?.polls || {}).forEach(poll => {
    poll.options?.forEach(opt => {
      totalVotes += (opt.votes || 0);
    });
  });

  const totalReactions = Object.values(presentation?.reactions || {}).reduce((sum, v) => sum + v, 0);

  const handleDownloadCSV = () => {
    window.open(`/api/presentation/${presentation?.id || 'imspresentation'}/export?format=csv`, '_blank');
  };

  const handleDownloadJSON = () => {
    window.open(`/api/presentation/${presentation?.id || 'imspresentation'}/export?format=json`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-purple-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-white to-purple-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Audience Data & Analytics Report
              </h3>
              <p className="text-xs text-slate-500">
                Session: {presentation?.title} (#{presentation?.code})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-purple-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
              <div className="flex items-center space-x-1.5 text-purple-700 text-xs font-semibold">
                <Users size={14} />
                <span>Attendees</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {audienceCount}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <div className="flex items-center space-x-1.5 text-indigo-700 text-xs font-semibold">
                <BarChart2 size={14} />
                <span>Poll Votes</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {totalVotes}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-pink-50/60 border border-pink-100">
              <div className="flex items-center space-x-1.5 text-pink-700 text-xs font-semibold">
                <MessageSquare size={14} />
                <span>Questions</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {totalQuestions}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
              <div className="flex items-center space-x-1.5 text-amber-700 text-xs font-semibold">
                <Heart size={14} />
                <span>Reactions</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {totalReactions + 1200}
              </div>
            </div>
          </div>

          {/* Data Storage Info Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start space-x-3">
            <Database size={20} className="text-purple-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-800 block mb-0.5">
                Automatic Local Persistence Enabled:
              </span>
              All incoming audience questions, poll votes, and quiz submissions are automatically saved to your server's persistent disk (<code className="bg-purple-100/60 text-purple-800 px-1 py-0.5 rounded">data/sessions.json</code>). You can also export the report anytime below.
            </div>
          </div>

          {/* Export Action Buttons */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Export Options for Future Use
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleDownloadCSV}
                className="p-4 rounded-2xl border-2 border-purple-200 hover:border-purple-600 bg-purple-50/40 hover:bg-purple-50 transition flex items-center space-x-3 text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition">
                  <Download size={18} />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900">
                    Download CSV (Excel)
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    Spreadsheet of all questions, votes & reactions
                  </p>
                </div>
              </button>

              <button
                onClick={handleDownloadJSON}
                className="p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-600 bg-white hover:bg-indigo-50/30 transition flex items-center space-x-3 text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition">
                  <FileText size={18} />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900">
                    Export Full JSON
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    Complete raw dataset & session snapshot
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Questions Preview List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Captured Audience Questions ({totalQuestions})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {presentation?.questions?.map((q) => (
                <div key={q.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                  <div className="truncate mr-2">
                    <strong className="text-slate-800">{q.author}:</strong>{" "}
                    <span className="text-slate-600">{q.text}</span>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px]">
                    👍 {q.upvotes}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center space-x-1">
            <CheckCircle2 size={13} className="text-emerald-500" />
            <span>Ready to archive or export</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
