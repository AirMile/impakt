const NL_MONTHS = {
  januari: 0,
  februari: 1,
  maart: 2,
  april: 3,
  mei: 4,
  juni: 5,
  juli: 6,
  augustus: 7,
  september: 8,
  oktober: 9,
  november: 10,
  december: 11,
};

export function parseNLDate(str) {
  if (!str || typeof str !== "string") return null;
  const parts = str.trim().split(/\s+/);
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const monthIdx = NL_MONTHS[parts[1].toLowerCase()];
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || monthIdx === undefined || isNaN(year)) return null;
  return new Date(year, monthIdx, day);
}

export function isToday(date, now = new Date()) {
  if (!date) return false;
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function isThisWeek(date, now = new Date()) {
  if (!date) return false;
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((nowDay - d) / 86400000);
  return diffDays > 0 && diffDays <= 7;
}

export function groupHappyStories(
  stories,
  { now = new Date(), threshold = 3, filterTag = null } = {}
) {
  const pool = filterTag
    ? stories.filter((s) => s.tags?.includes(filterTag))
    : stories;

  const today = [];
  const week = [];
  const earlier = [];

  for (const s of pool) {
    const d = parseNLDate(s.date);
    if (isToday(d, now)) today.push(s);
    else if (isThisWeek(d, now)) week.push(s);
    else earlier.push(s);
  }

  const bySmile = (a, b) => b.reactions.smile - a.reactions.smile;
  today.sort(bySmile);
  week.sort(bySmile);
  earlier.sort(bySmile);

  if (today.length < threshold) {
    week.push(...today);
    week.sort(bySmile);
    today.length = 0;
  }
  if (week.length < threshold) {
    earlier.push(...week);
    earlier.sort(bySmile);
    week.length = 0;
  }

  const result = [];
  if (today.length > 0)
    result.push({
      key: "today",
      label: "LEUK NIEUWS VAN VANDAAG",
      stories: today,
    });
  if (week.length > 0)
    result.push({
      key: "week",
      label: "LEUK NIEUWS VAN DEZE WEEK",
      stories: week,
    });
  if (earlier.length > 0)
    result.push({ key: "earlier", label: "EERDER", stories: earlier });
  return result;
}
