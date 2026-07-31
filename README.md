# Fall Focus

A warm, seasonal task tracker for planning and completing meaningful work during fall.

## Features

- Add tasks with categories, priorities, and due dates
- Mark tasks complete or remove them
- Filter by status and category
- Search tasks by name
- Track seasonal progress automatically
- Save tasks in the browser with local storage
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

Tasks are stored in the browser's local storage. They remain on the same browser and device, but they are not synchronized between devices or accounts.
