import { useCallback, useEffect, useState } from "react";
import { mockApi } from "@/lib/mockApi";

const PAGE_SIZE = 500;
const MAX_RECORDS = 3000;

// Loads every charging station, a page at a time, so the map can show all of Bangkok.
export default function useAllStations() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = [];
      let cursor;
      while (all.length < MAX_RECORDS) {
        const page = await mockApi.entities.ChargingStation.filter({}, { sort: "name", limit: PAGE_SIZE, cursor });
        all.push(...(page?.items || []));
        if (!page?.has_more) break;
        cursor = page.next_cursor;
      }
      setStations(all);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { stations, loading, reload: load };
}
