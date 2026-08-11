import type { VercelRequest, VercelResponse } from "@vercel/node";
import server from "../src/server";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const protocol = (req.headers["x-forwarded-proto"] as string) || "https";
  const host = (req.headers["x-forwarded-host"] as string) || req.headers.host || "localhost";
  const url = `${protocol}://${host}${req.url || "/"}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }

  const body = ["GET", "HEAD"].includes(req.method || "")
    ? undefined
    : typeof req.body === "string"
      ? req.body
      : JSON.stringify(req.body);

  const webRequest = new Request(url, {
    method: req.method,
    headers,
    body,
  });

  try {
    const webResponse = await server.fetch(webRequest, {}, {});
    res.status(webResponse.status);
    webResponse.headers.forEach((val, key) => {
      res.setHeader(key, val);
    });
    const responseText = await webResponse.text();
    res.send(responseText);
  } catch (err) {
    console.error("Vercel SSR Handler Error:", err);
    res.status(500).send("Internal Server Error");
  }
}
