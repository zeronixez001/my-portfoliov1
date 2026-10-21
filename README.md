# Adrian Montes — Portfolio

A responsive personal portfolio built with React, TypeScript, Vite, TanStack Router, and Tailwind CSS. The site loads public GitHub profile/repository information from the GitHub REST API in the browser.

## Deploy to GitHub Pages

This repository is configured as a **GitHub Pages project site** whose repository name is `my-portfoliov1`.

1. Upload/push the contents of this project to the `main` branch of the GitHub repository named **`my-portfoliov1`**. The `.github/workflows/deploy.yml` file must be at the repository root.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, select **GitHub Actions** as the source.
4. Open the **Actions** tab and wait for **Deploy portfolio to GitHub Pages** to finish successfully. It also runs automatically on every push to `main`.
5. Your site URL will be `https://YOUR-GITHUB-USERNAME.github.io/my-portfoliov1/` (replace the username with your GitHub username).

The build creates a static site in `dist/`; GitHub Pages does not run a Node/TanStack server, so the app is configured as a client-rendered static site. Public GitHub API data requires an internet connection and can be limited by GitHub's unauthenticated API rate limit.

## Run locally

Requires Node.js 22 and Bun.

```sh
bun install
bun run dev
```

To test the production build locally:

```sh
bun run build
bun run preview
```

## Important configuration

`vite.config.ts` uses `/my-portfoliov1/` as the base path. If the repository is renamed, update that base path to match the new repository name before deploying. For a user/organization site named `YOUR-USERNAME.github.io`, use `/` instead.
