'use client';

import { useState, useEffect, useRef } from 'react';
import { Mail, Lock, AlertCircle, Clock, ExternalLink, MessageSquare, Send } from 'lucide-react';

interface PreviewData {
  html: string;
  designName: string;
  expiresAt: string;
  hasPassword: boolean;
  password: string | null;
}

interface Comment {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

export default function PreviewPage({ params }: { params: { token: string } }) {
  const { token } = params;
  const [data, setData] = useState<PreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [commentSending, setCommentSending] = useState(false);

  useEffect(() => {
    fetch(`/api/preview?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); }
        else { setData(d); if (!d.hasPassword) setUnlocked(true); }
      })
      .catch(() => setError('Failed to load preview'))
      .finally(() => setLoading(false));
  }, [token]);

  // Resize iframe to content height
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'wizemail-height' && iframeRef.current) {
        iframeRef.current.style.height = `${e.data.height}px`;
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const loadComments = () => {
    fetch(`/api/preview/comments?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => { if (d.comments) setComments(d.comments); })
      .catch(() => undefined);
  };

  useEffect(() => {
    if (unlocked) loadComments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked]);

  const handlePostComment = async () => {
    if (!commentName.trim() || !commentBody.trim()) return;
    setCommentSending(true);
    try {
      const res = await fetch('/api/preview/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, authorName: commentName, body: commentBody }),
      });
      if (res.ok) {
        setCommentBody('');
        loadComments();
      }
    } finally {
      setCommentSending(false);
    }
  };

  const handleUnlock = () => {
    if (!data) return;
    if (passwordInput === data.password) {
      setUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f11] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#71717a]">Loading preview…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f11] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#f4f4f5]">Preview unavailable</h1>
            <p className="text-sm text-[#71717a] mt-1">{error}</p>
          </div>
          <a href="/" className="inline-flex items-center gap-1.5 text-sm text-[#818cf8] hover:text-[#6366f1] transition-colors">
            Go to Wizemail
          </a>
        </div>
      </div>
    );
  }

  if (!data) return null;

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#0f0f11] flex items-center justify-center px-4">
        <div className="max-w-sm w-full space-y-6">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6 text-[#818cf8]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#f4f4f5]">{data.designName || 'Email Preview'}</h1>
              <p className="text-sm text-[#71717a] mt-1">This preview is password-protected</p>
            </div>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              placeholder="Enter password"
              className={`w-full bg-[#1c1c1f] border rounded-lg px-3 py-2.5 text-sm text-[#f4f4f5] placeholder-[#3a3a3e] focus:outline-none transition-colors ${
                passwordError ? 'border-red-500/50 focus:border-red-500' : 'border-[#2a2a2e] focus:border-[#6366f1]/60'
              }`}
              autoFocus
            />
            {passwordError && <p className="text-xs text-red-400">Incorrect password</p>}
            <button
              onClick={handleUnlock}
              className="w-full py-2.5 rounded-lg bg-[#6366f1] text-sm text-white font-medium hover:bg-[#818cf8] transition-colors"
            >
              View preview
            </button>
          </div>
        </div>
      </div>
    );
  }

  const expiresDate = new Date(data.expiresAt);
  const daysLeft = Math.ceil((expiresDate.getTime() - Date.now()) / 86400000);

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      {/* Header bar */}
      <div className="bg-[#0f0f11] border-b border-[#2a2a2e] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#6366f1] flex items-center justify-center">
            <Mail className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-semibold text-[#f4f4f5]">Wizemail</span>
          <span className="text-[#3a3a3e] text-xs">/</span>
          <span className="text-xs text-[#a1a1aa] truncate max-w-[200px]">{data.designName || 'Email Preview'}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[#52525b]">
            <Clock className="w-3 h-3" />
            <span>Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</span>
          </div>
          <a
            href="/"
            className="flex items-center gap-1 text-xs text-[#71717a] hover:text-[#a1a1aa] transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">Create your own</span>
          </a>
        </div>
      </div>

      {/* Email preview */}
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#e2e8f0]">
          <iframe
            ref={iframeRef}
            srcDoc={data.html}
            className="w-full border-0"
            style={{ minHeight: 400 }}
            title={data.designName || 'Email Preview'}
            sandbox="allow-same-origin"
          />
        </div>
        <p className="text-center text-[10px] text-[#94a3b8] mt-4">
          Read-only preview · shared via{' '}
          <a href="/" className="text-[#818cf8] hover:underline">Wizemail</a>
        </p>

        {/* Comments */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#64748b]" />
            <h2 className="text-sm font-semibold text-[#374151]">Leave feedback</h2>
          </div>

          {/* Existing comments */}
          {comments.length > 0 && (
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="bg-white rounded-xl border border-[#e2e8f0] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center">
                      <span className="text-xs font-semibold text-[#6366f1]">{c.author_name[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#374151]">{c.author_name}</p>
                      <p className="text-[10px] text-[#94a3b8]">{new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#4b5563] leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>
          )}

          {/* New comment form */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 space-y-3">
            <input
              type="text"
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              placeholder="Your name"
              className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#374151] placeholder-[#94a3b8] focus:outline-none focus:border-[#6366f1]/50 transition-colors"
            />
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Share your feedback on this design…"
              rows={3}
              className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#374151] placeholder-[#94a3b8] focus:outline-none focus:border-[#6366f1]/50 transition-colors resize-none"
            />
            <button
              onClick={handlePostComment}
              disabled={commentSending || !commentName.trim() || !commentBody.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#6366f1] text-sm text-white font-medium hover:bg-[#818cf8] transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {commentSending ? 'Sending…' : 'Post comment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
