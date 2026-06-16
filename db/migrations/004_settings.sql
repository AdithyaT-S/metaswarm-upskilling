-- ================================================================
-- 004_settings.sql
--
-- Settings module: custom field definitions for configurable entity fields.
-- ================================================================

CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      uuid NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('contact')),
  field_name  text NOT NULL,
  field_type  text NOT NULL CHECK (field_type IN ('text','number','date','boolean','select')),
  options     jsonb DEFAULT '[]',
  is_required boolean NOT NULL DEFAULT false,
  position    int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, entity_type, field_name)
);

CREATE INDEX IF NOT EXISTS idx_custom_field_defs_org ON custom_field_definitions(org_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_defs_entity ON custom_field_definitions(org_id, entity_type);
