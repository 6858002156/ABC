// Thai EV charger brands aggregated by the app — real names + real logos
export const BRANDS = {
  "EA Anywhere": {
    color: "#10b981", short: "EA",
    logo: "https://play-lh.googleusercontent.com/qD7yuH4LW54F1bKTR_JOmMXzdJ7Nas7tJ6FDsWSRcDE3IilX6qvxguh7Lrym0mkNbNd87r7dTjnadpz4NM2p=w240-h480-rw"
  },
  Altervim: {
    color: "#6366f1", short: "AL",
    logo: "https://play-lh.googleusercontent.com/Ddx8DdzMPs0XhsYh0Uug_AyBy6FlLKZxEjV3nh5eJzA6GdT9YEOFZWWlobdJmqrvK5FjHdn4Rf8Z412ym3r2NQ=w240-h480-rw"
  },
  Sharge: {
    color: "#f59e0b", short: "SH",
    logo: "https://sharge.co.th/images/sharge_logo.png"
  },
  "PEA Volta": {
    color: "#ef4444", short: "PE",
    logo: "https://play-lh.googleusercontent.com/gGRFDwtbo2lsk435XhBlwmarKrEyfjOlWSpU_K1CCIK-95sEUAw0wWFKC82mW-LRwdi3EfeVPEl5TItJ3y-LqBY=w240-h480-rw"
  },
  "EV Station PluZ": {
    color: "#0ea5e9", short: "EV",
    logo: "https://play-lh.googleusercontent.com/0YYOYQle8RBntTywdor540frp_4HfUFe2e3ocA5TMpe84jjAZqnufjKFawWSwvuaM82du_sD2lgGJvpRiKuCO8c=w240-h480-rw"
  },
  chargEV: {
    color: "#8b5cf6", short: "CE",
    logo: "https://play-lh.googleusercontent.com/ylvroxwX6uK2qn_XwuZ_BjoRl2O8GtUhdWKSaMk89HY8BTSWCgbRMz47m56wEoo2NOK8iGZJzcVtj8XI4kI2XCo=w240-h480-rw"
  },
  "MG EV": {
    color: "#14b8a6", short: "MG",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/MG_Motor_2021_logo.svg/250px-MG_Motor_2021_logo.svg.png"
  },
  "BYD Charge": {
    color: "#e11d48", short: "BY",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/BYD_Auto_2022_logo.svg/500px-BYD_Auto_2022_logo.svg.png"
  },
  "EGAT EV": { color: "#dc2626", short: "EG" },
  "Spark EV": { color: "#f97316", short: "SP" },
  Elex: { color: "#0d9488", short: "EL" }
};

export const brandColor = (brand) => BRANDS[brand]?.color || "#64748b";
export const brandShort = (brand) => BRANDS[brand]?.short || (brand || "?").slice(0, 2).toUpperCase();

export const PROVINCES = ["Bangkok", "Chiang Mai", "Phuket", "Chonburi", "Ayutthaya", "Hua Hin", "Khon Kaen", "Nakhon Ratchasima", "Krabi"];

export const formatTHB = (n) => "฿" + (n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });