-- Fix RLS policies for blogs and insights tables to allow admins to manage articles

-- 1. Ensure insights policies are correct
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Insights are insertable by admins') THEN
        CREATE POLICY "Insights are insertable by admins" ON insights
          FOR INSERT WITH CHECK (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
            )
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Insights are updatable by admins') THEN
        CREATE POLICY "Insights are updatable by admins" ON insights
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
            )
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Insights are deletable by admins') THEN
        CREATE POLICY "Insights are deletable by admins" ON insights
          FOR DELETE USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
            )
          );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Insights are viewable by everyone') THEN
        CREATE POLICY "Insights are viewable by everyone" ON insights
          FOR SELECT USING (true);
    END IF;
END $$;


-- 2. Add policies for the legacy blogs table
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Blogs are insertable by admins') THEN
        CREATE POLICY "Blogs are insertable by admins" ON blogs
          FOR INSERT WITH CHECK (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
            )
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Blogs are updatable by admins') THEN
        CREATE POLICY "Blogs are updatable by admins" ON blogs
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
            )
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Blogs are deletable by admins') THEN
        CREATE POLICY "Blogs are deletable by admins" ON blogs
          FOR DELETE USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
            )
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Blogs are viewable by everyone') THEN
        CREATE POLICY "Blogs are viewable by everyone" ON blogs
          FOR SELECT USING (true);
    END IF;
END $$;
