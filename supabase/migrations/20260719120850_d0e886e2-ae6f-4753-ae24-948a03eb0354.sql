
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

DROP POLICY IF EXISTS "analytics_insert_all" ON public.analytics_events;
CREATE POLICY "analytics_insert_all" ON public.analytics_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(event) BETWEEN 1 AND 120 AND char_length(lead_id) BETWEEN 1 AND 120);
