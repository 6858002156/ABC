import { mockApi } from "@/lib/mockApi";

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// A charger QR can carry our app link, a station id, or the station name.
export async function findStationFromCode(raw) {
  const text = String(raw || "").trim();
  if (!text) return null;

  const linked = text.match(/\/stations\/([A-Za-z0-9_-]{6,})/);
  const candidateId = linked ? linked[1] : text;

  if (/^[A-Za-z0-9_-]{16,}$/.test(candidateId)) {
    const byId = await mockApi.entities.ChargingStation.get(candidateId).catch(() => null);
    if (byId?.id) return byId;
  }

  const term = escapeRegex(text.slice(0, 60));
  const page = await mockApi.entities.ChargingStation
    .filter(
      {
        $or: [
          { name: { $regex: term, $options: "i" } },
          { operator: { $regex: term, $options: "i" } },
        ],
      },
      { sort: "-rating", limit: 1 },
    )
    .catch(() => null);

  return page?.items?.[0] || null;
}
