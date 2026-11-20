import { useRef, useState } from "react";
import { ImagePlus, Loader2, Send, X, Video } from "lucide-react";
import { mockApi } from "@/lib/mockApi";
import { Image } from "@/components/ui/image";

const MAX_MB = 50;

export default function PostComposer({ me, onCreated }) {
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null); // { url, kind }
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Please choose a file under ${MAX_MB} MB.`);
      return;
    }
    setUploading(true);
    setError("");
    try {
      const { file_url } = await mockApi.integrations.Core.UploadPublicFile({ file });
      setMedia({ url: file_url, kind: file.type.startsWith("video") ? "video" : "image" });
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const post = async () => {
    if (posting || uploading) return;
    if (!text.trim() && !media) return;
    setPosting(true);
    setError("");
    const content =
      text.trim() || (media?.kind === "video" ? "Shared a video" : "Shared a photo");
    try {
      const created = await mockApi.entities.Post.create({
        content,
        author_name: me?.full_name || "EV Driver",
        type: "post",
        image_url: media?.kind === "image" ? media.url : undefined,
        video_url: media?.kind === "video" ? media.url : undefined,
      });
      setText("");
      setMedia(null);
      onCreated(created);
    } catch {
      setError("Could not post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-[13px] shrink-0">
          {(me?.full_name || "E").charAt(0).toUpperCase()}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Share a tip, route, or charging find..."
          className="flex-1 resize-none text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
        />
      </div>

      {media && (
        <div className="relative mt-3 rounded-xl overflow-hidden bg-slate-100">
          {media.kind === "video" ? (
            <video src={media.url} controls playsInline className="w-full max-h-64 bg-black" />
          ) : (
            <Image src={media.url} alt="Selected photo" className="w-full h-48" />
          )}
          <button
            onClick={() => setMedia(null)}
            aria-label="Remove attachment"
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/70 text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-[12px] text-rose-500 font-medium">{error}</p>}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={pick}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-emerald-600 disabled:opacity-50 transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : media?.kind === "video" ? (
            <Video className="w-4 h-4" />
          ) : (
            <ImagePlus className="w-4 h-4" />
          )}
          {uploading ? "Uploading..." : media ? "Change media" : "Photo or video"}
        </button>
        <button
          onClick={post}
          disabled={posting || uploading || (!text.trim() && !media)}
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold text-[13px] px-4 py-2 rounded-full transition-colors"
        >
          {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Post
        </button>
      </div>
    </div>
  );
}
