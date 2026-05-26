/**
 * Auto-generates images for all products missing a photo.
 * Builds prompts dynamically from product title + type.
 * Run: OPENAI_API_KEY=sk-... node scripts/seed-remaining-images.mjs
 */

import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import https from "https";
import http from "http";

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) { console.error("❌  Set OPENAI_API_KEY"); process.exit(1); }

const SUPABASE_URL = "https://mqgequubhvrrgvkoipbg.supabase.co";
const SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZ2VxdXViaHZycmd2a29pcGJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTAzMjgxMiwiZXhwIjoyMDk0NjA4ODEyfQ.k08MziQYS3gECwOfFP_UCgZwRuffdv9Ogp3OhyRKLw0";
const BUCKET = "product-images";

const openai = new OpenAI({ apiKey: OPENAI_KEY });
const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const STYLE = `Professional photography for an automotive marketplace. Pure matte black background. Dramatic studio lighting with a warm orange-amber rim light from the side. Sharp focus, photorealistic, cinematic quality. No text, no watermarks, no people, no logos. Dark moody atmosphere.`;

function buildPrompt(product) {
  const { title, listingType, brand, carMake, carModel, condition } = product;
  const cond = condition === "LIKE_NEW" ? "like-new" : condition?.toLowerCase() ?? "new";

  if (listingType === "CAR") {
    const year = title.match(/\d{4}/)?.[0] ?? "";
    const color = ["white", "black", "silver", "dark blue", "pearl grey", "gunmetal"][Math.floor(Math.random() * 6)];
    return `${STYLE} ${year} ${carMake} ${carModel} in ${color}, three-quarter front angle, ${cond} condition. Clean exterior, polished paint, dramatic orange amber rim lighting. Black background, cinematic car photography.`;
  }

  if (listingType === "SERVICE") {
    const servicePrompts = {
      "tires":      `${STYLE} Set of four premium car tires stacked on each other on black surface. Dramatic orange rim lighting showing tread pattern and sidewall texture.`,
      "body-shop":  `${STYLE} Auto body repair work on a car panel, professional bodywork tools and spray gun. Dark workshop background with orange accent lighting.`,
      "paint":      `${STYLE} Professional car spray painting, glossy metallic paint being applied to a car panel with an airbrush gun. Orange lighting creating dramatic paint reflections.`,
      "ac-repair":  `${STYLE} Car AC system components: compressor, condenser and refrigerant gauges on a black surface. Orange side lighting highlighting the metallic parts.`,
      "battery":    `${STYLE} New premium car battery, black case with red and black terminals. On a black surface with orange accent lighting. Product photography.`,
      "tow":        `${STYLE} Heavy-duty tow truck hook and chain, professional steel equipment on dark background. Orange warning lights in background. Dramatic moody atmosphere.`,
      "alignment":  `${STYLE} Wheel alignment machine attached to a car wheel in a dark workshop. Orange accent lighting showing the precision alignment equipment.`,
      "oil-change": `${STYLE} Fresh synthetic engine oil pouring from a bottle into a funnel into a car engine. Golden oil stream in dramatic orange lighting. Dark workshop background.`,
      "rental":     `${STYLE} Car rental keys with a key fob on a black surface. Clean modern keys with orange accent lighting. Premium automotive service photography.`,
      "transport":  `${STYLE} Car transport truck carrying multiple vehicles on a highway at dusk. Orange sky in the background. Dramatic cinematic wide angle.`,
      "tinting":    `${STYLE} Professional window tinting being applied to a car side window. Tinted film being smoothed out. Dark background, orange accent lighting.`,
      "roadside":   `${STYLE} Roadside assistance kit: reflective triangle, jumper cables, and emergency tools on black surface. Orange accent lighting. Safety and reliability atmosphere.`,
      "glass":      `${STYLE} Car windshield repair with resin injection tool being used on a cracked windshield. Close-up detail. Orange ambient lighting. Professional auto glass service.`,
      "mechanic":   `${STYLE} Professional automotive diagnostic scanner connected to car OBD port. Digital display visible. Dark workshop background. Orange accent lighting.`,
      "insurance":  `${STYLE} Car insurance policy document, pen, and model car on a dark desk. Golden accent lighting. Professional and trustworthy financial service atmosphere.`,
      "detailing":  `${STYLE} Car detailing: orbital buffer polishing a black car hood to a deep mirror shine. Orange rim lighting reflecting off the glossy paint. Cinematic detail photography.`,
      "car-wash":   `${STYLE} Professional car wash water cascade over a black luxury car. Water droplets and foam. Orange reflections in the water. Cinematic wet car photography.`,
    };
    const brandKey = brand?.toLowerCase() ?? "";
    return servicePrompts[brandKey] ?? `${STYLE} ${title} automotive service. Professional setup in a dark workshop. Tools and equipment visible. Orange accent lighting creating a professional atmosphere.`;
  }

  // PART
  return `${STYLE} ${title} auto part by ${brand ?? ""}. ${carMake ?? ""} ${carModel ?? ""} compatible. ${cond} condition. Professional product photography on black surface. Dramatic orange rim lighting revealing part details and materials.`;
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    lib.get(url, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

async function generateAndUpload(product, index, total) {
  const prompt = buildPrompt(product);
  console.log(`\n[${index + 1}/${total}] 🎨 ${product.title}`);

  let imageBuffer;
  let attempts = 0;
  while (attempts < 4) {
    attempts++;
    try {
      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "low",
      });
      const data = response.data[0];
      imageBuffer = data.b64_json
        ? Buffer.from(data.b64_json, "base64")
        : await fetchBuffer(data.url);
      break;
    } catch (err) {
      const isRateLimit = err.status === 429 || String(err.message).includes("rate") || String(err.message).includes("429");
      if (isRateLimit && attempts < 4) {
        const wait = 20 * attempts;
        console.log(`   ⏳ Rate limit, retrying in ${wait}s...`);
        await new Promise(r => setTimeout(r, wait * 1000));
      } else {
        throw err;
      }
    }
  }

  const fileName = `products/${product.id}-${Date.now()}.jpg`;
  const { error: uploadErr } = await sb.storage.from(BUCKET).upload(fileName, imageBuffer, { contentType: "image/jpeg", upsert: true });
  if (uploadErr) throw new Error(`Upload: ${uploadErr.message}`);

  const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(fileName);
  const { error: dbErr } = await sb.from("product_images").insert({
    id: uuid(), productId: product.id, url: urlData.publicUrl, isPrimary: true, sortOrder: 0,
  });
  if (dbErr && !dbErr.message.includes("duplicate")) throw new Error(`DB: ${dbErr.message}`);

  console.log(`   ✅ ${urlData.publicUrl.slice(0, 80)}...`);
}

async function main() {
  // Get all products without images
  const { data: images } = await sb.from("product_images").select("productId");
  const withImages = new Set((images || []).map(r => r.productId));

  const { data: products } = await sb.from("products")
    .select("id, title, listingType, brand, carMake, carModel, condition");

  const missing = products.filter(p => !withImages.has(p.id));
  console.log(`🚀 Generating images for ${missing.length} products...\n`);

  let success = 0, failed = 0;

  for (let i = 0; i < missing.length; i++) {
    try {
      await generateAndUpload(missing[i], i, missing.length);
      success++;
    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}`);
      failed++;
    }
    if (i < missing.length - 1) await new Promise(r => setTimeout(r, 8000));
  }

  console.log(`\n✅ Done! ${success} generated, ${failed} failed.`);
}

main().catch(console.error);
