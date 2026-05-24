-- Hero banners table: managed from admin panel
CREATE TABLE IF NOT EXISTS hero_banners (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title       TEXT NOT NULL,
  subtitle    TEXT,
  "ctaText"   TEXT DEFAULT 'Shop Now',
  "ctaLink"   TEXT DEFAULT '/browse',
  "imageUrl"  TEXT,
  "isActive"  BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS — only admins can write, anyone can read active banners
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hero_banners_public_read"
  ON hero_banners FOR SELECT
  USING ("isActive" = true);

CREATE POLICY "hero_banners_admin_all"
  ON hero_banners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role = 'ADMIN'
    )
  );

-- Seed one default banner so the homepage isn't blank
INSERT INTO hero_banners (id, title, subtitle, "ctaText", "ctaLink", "imageUrl", "isActive", "sortOrder")
VALUES (
  'banner-default-1',
  'Qatar''s #1 Auto Parts Marketplace',
  'Find genuine OEM and aftermarket parts for all car makes',
  'Browse Parts',
  '/browse',
  NULL,
  true,
  0
);
