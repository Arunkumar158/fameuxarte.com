/* Migration for Sprint 2: Harden Profile Security */

-- Create trigger function to protect restricted profile fields from non-admin updates
CREATE OR REPLACE FUNCTION protect_profile_restricted_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Allow service role (backend operations where auth.uid() is null)
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- 2. Allow admins to modify anything
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN NEW;
  END IF;

  -- 3. Prevent non-admins from modifying restricted fields
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
    RAISE EXCEPTION 'Not authorized to modify verification_status';
  END IF;

  IF NEW.verified_at IS DISTINCT FROM OLD.verified_at THEN
    RAISE EXCEPTION 'Not authorized to modify verified_at';
  END IF;

  IF NEW.trust_score IS DISTINCT FROM OLD.trust_score THEN
    RAISE EXCEPTION 'Not authorized to modify trust_score';
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Not authorized to modify role';
  END IF;

  IF NEW.verification_notes IS DISTINCT FROM OLD.verification_notes THEN
    RAISE EXCEPTION 'Not authorized to modify verification_notes';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to allow re-running
DROP TRIGGER IF EXISTS enforce_profile_security ON profiles;

-- Create the trigger
CREATE TRIGGER enforce_profile_security
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION protect_profile_restricted_fields();
