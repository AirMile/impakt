import { API_BASE_URL } from "./config";

// Backend levert het beeld soms absoluut (/articles → `img`) en soms als
// relatief storage-pad (/happy-feed → `image_url` = "articles/xxx.jpg"). We
// strippen `/api` van de base-URL en normaliseren naar een absolute URL, zodat
// <Image> 'm in beide feeds kan laden.
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

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

function resolveArticleImageUrl(imageUrl) {
  if (!imageUrl) return "";
  const value = String(imageUrl);
  if (/^(https?:)?\/\//i.test(value) || /^data:/i.test(value)) return value;

  const path = value.replace(/^\/+/, "");
  if (path.startsWith("storage/")) return `${API_ORIGIN}/${path}`;
  return `${API_ORIGIN}/storage/${path}`;
}

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
  if (Array.isArray(content)) {
    return content
      .map((item) => (typeof item === "string" ? item : item?.value))
      .filter(Boolean);
  }
  return String(content)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// De backend levert article-tags soms als losse namen ("Lokaal"), soms als
// object met id/name/category. Normaliseer beide naar een object, zodat de
// feed op naam kan filteren én de tag-styling de categorie kan gebruiken.
function cleanTag(tag) {
  if (typeof tag === "string") return { id: tag, name: tag, category: null };
  if (!tag || typeof tag !== "object") return null;
  return { id: tag.id, name: tag.name, category: tag.category };
}

// De good-news-markering komt als tag binnen: naam "Goed nieuws"/"happy" of
// categorie "happy". Nu tags objecten zijn (met category) kunnen we 'm weer
// afleiden, naast de expliciete backend-flag.
function isGoodNewsTag(tag) {
  const name = String(tag?.name ?? "")
    .trim()
    .toLowerCase();
  const category = String(tag?.category ?? "")
    .trim()
    .toLowerCase();
  return name === "goed nieuws" || name === "happy" || category === "happy";
}

export function mapArticle(raw) {
  if (!raw || typeof raw !== "object") return null;

  const rawTags = Array.isArray(raw.tags)
    ? raw.tags.map(cleanTag).filter(Boolean)
    : [];
  // goodNews komt van de expliciete backend-flag óf wordt afgeleid uit een
  // good-news-tag (nu category weer beschikbaar is via het tag-object-model).
  const goodNews = raw.goodNews === true || rawTags.some(isGoodNewsTag);

  return {
    id: raw.id,
    title: raw.title ?? "",
    sub: raw.summary ?? raw.sub ?? "",
    img:
      raw.image_url != null
        ? resolveArticleImageUrl(raw.image_url)
        : resolveArticleImageUrl(raw.img),
    body: paragraphsFromContent(raw.content ?? raw.body ?? raw.body_paragraphs),
    date: formatNLDate(raw.published_at) || raw.date || "",
    time: formatTime(raw.published_at) || raw.time || "",
    views: formatViews(raw.views_count ?? raw.views ?? 0),
    readers: formatViews(raw.views_count ?? raw.views ?? 0),
    tone: raw.tone ?? "",
    tags: rawTags,
    goodNews,
    trending: false,
    reactions: raw.reactions ?? { smile: 0, meh: 0, frown: 0 },
    // De eigen reactie van de ingelogde gebruiker (null als niet gestemd / anoniem).
    myReaction: raw.my_reaction ?? null,
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
  resolveArticleImageUrl,
};
