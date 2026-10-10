// Shared helpers for Earshot player stats (used by players.js and players.html)
// Local calendar day as YYYY-MM-DD, and the day before it
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const prevDay = key => { const [y, m, d] = key.split("-").map(Number); return dayKey(new Date(y, m - 1, d - 1)); };
// A streak is alive if the last win was today or yesterday
export const liveStreak = p => p && p.lastWinDay && (p.lastWinDay === dayKey() || p.lastWinDay === prevDay(dayKey())) ? p.streak || 0 : 0;
export const _test = { dayKey, prevDay, liveStreak };
