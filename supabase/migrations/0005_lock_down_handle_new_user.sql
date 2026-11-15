-- The new-user trigger function runs with elevated rights. It only needs
-- to be fired by the trigger, never called through the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
