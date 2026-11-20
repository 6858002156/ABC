import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { mockApi } from "@/lib/mockApi";
import StationRow from "@/components/stations/StationRow";

const PAGE = 10;

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Charger browsing, merged onto the home page: search runs on the server.
export default function HomeChargers() {
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTerm(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const filter = useMemo(() => {
    if (!term) return {};
    const safe = escapeRegex(term.slice(0, 60));
    return {
      $or: [
        { name: { $regex: safe, $options: "i" } },
        { operator: { $regex: safe, $options: "i" } },
        { address: { $regex: safe, $options: "i" } },
        { district: { $regex: safe, $options: "i" } },
      ],
    };
  }, [term]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    mockApi.entities.ChargingStation
      .filter(filter, { sort: "-rating", limit: PAGE })
      .then((page) => {
        if (!active) return;
        setItems(page?.items || []);
        setCursor(page?.next_cursor || null);
        setHasMore(!!page?.has_more);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filter]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const page = await mockApi.entities.ChargingStation.filter(filter, {
        sort: "-rating",
        limit: PAGE,
        cursor,
      });
      setItems((prev) => [...prev, ...(page?.items || [])]);
      setCursor(page?.next_cursor || null);
      setHasMore(!!page?.has_more);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div>
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, area or operator"
          className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-[13.5px] focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <StationRow key={s.id} station={s} />
          ))}
          {items.length === 0 && (
            <div className="text-center py-10 text-[13px] text-slate-400 flex flex-col items-center gap-1">
              <SlidersHorizontal className="w-5 h-5 text-slate-300" />
              No charger matches "{term}"
            </div>
          )}
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full py-3 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-600 hover:border-slate-300 disabled:opacity-50"
            >
              {loadingMore ? "Loading…" : "Show more chargers"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
