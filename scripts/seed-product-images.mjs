/**
 * Generates product images using OpenAI dall-e-3 and uploads them to
 * Supabase Storage, then writes rows into the product_images table.
 *
 * Run:
 *   OPENAI_API_KEY=sk-proj-... node scripts/seed-product-images.mjs
 */

import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import https from "https";
import http from "http";

// ── Config ────────────────────────────────────────────────────────────────────
const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) { console.error("❌  Set OPENAI_API_KEY env var first."); process.exit(1); }

const SUPABASE_URL = "https://mqgequubhvrrgvkoipbg.supabase.co";
const SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZ2VxdXViaHZycmd2a29pcGJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTAzMjgxMiwiZXhwIjoyMDk0NjA4ODEyfQ.k08MziQYS3gECwOfFP_UCgZwRuffdv9Ogp3OhyRKLw0";
const BUCKET       = "product-images";

const openai = new OpenAI({ apiKey: OPENAI_KEY });
const sb     = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Visual style shared by all prompts ────────────────────────────────────────
const STYLE = `Professional product photography for an automotive marketplace.
Pure matte black background. Dramatic studio lighting with a warm orange-amber rim light from the side.
Sharp focus, photorealistic, cinematic quality. No text, no watermarks, no people, no logos.
Dark moody atmosphere, high contrast, 1:1 square crop.`;

// ── Product → image prompt map ────────────────────────────────────────────────
const PRODUCTS = [
  // ── Auto Parts ──────────────────────────────────────────────────────────────
  { id: "p4", prompt: `${STYLE} OZ Racing Ultraleggera 18-inch lightweight alloy wheel, silver multi-spoke design with machined finish, standing upright at a slight angle, dramatic orange rim lighting revealing spoke texture and center cap detail.` },
  { id: "p6", prompt: `${STYLE} Set of four Bosch spark plugs arranged in a row on a black surface. Iridium electrode tip visible. Chrome threads, insulator, and copper core. Orange side lighting highlighting the metallic surfaces.` },
  { id: "p8", prompt: `${STYLE} Castrol EDGE 5W-30 4-litre engine oil bottle. Premium dark metallic bottle with orange and black branding. Studio product shot. Dramatic orange rim lighting from the left creating reflections on the bottle surface.` },
  { id: "p1", prompt: `${STYLE} Garrett GT2554R turbocharger unit. Polished compressor housing, turbine wheel visible. Heavy-duty cast metal with inlet and outlet flanges. Dramatic orange rim light creating depth and metallic reflections.` },
  { id: "p5", prompt: `${STYLE} K&N high-performance air filter, round red cotton gauze filter in chrome end cap. Placed flat on black surface. Orange accent lighting illuminating the red filter material and chrome details.` },
  { id: "p7", prompt: `${STYLE} Denso 12V 150A alternator, silver-gray aluminum housing with black pulley and mounting brackets. Clean machined metal surfaces. Dramatic orange rim lighting highlighting the ribbed casing and terminal connections.` },
  { id: "p3", prompt: `${STYLE} Brembo front brake kit: large ventilated disc rotor with red 4-piston caliper clamped on it. The red caliper features the Brembo logo embossed on it. Placed on black surface, orange dramatic side lighting.` },
  { id: "p2", prompt: `${STYLE} BMW F30 LED headlight assembly. Crystal clear housing with complex LED projector inside showing blue-white LED matrix. DRL strip visible. Dramatic orange ambient glow. Ultra-detailed lens reflections.` },

  // ── Cars ────────────────────────────────────────────────────────────────────
  { id: "075eaad8-9ee9-4a91-a835-d82706384869", prompt: `${STYLE} 2021 Porsche 911 Carrera in silver, three-quarter front angle. Iconic round headlights, aerodynamic body, wide rear haunches. Black background, orange studio accent lighting on the car body, dramatic reflections on the paint.` },
  { id: "cd18d7bd-7266-4c1a-9779-1d2e8e0adfa7", prompt: `${STYLE} 2023 Tesla Model 3 in pearl white, three-quarter front angle. Minimalist aerodynamic design, frameless glass roof, flush door handles. Black background, orange studio rim lighting on the body panels, clean reflections.` },
  { id: "9dc06e4c-4aaf-431d-9d30-70eff45c8eba", prompt: `${STYLE} 2022 Tesla Model Y in midnight silver metallic, three-quarter front angle. Crossover SUV profile, panoramic roof, sleek lines. Black background, orange amber rim lighting from the right, dramatic paint reflections.` },
  { id: "51098962-690c-42bd-ae41-525e423fd2ac", prompt: `${STYLE} 2023 Mercedes-Benz S-Class in obsidian black, three-quarter front angle. Imposing long hood, panoramic roof, LED headlights. Luxury flagship sedan. Black background, orange golden rim lighting, deep glossy paint reflections.` },
  { id: "26b50e2d-9bdd-494c-8830-3c03099ff5d3", prompt: `${STYLE} 2022 BMW 7 Series in dark blue, three-quarter front angle. Wide kidney grille, large LED headlights, executive sedan profile. Black background, warm orange rim lighting on the body, metallic paint depth.` },
  { id: "4ee09ef8-8e22-43f7-b2a8-6f75504de998", prompt: `${STYLE} Classic 1969 Ford Mustang fastback in candy apple red, three-quarter front angle. Iconic long hood, short deck, chrome grille, racing stripes. Black background, dramatic warm orange lighting, deep gloss paint.` },
  { id: "e7eda8da-f220-45af-a60f-eb778173287e", prompt: `${STYLE} Classic 1972 Chevrolet Camaro SS in muscle car orange with black racing stripes, three-quarter front angle. Aggressive front end, wide stance, chrome bumper. Black background, orange dramatic lighting amplifying the classic muscle car aura.` },
  { id: "ad112401-4ca5-4c19-a98f-48aa068657a9", prompt: `${STYLE} 2022 Hyundai H-100 commercial minibus in white, three-quarter front angle. Passenger van profile. Black background, warm orange rim lighting from the side, clean reflective surfaces.` },
  { id: "4c2435bb-d9be-4801-9b57-f4fabae83d5a", prompt: `${STYLE} 2021 Mitsubishi Canter light commercial truck in white, three-quarter front angle. Flat-nose cab, cargo box in the back. Black background, warm orange studio lighting, clean commercial vehicle photography.` },
  { id: "e576e427-1073-41e7-bb70-bc47b20aa89e", prompt: `${STYLE} 2020 Nissan GT-R in gun metallic, three-quarter front angle. Aggressive aerodynamic body kit, iconic round taillights, wide body. Black background, orange-amber rim lighting on the body, dramatic supercar atmosphere.` },

  // ── Services ────────────────────────────────────────────────────────────────
  { id: "fc6749a6-40cd-4456-92b2-22cf6d0c45de", prompt: `${STYLE} Professional tow truck hook-up scene at night in Qatar. Close-up of a heavy-duty steel tow hook attached to a car bumper. Dark road background with orange warning lights glowing. Dramatic moody atmosphere.` },
  { id: "5d47614f-9a68-46a7-9907-05dcd14207ac", prompt: `${STYLE} Professional car mechanic tools arranged on a dark surface: wrench set, socket set, torque wrench, and diagnostic scanner. Orange accent lighting highlighting chrome metal tools. Top-down flat lay composition.` },
  { id: "1e387c5e-c346-4eac-8e16-9b0221eb48fe", prompt: `${STYLE} Mobile mechanic toolbox on wheels, red cabinet with drawers open showing organized tools. In a dark workshop background. Orange accent lighting highlighting the metallic tools and red cabinet surface.` },
  { id: "fc46bc0d-aed8-4d1a-a94c-549fec8e598d", prompt: `${STYLE} Car inspection checklist clipboard with a pen on top, next to a car's open engine bay. Dark moody workshop background. Orange rim lighting illuminating the clipboard and engine components.` },
  { id: "7ad99d8c-d707-4483-b9fa-55d4f9efe011", prompt: `${STYLE} Pre-purchase car inspection: mechanic's hands using an OBD diagnostic tool plugged into a car dashboard port. Dark car interior background. Orange ambient lighting. Professional and trustworthy atmosphere.` },
  { id: "66132f1e-7bfd-478e-9af0-7835ca80a495", prompt: `${STYLE} Premium car insurance document folder and a car key on a dark surface. Gold shield badge with a checkmark symbol. Orange accent lighting creating a premium financial services atmosphere.` },
  { id: "528f5d8b-430e-40cc-8402-d21e097398a2", prompt: `${STYLE} Car insurance quote form and pen on a dark desk. Small model car next to it. Clean professional composition. Orange warm accent lighting creating a business services atmosphere.` },
  { id: "c4ef2afb-084f-4412-8762-0779f38235a6", prompt: `${STYLE} Premium auto detailing: close-up of a black car hood being polished with a high-speed orbital buffer. Swirl marks disappearing into a deep gloss finish. Orange rim lighting reflecting off the paint. Professional detailing atmosphere.` },
  { id: "e9602c7f-b19c-4b93-8015-ec389c64f244", prompt: `${STYLE} Car detailing: interior cleaning close-up. Premium leather seat being cleaned with a microfiber cloth. Vacuum attachments and cleaning products on the car floor. Orange warm lighting creating a premium feel.` },
  { id: "6fe4a087-11f8-4a98-98f9-b98879b4e92e", prompt: `${STYLE} Express car wash: water cascading off a black luxury car in a professional car wash bay. High-pressure water jets visible. Dramatic lighting with orange reflections in the water droplets. Cinematic wet car photography.` },
  { id: "eec0ecaf-9fef-4622-9aea-2325df7406d3", prompt: `${STYLE} Full-service hand car wash: a black luxury SUV being hand-washed by professional washers with large sponges. Soap suds and water on the car surface. Orange ambient lighting in the wash bay. Professional and premium.` },
  { id: "fc6749a6-40cd-4456-92b2-22cf6d0c45de-2", prompt: `${STYLE} Full synthetic engine oil change: close-up of golden synthetic oil pouring from a can into a car engine. Dark workshop background. Orange rim light creating a warm glow through the oil stream. Dramatic automotive photography.` },
];

// ── Helper: download image URL → Buffer ───────────────────────────────────────
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

// ── Helper: generate UUID v4 ──────────────────────────────────────────────────
function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Carro Product Image Seeder");
  console.log(`📸 Generating images for ${PRODUCTS.length} products...\n`);

  // Get products that already have images so we can skip them
  const { data: existingImages } = await sb
    .from("product_images")
    .select("productId");
  const alreadyHaveImage = new Set((existingImages || []).map((r) => r.productId));
  console.log(`⏭️  ${alreadyHaveImage.size} products already have images, will skip them.\n`);

  let success = 0;
  let failed  = 0;

  for (let i = 0; i < PRODUCTS.length; i++) {
    const { id: productId, prompt } = PRODUCTS[i];

    // Skip duplicate entries (like fc6749a6...-2) - these are placeholder entries
    if (productId.endsWith("-2")) continue;

    if (alreadyHaveImage.has(productId)) {
      console.log(`[${i + 1}/${PRODUCTS.length}] ⏭️  Skipping ${productId} (already has image)`);
      continue;
    }

    console.log(`\n[${i + 1}/${PRODUCTS.length}] 🎨 Generating: ${productId}`);
    console.log(`   Prompt: ${prompt.slice(0, 90)}...`);

    try {
      // 1. Generate image via OpenAI (with retry on rate limit)
      let imageBuffer;
      let attempts = 0;
      while (attempts < 4) {
        attempts++;
        try {
          const response = await openai.images.generate({
            model:   "gpt-image-1",
            prompt,
            n:       1,
            size:    "1024x1024",
            quality: "low",
          });
          const data = response.data[0];
          if (data.b64_json) {
            imageBuffer = Buffer.from(data.b64_json, "base64");
          } else if (data.url) {
            imageBuffer = await fetchBuffer(data.url);
          }
          break; // success
        } catch (err) {
          const isRateLimit = err.status === 429 || err.message?.includes("429") || err.message?.includes("rate");
          if (isRateLimit && attempts < 4) {
            const waitSec = 15 * attempts;
            console.log(`   ⏳ Rate limited, waiting ${waitSec}s before retry ${attempts}/3...`);
            await new Promise((r) => setTimeout(r, waitSec * 1000));
          } else {
            throw err;
          }
        }
      }

      // 2. Upload to Supabase Storage
      const fileName = `products/${productId}-${Date.now()}.jpg`;
      const { error: uploadError } = await sb.storage
        .from(BUCKET)
        .upload(fileName, imageBuffer, {
          contentType: "image/jpeg",
          upsert:      true,
        });
      if (uploadError) throw new Error(`Upload error: ${uploadError.message}`);

      // 3. Get public URL
      const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      // 4. Insert into product_images table
      const { error: insertError } = await sb.from("product_images").upsert({
        id:        uuid(),
        productId,
        url:       publicUrl,
        isPrimary: true,
        sortOrder: 0,
      }, { onConflict: "productId,sortOrder" });
      if (insertError) {
        // Try plain insert if upsert fails due to missing unique constraint
        const { error: insertError2 } = await sb.from("product_images").insert({
          id:        uuid(),
          productId,
          url:       publicUrl,
          isPrimary: true,
          sortOrder: 0,
        });
        if (insertError2) throw new Error(`DB insert error: ${insertError2.message}`);
      }

      console.log(`   ✅ Done → ${publicUrl.slice(0, 80)}...`);
      success++;

    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}`);
      failed++;
    }

    // Rate limit: 8s between requests
    if (i < PRODUCTS.length - 1) {
      await new Promise((r) => setTimeout(r, 8000));
    }
  }

  console.log(`\n✅ Done! ${success} images generated, ${failed} failed.`);
}

main().catch(console.error);
