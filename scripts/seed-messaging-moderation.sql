-- ============================================================
-- Messages, Notifications, and Product Moderation
-- ============================================================

-- 1. Messages table (buyer→seller inquiries)
CREATE TABLE IF NOT EXISTS public.messages (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "productId"  TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  "storeId"    TEXT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  "fromUserId" TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  "fromName"   TEXT NOT NULL,
  "fromEmail"  TEXT,
  "fromPhone"  TEXT,
  content      TEXT NOT NULL,
  "isRead"     BOOLEAN NOT NULL DEFAULT false,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "messages_public_insert" ON public.messages;
CREATE POLICY "messages_public_insert" ON public.messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "messages_store_read" ON public.messages;
CREATE POLICY "messages_store_read" ON public.messages FOR SELECT USING (
  "storeId" IN (SELECT id FROM public.stores WHERE "userId" = auth.uid()::text)
  OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN')
);
DROP POLICY IF EXISTS "messages_store_update" ON public.messages;
CREATE POLICY "messages_store_update" ON public.messages FOR UPDATE USING (
  "storeId" IN (SELECT id FROM public.stores WHERE "userId" = auth.uid()::text)
  OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN')
);

-- 2. Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"    TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  link        TEXT,
  "isRead"    BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_own" ON public.notifications;
CREATE POLICY "notifications_own" ON public.notifications FOR ALL USING (
  "userId" = auth.uid()::text
  OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN')
);

-- 3. Add approvalStatus to products (ACTIVE for existing, new ones default PENDING)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS "approvalStatus" TEXT NOT NULL DEFAULT 'ACTIVE';

-- 4. Add isBanned to users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS "isBanned" BOOLEAN NOT NULL DEFAULT false;

-- 5. Performance indexes
CREATE INDEX IF NOT EXISTS idx_messages_storeid       ON public.messages("storeId");
CREATE INDEX IF NOT EXISTS idx_notifications_userid   ON public.notifications("userId");
CREATE INDEX IF NOT EXISTS idx_products_approvalstatus ON public.products("approvalStatus");

-- Verify
SELECT 'messages table: OK' WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='messages')
UNION ALL
SELECT 'notifications table: OK' WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='notifications')
UNION ALL
SELECT 'approvalStatus column: OK' WHERE EXISTS (
  SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='approvalStatus'
);
