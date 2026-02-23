This folder collects the project's frontend surfaces for clearer organization.

Detected frontends (do NOT move files automatically — review before reorganizing):

- Main React + Vite app (source in project root):
  - index.html
  - src/index.tsx
  - src/App.tsx
  - vite.config.ts
  - package.json

- Static pages (served as-is):
  - public/about.html
  - public/market-data.html
  - public/video-generator.html
  - public/video-player.html
  - public/policies/

Recommended next steps to consolidate into this folder:

1. Decide whether to move the React app into `frontends/app/` and the static pages into `frontends/static/`.
2. If moving, update paths and the project's `package.json` scripts (or Vite config) and any deployment settings.
3. Optionally add a top-level `frontends/package.json` to run scripts for multiple frontends concurrently.

Dev run commands (existing setup — do not run from this folder unless you move files):

```bash
# run the React + Vite app from the repo root
npm install
npm run dev

# serve static pages (from their folder)
# using a simple static server, e.g. serve
npx serve public
```

If you want, I can move the files into `frontends/` (creating `frontends/app/` and `frontends/static/`), update config and `package.json` scripts, and adjust the Vite dev proxy — tell me to proceed and I will make the moves and required updates.