import { mkdir, readFile, writeFile } from "node:fs/promises";

const [shell, styles, hosting] = await Promise.all([
  readFile("standalone/shell.html", "utf8"),
  readFile("app/styles.css", "utf8"),
  readFile(".openai/hosting.json", "utf8")
]);

const html = shell.replace("/*__STYLES__*/", styles);
const worker = `const htmlTemplate = ${JSON.stringify(html)};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/" && url.pathname !== "/index.html") {
      return new Response("Not found", { status: 404 });
    }
    const html = htmlTemplate
      .replaceAll("__SUPABASE_URL__", env.SUPABASE_URL || "")
      .replaceAll("__SUPABASE_PUBLISHABLE_KEY__", env.SUPABASE_PUBLISHABLE_KEY || "");
    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=UTF-8",
        "cache-control": "no-cache"
      }
    });
  }
};
`;

await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
await writeFile("dist/server/index.js", worker);
await writeFile("dist/.openai/hosting.json", hosting);
