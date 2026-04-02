-- Migration 010: Normalise message_type values to uppercase domain enum
-- Context (F5): The domain MessageType enum uses uppercase values:
--   'REGULAR' | 'BET' | 'SYSTEM' | 'DONATION'
-- Existing rows store legacy lowercase values: 'message' | 'bet' | 'system'
-- After this migration the CHECK constraint is updated and all rows use uppercase.
-- The frontend adapter normalizeMessageType() in supabase-chat.service.ts
-- can be removed once this migration is applied in production.

BEGIN;

-- 1. Drop the existing CHECK constraint (it references the old lowercase values)
ALTER TABLE chat_messages
  DROP CONSTRAINT IF EXISTS chat_messages_message_type_check;

-- 2. Backfill existing rows: lowercase → uppercase
UPDATE chat_messages SET message_type = 'REGULAR'  WHERE message_type = 'message';
UPDATE chat_messages SET message_type = 'BET'      WHERE message_type = 'bet';
UPDATE chat_messages SET message_type = 'SYSTEM'   WHERE message_type = 'system';
UPDATE chat_messages SET message_type = 'DONATION' WHERE message_type = 'donation';

-- 3. Add the new CHECK constraint with uppercase values (+ DONATION)
ALTER TABLE chat_messages
  ADD CONSTRAINT chat_messages_message_type_check
  CHECK (message_type IN ('REGULAR', 'BET', 'SYSTEM', 'DONATION'));

COMMIT;
