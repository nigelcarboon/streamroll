-- Align service colours with the published brand palettes used in the
-- identity deck. Binge's tile is black, which would vanish on the app's
-- dark ground, so it takes the amber from its palette instead.
update services set colour = '#0088E6' where name = 'Stan';
update services set colour = '#01147C' where name = 'Disney+';
update services set colour = '#D6964A' where name = 'Binge';
