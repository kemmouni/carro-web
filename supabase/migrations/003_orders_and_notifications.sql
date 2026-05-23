-- ── Orders table ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "buyerId"        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "storeId"        UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  status           TEXT NOT NULL DEFAULT 'PENDING'
                     CHECK (status IN ('PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED')),
  total            NUMERIC(10,2) NOT NULL,
  currency         TEXT NOT NULL DEFAULT 'QAR',
  "paymentMethod"  TEXT NOT NULL DEFAULT 'COD',
  "buyerName"      TEXT NOT NULL,
  "buyerPhone"     TEXT NOT NULL,
  "deliveryAddress" TEXT NOT NULL,
  notes            TEXT,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_store ON orders("storeId");
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders("buyerId");

-- ── Order items ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderId"   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  "productId" UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INT NOT NULL DEFAULT 1,
  price       NUMERIC(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items("orderId");

-- ── Notifications table (if not already created) ──────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'info',
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  link        TEXT,
  "isRead"    BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications("userId");

-- ── RLS: allow service role full access (used by supabaseAdmin) ──────────────
ALTER TABLE orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications   ENABLE ROW LEVEL SECURITY;

-- service_role bypasses RLS automatically in Supabase
-- For anon/authenticated reads you'd add policies, but we use service role only
