ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS guest_label TEXT;

UPDATE public.messages
  SET guest_label = guest_id
  WHERE guest_label IS NULL;

ALTER TABLE public.messages
  ALTER COLUMN guest_label SET NOT NULL;
