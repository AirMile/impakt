import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getOnboarded,
  setOnboarded,
  getPreferences,
  setPreferences,
  getBookmarks,
  setBookmarks,
  getToken,
  setToken,
  clearToken,
  getPollVote,
  setPollVote,
} from "./prefs";

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("onboarded", () => {
  test("retourneert false als niet gezet", async () => {
    expect(await getOnboarded()).toBe(false);
  });

  test("round-trip: true", async () => {
    await setOnboarded(true);
    expect(await getOnboarded()).toBe(true);
  });

  test("round-trip: false", async () => {
    await setOnboarded(true);
    await setOnboarded(false);
    expect(await getOnboarded()).toBe(false);
  });

  test("retourneert boolean (niet string)", async () => {
    await setOnboarded(true);
    expect(typeof (await getOnboarded())).toBe("boolean");
  });
});

describe("preferences", () => {
  test("retourneert lege array als niet gezet", async () => {
    expect(await getPreferences()).toEqual([]);
  });

  test("round-trip", async () => {
    await setPreferences(["Klimaat", "Tech"]);
    expect(await getPreferences()).toEqual(["Klimaat", "Tech"]);
  });

  test("overschrijft bestaande waarde", async () => {
    await setPreferences(["Sport"]);
    await setPreferences(["Klimaat", "Tech"]);
    expect(await getPreferences()).toEqual(["Klimaat", "Tech"]);
  });
});

describe("bookmarks", () => {
  test("retourneert lege array als niet gezet", async () => {
    expect(await getBookmarks()).toEqual([]);
  });

  test("round-trip", async () => {
    await setBookmarks([1, 2, 3]);
    expect(await getBookmarks()).toEqual([1, 2, 3]);
  });

  test("overschrijft bestaande waarde", async () => {
    await setBookmarks([1]);
    await setBookmarks([4, 5]);
    expect(await getBookmarks()).toEqual([4, 5]);
  });
});

describe("token", () => {
  test("retourneert null als niet gezet", async () => {
    expect(await getToken()).toBeNull();
  });

  test("round-trip: schrijft en leest het token", async () => {
    await setToken("abc123");
    expect(await getToken()).toBe("abc123");
  });

  test("setToken negeert lege waarde", async () => {
    await setToken("");
    expect(await getToken()).toBeNull();
  });

  test("clearToken verwijdert het token", async () => {
    await setToken("abc123");
    await clearToken();
    expect(await getToken()).toBeNull();
  });
});

describe("pollVotes", () => {
  test("retourneert null als er geen stem is opgeslagen", async () => {
    expect(await getPollVote(15, 7)).toBeNull();
  });

  test("round-trip per gebruiker en poll", async () => {
    await setPollVote(15, 7, 31);
    await setPollVote(15, 8, 40);
    await setPollVote(16, 7, 32);

    expect(await getPollVote(15, 7)).toBe(31);
    expect(await getPollVote(15, 8)).toBe(40);
    expect(await getPollVote(16, 7)).toBe(32);
  });
});
