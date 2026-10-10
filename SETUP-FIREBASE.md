# Switching on Google sign-in and leaderboards

Earshot uses Firebase (by Google) for player sign-in and to store results. It's free at this size. Setup takes about 5 minutes; until it's done, the game works as before and the "Sign in with Google" button explains that sign-in isn't switched on yet.

## 1. Create the project
1. Go to https://console.firebase.google.com and sign in with your Google account.
2. Click **Create a project**, name it `earshot`, and finish the steps (Google Analytics is optional; you can turn it off).

## 2. Turn on Google sign-in
1. In the left menu: **Build → Authentication → Get started**.
2. Under **Sign-in method**, choose **Google**, switch it on, pick a support email, and **Save**.
3. Go to **Authentication → Settings → Authorized domains** and **Add domain**: `tomh6.github.io`

## 3. Create the database
1. Left menu: **Build → Firestore Database → Create database**.
2. Pick a location close to your players (for Israel, `europe-west` works well) and start in **production mode**.
3. Open the **Rules** tab, replace everything with the contents of `firestore.rules` from this repo, and click **Publish**.

## 4. Register the web app and get the settings
1. Click the gear icon → **Project settings**. Under **Your apps**, click the **web** icon (`</>`).
2. Nickname it `earshot`; you don't need Firebase Hosting. Click **Register app**.
3. Firebase shows a block of code with `const firebaseConfig = { apiKey: ..., authDomain: ..., ... }`.
4. Copy those values into `firebase-config.js` (or paste them to Claude to do it).

These values identify the project and are meant to be public; the rules from step 3 decide who can read and write.

## What gets stored
- `players/{id}`: display name, rounds played, rounds won, best distance, current and best streak, last day played and won.
- `results/{id}`: one entry per finished round: player, day, song, won or not, distance, buzzes used, mode.
- Google email addresses and photos are not stored.

## Good to know
- Scores are saved from the player's browser, so a determined player could fake a score. That's normal for a prototype; a server-side check can come later.
- While the game is in dev mode, every round counts toward stats and streaks. At launch (daily mode), streaks would usually count only the daily song.
