import { parseViews } from "./parseViews";

export function topReadStories(stories, n) {
  return [...stories]
    .sort((a, b) => parseViews(b.views) - parseViews(a.views))
    .slice(0, n);
}
