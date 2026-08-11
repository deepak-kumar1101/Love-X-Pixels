-- ====================================================================
-- LOVEPIXELS • COMPLETE ONE-CLICK SUPABASE POSTGRESQL DATABASE SCHEMA
-- Execute this SQL script in Supabase Console -> SQL Editor -> Click RUN
-- ====================================================================

-- 1. PROFILES TABLE (Synced with Supabase Auth & Discord OAuth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  avatar_url TEXT,
  roles TEXT[] DEFAULT ARRAY['Member']::TEXT[],
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  badges TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_verified BOOLEAN DEFAULT TRUE,
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STAFF TABLE
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  rank TEXT NOT NULL,
  presence TEXT DEFAULT 'online',
  handle TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  time_label TEXT DEFAULT '8:00 PM IST',
  host TEXT DEFAULT 'Aurelia',
  status TEXT DEFAULT 'upcoming',
  reward TEXT DEFAULT '₹1,000 + Champion Role',
  max_slots INT DEFAULT 50,
  registered_count INT DEFAULT 0,
  remaining_slots INT DEFAULT 50,
  difficulty TEXT DEFAULT 'Medium',
  rules TEXT[] DEFAULT ARRAY[]::TEXT[],
  banner_url TEXT,
  registration_open BOOLEAN DEFAULT TRUE,
  winner_id TEXT,
  winner_name TEXT,
  winner_avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  discord_id TEXT NOT NULL,
  username TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'registered'
);

-- 5. WINNER ANNOUNCEMENTS TABLE (24-Hour Active Celebrations)
CREATE TABLE IF NOT EXISTS public.winner_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  winner_discord_id TEXT NOT NULL,
  winner_name TEXT NOT NULL,
  avatar TEXT,
  event_name TEXT NOT NULL,
  prize_won TEXT NOT NULL,
  congratulations_msg TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  status TEXT DEFAULT 'active'
);

-- 6. WINNER HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.winner_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  winner_discord_id TEXT,
  winner_name TEXT NOT NULL,
  avatar TEXT,
  prize TEXT NOT NULL,
  won_at TIMESTAMPTZ DEFAULT NOW(),
  participants_count INT DEFAULT 0
);

-- 7. REWARD CLAIMS TABLE (Winner Ticket System)
CREATE TABLE IF NOT EXISTS public.reward_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  winner_name TEXT NOT NULL,
  discord_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  prize TEXT NOT NULL,
  reason TEXT DEFAULT 'Reward Claim Ticket',
  payment_method TEXT DEFAULT 'UPI',
  account_details TEXT,
  status TEXT DEFAULT 'pending',
  proof_image_url TEXT,
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PAYOUTS TABLE (Verified Winners & Payout Proof Receipts)
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  handle TEXT NOT NULL,
  amount TEXT NOT NULL,
  reason TEXT NOT NULL,
  paid_at TEXT NOT NULL,
  proof_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. REVIEWS TABLE (Member Feedback)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  handle TEXT NOT NULL,
  quote TEXT NOT NULL,
  rating INT DEFAULT 5,
  approved BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. GALLERY TABLE
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  src TEXT NOT NULL,
  alt TEXT,
  caption TEXT,
  category TEXT DEFAULT 'Community',
  span TEXT DEFAULT 'col-span-1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PARTNERS TABLE
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Community',
  description TEXT,
  member_count INT DEFAULT 500,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'banner',
  priority TEXT DEFAULT 'high',
  visible BOOLEAN DEFAULT TRUE,
  target_audience TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. VISITOR LOGS TABLE (Analytics)
CREATE TABLE IF NOT EXISTS public.visitor_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 15. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target_collection TEXT,
  target_id TEXT,
  performed_by TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- AUTOMATIC DISCORD USER PROFILE SYNC TRIGGER
-- Automatically creates a row in public.profiles when a user signs in
-- Automatically grants Owner & Admin roles to nyx_str, w.arch, or admin email
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT;
  v_username TEXT;
  v_is_admin BOOLEAN;
BEGIN
  v_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Discord Member');
  v_username := COALESCE(NEW.raw_user_meta_data->>'preferred_username', SPLIT_PART(NEW.email, '@', 1), 'discord_' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 6));
  
  -- Check if username or email matches target admin handles (nyx_str, w.arch, admin mail)
  IF LOWER(v_username) LIKE '%nyx_str%' OR LOWER(v_name) LIKE '%nyx_str%' OR
     LOWER(v_username) LIKE '%w.arch%' OR LOWER(v_name) LIKE '%w.arch%' OR
     LOWER(COALESCE(NEW.email, '')) = LOWER(COALESCE(current_setting('app.admin_email', true), 'naitikpatelmadv9725@gmail.com')) THEN
    v_is_admin := TRUE;
  ELSE
    v_is_admin := FALSE;
  END IF;

  INSERT INTO public.profiles (id, display_name, username, email, avatar_url, roles)
  VALUES (
    NEW.id,
    v_name,
    v_username,
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN v_is_admin THEN ARRAY['Owner', 'Admin', 'Member']::TEXT[]
      ELSE ARRAY['Member']::TEXT[]
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    email = EXCLUDED.email,
    roles = CASE 
      WHEN v_is_admin THEN ARRAY['Owner', 'Admin', 'Member']::TEXT[]
      ELSE profiles.roles
    END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winner_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winner_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Staff" ON public.staff FOR SELECT USING (true);
CREATE POLICY "Public Read Events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public Read Participants" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Public Read WinnerAnnouncements" ON public.winner_announcements FOR SELECT USING (true);
CREATE POLICY "Public Read WinnerHistory" ON public.winner_history FOR SELECT USING (true);
CREATE POLICY "Public Read RewardClaims" ON public.reward_claims FOR SELECT USING (true);
CREATE POLICY "Public Read Payouts" ON public.payouts FOR SELECT USING (true);
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public Read Gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Public Read Partners" ON public.partners FOR SELECT USING (true);
CREATE POLICY "Public Read Announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Public Read Settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Public Read VisitorLogs" ON public.visitor_logs FOR SELECT USING (true);
CREATE POLICY "Public Read AuditLogs" ON public.audit_logs FOR SELECT USING (true);

CREATE POLICY "Public Write Profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write Staff" ON public.staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write Events" ON public.events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write Participants" ON public.participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write WinnerAnnouncements" ON public.winner_announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write WinnerHistory" ON public.winner_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write RewardClaims" ON public.reward_claims FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write Payouts" ON public.payouts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write Reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write Gallery" ON public.gallery FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write Partners" ON public.partners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write Announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write Settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write VisitorLogs" ON public.visitor_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Write AuditLogs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
