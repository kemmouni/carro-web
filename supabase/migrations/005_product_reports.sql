-- ============================================================
-- Migration 005 — Product Reports
-- Run this in: Supabase dashboard → SQL Editor
-- ============================================================

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
