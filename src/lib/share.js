import { Share, Platform } from "react-native";
import { toast } from "./toast";

const ALLOWED_KINDS = ["story", "meme"];

export function buildShareUrl({ kind, id }) {
  if (!ALLOWED_KINDS.includes(kind))
    throw new Error(`Onbekend share kind: ${kind}`);
  return `impakt://${kind}/${id}`;
}

async function shareViaPlatform({ title, message, url }) {
  if (Platform.OS === "web") {
    try {
      if (navigator.share && navigator.canShare?.({ url }) !== false) {
        await navigator.share({ title, text: message, url });
        return;
      }
    } catch (e) {
      if (e.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.show("Link gekopieerd");
    } catch {
      // clipboard niet beschikbaar — stil falen
    }
    return;
  }

  try {
    await Share.share({ title, message: `${message}\n${url}`, url });
  } catch {
    // stil falen bij dismiss of fout
  }
}

export async function shareStory(story) {
  const url = buildShareUrl({ kind: "story", id: story.id });
  await shareViaPlatform({ title: story.title, message: story.sub, url });
}

export async function shareMeme(meme) {
  const url = buildShareUrl({ kind: "meme", id: meme.id });
  await shareViaPlatform({
    title: meme.storyHeadline,
    message: `${meme.top} / ${meme.bot}`,
    url,
  });
}
