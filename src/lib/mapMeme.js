export function mapMeme(raw) {
  if (!raw || typeof raw !== "object") return null;

  const storyId = raw.article_id ?? raw.storyId ?? null;
  const article =
    raw.article && typeof raw.article === "object" ? raw.article : null;

  return {
    id: raw.id,
    storyId,
    img: raw.image_url ?? raw.img ?? "",
    top: raw.title ?? raw.top ?? "",
    bot: raw.caption ?? raw.bot ?? "",
    likes: Number.isFinite(raw.likes) ? raw.likes : 0,
    reactions: raw.reactions ?? { smile: 0, meh: 0, frown: 0 },
    storyHeadline: article?.title ?? "",
    storyTeaser: article?.summary ?? "",
    storySource: "Impakt",
  };
}
