# Earshot test log

Each version gets a name, a list of what changed, and the results of the tests run before it was pushed.
The version name is also shown at the bottom of the game page, so you can check which version is live.

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
