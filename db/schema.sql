-- Correr en Supabase → SQL Editor

create table if not exists drivers (
  id          serial primary key,
  pos         int,
  flag        text,
  name        text,
  short       text,
  team        text,
  number      int,
  pts         int default 0,
  emoji       text,
  nat         text,
  bio         text,
  age         int,
  born        text,
  prev        text
);

create table if not exists constructors (
  id          serial primary key,
  pos         int,
  name        text,
  engine      text,
  pts         int default 0,
  color_hex   text,
  driver1     text,
  driver2     text,
  note        text
);

create table if not exists calendar (
  id          serial primary key,
  round       int,
  flag        text,
  name        text,
  circuit     text,
  date_str    text,
  status      text check (status in ('done','next','upcoming','cancelled')),
  winner      text,
  has_sprint  boolean default false
);

create table if not exists race_results (
  id          serial primary key,
  race_name   text,
  race_type   text default 'race',  -- 'race' | 'sprint'
  pos         int,
  driver_name text,
  team        text,
  pts         int default 0,
  fastest_lap boolean default false,
  dnf         boolean default false
);

create table if not exists race_points (
  id          serial primary key,
  driver_name text,
  australia   int default 0,
  china       int default 0,
  japan       int default 0,
  miami       int default 0
);

create table if not exists news (
  id             serial primary key,
  title          text,
  summary        text,
  tag_type       text check (tag_type in ('breaking','technical','paddock','upcoming','transfer')),
  source         text,
  published_date text
);