import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  onboarded: "impakt.onboarded",
  preferences: "impakt.preferences",
  bookmarks: "impakt.bookmarks",
  token: "impakt.token",
  pollVotes: "impakt.pollVotes",
};

export async function getOnboarded() {
  const v = await AsyncStorage.getItem(KEYS.onboarded);
  return v === "true";
}

export async function setOnboarded(value) {
  await AsyncStorage.setItem(KEYS.onboarded, String(value));
}

export async function getPreferences() {
  const v = await AsyncStorage.getItem(KEYS.preferences);
  return v ? JSON.parse(v) : [];
}

export async function setPreferences(prefs) {
  await AsyncStorage.setItem(KEYS.preferences, JSON.stringify(prefs));
}

export async function getBookmarks() {
  const v = await AsyncStorage.getItem(KEYS.bookmarks);
  return v ? JSON.parse(v) : [];
}

export async function setBookmarks(ids) {
  await AsyncStorage.setItem(KEYS.bookmarks, JSON.stringify(ids));
}

// Auth-token persistentie: bij login schrijven, bij opstart lezen (→ fetchAccount
// haalt de verse user op), bij uitloggen/verwijderen wissen.
export async function getToken() {
  return AsyncStorage.getItem(KEYS.token);
}

export async function setToken(token) {
  if (!token) return;
  await AsyncStorage.setItem(KEYS.token, String(token));
}

export async function clearToken() {
  await AsyncStorage.removeItem(KEYS.token);
}

function pollVoteKey(userId, pollId) {
  return `${userId}:${pollId}`;
}

export async function getPollVote(userId, pollId) {
  if (userId == null || pollId == null) return null;
  const v = await AsyncStorage.getItem(KEYS.pollVotes);
  const votes = v ? JSON.parse(v) : {};
  return votes[pollVoteKey(userId, pollId)] ?? null;
}

export async function setPollVote(userId, pollId, optionId) {
  if (userId == null || pollId == null || optionId == null) return;
  const v = await AsyncStorage.getItem(KEYS.pollVotes);
  const votes = v ? JSON.parse(v) : {};
  votes[pollVoteKey(userId, pollId)] = optionId;
  await AsyncStorage.setItem(KEYS.pollVotes, JSON.stringify(votes));
}
