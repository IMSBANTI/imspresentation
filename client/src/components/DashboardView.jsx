import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Tv, 
  Laptop, 
  Copy, 
  Check, 
  ExternalLink, 
  Layers, 
  Users, 
  Calendar, 
  Sparkles, 
  Trash2, 
  LogOut,
  QrCode 
} from 'lucide-react';
import QRCodeModal from './QRCodeModal';

export default function DashboardView({
  user,
  onLogout,
  onOpenStudio,
  onOpenStage,
  onOpenJoin,
}) {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [templateChoice, setTemplateChoice] = useState('blank');
  const [creating, setCreating] = useState(false);
  const [qrModalPres, setQrModalPres] = useState(null);

  const fetchPresentations = async () => {
    try {
      const token = localStorage.getItem('ims_token');
      const headers = {};
      if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/presentations', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.token && (!token || token === 'null' || token === 'undefined')) {
          localStorage.setItem('ims_token', data.token);
        }
        setPresentations(data.presentations || []);
      }
    } catch (e) {
      console.error('Fetch presentations error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresentations();
  }, []);

  const handleCreatePresentation = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);

    try {
      const token = localStorage.getItem('ims_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/presentations', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: newTitle.trim(),
          code: newCode.trim() || undefined,
          template: templateChoice
        })
      });

      const data = await res.json();

      if (res.ok && data.presentation) {
        if (data.token) {
          localStorage.setItem('ims_token', data.token);
        }
        setShowNewModal(false);
        setNewTitle('');
        setNewCode('');
        setTemplateChoice('blank');
        await fetchPresentations();
        onOpenStudio(data.presentation.id);
      } else {
        alert(data.error || 'Failed to create presentation. Please try again.');
      }
    } catch (e) {
      console.error('Create presentation error:', e);
      alert('Network error connecting to server. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePresentation = async (presId, presTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${presTitle}"?`)) return;
    try {
      const token = localStorage.getItem('ims_token');
      const res = await fetch(`/api/presentations/${presId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPresentations();
      }
    } catch (e) {
      console.error('Delete presentation error:', e);
    }
  };

  const copyJoinLink = (code) => {
    const url = `${window.location.origin}/?view=audience&room=${code}`;
    navigator.clipboard.writeText(url);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-slate-800">
      {/* Top Dashboard Header */}
      <header className="h-16 bg-white border-b border-purple-100 px-6 flex items-center justify-between shadow-xs sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
            IMS
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
              imspresentation
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-800 block">
              {user?.name || "Presenter"}
            </span>
            <span className="text-[10px] text-slate-400">
              {user?.email}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
        {/* Banner */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative z-10">
            <span className="px-3 py-1 rounded-full bg-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-400/30">
              Connected to Neon Cloud
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-2">
              Welcome back, {user?.name || "Presenter"}!
            </h2>
            <p className="text-xs md:text-sm text-purple-200/80 max-w-lg mt-1">
              Create, host, and monitor live presentations with interactive polls, quizzes, real-time transcription, and attendee analytics.
            </p>
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="relative z-10 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs md:text-sm shadow-lg transition flex items-center space-x-2 shrink-0 active:scale-95"
          >
            <Plus size={16} />
            <span>New Presentation</span>
          </button>
        </div>

        {/* Presentations Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">
              Your Presentations ({presentations.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-12 text-center text-purple-600 text-xs font-semibold">
              Loading your presentations from database...
            </div>
          ) : presentations.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-purple-200 space-y-3">
              <Layers size={36} className="mx-auto text-purple-300" />
              <h4 className="text-sm font-bold text-slate-700">No presentations created yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create your first interactive presentation deck to start collecting live audience votes, questions, and reactions.
              </p>
              <button
                onClick={() => setShowNewModal(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold shadow-xs hover:bg-purple-700 transition inline-flex items-center space-x-1"
              >
                <Plus size={14} />
                <span>Create Presentation</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {presentations.map((pres) => (
                <div
                  key={pres.id}
                  className="bg-white rounded-2xl border border-purple-100 hover:border-purple-300 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Bar of Card */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono font-bold text-xs">
                        #{pres.code}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {pres.slides?.length || 7} slides
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base group-hover:text-purple-700 transition line-clamp-2">
                      {pres.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      Presenter: {pres.author || user?.name}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenStudio(pres.id)}
                      className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center space-x-1.5"
                      title="Open Presenter Studio"
                    >
                      <Laptop size={13} />
                      <span>Studio</span>
                    </button>

                    <button
                      onClick={() => onOpenStage(pres.id)}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-xs font-medium transition"
                      title="Open Stage Projector View"
                    >
                      <Tv size={14} />
                    </button>

                    <button
                      onClick={() => setQrModalPres(pres)}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-xs font-medium transition flex items-center space-x-1"
                      title="Show Audience QR Code"
                    >
                      <QrCode size={14} />
                    </button>

                    <button
                      onClick={() => copyJoinLink(pres.code)}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-xs font-medium transition flex items-center space-x-1"
                      title="Copy Audience Join URL"
                    >
                      {copiedId === pres.code ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>

                    <button
                      onClick={() => handleDeletePresentation(pres.id, pres.title)}
                      className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 text-xs font-medium transition flex items-center cursor-pointer"
                      title="Delete Presentation"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal: New Presentation */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-purple-100 shadow-2xl p-6 space-y-4 animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-900">
              Create New Presentation
            </h3>
            <p className="text-xs text-slate-500">
              Setup a new interactive slide deck with live polls, quizzes, and Q&A.
            </p>

            <form onSubmit={handleCreatePresentation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Presentation Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Q3 Company All-Hands"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-xs text-slate-800 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Custom Room Code (Optional)
                </label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ALLHANDS"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-xs font-mono uppercase text-slate-800 outline-hidden"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Audience will use this code to join from their smartphones.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Starting Slides
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTemplateChoice('blank')}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      templateChoice === 'blank'
                        ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-600/15'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">📄 Blank Deck</span>
                        {templateChoice === 'blank' && (
                          <span className="text-[9px] font-bold uppercase bg-purple-200 text-purple-800 px-1.5 py-0.2 rounded-sm">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        1 clean Title slide. Build your deck from scratch with no pre-filled slides.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTemplateChoice('sample')}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      templateChoice === 'sample'
                        ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-600/15'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">🎨 Sample Template</span>
                        {templateChoice === 'sample' && (
                          <span className="text-[9px] font-bold uppercase bg-purple-200 text-purple-800 px-1.5 py-0.2 rounded-sm">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        6 pre-built slides with sample Poll, Quiz & Q&A.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewModal(false);
                    setTemplateChoice('blank');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition"
                >
                  {creating ? "Creating..." : "Create & Launch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audience Scan to Join QR Code Modal */}
      <QRCodeModal
        isOpen={!!qrModalPres}
        onClose={() => setQrModalPres(null)}
        presentation={qrModalPres}
      />
    </div>
  );
}
