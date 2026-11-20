// Small in-memory API used by the standalone demo build.
const stationData = [
  ["CentralWorld EV Station", "999/9 Rama I Rd, Pathum Wan", "Bangkok", 13.7466, 100.5393, "EA Anywhere", "CCS2", 120, "Available", 7.5],
  ["PTT Station Vibhavadi", "Vibhavadi Rangsit Rd, Chatuchak", "Bangkok", 13.8241, 100.5594, "PTT EV Station PluZ", "CCS2", 150, "Available", 7.7],
  ["Siam Paragon Charging", "991 Rama I Rd, Pathum Wan", "Bangkok", 13.7465, 100.5347, "ELEX by EGAT", "Type 2", 22, "In Use", 7.0],
  ["MAYA Chiang Mai", "55 Huay Kaew Rd, Chang Phueak", "Chiang Mai", 18.8021, 98.9675, "PEA VOLTA", "CCS2", 50, "Available", 7.5],
  ["ICONSIAM EV Hub", "299 Charoen Nakhon Rd, Khlong San", "Bangkok", 13.7268, 100.5100, "SHARGE", "CCS2", 120, "Available", 8.5],
  ["Tesla Supercharger CentralWorld", "999/9 Rama I Rd, Pathum Wan", "Bangkok", 13.7462, 100.5398, "Tesla Supercharger", "CCS2", 250, "Available", 9.0],
  ["PTT Station Bangchak Si Nakharin", "Srinagarindra Rd, Prawet", "Bangkok", 13.6904, 100.6463, "PTT EV Station PluZ", "CCS2", 150, "In Use", 7.7],
  ["Mega Bangna EV Charging", "38-39 Bang Na-Trat Rd, Bang Phli", "Samut Prakan", 13.6458, 100.6800, "EA Anywhere", "CCS2", 120, "Available", 7.5],
  ["Don Mueang Airport EV Station", "Vibhavadi Rangsit Rd, Don Mueang", "Bangkok", 13.9126, 100.6068, "ELEX by EGAT", "CCS2", 50, "Available", 7.0],
  ["Central Ladprao EV Station", "1693 Phahon Yothin Rd, Chatuchak", "Bangkok", 13.8167, 100.5610, "SHARGE", "Type 2", 22, "In Use", 8.0],
  ["PTT Station Rama 2 KM 14", "Rama II Rd, Bang Khun Thian", "Bangkok", 13.6150, 100.4170, "PTT EV Station PluZ", "CCS2", 150, "Available", 7.7],
  ["EmQuartier EV Charging", "693 Sukhumvit Rd, Watthana", "Bangkok", 13.7307, 100.5698, "EA Anywhere", "CCS2", 120, "Available", 7.5],
  ["PEA VOLTA Bang Pa-in", "Asia Highway, Bang Pa-in", "Ayutthaya", 14.2290, 100.5760, "PEA VOLTA", "CCS2", 120, "Available", 7.5],
  ["Central Ayutthaya EV Station", "129/1 Phahon Yothin Rd, Khlong Suan Phlu", "Ayutthaya", 14.3510, 100.6100, "EA Anywhere", "CCS2", 50, "In Use", 7.5],
  ["PTT Station Wang Noi", "Phahon Yothin Rd, Wang Noi", "Ayutthaya", 14.2310, 100.7180, "PTT EV Station PluZ", "CCS2", 150, "Available", 7.7],
  ["MAYA Chiang Mai Supercharge", "55 Huay Kaew Rd, Chang Phueak", "Chiang Mai", 18.8024, 98.9672, "EA Anywhere", "CCS2", 120, "Available", 7.5],
  ["PTT Station Chiang Mai Airport", "Mahidol Rd, Pa Daet", "Chiang Mai", 18.7650, 98.9730, "PTT EV Station PluZ", "CCS2", 150, "Available", 7.7],
  ["Central Chiang Mai EV Station", "Central Chiang Mai, Fa Ham", "Chiang Mai", 18.8003, 99.0170, "SHARGE", "Type 2", 22, "In Use", 8.0],
  ["PEA VOLTA Lamphun", "Superhighway Chiang Mai-Lamphun, Mueang", "Lamphun", 18.5700, 99.0080, "PEA VOLTA", "CCS2", 50, "Available", 7.5],
  ["MG Super Charge Chiang Mai", "Superhighway Chiang Mai-Lamphun, Mueang", "Chiang Mai", 18.7730, 99.0020, "MG Super Charge", "CCS2", 120, "Available", 7.5],
  ["Central Phuket EV Station", "74-75 Wichit Songkhram Rd, Wichit", "Phuket", 7.8900, 98.3670, "EA Anywhere", "CCS2", 120, "Available", 8.0],
  ["Tesla Supercharger Phuket", "Central Phuket, Wichit", "Phuket", 7.8904, 98.3678, "Tesla Supercharger", "CCS2", 250, "Available", 9.0],
  ["PTT Station Phuket Bypass", "Chalermprakiat R.9 Rd, Ratsada", "Phuket", 7.9180, 98.3820, "PTT EV Station PluZ", "CCS2", 150, "In Use", 7.7],
  ["PEA VOLTA Phuket Town", "Thepkrasattri Rd, Talat Yai", "Phuket", 7.8900, 98.3980, "PEA VOLTA", "CCS2", 50, "Available", 7.5],
  ["ELEX by EGAT Patong", "Phra Metta Rd, Patong", "Phuket", 7.8890, 98.2970, "ELEX by EGAT", "Type 2", 22, "Available", 7.0],
  ["Terminal 21 Pattaya EV Station", "Moo 9, North Pattaya Rd, Nong Prue", "Chonburi", 12.9450, 100.8898, "EA Anywhere", "CCS2", 120, "Available", 7.5],
  ["PTT Station Pattaya Sukhumvit", "Sukhumvit Rd, Nong Prue", "Chonburi", 12.9230, 100.8830, "PTT EV Station PluZ", "CCS2", 150, "Available", 7.7],
  ["Tesla Supercharger Pattaya", "Central Pattaya, Nong Prue", "Chonburi", 12.9340, 100.8870, "Tesla Supercharger", "CCS2", 250, "In Use", 9.0],
  ["PEA VOLTA Bang Saen", "Long Had Bangsaen Rd, Saen Suk", "Chonburi", 13.2850, 100.9250, "PEA VOLTA", "CCS2", 50, "Available", 7.5],
  ["PTT Station Hua Hin Bypass", "Phet Kasem Rd, Hin Lek Fai", "Prachuap Khiri Khan", 12.5700, 99.9580, "PTT EV Station PluZ", "CCS2", 150, "Available", 7.7],
  ["Market Village Hua Hin EV", "234/1 Phet Kasem Rd, Hua Hin", "Prachuap Khiri Khan", 12.5680, 99.9580, "SHARGE", "Type 2", 22, "In Use", 8.0],
  ["PEA VOLTA Prachuap Khiri Khan", "Phet Kasem Rd, Ao Noi", "Prachuap Khiri Khan", 11.8120, 99.7980, "PEA VOLTA", "CCS2", 50, "Available", 7.5],
  ["PTT Station Korat Mittraphap", "Mittraphap Rd, Nai Mueang", "Nakhon Ratchasima", 14.9720, 102.0830, "PTT EV Station PluZ", "CCS2", 150, "Available", 7.7],
  ["Terminal 21 Korat EV Station", "Mittraphap Rd, Nai Mueang", "Nakhon Ratchasima", 14.9700, 102.0830, "EA Anywhere", "CCS2", 120, "In Use", 7.5],
  ["PEA VOLTA Pak Chong", "Mittraphap Rd, Pak Chong", "Nakhon Ratchasima", 14.7080, 101.4160, "PEA VOLTA", "CCS2", 50, "Available", 7.5],
  ["PTT Station Khon Kaen Mittraphap", "Mittraphap Rd, Nai Mueang", "Khon Kaen", 16.4410, 102.8360, "PTT EV Station PluZ", "CCS2", 150, "Available", 7.7],
  ["Central Khon Kaen EV Station", "99 Srichan Rd, Nai Mueang", "Khon Kaen", 16.4420, 102.8360, "EA Anywhere", "CCS2", 120, "Available", 7.5],
  ["PEA VOLTA Udon Thani", "Nittayo Rd, Mak Khaeng", "Udon Thani", 17.4130, 102.7870, "PEA VOLTA", "CCS2", 50, "Available", 7.5],
  ["PTT Station Hat Yai", "Phetkasem Rd, Hat Yai", "Songkhla", 7.0080, 100.4740, "PTT EV Station PluZ", "CCS2", 120, "Available", 7.7],
  ["ELEX by EGAT Kanchanaburi", "Saeng Chuto Rd, Ban Tai", "Kanchanaburi", 14.0220, 99.5320, "ELEX by EGAT", "CCS2", 50, "Maintenance", 7.0],
  // Additional regional demo locations. Coordinates identify the named area;
  // use the Google Maps search link on each record to confirm the exact entrance.
  ["PTT Station Suvarnabhumi", "Lat Krabang Rd, Racha Thewa", "Samut Prakan", 13.6898, 100.7501, "PTT EV Station PluZ", "CCS2", 150, "Available", 7.7],
  ["PEA VOLTA Nakhon Sawan", "Phahonyothin Rd, Pak Nam Pho", "Nakhon Sawan", 15.7047, 100.1372, "PEA VOLTA", "CCS2", 50, "Available", 7.5],
  ["PTT Station Phitsanulok", "Mittraphap Rd, Nai Mueang", "Phitsanulok", 16.8211, 100.2659, "PTT EV Station PluZ", "CCS2", 150, "Available", 7.7],
  ["PEA VOLTA Lampang", "Phahonyothin Rd, Mueang Lampang", "Lampang", 18.2888, 99.4909, "PEA VOLTA", "CCS2", 50, "Available", 7.5],
  ["PTT Station Chiang Rai", "Phahonyothin Rd, Wiang", "Chiang Rai", 19.9072, 99.8325, "PTT EV Station PluZ", "CCS2", 120, "Available", 7.7],
  ["PEA VOLTA Mae Sot", "Asia Highway, Mae Sot", "Tak", 16.7150, 98.5708, "PEA VOLTA", "CCS2", 50, "Available", 7.5],
  ["PTT Station Ubon Ratchathani", "à¹à¸ˆà¹‰à¸‡à¸ªà¸™à¸´à¸— Rd, Nai Mueang", "Ubon Ratchathani", 15.2287, 104.8564, "PTT EV Station PluZ", "CCS2", 120, "Available", 7.7],
  ["PEA VOLTA Nakhon Ratchasima", "Mittraphap Rd, Nai Mueang", "Nakhon Ratchasima", 14.9799, 102.0977, "PEA VOLTA", "CCS2", 50, "Available", 7.5],
  ["PTT Station Buriram", "Isan Rd, Nai Mueang", "Buriram", 14.9930, 103.1029, "PTT EV Station PluZ", "CCS2", 120, "Available", 7.7],
  ["PEA VOLTA Surin", "Krungsri Nai Rd, Nai Mueang", "Surin", 14.8829, 103.4937, "PEA VOLTA", "CCS2", 50, "Available", 7.5],
  ["PTT Station Nong Khai", "Mittraphap Rd, Nong Kom Ko", "Nong Khai", 17.8783, 102.7412, "PTT EV Station PluZ", "CCS2", 120, "Available", 7.7],
  ["PEA VOLTA Sakon Nakhon", "Nittayo Rd, That Choeng Chum", "Sakon Nakhon", 17.1547, 104.1477, "PEA VOLTA", "CCS2", 50, "Available", 7.5],
  ["PTT Station Maha Sarakham", "à¸–à¸µà¸™à¸²à¸™à¸™à¸—à¹Œ Rd, Talat", "Maha Sarakham", 16.1851, 103.3007, "PTT EV Station PluZ", "CCS2", 120, "Available", 7.7],
  ["PEA VOLTA Chaiyaphum", "Nai Mueang, Mueang Chaiyaphum", "Chaiyaphum", 15.8068, 102.0315, "PEA VOLTA", "CCS2", 50, "Available", 7.5],
  ["PTT Station Rayong", "Sukhumvit Rd, Choeng Noen", "Rayong", 12.6814, 101.2816, "PTT EV Station PluZ", "CCS2", 150, "Available", 7.7],
  ["PEA VOLTA Chanthaburi", "Sukhumvit Rd, Wat Mai", "Chanthaburi", 12.6114, 102.1039, "PEA VOLTA", "CCS2", 50, "Available", 7.5],
  ["PTT Station Trat", "Sukhumvit Rd, Wang Krachae", "Trat", 12.2436, 102.5151, "PTT EV Station PluZ", "CCS2", 120, "Available", 7.7],
  ["PEA VOLTA Chachoengsao", "Sukhumvit Rd, Na Mueang", "Chachoengsao", 13.6904, 101.0779, "PEA VOLTA", "CCS2", 50, "Available", 7.5],
  ["PTT Station Prachinburi", "à¸ªà¸¸à¸§à¸£à¸£à¸“à¸¨à¸£ Rd, Na Muang", "Prachinburi", 14.0511, 101.3716, "PTT EV Station PluZ", "CCS2", 120, "Available", 7.7],
  ["PEA VOLTA Phetchaburi", "Phetkasem Rd, Ban Mo", "Phetchaburi", 13.1119, 99.9447, "PEA VOLTA", "CCS2", 50, "Available", 7.5],
  ["PTT Station Chumphon", "Phetkasem Rd, Na Thung", "Chumphon", 10.4930, 99.1800, "PTT EV Station PluZ", "CCS2", 150, "Available", 7.7],
  ["PEA VOLTA Surat Thani", "Talad Mai Rd, Talat", "Surat Thani", 9.1401, 99.3331, "PEA VOLTA", "CCS2", 50, "Available", 7.5],
  ["PTT Station Nakhon Si Thammarat", "Ratchadamnoen Rd, Nai Mueang", "Nakhon Si Thammarat", 8.4304, 99.9631, "PTT EV Station PluZ", "CCS2", 120, "Available", 7.7],
  ["PEA VOLTA Krabi", "Phetkasem Rd, Pak Nam", "Krabi", 8.0863, 98.9063, "PEA VOLTA", "CCS2", 50, "Available", 7.5],
  ["PTT Station Trang", "Phetkasem Rd, Thap Thiang", "Trang", 7.5594, 99.6114, "PTT EV Station PluZ", "CCS2", 120, "Available", 7.7],
  ["PEA VOLTA Phatthalung", "Asia Highway, Khuha Sawan", "Phatthalung", 7.6167, 100.0740, "PEA VOLTA", "CCS2", 50, "Available", 7.5],
  ["PTT Station Yala", "Sukyang Rd, Sateng", "Yala", 6.5411, 101.2804, "PTT EV Station PluZ", "CCS2", 120, "Available", 7.7],
  ["PEA VOLTA Pattani", "à¸«à¸™à¸­à¸‡à¸ˆà¸´à¸ Rd,à¸ªà¸°à¸šà¸²à¸£à¸±à¸‡", "Pattani", 6.8680, 101.2501, "PEA VOLTA", "CCS2", 50, "Available", 7.5],
  ["PTT Station Phang Nga", "Phetkasem Rd, Thai Chang", "Phang Nga", 8.4501, 98.5298, "PTT EV Station PluZ", "CCS2", 120, "Available", 7.7],
];

// 200 additional map-search demo entries: four network searches in each of
// these 50 regional areas. Pins mark the town area, not a verified charger site.
const regionalAreas = [
  ["Bangkok Sukhumvit", "Bangkok", 13.7307, 100.5698], ["Bangkok Thonburi", "Bangkok", 13.7268, 100.5100], ["Bangkok Ratchada", "Bangkok", 13.7650, 100.5740], ["Bangkok Bang Na", "Bangkok", 13.6680, 100.6080], ["Nonthaburi", "Nonthaburi", 13.8621, 100.5144], ["Pathum Thani", "Pathum Thani", 14.0208, 100.5250], ["Samut Prakan", "Samut Prakan", 13.5991, 100.5998], ["Samut Sakhon", "Samut Sakhon", 13.5475, 100.2744], ["Nakhon Pathom", "Nakhon Pathom", 13.8199, 100.0622], ["Ayutthaya", "Ayutthaya", 14.3532, 100.5689],
  ["Lopburi", "Lopburi", 14.7995, 100.6534], ["Saraburi", "Saraburi", 14.5289, 100.9101], ["Nakhon Sawan", "Nakhon Sawan", 15.7047, 100.1372], ["Phichit", "Phichit", 16.4419, 100.3488], ["Phitsanulok", "Phitsanulok", 16.8211, 100.2659], ["Sukhothai", "Sukhothai", 17.0056, 99.8235], ["Uttaradit", "Uttaradit", 17.6201, 100.0993], ["Lampang", "Lampang", 18.2888, 99.4909], ["Lamphun", "Lamphun", 18.5745, 99.0087], ["Chiang Mai", "Chiang Mai", 18.7883, 98.9853],
  ["Chiang Rai", "Chiang Rai", 19.9072, 99.8325], ["Phayao", "Phayao", 19.1664, 99.9019], ["Nan", "Nan", 18.7756, 100.7730], ["Phrae", "Phrae", 18.1459, 100.1410], ["Mae Sot", "Tak", 16.7150, 98.5708], ["Udon Thani", "Udon Thani", 17.4130, 102.7870], ["Nong Khai", "Nong Khai", 17.8783, 102.7412], ["Khon Kaen", "Khon Kaen", 16.4419, 102.8360], ["Loei", "Loei", 17.4860, 101.7223], ["Sakon Nakhon", "Sakon Nakhon", 17.1547, 104.1477],
  ["Nakhon Phanom", "Nakhon Phanom", 17.3920, 104.7696], ["Mukdahan", "Mukdahan", 16.5436, 104.7235], ["Roi Et", "Roi Et", 16.0567, 103.6531], ["Maha Sarakham", "Maha Sarakham", 16.1851, 103.3007], ["Kalasin", "Kalasin", 16.4322, 103.5061], ["Chaiyaphum", "Chaiyaphum", 15.8068, 102.0315], ["Nakhon Ratchasima", "Nakhon Ratchasima", 14.9799, 102.0977], ["Buriram", "Buriram", 14.9930, 103.1029], ["Surin", "Surin", 14.8829, 103.4937], ["Sisaket", "Sisaket", 15.1186, 104.3220],
  ["Ubon Ratchathani", "Ubon Ratchathani", 15.2287, 104.8564], ["Pattaya", "Chonburi", 12.9340, 100.8870], ["Rayong", "Rayong", 12.6814, 101.2816], ["Chanthaburi", "Chanthaburi", 12.6114, 102.1039], ["Trat", "Trat", 12.2436, 102.5151], ["Hua Hin", "Prachuap Khiri Khan", 12.5684, 99.9577], ["Phetchaburi", "Phetchaburi", 13.1119, 99.9447], ["Chumphon", "Chumphon", 10.4930, 99.1800], ["Surat Thani", "Surat Thani", 9.1401, 99.3331], ["Phuket", "Phuket", 7.8900, 98.3670],
];
const mapSearchNetworks = ["EV Station PluZ", "PEA VOLTA", "EA Anywhere", "ELEX by EGAT"];
for (const [area, province, latitude, longitude] of regionalAreas) {
  for (const network of mapSearchNetworks) {
    const query = `EV charging station ${network} ${area} Thailand`;
    stationData.push([
      `${network} map search â€” ${area}`,
      `Google Maps area search, ${area}`,
      province,
      latitude,
      longitude,
      network,
      "CCS2",
      network === "PEA VOLTA" ? 50 : 120,
      "Available",
      network === "ELEX by EGAT" ? 7.0 : 7.5,
    ]);
  }
}

const stations = stationData.map(([station_name, address, province, latitude, longitude, network_brand, connector_type, max_power_kw, status, price_per_kwh], index) => ({
  id: `station-${index + 1}`,
  station_name,
  name: station_name,
  address,
  province,
  latitude,
  longitude,
  network_brand,
  brand: network_brand,
  connector_type,
  connector_types: [connector_type],
  max_power_kw,
  status,
  rating: Number((4.1 + ((index * 7) % 9) / 10).toFixed(1)),
  price_per_kwh,
  on_peak_price_thb: Math.min(8.5, Math.max(7.5, Number((7.5 + (index % 5) * 0.25).toFixed(2)))),
  off_peak_price_thb: Math.min(5.5, Math.max(4.5, Number((4.5 + (index % 5) * 0.25).toFixed(2)))),
  google_maps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${station_name}, ${address}, ${province}, Thailand`)}`,
}));

const storageKey = "volt-jai-demo-data-v1";
const data = {
  ChargingStation: stations,
  ChargingStations: stations,
  Location: [
    { id: "loc-bkk", name: "Bangkok", province: "Bangkok", category: "city", latitude: 13.7563, longitude: 100.5018 },
    { id: "loc-cnx", name: "Chiang Mai", province: "Chiang Mai", category: "city", latitude: 18.7883, longitude: 98.9853 },
    { id: "loc-pkt", name: "Phuket", province: "Phuket", category: "beach", latitude: 7.8804, longitude: 98.3923 },
    { id: "loc-siam", name: "Siam Paragon", province: "Bangkok", category: "mall", latitude: 13.7465, longitude: 100.5347 },
    { id: "loc-central-pattaya", name: "Central Pattaya Beach", province: "Chonburi", category: "beach", latitude: 12.9345, longitude: 100.8854 },
    { id: "loc-bkk-airport", name: "Suvarnabhumi Airport", province: "Samut Prakan", category: "airport", latitude: 13.6900, longitude: 100.7501 },
    { id: "loc-pattaya-beach", name: "Pattaya Beach", province: "Chonburi", category: "beach", latitude: 12.9276, longitude: 100.8771 },
    { id: "loc-hua-hin-beach", name: "Hua Hin Beach", province: "Prachuap Khiri Khan", category: "beach", latitude: 12.5684, longitude: 99.9577 },
    { id: "loc-iconsiam", name: "Iconsiam", province: "Bangkok", category: "mall", latitude: 13.7267, longitude: 100.5100 },
    { id: "loc-mega-bangna", name: "Mega Bangna", province: "Samut Prakan", category: "mall", latitude: 13.6466, longitude: 100.6800 },
    { id: "loc-centralworld", name: "CentralWorld", province: "Bangkok", category: "mall", latitude: 13.7466, longitude: 100.5393 },
    { id: "loc-cnx-old-city", name: "Chiang Mai Old City", province: "Chiang Mai", category: "landmark", latitude: 18.7883, longitude: 98.9853 },
  ],
};
// Keep demo records across page reloads. The hosted Base44 client can replace
// this adapter later; localStorage makes the standalone demo usable meanwhile.
try {
  const saved = JSON.parse(globalThis.localStorage?.getItem(storageKey) || "null");
  if (saved && typeof saved === "object") {
    for (const [name, rows] of Object.entries(saved)) {
      if (Array.isArray(rows) && Array.isArray(data[name])) {
        // Keep saved demo edits while making newly added seed stations available
        // to existing browsers that already have an older station list cached.
        if (name === "ChargingStation" || name === "ChargingStations") {
          const savedIds = new Set(rows.map((row) => row.id));
          data[name] = [...rows.map((row) => {
            const seeded = stations.find((station) => station.id === row.id);
            return seeded ? { ...row, on_peak_price_thb: seeded.on_peak_price_thb, off_peak_price_thb: seeded.off_peak_price_thb, price_per_kwh: seeded.price_per_kwh } : row;
          }), ...stations.filter((station) => !savedIds.has(station.id))];
        } else {
          data[name] = rows;
        }
      }
    }
  }
} catch {
  // Storage can be unavailable in private or restricted browsing contexts.
}
const persist = () => {
  try {
    globalThis.localStorage?.setItem(storageKey, JSON.stringify(data));
  } catch {
    // The in-memory adapter remains functional for this browser session.
  }
};
const clone = (value) => structuredClone(value);
const haversineKm = (a, b) => {
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const dLat = radians(b.lat - a.lat);
  const dLng = radians(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};
const mockAiAnswer = async (question) => {
  const raw = String(question || "").trim();
  const q = raw.toLocaleLowerCase();
  const th = /[\u0e00-\u0e7f]/.test(raw);
  const say = (en, thai) => th ? thai : en;
  const page = await entities.ChargingStations.list({ limit: 10000 });
  const all = (page.items || []).filter((s) => !/map search/i.test(s.station_name || ""));
  const available = /available|free|open|ว่าง|พร้อมใช้/.test(q);
  const province = [...new Set(all.map((s) => s.province).filter(Boolean))].sort((a,b)=>b.length-a.length).find((p)=>q.includes(p.toLowerCase()));
  const district = [...new Set(all.flatMap((s)=>(s.address||"").split(",").map(x=>x.trim())).filter(Boolean))].sort((a,b)=>b.length-a.length).find((d)=>q.includes(d.toLowerCase()));
  const aliases = [["PTT EV Station PluZ",/\bptt\b|pluz/i],["EA Anywhere",/\bea\b|ea anywhere/i],["PEA VOLTA",/\bpea\b|volta/i],["ELEX by EGAT",/elex|egat/i],["MG Super Charge",/\bmg\b/i],["Tesla Supercharger",/tesla/i],["SHARGE",/sharge/i]];
  const brand = aliases.find(([,re])=>re.test(raw))?.[0];
  const connector = /type\s*2|type-2|type two|ไทป์\s*2/i.test(raw) ? "Type 2" : /ccs\s*2|ซีซีเอส/i.test(raw) ? "CCS2" : null;
  const guides = [
    [/ccs.?2|type.?2|connector|หัวชาร์จ|ปลั๊ก/i,"CCS2 combines AC pins with two DC pins and supports DC fast charging; Type 2 is the common AC connector. Actual speed depends on your vehicle and station. Check your vehicle inlet before charging.","CCS2 มีขั้ว AC และ DC รองรับชาร์จเร็ว ส่วน Type 2 เป็นหัวชาร์จ AC ที่ใช้ทั่วไป ความเร็วจริงขึ้นกับรถและสถานี ควรตรวจสอบช่องชาร์จของรถก่อนใช้"],
    [/\bac\b|\bdc\b|fast charge|ชาร์จเร็ว/i,"AC passes through the car's onboard charger and is usually slower (often 7–22 kW). DC fast charging feeds the battery directly; speed is limited by the car, battery state/temperature, and charger.","AC ผ่านเครื่องแปลงไฟในรถและมักช้ากว่า (ราว 7–22 kW) ส่วน DC fast charge จ่ายไฟตรงสู่แบตเตอรี่ ความเร็วขึ้นกับรถ ระดับ/อุณหภูมิแบต และตู้ชาร์จ"],
    [/peak|off.?peak|ช่วงเวลา|ค่าไฟ/i,"Typical Thai TOU periods are On-Peak weekdays 09:00–22:00 and Off-Peak 22:00–09:00 plus weekends/holidays. Operator tariffs vary; confirm the rate in the charging app.","ช่วง TOU ที่พบบ่อยคือ On-Peak วันธรรมดา 09:00–22:00 และ Off-Peak 22:00–09:00 รวมวันหยุด แต่ราคาแต่ละเครือข่ายต่างกัน โปรดตรวจสอบในแอป"],
    [/battery|แบตเตอรี่|ดูแลแบต/i,"For daily battery care, use a routine charge limit (often around 80%), avoid leaving the battery near empty/full for long periods, and precondition before fast charging when supported. Follow your vehicle maker's guidance.","ดูแลแบตโดยตั้งเพดานชาร์จใช้งานประจำ (มักราว 80%) ไม่จอดทิ้งไว้เมื่อแบตใกล้หมดหรือเต็มนาน ๆ และอุ่นแบตก่อนชาร์จเร็วหากรถรองรับ ยึดคำแนะนำผู้ผลิต"],
    [/trip|route|long.?distance|ทางไกล|เดินทางไกล/i,"For long trips, plan reliable DC stops, keep a battery reserve, check connector compatibility and live availability before detouring, and recheck route apps because status and prices change.","เดินทางไกลควรวางจุดแวะ DC ที่เชื่อถือได้ เผื่อแบตสำรอง ตรวจหัวชาร์จและสถานะจริงก่อนอ้อมทาง และเช็กแอปอีกครั้งเพราะสถานะ/ราคาเปลี่ยนได้"],
  ];
  const guide = guides.find(([re])=>re.test(raw));
  if (guide) return {pill:say("EV guide","คู่มือ EV"),figure:say("Quick guide","คำแนะนำ"),text:say(guide[1],guide[2])};
  const cheap = /cheap|cheapest|lowest|price|cost|rate|ราคา|ถูก|ค่าใช้จ่าย|ค่าไฟ/.test(q);
  const fast = /fast|fastest|quick|power|kw|เร็ว|กำลัง/.test(q);
  const calculate = /full charge|charge time|charging time|how much.*charge|cost.*charge|estimate|time.*cost|กี่นาที|ชาร์จ.*(นาน|เท่าไหร่|กี่)|คำนวณ|ประมาณ/.test(q);
  const field = /off.?peak|กลางคืน/.test(q)?"off_peak_price_thb":/on.?peak|กลางวัน/.test(q)?"on_peak_price_thb":"price_per_kwh";
  let rows = all.filter(s=>(!available||s.status==="Available")&&(!province||s.province===province)&&(!district||(s.address||"").toLowerCase().includes(district.toLowerCase()))&&(!brand||s.network_brand===brand)&&(!connector||(s.connector_types||[s.connector_type]).includes(connector)));
  if (/\bdc\b|fast|เร็ว/i.test(raw)) rows=rows.filter(s=>Number(s.max_power_kw)>=50);
  const price=s=>Number(s[field]??s.price_per_kwh??0);
  rows.sort((a,b)=>cheap?price(a)-price(b):fast?Number(b.max_power_kw)-Number(a.max_power_kw):0);
  if (!rows.length) return {pill:say("Station search","ค้นหาสถานี"),figure:say("No match","ไม่พบ"),text:say("No stations match those filters. Try a province, district, network, connector, or remove the availability filter.","ไม่พบสถานีตามเงื่อนไข ลองระบุจังหวัด เขต เครือข่าย หัวชาร์จ หรือเอาเงื่อนไขสถานะว่างออก")};
  const s=rows[0];
  if (calculate) {
    const vp=await entities.UserVehicles.list({limit:1000}); const v=(vp.items||[]).find(x=>x.is_active); const cap=Number(v?.battery_capacity_kwh);
    const from=Number(raw.match(/(?:from|จาก)\s*(\d{1,3})/i)?.[1]??20), to=Number(raw.match(/(?:to|ถึง)\s*(\d{1,3})/i)?.[1]??80);
    const kwh=cap?Math.max(0,cap*(Math.min(to,100)-Math.min(from,100))/100):0; const mins=kwh?Math.ceil(kwh/Math.min(Number(s.max_power_kw),cap*.7)*60):0; const cost=kwh*price(s);
    const wallet=await getOrCreateWallet(currentUser?.id||"demo-user"); const balance=Number(wallet?.balance??walletBalance);
    return {pill:say("Estimate · demo rate","ประมาณการ · ราคาเดโม"),figure:cap?`${mins} min · ฿${cost.toFixed(0)}`:say("Add an active EV","เพิ่มรถ EV ที่ใช้งาน"),text:cap?say(`${v.brand||"Your EV"} ${v.model||""} (${cap} kWh), ${from}%→${to}%: about ${kwh.toFixed(1)} kWh at ${s.station_name} (${s.max_power_kw} kW), around ${mins} min and ฿${cost.toFixed(0)} at ฿${price(s)}/kWh. Wallet ฿${balance.toFixed(0)}; ${balance>=cost?"balance covers estimate":`short by ฿${(cost-balance).toFixed(0)}`}. Real charging slows near full; estimate excludes losses.`,`${v.brand||"รถของคุณ"} ${v.model||""} (${cap} kWh) จาก ${from}% ถึง ${to}% ใช้ไฟราว ${kwh.toFixed(1)} kWh ที่ ${s.station_name} (${s.max_power_kw} kW) ใช้เวลาประมาณ ${mins} นาที ค่าใช้จ่าย ฿${cost.toFixed(0)} ยอด Wallet ฿${balance.toFixed(0)} ${balance>=cost?"เพียงพอตามประมาณการ":`ขาด ฿${(cost-balance).toFixed(0)}`} การชาร์จจริงช้าลงเมื่อแบตใกล้เต็มและตัวเลขไม่รวมการสูญเสีย`):say("Set an active EV in My EV to estimate charging time and cost.","ตั้งรถที่ใช้งานในหน้า My EV เพื่อคำนวณเวลาและค่าใช้จ่าย")};
  }
  return {pill:province||brand||district||say("Station recommendation","แนะนำสถานี"),figure:cheap?`฿${price(s).toFixed(2)}/kWh`:fast?`${s.max_power_kw} kW`:`${rows.filter(x=>x.status==="Available").length} available`,text:say(`${s.station_name} (${s.network_brand}) in ${s.province}, ${s.connector_type}, ${s.max_power_kw} kW, ${s.status}, ฿${price(s).toFixed(2)}/kWh. ${rows.length} matching stations; ranked by ${cheap?"lowest rate":fast?"highest power":"match"}. Local demo data; confirm live status and tariff before driving.`,`${s.station_name} (${s.network_brand}) จ.${s.province} ${s.connector_type} ${s.max_power_kw} kW สถานะ ${s.status} ราคา ฿${price(s).toFixed(2)}/kWh พบ ${rows.length} สถานี ข้อมูลเดโม โปรดตรวจสอบสถานะและราคาจริงก่อนเดินทาง`)};
};const mockTripPlan = (input = {}) => {
  const origin = input.origin || {};
  const destination = input.destination || {};
  const start = { lat: Number(origin.lat), lng: Number(origin.lng) };
  const end = { lat: Number(destination.lat), lng: Number(destination.lng) };
  if (![start.lat, start.lng, end.lat, end.lng].every(Number.isFinite)) {
    return { error: "Choose a start and a destination with map coordinates first." };
  }
  const vehicle = input.vehicle || {};
  const capacity = Number(vehicle.battery_capacity_kwh) || 60;
  const startPct = Number(input.battery_start_pct) || 70;
  const targetPct = Number(input.battery_target_pct) || 85;
  const distance = Math.round(haversineKm(start, end) * 1.25);
  const energy = Math.round(distance * 0.17 * 10) / 10;
  const routeStations = stations.map((station) => {
    const point = { lat: station.latitude, lng: station.longitude };
    const fromStart = haversineKm(start, point);
    const toEnd = haversineKm(point, end);
    return { station, detour: Math.round((fromStart + toEnd - haversineKm(start, end)) * 10) / 10, along: fromStart };
  }).filter(({ station, detour }) => station.status === "Available" && station.max_power_kw >= 50 && detour < 80)
    .sort((a, b) => a.along - b.along);
  const maxRange = Math.max(0, capacity * startPct / 100 - capacity * 0.12) / 0.17;
  const chargingStops = distance > maxRange && routeStations.length ? [routeStations[0]].map(({ station, along }) => {
    const kwh = Math.round(Math.max(0, capacity * targetPct / 100 - (capacity * startPct / 100 - along * 0.17)) * 10) / 10;
    return { station_id: station.id, station_name: station.station_name, network: station.network_brand, connector_type: station.connector_type, power_kw: station.max_power_kw, price_thb: station.price_per_kwh, kwh, charge_minutes: Math.max(5, Math.round(kwh / Math.min(station.max_power_kw, 120) * 60)), cost: Math.round(kwh * station.price_per_kwh * 10) / 10, arrival_pct: Math.max(12, Math.round((startPct - along * 0.17 / capacity * 100))), target_pct: targetPct, at_km: Math.round(along), latitude: station.latitude, longitude: station.longitude };
  }) : [];
  const cost = Math.round(chargingStops.reduce((sum, stop) => sum + stop.cost, 0) * 10) / 10;
  const arrival = Math.max(0, Math.round((startPct - (energy / capacity * 100) + chargingStops.length * targetPct)));
  const warning = distance > maxRange && !chargingStops.length ? "This demo route exceeds the estimated battery range and has no matching fast charger nearby." : "";
  return {
    origin: origin.name || "Start", destination: destination.name || "Destination", distance_km: distance,
    drive_minutes: Math.round(distance / 75 * 60), total_duration_minutes: Math.round(distance / 75 * 60) + chargingStops.reduce((sum, stop) => sum + stop.charge_minutes, 0),
    energy_kwh: energy, estimated_cost: cost, vehicle_model: `${vehicle.brand || ""} ${vehicle.model || "Your EV"}`.trim(),
    battery_capacity_kwh: capacity, start_pct: startPct, target_pct: targetPct, arrival_pct: arrival,
    charging_stops: chargingStops, headline: chargingStops.length ? `${chargingStops.length} stop planned` : "No stop needed",
    summary: chargingStops.length ? `${distance} km to ${destination.name || "your destination"}. Stop at ${chargingStops[0].station_name} for a fast charge; estimated charging cost à¸¿${cost}.` : `${distance} km to ${destination.name || "your destination"}, about ${Math.round(distance / 75 * 60)} minutes of driving.`,
    warning,
  };
};
const matches = (item, query = {}) => Object.entries(query).every(([key, value]) => {
  if (key === "$or") return value.some((part) => matches(item, part));
  if (value && typeof value === "object" && "$regex" in value) return new RegExp(value.$regex, value.$options || "").test(String(item[key] ?? ""));
  if (value && typeof value === "object" && "$ne" in value) return item[key] !== value.$ne;
  return item[key] === value;
});
const normalizeOptions = (sortOrOptions, limit) => typeof sortOrOptions === "object" && sortOrOptions !== null
  ? sortOrOptions : { sort: sortOrOptions, limit };
const makePage = (items, hasMore = false, nextCursor = null) => Object.assign(items, { items: [...items], has_more: hasMore, next_cursor: nextCursor });

const entities = {};
const entityNames = ["Booking", "Comment", "Post", "PostLike", "Transaction", "Wallet", "WalletTransactions", "Vehicle", "UserVehicles", "ChargingSessions", "Trip", "Location", "ChargingStation", "ChargingStations"];
for (const name of entityNames) {
  const collection = data[name] || (data[name] = []);
  entities[name] = {
    async list(sortOrOptions, limit) {
      const opts = normalizeOptions(sortOrOptions, limit);
      let result = [...collection];
      const sort = opts.sort;
      if (sort) {
        const field = sort.replace(/^-/, "");
        result.sort((a, b) => (a[field] > b[field] ? 1 : a[field] < b[field] ? -1 : 0) * (sort.startsWith("-") ? -1 : 1));
      }
      if (opts.limit) result = result.slice(0, opts.limit);
      return makePage(clone(result));
    },
    async filter(query = {}, sortOrOptions, limit) {
      const opts = normalizeOptions(sortOrOptions, limit);
      let result = collection.filter((item) => matches(item, query));
      if (opts.sort) {
        const field = opts.sort.replace(/^-/, "");
        result = [...result].sort((a, b) => (a[field] > b[field] ? 1 : a[field] < b[field] ? -1 : 0) * (opts.sort.startsWith("-") ? -1 : 1));
      }
      const start = opts.cursor ? Number(opts.cursor) || 0 : 0;
      const pageSize = opts.limit || result.length;
      const page = result.slice(start, start + pageSize);
      const hasMore = start + pageSize < result.length;
      return makePage(clone(page), hasMore, hasMore ? String(start + pageSize) : null);
    },
    async get(id) { const item = collection.find((entry) => entry.id === id); if (!item) throw new Error(`${name} not found`); return clone(item); },
    async create(fields = {}) { const item = { id: `${name.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, created_date: new Date().toISOString(), ...fields }; collection.push(item); persist(); return clone(item); },
    async update(id, fields = {}) { const item = collection.find((entry) => entry.id === id); if (!item) throw new Error(`${name} not found`); Object.assign(item, fields, { updated_date: new Date().toISOString() }); persist(); return clone(item); },
    async updateMany(query = {}, update = {}) { const matchesFound = collection.filter((item) => matches(item, query)); matchesFound.forEach((item) => Object.assign(item, update.$set || update)); if (matchesFound.length) persist(); return { modified_count: matchesFound.length }; },
    async delete(id) { const index = collection.findIndex((entry) => entry.id === id); if (index >= 0) { collection.splice(index, 1); persist(); } return { success: true }; },
    async aggregate({ query = {}, groupBy } = {}) {
      const rows = collection.filter((item) => matches(item, query));
      if (!groupBy) return { rows: clone(rows), count: rows.length };
      const counts = new Map();
      rows.forEach((item) => {
        const key = item[groupBy];
        if (key != null) counts.set(key, (counts.get(key) || 0) + 1);
      });
      return { rows: [...counts].map(([key, count]) => ({ [groupBy]: key, count })) };
    },
  };
}

const WALLET_STORAGE_KEY = "volt-jai-wallet-balance-thb";
const storedWalletBalance = () => {
  try {
    const stored = globalThis.localStorage?.getItem(WALLET_STORAGE_KEY);
    if (stored == null) return null;
    const value = Number(stored);
    return Number.isFinite(value) && value >= 0 ? value : null;
  } catch { return null; }
};
let walletBalance = storedWalletBalance() ?? Number(data.Wallet?.[0]?.balance ?? 1000);
let currentUser = { id: "demo-user", email: "demo@voltjaithailand.com", full_name: "Volt Jai Driver", role: "admin", wallet_balance_thb: walletBalance };
const publishWalletUpdate = (wallet) => {
  try {
    globalThis.dispatchEvent?.(new CustomEvent("volt-jai-wallet-updated", { detail: clone(wallet) }));
  } catch {
    // Wallet persistence remains available where browser events are unavailable.
  }
};
const getOrCreateWallet = async (userId) => {
  const wallets = await entities.Wallet.filter({ created_by_id: userId }, "-created_date", 1);
  if (wallets[0]) return entities.Wallet.update(wallets[0].id, { balance: walletBalance });
  return entities.Wallet.create({ balance: walletBalance, currency: "THB", created_by_id: userId });
};
const setWalletBalance = async (balance) => {
  walletBalance = Math.max(0, Math.round((Number(balance) || 0) * 100) / 100);
  currentUser = { ...currentUser, wallet_balance_thb: walletBalance };
  try { globalThis.localStorage?.setItem(WALLET_STORAGE_KEY, String(walletBalance)); } catch { /* Storage can be unavailable. */ }
  const wallet = await getOrCreateWallet(currentUser.id);
  publishWalletUpdate(wallet);
  return wallet;
};
const chargeWallet = async (amount) => {
  const charge = Math.max(0, Number(amount) || 0);
  return setWalletBalance(walletBalance - charge);
};
export const mockApi = {
  entities,
  wallet: { getOrCreate: getOrCreateWallet, charge: chargeWallet, setBalance: setWalletBalance, publishUpdate: publishWalletUpdate },
  auth: {
    async me() { return currentUser && clone(currentUser); },
    async updateMe(fields) {
      currentUser = { ...currentUser, ...fields };
      if (fields.wallet_balance_thb != null) await setWalletBalance(fields.wallet_balance_thb);
      return clone(currentUser);
    },
    async loginViaEmailPassword() { return clone(currentUser); },
    async login() { return clone(currentUser); },
    async register() { return clone(currentUser); },
    async verifyOtp() { return { access_token: "demo-token" }; },
    async resendOtp() { return { success: true }; },
    setToken() {},
    loginWithProvider() {},
    async resetPassword() { return { success: true }; },
    async resetPasswordRequest() { return { success: true }; },
    async logout() { currentUser = null; return { success: true }; },
  },
  functions: {
    async invoke(name, payload = {}) {
      if (name === "askEvAssistant") {
        const data = await mockAiAnswer(payload.question || payload.prompt || "");
        return { data, success: true };
      }
      if (name === "planEvTrip") {
        const data = mockTripPlan(payload);
        return data.error ? { data, success: false } : { data, success: true };
      }
      return { data: {}, success: true };
    },
  },
  integrations: { Core: { async UploadPublicFile({ file } = {}) { return { file_url: file ? URL.createObjectURL(file) : "" }; } } },
};

export { entities, stations };
export default mockApi;
