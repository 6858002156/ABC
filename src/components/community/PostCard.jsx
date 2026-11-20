import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import { Image } from "@/components/ui/image";
import CommentThread from "@/components/community/CommentThread";
import { cn } from "@/lib/utils";

export default function PostCard({
  post,
  index,
  me,
  liked,
  likeCount,
  commentCount,
  onToggleLike,
  onCommentAdded,
}) {
  const [showComments, setShowComments] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.03 * Math.min(index, 10) }}
      className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-[13px]">
          {(post.author_name || "E").charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-slate-900 truncate">
            {post.author_name || "EV Driver"}
          </div>
          <div className="text-[11px] text-slate-400">
            {new Date(post.created_date).toLocaleDateString()}
          </div>
        </div>
      </div>

      <p className="text-[14px] text-slate-700 mt-3 whitespace-pre-wrap break-words">
        {post.content}
      </p>

      {post.image_url && (
        <div className="mt-3 rounded-xl overflow-hidden bg-slate-100">
          <Image src={post.image_url} alt="" className="w-full h-64" />
        </div>
      )}

      {post.video_url && (
        <video
          src={post.video_url}
          controls
          playsInline
          preload="metadata"
          className="mt-3 w-full max-h-80 rounded-xl bg-black"
        />
      )}

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
        <button
          onClick={() => onToggleLike(post)}
          className={cn(
            "inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors",
            liked ? "text-rose-500" : "text-slate-500 hover:text-rose-500",
          )}
        >
          <Heart className={cn("w-4 h-4", liked && "fill-current")} /> {likeCount || 0}
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors",
            showComments ? "text-emerald-600" : "text-slate-500 hover:text-emerald-600",
          )}
        >
          <MessageCircle className="w-4 h-4" /> {commentCount || 0}
        </button>
      </div>

      {showComments && (
        <CommentThread postId={post.id} me={me} onAdded={() => onCommentAdded(post)} />
      )}
    </motion.div>
  );
}