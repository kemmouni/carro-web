-- ============================================================
-- Carro — Pending Migrations (004 + 005)
-- Go to: Supabase Dashboard → SQL Editor → paste and run
-- ============================================================

-- ── Offers ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS offers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId"     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  "storeId"       UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  "buyerId"       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "buyerName"     TEXT NOT NULL,
  "buyerPhone"    TEXT NOT NULL,
  "proposedPrice" NUMERIC(12,2) NOT NULL,
  "counterPrice"  NUMERIC(12,2),
  message         TEXT,
  status          TEXT NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','ACCEPTED','DECLINED','COUNTERED')),
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS offers_store_idx   ON offers("storeId");
CREATE INDEX IF NOT EXISTS offers_buyer_idx   ON offers("buyerId");
CREATE INDEX IF NOT EXISTS offers_product_idx ON offers("productId");

-- ── Service Bookings ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId"     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  "storeId"       UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  "customerId"    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  "customerName"  TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  "bookingDate"   DATE NOT NULL,
  "bookingTime"   TEXT NOT NULL,
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','CONFIRMED','CANCELLED','COMPLETED')),
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS bookings_store_idx   ON bookings("storeId");
CREATE INDEX IF NOT EXISTS bookings_product_idx ON bookings("productId");

-- ── Subscription Plans ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscription_plans (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  price             NUMERIC(10,2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'QAR',
  interval          TEXT NOT NULL DEFAULT 'monthly' CHECK (interval IN ('monthly','yearly')),
  "featuredSlots"   INT NOT NULL DEFAULT 0,
  "maxListings"     INT NOT NULL DEFAULT 10,
  "analyticsAccess" BOOLEAN NOT NULL DEFAULT false,
  "prioritySupport" BOOLEAN NOT NULL DEFAULT false,
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO subscription_plans (name, slug, price, "featuredSlots", "maxListings", "analyticsAccess", "prioritySupport")
VALUES
  ('Starter',  'starter',   0,   0,  10,  false, false),
  ('Pro',      'pro',      149,  5,  50,  true,  false),
  ('Business', 'business', 399, 20, 200,  true,  true)
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS subscriptions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "storeId"            UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  "planId"             UUID NOT NULL REFERENCES subscription_plans(id),
  status               TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','CANCELLED','EXPIRED')),
  "currentPeriodStart" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "currentPeriodEnd"   TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  "createdAt"          TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("storeId")
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ── Referrals ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referral_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  code        TEXT NOT NULL UNIQUE,
  uses        INT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referrals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "referrerId"  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "referredId"  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  code          TEXT NOT NULL,
  "rewardGiven" BOOLEAN NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- ── Product Reports ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId"  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  "reporterId" UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason       TEXT NOT NULL
                 CHECK (reason IN ('fake_listing','prohibited_item','wrong_price','duplicate','spam','other')),
  details      TEXT,
  status       TEXT NOT NULL DEFAULT 'PENDING'
                 CHECK (status IN ('PENDING','REVIEWED','DISMISSED','ACTIONED')),
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_reports_product ON product_reports ("productId");
CREATE INDEX IF NOT EXISTS idx_product_reports_status  ON product_reports (status);
