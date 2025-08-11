import React, { useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { Cog, RefreshCw, Clock3, Search, TrendingUp, TrendingDown } from "lucide-react";

const pad = (n) => String(n).padStart(2, "0");
const fmtMoney = (n, currency = "USD") =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(n);

const defaultAccent = "#22c55e";

function Header({ accent, setAccent }) {
  return (
    <div className="flex items-center justify-end gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-400">Akzentfarbe</span>
        <input
          type="color"
          aria-label="Akzentfarbe wählen"
          className="h-9 w-9 rounded border border-zinc-700 bg-zinc-900"
          value={accent}
          onChange={(e) => setAccent(e.target.value)}
        />
      </div>
    </div>
  );
}

function Card({ title, right, children, accent }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-zinc-900/70 border border-zinc-800 shadow-lg p-4 md:p-6"
      style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.02), 0 10px 30px -10px ${accent}33` }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-white">{title}</h2>
        {right}
      </div>
      {children}
    </motion.div>
  );
}

function News({ accent }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const RSS_URL =
    "https://www.tagesschau.de/infoservices/alle-meldungen-100~rss2.xml";

  // ---- Helpers ----
  const IMG_RE =
    /(https?:\/\/images\.tagesschau\.de\/[^\s"'>)]+?\.(?:jpg|jpeg|png|webp))(?:\?[^\s"'>)]*)?/i;

  const tryFetch = async (url, parseJson = false) => {
    const res = await fetch(url, { referrerPolicy: "no-referrer" });
    if (!res.ok) throw new Error("fetch failed");
    if (parseJson) {
      const j = await res.json();
      return j.contents;
    }
    return await res.text();
  };

  const fetchViaProxies = async (targetUrl) => {
    const enc = encodeURIComponent(targetUrl);
    const candidates = [
      `https://api.allorigins.win/raw?url=${enc}`,
      `https://api.allorigins.win/get?url=${enc}`,
      `https://cors.isomorphic-git.org/${targetUrl}`,
    ];
    for (const u of candidates) {
      try {
        const isJson = u.includes("/get?url=");
        const text = await tryFetch(u, isJson);
        if (text) return text;
      } catch {
      }
    }
    throw new Error("No proxy worked");
  };

  const extractImageFromDescription = (description = "") => {
    const imgTag = description.match(/<img[^>]+src="([^"]+)"/i);
    if (imgTag && IMG_RE.test(imgTag[1])) return imgTag[1];

    const any = description.match(IMG_RE);
    if (any) return any[1];

    return "";
  };

  const extractImageFromHtml = (html) => {
    // a) <img src="https://images.tagesschau.de/...">
    const img = html.match(/<img[^>]+src="([^"]+)"/i);
    if (img && IMG_RE.test(img[1])) return img[1];

    // b) <source srcset="https://images.tagesschau.de/... 1x, ...">
    const srcset = html.match(/srcset="([^"]+)"/i);
    if (srcset) {
      // Nimm den ersten Eintrag aus srcset, der auf images.tagesschau.de zeigt
      const firstMatch = srcset[1].split(",").map(s => s.trim().split(" ")[0]).find(u => IMG_RE.test(u));
      if (firstMatch) return firstMatch;
    }

    // c) Fallback: irgendeine images.tagesschau.de-URL irgendwo im HTML
    const any = html.match(IMG_RE);
    if (any) return any[1];

    return "";
  };

  const fetchArticleImage = async (articleUrl) => {
    try {
      const html = await fetchViaProxies(articleUrl);
      return extractImageFromHtml(html);
    } catch {
      return "";
    }
  };

  const fetchNews = async () => {
    setError("");
    setLoading(true);
    try {
      const xmlText = await fetchViaProxies(RSS_URL);
      const xml = new window.DOMParser().parseFromString(xmlText, "text/xml");
      const nodes = Array.from(xml.querySelectorAll("item")).slice(0, 6);

      const prelim = nodes.map((n) => {
        const title = n.querySelector("title")?.textContent ?? "";
        const link = n.querySelector("link")?.textContent ?? "#";
        const pubDate = n.querySelector("pubDate")?.textContent ?? "";
        const description = n.querySelector("description")?.textContent ?? "";

        let image =
          n.querySelector("enclosure")?.getAttribute("url") ||
          n.querySelector("media\\:content")?.getAttribute("url") ||
          n.querySelector("media\\:thumbnail")?.getAttribute("url") ||
          extractImageFromDescription(description) ||
          "";

        return { title, link, pubDate, image };
      });

      const filled = await Promise.all(
        prelim.map(async (it) => {
          if (!it.image) {
            const img = await fetchArticleImage(it.link);
            if (img) it.image = img;
          }
          return it;
        })
      );

      if (!filled.length) setError("Keine Nachrichten gefunden");
      setItems(filled);
    } catch (e) {
      console.error(e);
      setError("News konnten nicht geladen werden");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const id = setInterval(fetchNews, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Card
      title="Tagesschau"
      right={
        <button
          onClick={fetchNews}
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
          aria-label="Neu laden"
        >
          <RefreshCw className="w-4 h-4 text-zinc-300" />
        </button>
      }
      accent={accent}
    >
      <div className="space-y-4">
        {loading && <div className="text-zinc-400 text-sm">Lade…</div>}
        {error && !loading && <div className="text-sm text-red-400">{error}</div>}

        <AnimatePresence>
          {items.map((it, i) => (
            <motion.a
              key={i}
              href={it.link}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-start gap-3 group"
            >
              <div className="shrink-0 w-14 h-10 rounded-md overflow-hidden bg-zinc-800 border border-zinc-700">
                {it.image ? (
                  <img alt="Vorschau" src={it.image} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1">
                <div className="text-sm text-zinc-300 group-hover:text-white line-clamp-2 font-medium">
                  {it.title}
                </div>
                <div className="text-xs text-zinc-500">
                  {new Date(it.pubDate).toLocaleTimeString("de-DE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </motion.a>
          ))}
        </AnimatePresence>

        <div className="text-[11px] text-zinc-500">
          Letztes Update:{" "}
          {new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </Card>
  );
}


// --- Krypto Märkte (CoinGecko) ---
const COIN_MAP = {
  bitcoin: { label: "BTC" },
  ethereum: { label: "ETH" },
  solana: { label: "SOL" },
  ripple: { label: "XRP" },
};

function Markets({ accent }) {
  const [currency, setCurrency] = useState(Cookies.get("currency") || "USD");
  const [data, setData] = useState({});

  const fetchPrices = async (cur = currency) => {
    try {
      const ids = Object.keys(COIN_MAP).join(",");
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${cur.toLowerCase()}&include_24hr_change=true`;
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPrices();
    const id = setInterval(fetchPrices, 60 * 1000);
    return () => clearInterval(id);
  }, [currency]);

  useEffect(() => {
    Cookies.set("currency", currency, { expires: 365 });
  }, [currency]);

  return (
    <Card
      title="Markets"
      right={
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="bg-zinc-800 text-zinc-200 text-sm px-2 py-1 rounded-md border border-zinc-700"
        >
          {["USD", "EUR", "GBP"].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      }
      accent={accent}
    >
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(COIN_MAP).map(([id, meta]) => {
          const price = data?.[id]?.[currency.toLowerCase()];
          const change = data?.[id]?.[`${currency.toLowerCase()}_24h_change`];
          const rising = change >= 0;
          return (
            <div key={id} className="rounded-xl bg-zinc-800/50 border border-zinc-700 p-4">
              <div className="flex items-center justify-between mb-1 text-zinc-300">
                <div className="font-semibold">{meta.label}</div>
                {rising ? (
                  <TrendingUp className="w-4 h-4" style={{ color: accent }} />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div className="text-white text-lg font-semibold">
                {price !== undefined ? fmtMoney(price, currency) : "—"}
              </div>
              <div className={`text-xs ${rising ? "text-emerald-400" : "text-red-400"}`}>
                {change ? `${change.toFixed(2)}%` : ""}
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-[11px] text-zinc-500 mt-3">Aktualisiert jede Minute</div>
    </Card>
  );
}

// --- Wetter (Open‑Meteo) ---
function Wetter({ accent }) {
  const [city, setCity] = useState(Cookies.get("city") || "Siegen");
  const [country, setCountry] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef(null);

  const fetchWeather = async (cityToFetch, countryToFetch = "") => {
    setLoading(true);
    setError("");
    setWeatherData(null);

    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cityToFetch}&count=1&language=en&format=json`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError(`Stadt \"${cityToFetch}\" nicht gefunden`);
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=Europe%2FBerlin&forecast_days=5`;
      const weatherResponse = await fetch(weatherUrl);
      const weatherJson = await weatherResponse.json();

      if (weatherJson.error) {
        setError(weatherJson.reason);
        setLoading(false);
        return;
      }

      setCity(name);
      setCountry(country);
      setWeatherData(weatherJson);
      Cookies.set("city", name, { expires: 365 });
    } catch (err) {
      console.error(err);
      setError("Abruf fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city, country);
    const id = setInterval(() => fetchWeather(city, country), 15 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchWeather(searchQuery.trim());
      setSearchQuery("");
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  };

  const currentTemp = weatherData?.current_weather?.temperature;
  const currentUV = useMemo(() => {
    if (!weatherData?.hourly) return null;
    const nowIsoHour = new Date().toISOString().slice(0, 13);
    const idx = weatherData.hourly.time?.findIndex((t) => t.startsWith(nowIsoHour));
    return idx >= 0 ? weatherData.hourly.uv_index?.[idx] : null;
  }, [weatherData]);

  return (
    <Card
      title="Wetter"
      right={
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-2 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            className="bg-zinc-800 text-zinc-200 text-sm pl-7 pr-2 py-1 rounded-md border border-zinc-700 w-44 md:w-56"
            placeholder="Stadt suchen…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      }
      accent={accent}
    >
      <div className="text-zinc-300">
        <div className="text-lg text-white">{city}{country ? `, ${country}` : ""}</div>
        <div className="text-5xl font-semibold my-2">{currentTemp !== undefined ? `${Math.round(currentTemp)}°C` : "—"}</div>
        <div className="text-sm text-zinc-400 flex items-center gap-3">
          <span>Aktualisiert alle 15 Minuten</span>
			{typeof currentUV === "number" && !Number.isNaN(currentUV) && (
			  <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">
				UV {currentUV.toFixed(1)}
			  </span>
			)}
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {weatherData?.daily?.time?.map((day, i) => (
          <div key={i} className="flex items-center justify-between border-t border-zinc-800 pt-3">
            <div className="text-zinc-300">
              {new Date(day).toLocaleDateString("de-DE", { weekday: "long" })}
            </div>
            <div className="text-zinc-200 flex items-center gap-3">
              <span>{Math.round(weatherData.daily.temperature_2m_max[i])}° / {Math.round(weatherData.daily.temperature_2m_min[i])}°</span>
				{typeof weatherData.daily.uv_index_max?.[i] === "number" && (
				  <span className="text-xs text-zinc-400">
					UV max {weatherData.daily.uv_index_max[i].toFixed(1)}
				  </span>
				)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// --- Rechner ---
function Rechner({ accent }) {
  const [value, setValue] = useState("0");

  const press = (ch) => {
    setValue((v) => (v === "0" ? String(ch) : v + ch));
  };
  const clear = () => setValue("0");
  const percent = () => setValue((v) => String(eval(v) / 100));
  const eq = () => {
    try {
      // eslint-disable-next-line no-eval
      const res = eval(value);
      setValue(String(res));
    } catch {
      setValue("Fehler");
      setTimeout(() => setValue("0"), 900);
    }
  };

  const Btn = ({ children, onClick, primary, wide }) => (
    <button
      onClick={onClick}
      className={`h-11 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition ${
        primary ? "font-semibold" : ""} ${wide ? "col-span-2" : ""}`}
      style={primary === "equals" ? { background: accent, color: "#0a0a0a", borderColor: accent } : {}}
    >
      {children}
    </button>
  );

  return (
    <Card title="Rechner" right={<div />} accent={accent}>
      <div className="rounded-xl bg-zinc-950/60 border border-zinc-800 p-3 text-right text-3xl text-white font-mono mb-3 min-h-[64px]">
        {value}
      </div>
      <div className="grid grid-cols-4 gap-2">
        <Btn onClick={clear}>AC</Btn>
        <Btn onClick={percent}>%</Btn>
        <Btn onClick={() => press("/")}>÷</Btn>
        <Btn onClick={() => press("*")}>×</Btn>

        <Btn onClick={() => press("7")}>7</Btn>
        <Btn onClick={() => press("8")}>8</Btn>
        <Btn onClick={() => press("9")}>9</Btn>
        <Btn onClick={() => press("-")}>-</Btn>

        <Btn onClick={() => press("4")}>4</Btn>
        <Btn onClick={() => press("5")}>5</Btn>
        <Btn onClick={() => press("6")}>6</Btn>
        <Btn onClick={() => press("+")}>+</Btn>

        <Btn onClick={() => press("1")}>1</Btn>
        <Btn onClick={() => press("2")}>2</Btn>
        <Btn onClick={() => press("3")}>3</Btn>
        <Btn onClick={eq} primary="equals">=</Btn>

        <Btn onClick={() => press("0")} wide>0</Btn>
        <Btn onClick={() => press(".")}>.</Btn>
      </div>
    </Card>
  );
}

// --- Arbeits‑Timer ---
function ArbeitsTimer({ accent }) {
  const [target, setTarget] = useState(Cookies.get("targetTime") || "17:00");
  const [now, setNow] = useState(Date.now());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    Cookies.set("targetTime", target, { expires: 365 });
  }, [target]);

  const targetDate = useMemo(() => {
    const [hh, mm] = target.split(":").map((n) => parseInt(n, 10));
    const d = new Date();
    d.setHours(hh, mm, 0, 0);
    if (d.getTime() < now) d.setDate(d.getDate() + 1);
    return d;
  }, [target, now]);

  const diff = Math.max(0, targetDate.getTime() - now);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return (
    <Card
      title="Arbeits‑Timer"
      right={
        <button onClick={() => setOpen((o) => !o)} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700">
          <Cog className="w-4 h-4 text-zinc-300" />
        </button>
      }
      accent={accent}
    >
      <div className="text-center">
        <div className="text-xs text-zinc-400 mb-2">Verbleibende Zeit bis {target} Uhr</div>
        <div className="text-5xl md:text-6xl font-bold tracking-wider" style={{ color: accent }}>
          {pad(h)}:{pad(m)}:{pad(s)}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-5 flex items-center justify-center gap-3"
          >
            <label className="text-sm text-zinc-300 flex items-center gap-2">
              <Clock3 className="w-4 h-4" /> Zielzeit:
              <input
                type="time"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="bg-zinc-800 text-zinc-200 border border-zinc-700 rounded px-2 py-1"
              />
            </label>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// --- Seite / Layout ---
export default function Dashboard() {
  const [accent, setAccent] = useState(Cookies.get("accent") || defaultAccent);
  useEffect(() => {
    Cookies.set("accent", accent, { expires: 365 });
    document.documentElement.style.setProperty("--accent", accent);
  }, [accent]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <Header accent={accent} setAccent={setAccent} />

        {/* GRID wie Screenshot 2 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
          {/* Links: News (md: 3 Spalten) */}
          <div className="md:col-span-3 lg:col-span-3">
            <News accent={accent} />
          </div>

          {/* Mitte: Markets + Timer */}
          <div className="md:col-span-5 lg:col-span-5 space-y-6">
            <Markets accent={accent} />
            <ArbeitsTimer accent={accent} />
          </div>

          {/* Rechts: Wetter + Rechner */}
          <div className="md:col-span-4 lg:col-span-4 space-y-6">
            <Wetter accent={accent} />
            <Rechner accent={accent} />
          </div>
        </div>
      </div>

      {/* Akzentfarbe als CSS‑Variable nutzen */}
      <style>{`::selection{background:${accent}33} a{color:${accent}} .accent{color:${accent}}`}</style>
    </div>
  );
}
