/**
 * Generates all Carro marketplace images using OpenAI gpt-image-1
 * Run: node scripts/generate-images.mjs
 */

import OpenAI from "openai";
import fs from "fs";
import path from "path";
import https from "https";

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) { console.error("Set OPENAI_API_KEY env var first."); process.exit(1); }
const client = new OpenAI({ apiKey: API_KEY });

const STYLE = `Professional automotive product photography. Isolated on a pure black background.
Dramatic studio lighting with a subtle warm orange rim light from the side.
Sharp focus, photorealistic, ultra-detailed, cinematic quality.
Dark moody atmosphere. Shot on professional camera.
No text, no watermarks, no people.`;

const IMAGES = [
  // ── Hero banners ──────────────────────────────────────────────
  {
    file: "public/images/hero-parts.jpg",
    size: "1536x1024",
    prompt: `${STYLE} Multiple premium auto parts arrangement: a high-performance turbocharged V8 engine, red Brembo brake caliper with disc, LED headlight assembly, and shock absorber. Arranged dramatically on a pure black surface. Orange accent lighting. Wide cinematic composition.`,
  },
  {
    file: "public/images/hero-sell.jpg",
    size: "1536x1024",
    prompt: `${STYLE} Wide shot of a professional auto parts warehouse interior. Dark industrial setting. Rows of metal shelving stacked with neatly organized auto parts boxes. Orange accent lighting on the shelves. Dramatic perspective. No people. Cinematic wide angle.`,
  },
  {
    file: "public/images/hero-brakes.jpg",
    size: "1536x1024",
    prompt: `${STYLE} Red high-performance Brembo brake kit: large ventilated disc brake and red 6-piston caliper. On pure black background. Dramatic orange rim lighting from the left. Sharp detailed product shot. Wide format.`,
  },

  // ── Category images ───────────────────────────────────────────
  {
    file: "public/images/categories/engine.jpg",
    size: "1024x1024",
    prompt: `${STYLE} High-performance V8 engine block, polished aluminum, chrome valve covers, on a pure matte black surface. Dramatic side lighting with orange accent glow. Extreme detail on metal textures and machined surfaces.`,
  },
  {
    file: "public/images/categories/brakes.jpg",
    size: "1024x1024",
    prompt: `${STYLE} Red performance brake caliper clamping a large ventilated disc rotor. Placed on a black reflective surface. Orange dramatic rim lighting from the side. Extreme close-up showing machined metal detail, cooling fins, and brake pad.`,
  },
  {
    file: "public/images/categories/suspension.jpg",
    size: "1024x1024",
    prompt: `${STYLE} Set of two premium KYB shock absorbers / coilover suspension units. Standing upright on a black surface. Orange accent lighting highlighting the chrome shafts and yellow springs. Sharp product photography.`,
  },
  {
    file: "public/images/categories/electrical.jpg",
    size: "1024x1024",
    prompt: `${STYLE} High-performance LED headlight assembly unit for luxury car. Crystal-clear housing with complex LED matrix inside. On black background with electric blue and orange accent lighting. Ultra-detailed reflections on the lens.`,
  },
  {
    file: "public/images/categories/ac.jpg",
    size: "1024x1024",
    prompt: `${STYLE} OEM car AC compressor unit, silver aluminum housing with magnetic clutch. On pure black background. Orange side lighting revealing the machined aluminum texture. Professional product photography.`,
  },
  {
    file: "public/images/categories/filters.jpg",
    size: "1024x1024",
    prompt: `${STYLE} Premium oil filter and K&N performance air filter together on black surface. Orange side lighting. The oil filter shows metallic finish, the air filter shows red cotton filter material. Dramatic product shot.`,
  },
  {
    file: "public/images/categories/body.jpg",
    size: "1024x1024",
    prompt: `${STYLE} Front bumper and hood of a black luxury sports car, partial view showing aggressive aerodynamic design. On black background with dramatic orange studio lighting from the side. Deep gloss paint reflections.`,
  },
  {
    file: "public/images/categories/interior.jpg",
    size: "1024x1024",
    prompt: `${STYLE} Premium leather steering wheel with carbon fiber trim, isolated on pure black background. Orange accent lighting highlighting the stitching and material texture. Close-up product photography.`,
  },
  {
    file: "public/images/categories/wheels.jpg",
    size: "1024x1024",
    prompt: `${STYLE} Single black multi-spoke alloy wheel with low-profile performance tire mounted. Tilted at 45 degrees on black surface. Orange rim lighting highlighting the machined spokes. Dramatic shadow below.`,
  },
  {
    file: "public/images/categories/exhaust.jpg",
    size: "1024x1024",
    prompt: `${STYLE} Stainless steel performance exhaust system, mandrel bent pipes with polished tips. On pure black background with warm orange lighting. Shows chrome reflections and brushed metal texture.`,
  },
];

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (res) => {
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function generateImage(item, index, total) {
  const dir = path.dirname(item.file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  console.log(`\n[${index + 1}/${total}] Generating: ${item.file}`);
  console.log(`  Prompt: ${item.prompt.slice(0, 80)}...`);

  try {
    const response = await client.images.generate({
      model:   "gpt-image-1",
      prompt:  item.prompt,
      n:       1,
      size:    item.size,
      quality: "high",
    });

    const imageData = response.data[0];

    if (imageData.b64_json) {
      // gpt-image-1 returns base64
      const buffer = Buffer.from(imageData.b64_json, "base64");
      fs.writeFileSync(item.file, buffer);
      console.log(`  ✅ Saved (base64) → ${item.file}`);
    } else if (imageData.url) {
      // dall-e-3 returns URL
      await downloadImage(imageData.url, item.file);
      console.log(`  ✅ Downloaded → ${item.file}`);
    } else {
      throw new Error("No image data in response");
    }
  } catch (err) {
    // Fallback to dall-e-3 if gpt-image-1 not available
    if (err.message?.includes("model") || err.status === 404) {
      console.log(`  ⚠️  gpt-image-1 not available, trying dall-e-3...`);
      try {
        const response = await client.images.generate({
          model:   "dall-e-3",
          prompt:  item.prompt,
          n:       1,
          size:    item.size === "800x600" ? "1024x1024" : "1792x1024",
          quality: "hd",
          style:   "vivid",
        });
        const url = response.data[0].url;
        await downloadImage(url, item.file);
        console.log(`  ✅ Downloaded (dall-e-3) → ${item.file}`);
      } catch (err2) {
        console.error(`  ❌ Failed: ${err2.message}`);
      }
    } else {
      console.error(`  ❌ Failed: ${err.message}`);
    }
  }

  // Rate limit: wait 2s between requests
  await new Promise((r) => setTimeout(r, 2000));
}

async function main() {
  console.log("🚀 Carro Image Generator — OpenAI gpt-image-1");
  console.log(`📸 Generating ${IMAGES.length} images...\n`);

  for (let i = 0; i < IMAGES.length; i++) {
    await generateImage(IMAGES[i], i, IMAGES.length);
  }

  console.log("\n✅ All done! Images saved to public/images/");
  console.log("\nNext: Update your code to use these local paths.");
}

main().catch(console.error);
