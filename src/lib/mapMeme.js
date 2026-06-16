import { API_BASE_URL } from "./config";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

function resolveMemeImageUrl(imageUrl) {
  if (!imageUrl) return "";
  const value = String(imageUrl);
  if (/^(https?:)?\/\//i.test(value) || /^data:/i.test(value)) return value;

  const path = value.replace(/^\/+/, "");
  if (path.startsWith("storage/")) return `${API_ORIGIN}/${path}`;
  return `${API_ORIGIN}/storage/${path}`;
}

export function mapMeme(raw) {
  if (!raw || typeof raw !== "object") return null;

  const storyId = raw.article_id ?? raw.story_id ?? raw.storyId ?? null;
  const article =
    raw.article && typeof raw.article === "object" ? raw.article : null;

  return {
    id: raw.id,
    storyId,
    img:
      raw.image_url != null
        ? resolveMemeImageUrl(raw.image_url)
        : (raw.img ?? ""),
    top: raw.title ?? raw.top ?? "",
    bot: raw.caption ?? raw.bot ?? "",
    likes: Number.isFinite(raw.likes) ? raw.likes : 0,
    reactions: raw.reactions ?? { smile: 0, meh: 0, frown: 0 },
    // De eigen reactie van de ingelogde gebruiker (null als niet gestemd / anoniem).
    myReaction: raw.my_reaction ?? null,
    storyHeadline: article?.title ?? "",
    storyTeaser: article?.summary ?? "",
    storySource: "Impakt",
  };
}
