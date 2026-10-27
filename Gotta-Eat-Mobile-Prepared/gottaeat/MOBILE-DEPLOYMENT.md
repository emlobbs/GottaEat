# Gotta Eat — mobile deployment notes

## What has been prepared

- Added a web-app manifest so supported browsers can offer an install-to-home-screen experience.
- Added 192px and 512px app icons plus an Apple home-screen icon reference.
- Added app theme colour and standalone display metadata while preserving the existing UI and project structure.

## Important: this project is not yet ready for shared production use

The current front-end (`src/app/(frontend)/meal-app.tsx`) keeps key state in React component state (`useState`). For example, votes and wishlist items reset when the page is refreshed and are not shared between devices. The existing Payload collections describe households, recipes, meal plans, swipe votes and wishlist recipes, but the front-end does not currently call them to load/save those records.

The collections also include broad read access (`read: () => true`) and there is no obvious database adapter or database connection configured in `src/payload.config.ts` in this exported project. Do not put private household data into a public deployment until authentication, household membership checks, collection access rules and a persistent database have been configured and tested.

## Recommended no-cost starting point

1. Use a free GitHub account to store the project.
2. Deploy the Next.js application to a host with a free tier that supports server-side Next.js (for example, Vercel's free tier, subject to its current limits).
3. Configure a persistent database and authentication before expecting data to sync across phones. This export alone does not include the required credentials or prove that the Figma-managed Payload setup will work outside Figma Make.
4. After the hosted HTTPS site works, install it on iPhone from Safari using Share → Add to Home Screen, and on Android from Chrome using Install app / Add to Home screen.

## Installability is not the same as data sync

The manifest enables the installable-app setup, but it does not make the app offline-capable and does not implement syncing. A service worker/offline strategy can be added later if desired. Shared sync requires a live backend, sign-in or a secure shared-household invitation, persistent storage and authorization rules.

## Local development

The package declares Node.js `>=24.22.1` and pnpm. Use a compatible Node version and pnpm version, install dependencies with `pnpm install`, then follow the host/backend setup before running production builds. This export's Figma-specific configuration may require platform-provided environment variables and services, so a clean standalone build/deploy must be verified rather than assumed.
