import { useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { mockApi } from "@/lib/mockApi";

export default function CommentThread({ postId, me, onAdded }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    mockApi.entities.Comment.filter({ post_id: postId }, { sort: "created_date", limit: 100 })
      .then((page) => setComments(page.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  const send = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const created = await mockApi.entities.Comment.create({
        post_id: postId,
        content,
        author_name: me?.full_name || "EV Driver",
      });
      setComments((prev) => [...prev, created]);
      setText("");
      onAdded?.();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-50 space-y-2.5">
      {loading && (
        <div className="flex justify-center py-2">
          <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />
        </div>
      )}
      {!loading && comments.length === 0 && (
        <p className="text-[12px] text-slate-400">No comments yet. Start the conversation.</p>
      )}
      {comments.map((c) => (
        <div key={c.id} className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px] shrink-0">
            {(c.author_name || "E").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-800">{c.author_name || "EV Driver"}</div>
            <p className="text-[13px] text-slate-600 whitespace-pre-wrap break-words">{c.content}</p>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-2 bg-slate-50 rounded-full pl-3 pr-1.5 py-1.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Write a comment..."
          className="flex-1 bg-transparent text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none min-w-0"
        />
        <button
          onClick={send}
          disabled={sending || !text.trim()}
          aria-label="Send comment"
          className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center disabled:opacity-40 shrink-0"
        >
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
