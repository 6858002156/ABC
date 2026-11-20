import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";
import { mockApi } from "@/lib/mockApi";
import PostComposer from "@/components/community/PostComposer";
import PostCard from "@/components/community/PostCard";

const countsByPost = (rows) =>
  (rows || []).reduce((acc, row) => {
    if (row.post_id) acc[row.post_id] = row.count || 0;
    return acc;
  }, {});

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [likeCounts, setLikeCounts] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const [myLikes, setMyLikes] = useState({});

  const loadCounts = useCallback(async () => {
    const [likes, comments] = await Promise.all([
      mockApi.entities.PostLike.aggregate({ query: {}, groupBy: "post_id" }),
      mockApi.entities.Comment.aggregate({ query: {}, groupBy: "post_id" }),
    ]);
    setLikeCounts(countsByPost(likes?.rows));
    setCommentCounts(countsByPost(comments?.rows));
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const page = await mockApi.entities.Post.list({ sort: "-created_date", limit: 50 });
        setPosts(page.items || []);
        await loadCounts();
      } catch {
        // keep the empty state if the feed can't load
      } finally {
        setLoading(false);
      }
    };
    init();
    mockApi.auth
      .me()
      .then(async (user) => {
        setMe(user);
        const mine = await mockApi.entities.PostLike.filter(
          { user_id: user.id },
          { limit: 500 },
        );
        setMyLikes(
          (mine.items || []).reduce((acc, like) => {
            acc[like.post_id] = like.id;
            return acc;
          }, {}),
        );
      })
      .catch(() => {});
  }, [loadCounts]);

  const addPost = (created) => setPosts((prev) => [created, ...prev]);

  const toggleLike = async (post) => {
    if (!me) return;
    const existingId = myLikes[post.id];
    if (existingId) {
      await mockApi.entities.PostLike.delete(existingId);
      setMyLikes((prev) => {
        const next = { ...prev };
        delete next[post.id];
        return next;
      });
      setLikeCounts((prev) => ({
        ...prev,
        [post.id]: Math.max(0, (prev[post.id] || 0) - 1),
      }));
      return;
    }
    const like = await mockApi.entities.PostLike.create({
      post_id: post.id,
      user_id: me.id,
    });
    setMyLikes((prev) => ({ ...prev, [post.id]: like.id }));
    setLikeCounts((prev) => ({ ...prev, [post.id]: (prev[post.id] || 0) + 1 }));
  };

  const bumpComments = (post) =>
    setCommentCounts((prev) => ({ ...prev, [post.id]: (prev[post.id] || 0) + 1 }));

  const contributors = [
    ...new Map(posts.map((p) => [p.author_name, p])).values(),
  ].slice(0, 6);

  return (
    <div className="px-5 pt-5 pb-4 space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[13px] text-slate-400 font-medium">Community</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
            EV squad
          </h1>
        </div>
        <div className="flex items-center gap-1 text-[12px] font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-100">
          <Users className="w-3.5 h-3.5 text-emerald-500" /> {contributors.length || 0} members
        </div>
      </div>

      <PostComposer me={me} onCreated={addPost} />

      <div className="space-y-3">
        {loading &&
          [0, 1, 2].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
          ))}

        {!loading &&
          posts.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              index={i}
              me={me}
              liked={Boolean(myLikes[post.id])}
              likeCount={likeCounts[post.id]}
              commentCount={commentCounts[post.id]}
              onToggleLike={toggleLike}
              onCommentAdded={bumpComments}
            />
          ))}

        {!loading && posts.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-[13px]">Be the first to post in your community.</p>
          </div>
        )}
      </div>
    </div>
  );
}
