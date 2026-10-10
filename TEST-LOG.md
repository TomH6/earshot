# Earshot test log

Each version gets a name, a list of what changed, and the results of the tests run before it was pushed.
The version name is also shown at the bottom of the game page, so you can check which version is live.

---

## v1.5 "One-Time Pass" (2026-10-10)

**What the run log showed** (Tom's Chrome, 17:45–17:55)
- 3 page loads at the address ending in `#daily` → Dream On all 3 times (daily mode, working as designed).
- 1 plain page load → Crazy Train (dev mode, new song).
- 1 Restart → Crazy Train again. The Restart button replays the same song by design, but the name made it look like a refresh.

**Changes**
- `#daily` and `#dev` now apply to one page load only. They clear themselves from the address, so the next refresh is back to normal dev mode. The log still records which one was used.
- The Restart button is renamed **Replay song**, with a tooltip pointing to New game for a different song.

**Tests** (headless Chrome, simulated Apple Music responses, page served at the real site address)

| Test | Expected | Result |
|---|---|---|
| Open with `#daily` | Daily song, label "Daily #1", `#daily` removed from address | Pass: Dream On, address back to plain |
| 2 refreshes after that | Dev mode, a new song each time | Pass: Jeremy, Paranoid |
| Log entries | First run logged as daily/#daily, then dev/plain | Pass |
| Button label and footer | "Replay song", v1.5 "One-Time Pass" | Pass |
| Script errors | None | Pass: none |

Also confirmed on the live site (v1.4, Claude app browser): 5 page loads gave 5 different songs.

---

## v1.4 "Flight Recorder" (2026-10-10)

**Problem reported:** "Dream On" keeps playing on every refresh. Dream On is exactly the song daily mode picks for Daily #1, so the browser is running daily mode: either the address still ends in `#daily`, or the browser is showing an old cached copy (v1.1 played the daily song on every load).

**Changes**
- Run log: every time the game loads a song it records the time, version, mode (dev or daily), event (page load, new game, restart), song, audio source (Apple preview or built-in cover) and the end of the address (`#daily`, `#dev` or plain). Kept in the browser, last 500 runs.
- New dashboard page, `log.html` (link at the bottom of the game): totals, most-played song, a diagnosis box that explains repeats (for example "the address ends in #daily"), a bar chart of songs played, and the full run table with back-to-back repeats highlighted. Copy and Clear buttons.
- The version label at the bottom of the game is now generated from one `VERSION` value in the code.
- The game page now has a proper HTML header (doctype and UTF-8). It was missing because the page started life as a chat artifact.

**Tests** (headless Chrome, simulated Apple Music responses, pages served at the real site address)

| Test | Expected | Result |
|---|---|---|
| 3 plain loads + 3 loads with `#daily` | 6 runs logged, 4 different songs | Pass: 6 runs, 4 songs |
| Dashboard diagnosis after repeated `#daily` loads | Names the song and blames `#daily` | Pass |
| Dashboard with no back-to-back repeats | Green "no repeats" box | Pass |
| Footer label | Earshot v1.4 "Flight Recorder" | Pass |
| Dashboard at phone width (400 px) | No sideways scrolling | Pass (after a fix) |
| Script errors | None | Pass, after adding the missing UTF-8 header (without it, a strict server could break the song-name matching) |

---

## v1.3 "Dev Mode" (2026-10-10)

**Changes**
- New `DEV_MODE` switch near the top of the game code. While it's on, every page refresh plays a new song from the shuffled deck (no repeats until all 70 have played). The top-right label shows "DEV MODE".
- With dev mode off (for launch), the page plays one daily song, the same for everyone that day, labelled "Daily #N". New game still gives practice songs.
- Either mode can be tried without changing code by adding `#daily` or `#dev` to the end of the address.

**Tests** (headless Chrome, simulated Apple Music responses, page served at the real site address)

| Test | Expected | Result |
|---|---|---|
| 3 refreshes in dev mode | 3 different songs, label "Dev mode" | Pass: Africa, More Than a Feeling, Zombie |
| 2 refreshes with `#daily` | Same song both times, label "Daily #1" | Pass: Dream On both times |
| Script errors | None | Pass: none |

---

## v1.2 "No Repeats" (2026-10-10)

**Problem found:** the same song kept coming back. Cause: on every page load the game played the "daily" song, which is fixed for the whole day, so each refresh replayed it. New game also only avoided the song just played.

**Changes**
- Songs now come from a shuffled deck: all 70 play once before any repeats. The deck is remembered in the browser, so refreshing the page gives the next song, not the same one.
- When the deck runs out it is reshuffled, and the last song played can't come first.
- The game opens in "Free play" mode instead of a fixed daily song.
- After a round ends, the reveal plays for 5 seconds and then fades out. Pressing Play brings it back.

**Tests** (headless Chrome, simulated Apple Music responses, page served at the real site address)

| Test | Expected | Result |
|---|---|---|
| 3 page refreshes | 3 different songs | Pass: Smoke on the Water, Wonderwall, Rock and Roll All Nite |
| 3 refreshes + 8 New games | 11 different songs | Pass: 11 of 11 unique |
| Music 4 s after round ends | Still playing | Pass |
| Music 6 s after round ends | Stopped | Pass |
| Press Play after auto-stop | Music plays again | Pass |
| Script errors | None | Pass: none |

---

## v1.1 "Short Road" (2026-10-10)

**Changes**
- Starting distance cut from 2 km to 1.4 km.
- Steady driving speed of 90 km/h (was accelerating, averaging about 240 km/h). The drive now takes about 56 seconds.
- Quiet fade-ins at the start of song previews are skipped, so the music is audible from the first second.
- Distance markers under the road redrawn for 1.4 km (1.4 km, 1 km, 500 m, here), placed to scale.
- Score comments rescaled to the shorter road (900 m / 500 m / 200 m).

**Tests** (headless Chrome, with Apple Music responses simulated)

| Test | Expected | Result |
|---|---|---|
| Distance before start | 1,400 m | Pass: 1,400 m |
| Speedometer while driving | 90 km/h, constant | Pass: 90 km/h at 3 s and at 13 s |
| Distance after 2 s intro + 1 s of driving | about 1,375 m | Pass: 1,375 m |
| Distance after 11 s of driving | about 1,125 m | Pass: 1,124 m |
| Preview that starts with 2 s of silence | Playback starts at about 2 s | Pass: starts at 1.95 s |
| Road markers line up with the distance | 1 km and 500 m at scale | Pass (checked on screenshot) |
| Script errors | None | Pass: none |

---

## v1.0 "First Drive" (2026-10-10), first version on GitHub Pages

**Features**
- Song drifts in from far away: muffled, echoey, wind gusts; clears up as you get closer.
- Buzz to freeze the distance and guess; music stops while guessing. Wrong guess = 150 m closer, 3 buzzes.
- Controls: Pause/Play, volume, Restart, New game. 2-second road intro before the music.
- Real 30-second song previews from Apple Music (70 rock songs, 70s to 90s), with built-in rock covers as fallback.

**Tests**

| Test | Result |
|---|---|
| Apple search and previews reachable from a real browser, audio decodes for effects | Pass |
| Deezer API reachable from a browser | Fail: blocked by Deezer (needs a relay server) |
| Song catalog matching on Apple Music | 62 of 70 matched; 5 test errors were Apple rate-limiting the rapid test; 3 songs with no usable preview replaced (You Oughta Know, Killing in the Name, Man in the Box) |
| Fallback to built-in songs when Apple is unreachable | Pass |
| Start, drive, buzz, wrong guess penalty | Pass |
| Pause stops music and distance; play resumes | Pass |
| Music stops during guessing, resumes after a wrong guess | Pass |
| Restart and New game | Pass |

**Fixed along the way**
- Game froze on start (first frame produced an invalid distance). Fixed before v1.0.
