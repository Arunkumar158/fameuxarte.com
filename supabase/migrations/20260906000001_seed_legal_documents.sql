-- Migration: 20260906000001_seed_legal_documents.sql
-- Seed initial legal documents (draft state) for the Policy System

INSERT INTO public.legal_documents (document_type, title, version, status, content, effective_at)
VALUES 
  ('privacy_policy', 'Privacy Policy', '1.0', 'draft', '# Privacy Policy

*PENDING BUSINESS DECISION: Finalize privacy data map and third party service disclosures.*', NOW()),

  ('terms_conditions', 'Terms & Conditions', '1.0', 'draft', '# Terms & Conditions

*PENDING BUSINESS DECISION: Finalize general platform terms.*', NOW()),

  ('artist_agreement', 'Artist Agreement', '1.0', 'draft', '# Artist Agreement

*PENDING BUSINESS DECISION: Finalize commission, exclusivity, payout timing, and damage liability.*', NOW()),

  ('buyer_terms', 'Buyer Terms', '1.0', 'draft', '# Buyer Terms

*PENDING BUSINESS DECISION: Finalize purchase conditions and liability.*', NOW()),

  ('return_policy', 'Refund & Cancellation Policy', '1.0', 'draft', '# Refund & Cancellation Policy

*PENDING BUSINESS DECISION: Finalize return window, who pays return shipping, and cancellation rules.*', NOW()),

  ('shipping_policy', 'Shipping & Delivery Policy', '1.0', 'draft', '# Shipping & Delivery Policy

*PENDING BUSINESS DECISION: Finalize shipping cost rules, timelines, and damage liability.*', NOW()),

  ('cookie_policy', 'Cookie Policy', '1.0', 'draft', '# Cookie Policy

*PENDING BUSINESS DECISION: Finalize PostHog and other analytics cookie disclosures.*', NOW())
ON CONFLICT DO NOTHING;
