-- Seed the fixed list of services from the onboarding screen.
-- Colours are placeholder brand-ish hex values; adjust to match final design.

insert into services (name, colour, is_free) values
  ('Netflix', '#E50914', false),
  ('Stan', '#04BEFE', false),
  ('Disney+', '#113CCF', false),
  ('Prime Video', '#00A8E1', false),
  ('Apple TV+', '#000000', false),
  ('HBO Max', '#8C3AF7', false),
  ('Binge', '#FFE500', false),
  ('Paramount+', '#0064FF', false),
  ('ABC iview', '#B80917', true),
  ('SBS On Demand', '#EC7E24', true),
  ('10 Play', '#FFFFFF', true);
