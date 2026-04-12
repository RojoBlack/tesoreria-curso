create type decision_estado as enum ('Pendiente', 'En proceso', 'Cumplida');
create type reunion_tipo as enum ('Ordinaria', 'Extraordinaria', 'Emergencia');

create table reuniones (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  tipo reunion_tipo not null default 'Ordinaria',
  lugar text not null default 'Sala de clases',
  asistentes_count integer not null default 0,
  resumen text not null default '',
  created_at timestamptz not null default now()
);

create table actas (
  id uuid primary key default gen_random_uuid(),
  reunion_id uuid not null references reuniones(id) on delete cascade,
  contenido text not null,
  created_at timestamptz not null default now()
);

create table decisiones (
  id uuid primary key default gen_random_uuid(),
  reunion_id uuid references reuniones(id) on delete set null,
  descripcion text not null,
  responsable text not null default '',
  estado decision_estado not null default 'Pendiente',
  fecha_limite date,
  created_at timestamptz not null default now()
);

create table avisos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  contenido text not null,
  destacado boolean not null default false,
  created_at timestamptz not null default now()
);

alter table reuniones enable row level security;
alter table actas enable row level security;
alter table decisiones enable row level security;
alter table avisos enable row level security;

create policy "lectura publica reuniones"  on reuniones  for select using (true);
create policy "lectura publica actas"      on actas      for select using (true);
create policy "lectura publica decisiones" on decisiones for select using (true);
create policy "lectura publica avisos"     on avisos     for select using (true);

create policy "escritura service reuniones"  on reuniones  for all using (auth.role() = 'service_role');
create policy "escritura service actas"      on actas      for all using (auth.role() = 'service_role');
create policy "escritura service decisiones" on decisiones for all using (auth.role() = 'service_role');
create policy "escritura service avisos"     on avisos     for all using (auth.role() = 'service_role');
