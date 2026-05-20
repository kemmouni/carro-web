-- ============================================================
-- Carro: Brands table + seed all brands & categories
-- Run in Supabase SQL Editor
-- ============================================================

-- ── 1. Create brands table ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.brands (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  "logoUrl"   TEXT,
  country     TEXT,
  "isPopular" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 999,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "brands_public_read" ON public.brands;
CREATE POLICY "brands_public_read" ON public.brands
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "brands_admin_all" ON public.brands;
CREATE POLICY "brands_admin_all" ON public.brands
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- ── 2. Add sortOrder to categories if missing ─────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='categories' AND column_name='sortOrder'
  ) THEN
    ALTER TABLE public.categories ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 999;
  END IF;
END $$;

-- ── 3. Upsert all Parts Categories ───────────────────────
INSERT INTO public.categories (id, name, slug, description, "sortOrder")
VALUES
  (gen_random_uuid()::text, 'Engine & Engine Parts',    'engine',           'Complete engines, engine blocks, cylinder heads, pistons, camshafts, crankshafts, and all internal engine components', 1),
  (gen_random_uuid()::text, 'Brakes & Brake System',    'brakes',           'Brake pads, discs, calipers, brake lines, master cylinders, ABS components, and complete brake kits', 2),
  (gen_random_uuid()::text, 'Suspension & Steering',    'suspension',       'Shock absorbers, struts, coilovers, control arms, ball joints, tie rods, rack and pinion, and steering components', 3),
  (gen_random_uuid()::text, 'Electrical & Lighting',    'electrical',       'Alternators, starters, sensors, fuses, relays, wiring harnesses, headlights, tail lights, and all electrical components', 4),
  (gen_random_uuid()::text, 'Air Conditioning & Heating','ac-heating',      'AC compressors, condensers, evaporators, heater cores, blower motors, refrigerant, and climate control parts', 5),
  (gen_random_uuid()::text, 'Filters & Fluids',         'filters-fluids',   'Oil filters, air filters, fuel filters, cabin filters, engine oil, transmission fluid, coolant, and brake fluid', 6),
  (gen_random_uuid()::text, 'Body & Exterior',          'body-exterior',    'Bumpers, fenders, hoods, doors, mirrors, grilles, spoilers, body kits, and all exterior body panels', 7),
  (gen_random_uuid()::text, 'Interior & Accessories',   'interior',         'Seats, dashboards, door panels, carpets, steering wheels, floor mats, and all interior trim pieces', 8),
  (gen_random_uuid()::text, 'Wheels & Tires',           'wheels-tires',     'Alloy wheels, steel rims, performance tires, all-terrain tires, wheel covers, and tire accessories', 9),
  (gen_random_uuid()::text, 'Exhaust System',           'exhaust',          'Exhaust manifolds, catalytic converters, mufflers, performance exhausts, downpipes, and exhaust tips', 10),
  (gen_random_uuid()::text, 'Transmission & Drivetrain','transmission',     'Automatic and manual transmissions, clutches, differentials, driveshafts, CV joints, and transfer cases', 11),
  (gen_random_uuid()::text, 'Fuel System',              'fuel-system',      'Fuel pumps, fuel injectors, carburetors, fuel tanks, fuel lines, pressure regulators, and fuel sensors', 12),
  (gen_random_uuid()::text, 'Cooling System',           'cooling',          'Radiators, water pumps, thermostats, cooling fans, coolant hoses, overflow tanks, and intercoolers', 13),
  (gen_random_uuid()::text, 'Batteries & Charging',     'batteries',        'Car batteries, battery chargers, jump starters, alternators, voltage regulators, and battery accessories', 14),
  (gen_random_uuid()::text, 'Audio & Electronics',      'audio',            'Car stereos, speakers, amplifiers, subwoofers, GPS navigation, dash cameras, and multimedia systems', 15),
  (gen_random_uuid()::text, 'Safety & Security',        'safety',           'Airbags, seatbelts, car alarms, immobilizers, parking sensors, reversing cameras, and safety systems', 16),
  (gen_random_uuid()::text, 'Turbo & Supercharger',     'turbo',            'Turbochargers, superchargers, intercoolers, blow-off valves, wastegates, and forced induction parts', 17),
  (gen_random_uuid()::text, 'Performance Parts',        'performance',      'Cold air intakes, performance chips, sport exhausts, upgraded brakes, suspension kits, and tuning parts', 18),
  (gen_random_uuid()::text, 'Gaskets & Seals',          'gaskets',          'Head gaskets, valve cover gaskets, oil seals, O-rings, intake manifold gaskets, and complete gasket sets', 19),
  (gen_random_uuid()::text, 'Tools & Equipment',        'tools',            'Workshop tools, OBD scanners, tire inflators, jacks, lifts, torque wrenches, and garage equipment', 20)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      "sortOrder" = EXCLUDED."sortOrder";

-- ── 4. Upsert all Car Brands ──────────────────────────────
INSERT INTO public.brands (id, name, slug, country, "isPopular", "sortOrder")
VALUES
  -- ★ Most Popular in Qatar/GCC
  (gen_random_uuid()::text, 'Toyota',          'toyota',         'Japan',       true,  1),
  (gen_random_uuid()::text, 'Nissan',          'nissan',         'Japan',       true,  2),
  (gen_random_uuid()::text, 'Mitsubishi',      'mitsubishi',     'Japan',       true,  3),
  (gen_random_uuid()::text, 'KIA',             'kia',            'South Korea', true,  4),
  (gen_random_uuid()::text, 'Hyundai',         'hyundai',        'South Korea', true,  5),
  (gen_random_uuid()::text, 'BMW',             'bmw',            'Germany',     true,  6),
  (gen_random_uuid()::text, 'Mercedes-Benz',   'mercedes-benz',  'Germany',     true,  7),
  (gen_random_uuid()::text, 'Lexus',           'lexus',          'Japan',       true,  8),
  (gen_random_uuid()::text, 'Honda',           'honda',          'Japan',       true,  9),
  (gen_random_uuid()::text, 'Ford',            'ford',           'USA',         true,  10),
  (gen_random_uuid()::text, 'Audi',            'audi',           'Germany',     true,  11),
  (gen_random_uuid()::text, 'Chevrolet',       'chevrolet',      'USA',         true,  12),
  (gen_random_uuid()::text, 'GMC',             'gmc',            'USA',         true,  13),
  (gen_random_uuid()::text, 'Land Rover',      'land-rover',     'UK',          true,  14),
  (gen_random_uuid()::text, 'Porsche',         'porsche',        'Germany',     true,  15),
  (gen_random_uuid()::text, 'Volkswagen',      'volkswagen',     'Germany',     true,  16),
  (gen_random_uuid()::text, 'MG',              'mg',             'China',       true,  17),
  (gen_random_uuid()::text, 'Infiniti',        'infiniti',       'Japan',       true,  18),
  (gen_random_uuid()::text, 'Dodge',           'dodge',          'USA',         true,  19),
  (gen_random_uuid()::text, 'Jeep',            'jeep',           'USA',         true,  20),

  -- Japanese
  (gen_random_uuid()::text, 'Mazda',           'mazda',          'Japan',       false, 21),
  (gen_random_uuid()::text, 'Subaru',          'subaru',         'Japan',       false, 22),
  (gen_random_uuid()::text, 'Suzuki',          'suzuki',         'Japan',       false, 23),
  (gen_random_uuid()::text, 'Isuzu',           'isuzu',          'Japan',       false, 24),
  (gen_random_uuid()::text, 'Daihatsu',        'daihatsu',       'Japan',       false, 25),
  (gen_random_uuid()::text, 'Acura',           'acura',          'Japan',       false, 26),
  (gen_random_uuid()::text, 'Scion',           'scion',          'Japan',       false, 27),

  -- Korean
  (gen_random_uuid()::text, 'Genesis',         'genesis',        'South Korea', false, 28),
  (gen_random_uuid()::text, 'Ssangyong',       'ssangyong',      'South Korea', false, 29),

  -- German
  (gen_random_uuid()::text, 'Opel',            'opel',           'Germany',     false, 30),
  (gen_random_uuid()::text, 'MINI',            'mini',           'UK/Germany',  false, 31),

  -- American
  (gen_random_uuid()::text, 'Cadillac',        'cadillac',       'USA',         false, 32),
  (gen_random_uuid()::text, 'Lincoln',         'lincoln',        'USA',         false, 33),
  (gen_random_uuid()::text, 'Chrysler',        'chrysler',       'USA',         false, 34),
  (gen_random_uuid()::text, 'RAM',             'ram',            'USA',         false, 35),
  (gen_random_uuid()::text, 'Buick',           'buick',          'USA',         false, 36),
  (gen_random_uuid()::text, 'Tesla',           'tesla',          'USA',         false, 37),

  -- British
  (gen_random_uuid()::text, 'Jaguar',          'jaguar',         'UK',          false, 38),
  (gen_random_uuid()::text, 'Bentley',         'bentley',        'UK',          false, 39),
  (gen_random_uuid()::text, 'Rolls-Royce',     'rolls-royce',    'UK',          false, 40),
  (gen_random_uuid()::text, 'Aston Martin',    'aston-martin',   'UK',          false, 41),
  (gen_random_uuid()::text, 'McLaren',         'mclaren',        'UK',          false, 42),

  -- Italian
  (gen_random_uuid()::text, 'Ferrari',         'ferrari',        'Italy',       false, 43),
  (gen_random_uuid()::text, 'Lamborghini',     'lamborghini',    'Italy',       false, 44),
  (gen_random_uuid()::text, 'Maserati',        'maserati',       'Italy',       false, 45),
  (gen_random_uuid()::text, 'Alfa Romeo',      'alfa-romeo',     'Italy',       false, 46),
  (gen_random_uuid()::text, 'Fiat',            'fiat',           'Italy',       false, 47),

  -- French
  (gen_random_uuid()::text, 'Peugeot',         'peugeot',        'France',      false, 48),
  (gen_random_uuid()::text, 'Renault',         'renault',        'France',      false, 49),
  (gen_random_uuid()::text, 'Citroën',         'citroen',        'France',      false, 50),
  (gen_random_uuid()::text, 'DS Automobiles',  'ds',             'France',      false, 51),

  -- Swedish
  (gen_random_uuid()::text, 'Volvo',           'volvo',          'Sweden',      false, 52),

  -- Chinese (Growing fast in Qatar)
  (gen_random_uuid()::text, 'Haval',           'haval',          'China',       false, 53),
  (gen_random_uuid()::text, 'Chery',           'chery',          'China',       false, 54),
  (gen_random_uuid()::text, 'Changan',         'changan',        'China',       false, 55),
  (gen_random_uuid()::text, 'BYD',             'byd',            'China',       false, 56),
  (gen_random_uuid()::text, 'Geely',           'geely',          'China',       false, 57),
  (gen_random_uuid()::text, 'GAC',             'gac',            'China',       false, 58),
  (gen_random_uuid()::text, 'JAC',             'jac',            'China',       false, 59),
  (gen_random_uuid()::text, 'Great Wall',      'great-wall',     'China',       false, 60),
  (gen_random_uuid()::text, 'BAIC',            'baic',           'China',       false, 61),
  (gen_random_uuid()::text, 'Hongqi',          'hongqi',         'China',       false, 62),
  (gen_random_uuid()::text, 'Lynk & Co',       'lynk-co',        'China',       false, 63),
  (gen_random_uuid()::text, 'Jetour',          'jetour',         'China',       false, 64),
  (gen_random_uuid()::text, 'Omoda',           'omoda',          'China',       false, 65),
  (gen_random_uuid()::text, 'Exeed',           'exeed',          'China',       false, 66),

  -- Other
  (gen_random_uuid()::text, 'RAM Trucks',      'ram-trucks',     'USA',         false, 67),
  (gen_random_uuid()::text, 'Hummer',          'hummer',         'USA',         false, 68),
  (gen_random_uuid()::text, 'Rivian',          'rivian',         'USA',         false, 69),
  (gen_random_uuid()::text, 'Bugatti',         'bugatti',        'France',      false, 70),
  (gen_random_uuid()::text, 'Koenigsegg',      'koenigsegg',     'Sweden',      false, 71),
  (gen_random_uuid()::text, 'Pagani',          'pagani',         'Italy',       false, 72)
ON CONFLICT (slug) DO UPDATE
  SET name      = EXCLUDED.name,
      country   = EXCLUDED.country,
      "isPopular" = EXCLUDED."isPopular",
      "sortOrder" = EXCLUDED."sortOrder";

-- ── 5. Done ───────────────────────────────────────────────
SELECT 'Brands: ' || count(*)::text FROM public.brands
UNION ALL
SELECT 'Categories: ' || count(*)::text FROM public.categories;
