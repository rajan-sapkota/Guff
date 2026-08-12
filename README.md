# Guff

Guff is a mobile-first real-time social discovery and messaging app. It combines a community feed, private conversations, user profiles, location sharing, camera capture, and lightweight administration in a glass-inspired interface.

## Highlights

- **Real-time social feed** — create and browse posts with media and location attachments.
- **Private messaging** — open one-to-one conversations directly from user profiles.
- **Profiles and follows** — view member profiles, follow or unfollow people, and see basic social stats.
- **Live location discovery** — search and attach locations through the in-app map experience.
- **Camera capture and image compression** — take photos in the app; images are compressed before being saved to keep payloads small.
- **Authentication and cloud data** — Firebase Authentication and Cloud Firestore support accounts and real-time app data.
- **Admin dashboard** — manage users and access member actions from a responsive, scrollable table.
- **Responsive Liquid Glass UI** — a desktop three-column layout and a touch-friendly floating mobile navigation bar.

## Technology

- React 18
- Vite 5
- Firebase Authentication and Cloud Firestore
- Leaflet
- Lucide React icons

## Getting started

### Prerequisites

- Node.js 18 or newer
- A Firebase project with Authentication and Cloud Firestore enabled

### Install and run

```bash
npm install
npm run dev
```

Vite will show a local URL (normally `http://localhost:5173`) for the development server.

## Firebase configuration

1. Copy `.env.example` to `.env`.
2. Replace the placeholder values with the web-app configuration from your Firebase project.
3. Enable the authentication providers you plan to support in Firebase Authentication.
4. Create a Cloud Firestore database and deploy or adapt the rules in `src/firestore.rules` to match your Firebase project.

```bash
cp .env.example .env
```

The app reads the following environment variables:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

Never commit a populated `.env` file. It is ignored by Git by default.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run build` | Create an optimized production build in `dist/`. |
| `npm run preview` | Serve the production build locally. |

## Project structure

```text
src/
  components/      Feature UI for feed, chat, map, profiles, and administration
  context/         Shared authentication and app state
  firebase/        Firebase configuration and data-service layer
  utils/           Client-side helpers, including image compression
public/            Static visual assets
```

## Design approach

Guff is built around a dark Apple-inspired Liquid Glass design system: translucent surfaces, soft shadows, prominent touch targets, and responsive navigation that shifts from a desktop rail to a mobile floating pill. See `DESIGN_STEERING.md` for the project’s UI and architecture conventions.

## License

No license has been specified yet. Add a license file before distributing or accepting outside contributions.
