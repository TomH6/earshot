// Earshot players: Google sign-in, saved results, stats, streaks and leaderboards (Firebase).
// The game sends an "earshot:result" event at the end of each round; this module saves it for the signed-in player.
import { FIREBASE_CONFIG } from "./firebase-config.js?v=2.0";
import { dayKey, prevDay, liveStreak } from "./players-util.js?v=2.0";

const SDK = "https://www.gstatic.com/firebasejs/10.12.2";
const $ = id => document.getElementById(id);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

const configured = !!(FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey);
const acct = $("account");
const board = $("board");

if (!configured) {
  if (acct) {
    const b = el("button", "gbtn", "Sign in with Google");
    b.onclick = () => { $("acctMsg").textContent = "Sign-in isn't switched on yet: the Firebase project still needs to be set up."; $("acctMsg").hidden = false; };
    acct.append(b);
  }
  if (board) { $("boardBody").textContent = "Leaderboards appear here once sign-in is switched on."; board.hidden = false; }
} else {
  start().catch(err => {
    console.error("[Earshot players]", err);
    if (acct) { acct.textContent = ""; acct.append(el("span", "hint", "Sign-in is unavailable right now.")); }
  });
}

async function start() {
  const [{ initializeApp }, A, F] = await Promise.all([
    import(`${SDK}/firebase-app.js`), import(`${SDK}/firebase-auth.js`), import(`${SDK}/firebase-firestore.js`)
  ]);
  const app = initializeApp(FIREBASE_CONFIG);
  const auth = A.getAuth(app);
  const db = F.getFirestore(app);
  let me = null, myStats = null;

  // ---------- account bar ----------
  function renderAccount() {
    acct.textContent = "";
    if (!me) {
      const b = el("button", "gbtn", "Sign in with Google");
      b.onclick = async () => {
        try { await A.signInWithPopup(auth, new A.GoogleAuthProvider()); }
        catch (e) {
          if (e && e.code === "auth/popup-closed-by-user") return;
          $("acctMsg").textContent = e && e.code === "auth/unauthorized-domain"
            ? "Sign-in is blocked for this address. Add it under Firebase → Authentication → Settings → Authorized domains."
            : "Sign-in didn't work. Try again, or allow pop-ups for this site.";
          $("acctMsg").hidden = false;
        }
      };
      acct.append(b);
      return;
    }
    $("acctMsg").hidden = true;
    const who = el("div", "who");
    who.append(el("span", "avatar", (me.displayName || "?").trim().charAt(0).toUpperCase()));
    const txt = el("div", "whotext");
    txt.append(el("b", null, me.displayName || "Player"));
    const s = myStats || {};
    txt.append(el("span", "hint", `Best ${Math.round(s.best || 0).toLocaleString("en-US")} m · Streak ${liveStreak(s)} · ${s.wins || 0}/${s.games || 0} won`));
    who.append(txt);
    const out = el("button", "linkbtn", "Sign out");
    out.onclick = () => A.signOut(auth);
    acct.append(who, out);
  }

  async function loadMe() {
    if (!me) { myStats = null; return; }
    const snap = await F.getDoc(F.doc(db, "players", me.uid));
    myStats = snap.exists() ? snap.data() : null;
  }

  // ---------- leaderboards ----------
  async function renderBoard() {
    const body = $("boardBody"); body.textContent = "Loading…";
    try {
      const [byBest, byStreak] = await Promise.all([
        F.getDocs(F.query(F.collection(db, "players"), F.orderBy("best", "desc"), F.limit(10))),
        F.getDocs(F.query(F.collection(db, "players"), F.orderBy("bestStreak", "desc"), F.limit(10)))
      ]);
      body.textContent = "";
      const cols = el("div", "boards");
      cols.append(list("Farthest correct guess", byBest.docs.map(d => [d.id, d.data()]), p => `${Math.round(p.best || 0).toLocaleString("en-US")} m`));
      cols.append(list("Longest win streak", byStreak.docs.map(d => [d.id, d.data()]), p => `${p.bestStreak || 0} day${p.bestStreak === 1 ? "" : "s"}`));
      body.append(cols);
    } catch (e) {
      console.error("[Earshot players]", e);
      body.textContent = "Couldn't load the leaderboards. Check that the Firestore database exists and the rules from firestore.rules are published.";
    }
  }
  function list(title, rows, value) {
    const box = el("div", "lb");
    box.append(el("h3", null, title));
    if (!rows.length) { box.append(el("p", "hint", "No scores yet. Sign in and play to be first.")); return box; }
    const ol = el("ol");
    rows.forEach(([id, p]) => {
      const li = el("li", me && id === me.uid ? "mine" : "");
      li.append(el("span", "nm", p.name || "Player"), el("span", "val", value(p)));
      ol.append(li);
    });
    box.append(ol);
    return box;
  }

  // ---------- saving a round ----------
  async function saveResult(r) {
    if (!me) return;
    const today = dayKey();
    await F.addDoc(F.collection(db, "results"), {
      uid: me.uid, name: me.displayName || "Player", at: F.serverTimestamp(), day: today,
      mode: r.mode, song: r.song, won: !!r.won, distance: r.won ? Math.round(r.distance) : 0, buzzes: r.buzzes, reason: r.reason || ""
    });
    const ref = F.doc(db, "players", me.uid);
    myStats = await F.runTransaction(db, async tx => {
      const snap = await tx.get(ref);
      const p = snap.exists() ? snap.data() : { games: 0, wins: 0, best: 0, streak: 0, bestStreak: 0, lastWinDay: null };
      p.name = me.displayName || "Player";
      p.games = (p.games || 0) + 1;
      p.lastPlayed = today;
      if (r.won) {
        p.wins = (p.wins || 0) + 1;
        p.best = Math.max(p.best || 0, Math.round(r.distance));
        if (p.lastWinDay !== today) p.streak = p.lastWinDay === prevDay(today) ? (p.streak || 0) + 1 : 1;
        p.lastWinDay = today;
        p.bestStreak = Math.max(p.bestStreak || 0, p.streak);
      }
      tx.set(ref, p);
      return p;
    });
  }

  window.addEventListener("earshot:result", async e => {
    if (!me) { const n = $("saveNote"); if (n) { n.textContent = "Sign in with Google to save this result and join the leaderboard."; n.hidden = false; } return; }
    try {
      await saveResult(e.detail);
      const n = $("saveNote"); if (n) { n.textContent = "Saved to your stats."; n.hidden = false; }
      renderAccount(); renderBoard();
    } catch (err) {
      console.error("[Earshot players]", err);
      const n = $("saveNote"); if (n) { n.textContent = "This result couldn't be saved. Check your connection."; n.hidden = false; }
    }
  });

  A.onAuthStateChanged(auth, async user => {
    me = user;
    try { await loadMe(); } catch (e) { console.error("[Earshot players]", e); }
    renderAccount(); renderBoard();
  });
  board.hidden = false;
}
