// Subregel voor de FeedEndCard: "Bijgewerkt om HH:MM". Toont het moment van
// bekijken (mount), niet de data-versheid van de backend. Accepteert een date
// zodat de helper puur en testbaar blijft.
export function updatedAtLabel(date = new Date()) {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `Bijgewerkt om ${hh}:${mm}`;
}
