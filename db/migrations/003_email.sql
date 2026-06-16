-- ================================================================
-- 003_email.sql
--
-- Email module: add ticket_id to email_threads and
-- provider_message_id to email_messages for inbound matching.
-- ================================================================

ALTER TABLE email_threads
  ADD COLUMN IF NOT EXISTS ticket_id uuid REFERENCES tickets(id) ON DELETE SET NULL;

ALTER TABLE email_messages
  ADD COLUMN IF NOT EXISTS provider_message_id text;

CREATE INDEX IF NOT EXISTS idx_threads_ticket ON email_threads(ticket_id)
  WHERE ticket_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_provider ON email_messages(provider_message_id)
  WHERE provider_message_id IS NOT NULL;
