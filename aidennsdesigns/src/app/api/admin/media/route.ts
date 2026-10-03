import sharp from "sharp";
import { isOwner, sameOrigin } from "@/lib/auth";
import { query } from "@/lib/db";
import { listMedia } from "@/lib/data";

export const runtime = "nodejs";
const MAX_BYTES = 4 * 1024 * 1024; // Vercel functions cap request bodies at 4.5 MB.
const ALLOWED = new Set(["jpeg", "png", "webp"]);
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  if (!(await isOwner())) return json({ error: "Unauthorized" }, 401);
  return json({ items: await listMedia() });
}

export async function POST(req: Request) {
  if (!(await isOwner())) return json({ error: "Unauthorized" }, 401);
  if (!(await sameOrigin())) return json({ error: "Cross-site request blocked." }, 403);
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "Upload could not be read. Files must be under 4 MB." }, 400);
  }
  const file = form.get("file");
  if (!(file instanceof File) || !file.size) return json({ error: "Choose an image file." }, 400);
  if (file.size > MAX_BYTES) return json({ error: "That file is over 4 MB. Export a smaller version and try again." }, 413);
  const alt = String(form.get("alt") ?? "").trim().slice(0, 250);
  try {
    const input = Buffer.from(await file.arrayBuffer());
    const meta = await sharp(input, { limitInputPixels: 40_000_000 }).metadata();
    if (!meta.format || !ALLOWED.has(meta.format)) return json({ error: "Only JPEG, PNG or WebP images are allowed." }, 415);
    // Re-encode: strips metadata, applies orientation, caps size, and guarantees the stored bytes are a plain image.
    const { data, info } = await sharp(input, { limitInputPixels: 40_000_000 })
      .rotate().resize({ width: 2400, withoutEnlargement: true }).webp({ quality: 84 }).toBuffer({ resolveWithObject: true });
    const rows = await query<{ id: string }>(
      `insert into media (data, mime, width, height, bytes, filename, alt) values ($1,'image/webp',$2,$3,$4,$5,$6) returning id`,
      [data, info.width, info.height, data.length, file.name.replace(/[^\w.\- ]/g, "").slice(0, 120), alt],
    );
    return json({ item: { id: rows[0].id, filename: file.name, alt, width: info.width, height: info.height, bytes: data.length } });
  } catch {
    return json({ error: "That file couldn’t be processed as an image." }, 415);
  }
}
