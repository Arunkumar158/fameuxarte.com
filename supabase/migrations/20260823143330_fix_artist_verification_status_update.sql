-- Fix artist verification status update trigger

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

  -- 3. Prevent non-admins from modifying restricted fields EXCEPT for submitting verification
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
    -- Allow transition from 'pending' to 'identity_submitted' by the user themselves
    IF OLD.verification_status = 'pending' AND NEW.verification_status = 'identity_submitted' AND auth.uid() = NEW.id THEN
      -- Allow it
    ELSE
      RAISE EXCEPTION 'Not authorized to modify verification_status';
    END IF;
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
