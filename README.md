# Fall Focus

A warm, seasonal task tracker for planning and completing meaningful work during fall.

## Features

- Add tasks with categories, priorities, and due dates
- Mark tasks complete or remove them
- Filter by status and category
- Search tasks by name
- Track seasonal progress automatically
- Save tasks in the browser with local storage
- Sync personal tasks securely across devices with Supabase Auth
- Create shared workspaces and join them with invite codes
- Responsive layout for desktop and mobile

## Live app

[Open Fall Focus](https://fall-focus-tracker.chrisnciss.chatgpt.site)

The hosted app is currently private and requires access through the authorized OpenAI account.

## Run locally

Requirements:

- Node.js 20 or newer
- npm

Install the dependencies and build the production worker:

```bash
npm install
npm run build
```

The generated deployment files are written to `dist/`.

For local interface development with Next.js:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Save changes to GitHub

```bash
git add .
git commit -m "Describe your changes"
git push
```

Pushing to GitHub saves the source and its history, but it does not automatically update the hosted app. The latest commit must also be saved and deployed through OpenAI Sites.

## Data storage

Signed-in tasks are stored in Supabase and protected with row-level security. Personal lists are private to each account; shared workspace tasks are available only to workspace members. Tasks created before sign-in are migrated from browser storage on the first signed-in device.
