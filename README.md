# Start Board

A small, browser-based board for collecting ideas, choosing a few to work on now, and keeping the rest for someday.

## Run locally

Open `index.html` in a browser. The app uses `start-board.css` for styling and `start-board.js` for its behavior. It does not require a server or build step.

## Your ideas and backups

Ideas are saved in the browser's local storage under the key `startboard`. They are not written into the project files. The example ideas in `SEED` in `start-board.js` are only used when that browser has no saved board.

The board is local to the browser profile and site origin. It does not automatically sync between browsers or devices. Clearing browser data can remove it.

- Select **Export backup** to download a dated JSON backup of the current board.
- Select **Import backup** to restore a backup. Importing replaces the current board after confirmation.
- Keep personal backups outside a public repository. A file excluded with `.gitignore` stays out of normal commits, but it is also not included in a GitHub Pages deployment.

When moving from the local HTML file to GitHub Pages, export a backup from the local board, open the deployed board in the browser, then import that backup. The local file and hosted page use different origins, so their saved boards are separate.

## Publish with GitHub Pages

Commit the app files to a GitHub repository, then enable Pages in the repository's **Settings > Pages** and choose the branch and folder containing the app files.

GitHub Pages looks for `index.html` at the published folder's root, and this project uses `index.html`. If your project uses a differently named HTML file, rename it to `index.html` for the default site URL, or keep its name and open it directly at `/<filename>.html` (URL-encode spaces, such as `/Start%20Board.html`).

GitHub Pages serves static files only. Each visitor's board is stored in that visitor's browser; Pages does not provide shared storage or automatic syncing.