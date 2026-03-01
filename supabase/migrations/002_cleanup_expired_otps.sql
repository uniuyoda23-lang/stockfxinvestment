-- Migration: add cleanup trigger for otp_codes
-- Deletes expired or verified OTPs on every insert to keep table small

-- Function that removes old/verified codes
CREATE OR REPLACE FUNCTION public.cleanup_otps_before_insert()
RETURNS trigger AS $$
BEGIN
  DELETE FROM public.otp_codes
    WHERE expires_at < NOW()
       OR verified = TRUE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to otp_codes table
DROP TRIGGER IF EXISTS cleanup_otps_trigger ON public.otp_codes;
CREATE TRIGGER cleanup_otps_trigger
  BEFORE INSERT ON public.otp_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_otps_before_insert();

-- Optionally run one-time cleanup now (can be executed manually)
-- DELETE FROM public.otp_codes WHERE expires_at < NOW() OR verified = TRUE;