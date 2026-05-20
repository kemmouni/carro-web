-- ============================================================
-- Carro — Row Level Security Policies
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ── Enable RLS on all tables ──────────────────────────────
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores         ENABLE ROW LEVEL SECURITY;
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews        ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists      ENABLE ROW LEVEL SECURITY;

-- ── Drop existing policies (safe re-run) ─────────────────
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────────────
-- Anyone authenticated can read their own profile
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Service role (backend) can do everything — handled by supabaseAdmin (bypasses RLS)

-- ─────────────────────────────────────────────────────────
-- STORES
-- ─────────────────────────────────────────────────────────
-- Anyone can read all stores (public marketplace)
CREATE POLICY "stores_select_public"
  ON stores FOR SELECT
  USING (true);

-- Only store owner can update their store
CREATE POLICY "stores_update_own"
  ON stores FOR UPDATE
  USING (auth.uid() = "userId");

-- ─────────────────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────────────────
-- Everyone can read categories
CREATE POLICY "categories_select_public"
  ON categories FOR SELECT
  USING (true);

-- ─────────────────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────────────────
-- Anyone can read active products
CREATE POLICY "products_select_active"
  ON products FOR SELECT
  USING (
    "isActive" = true
    OR EXISTS (
      SELECT 1 FROM stores s WHERE s.id = products."storeId" AND s."userId" = auth.uid()
    )
  );

-- Only the store owner can insert products
CREATE POLICY "products_insert_own_store"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores s WHERE s.id = "storeId" AND s."userId" = auth.uid()
    )
  );

-- Only the store owner can update their products
CREATE POLICY "products_update_own_store"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stores s WHERE s.id = products."storeId" AND s."userId" = auth.uid()
    )
  );

-- Only the store owner can delete their products
CREATE POLICY "products_delete_own_store"
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM stores s WHERE s.id = products."storeId" AND s."userId" = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────
-- PRODUCT IMAGES
-- ─────────────────────────────────────────────────────────
-- Anyone can read images of active products
CREATE POLICY "product_images_select_public"
  ON product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products p WHERE p.id = product_images."productId" AND (
        p."isActive" = true
        OR EXISTS (SELECT 1 FROM stores s WHERE s.id = p."storeId" AND s."userId" = auth.uid())
      )
    )
  );

-- Store owner can insert images for their products
CREATE POLICY "product_images_insert_own"
  ON product_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p."storeId"
      WHERE p.id = "productId" AND s."userId" = auth.uid()
    )
  );

-- Store owner can delete their product images
CREATE POLICY "product_images_delete_own"
  ON product_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p."storeId"
      WHERE p.id = product_images."productId" AND s."userId" = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────────────────────
-- Anyone can read reviews
CREATE POLICY "reviews_select_public"
  ON reviews FOR SELECT
  USING (true);

-- Authenticated buyers can leave one review per store
CREATE POLICY "reviews_insert_authenticated"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = "userId"
    AND auth.uid() IS NOT NULL
  );

-- Users can update their own review
CREATE POLICY "reviews_update_own"
  ON reviews FOR UPDATE
  USING (auth.uid() = "userId");

-- Users can delete their own review
CREATE POLICY "reviews_delete_own"
  ON reviews FOR DELETE
  USING (auth.uid() = "userId");

-- ─────────────────────────────────────────────────────────
-- WISHLISTS
-- ─────────────────────────────────────────────────────────
-- Users can only see their own wishlist
CREATE POLICY "wishlists_select_own"
  ON wishlists FOR SELECT
  USING (auth.uid() = "userId");

-- Users can add to their own wishlist
CREATE POLICY "wishlists_insert_own"
  ON wishlists FOR INSERT
  WITH CHECK (auth.uid() = "userId");

-- Users can remove from their own wishlist
CREATE POLICY "wishlists_delete_own"
  ON wishlists FOR DELETE
  USING (auth.uid() = "userId");

-- ─────────────────────────────────────────────────────────
-- STORAGE: product-images bucket
-- Run in Storage → Policies in Supabase dashboard
-- Or via SQL:
-- ─────────────────────────────────────────────────────────
-- Allow public read of product-images bucket
-- INSERT INTO storage.policies (name, bucket_id, operation, definition)
-- VALUES ('public_read', 'product-images', 'SELECT', 'true');

-- NOTE: Our backend uses supabaseAdmin (service role key) which bypasses
-- RLS entirely. RLS protects direct client-side access (anon/authenticated keys).
-- This means the API routes will still work — RLS only gates browser-direct calls.
