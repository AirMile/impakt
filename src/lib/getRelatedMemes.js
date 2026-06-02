export function getRelatedMemes(memes, storyId) {
  return memes.filter((m) => m.storyId === storyId);
}
