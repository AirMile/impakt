import { API_BASE_URL } from "./config";

// Backend levert het beeld soms absoluut (/articles → `img`) en soms als
// relatief storage-pad (/happy-feed → `image_url` = "articles/xxx.jpg"). We
// strippen `/api` van de base-URL en normaliseren naar een absolute URL, zodat
// <Image> 'm in beide feeds kan laden.
const ASSET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

function resolveImageUrl(raw) {
  const value = raw.image_url ?? raw.img ?? "";
  if (!value) return "";
  if (/^https?:\/\//.test(value)) return value;
  const path = value.replace(/^\/+/, "");
  const withStorage = path.startsWith("storage/") ? path : `storage/${path}`;
  return `${ASSET_BASE_URL}/${withStorage}`;
}

const NL_MONTHS = [
  "januari",
  "februari",
  "maart",
  "april",
  "mei",
  "juni",
  "juli",
  "augustus",
  "september",
  "oktober",
  "november",
  "december",
];

function formatNLDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${NL_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function formatViews(n) {
  const num = Number(n);
  if (!Number.isFinite(num) || num < 0) return "0";
  if (num >= 1_000_000)
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(num);
}

function paragraphsFromContent(content) {
  if (!content) return [];
  if (Array.isArray(content)) return content.filter(Boolean);
  return String(content)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// De backend levert article-tags als losse namen ("Lokaal"); ouder/mock-data
// soms als object. Normaliseer beide naar de tag-naam (string).
function tagName(tag) {
  if (typeof tag === "string") return tag;
  if (tag && typeof tag === "object") return tag.name ?? null;
  return null;
}

export function mapArticle(raw) {
  if (!raw || typeof raw !== "object") return null;

  const rawTags = Array.isArray(raw.tags)
    ? raw.tags.map(tagName).filter(Boolean)
    : [];
  // goodNews komt expliciet van de backend; de tag-categorie is niet langer
  // beschikbaar (tags zijn nu enkel namen).
  const goodNews = Boolean(raw.goodNews);

  return {
    id: raw.id,
    title: raw.title ?? "",
    sub: raw.summary ?? raw.sub ?? "",
    img: resolveImageUrl(raw),
    body: paragraphsFromContent(raw.content ?? raw.body),
    date: formatNLDate(raw.published_at),
    time: formatTime(raw.published_at),
    views: formatViews(raw.views_count ?? 0),
    readers: formatViews(raw.views_count ?? 0),
    tone: raw.tone ?? "",
    tags: rawTags,
    goodNews,
    trending: false,
    reactions: raw.reactions ?? { smile: 0, meh: 0, frown: 0 },
    poll: null,
    actions: null,
    sources: null,
    callToAction: raw.call_to_action ?? null,
    memes: Array.isArray(raw.memes) ? raw.memes : [],
  };
}

export {
  formatNLDate,
  formatTime,
  formatViews,
  paragraphsFromContent,
  resolveImageUrl,
};
