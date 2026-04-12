create extension if not exists "pgcrypto";

create type categoria_tipo as enum (
  'Cuotas',
  'Materiales',
  'Paseo',
  'Celebración',
  'Otros'
);

create table alumnos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  codigo_apoderado text unique not null,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table movimientos (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  categoria categoria_tipo not null,
  descripcion text not null,
  monto integer not null,
  alumno_id uuid references alumnos(id) on delete set null,
  mes_cuota text,
  created_at timestamptz not null default now()
);

create table config (
  clave text primary key,
  valor text not null
);

insert into config (clave, valor) values
  ('info_pago_nombre', 'Centro de Padres 5°B'),
  ('info_pago_plataforma', 'Mercado Pago'),
  ('info_pago_cuenta', 'pagos.5b@gmail.com'),
  ('info_pago_titular', 'María Jesús Fuentes'),
  ('cuota_mensual', '2000'),
  ('anio_escolar', '2026'),
  ('ajuste_saldo', '0'),
  ('ajuste_saldo_descripcion', '');

insert into alumnos (nombre, codigo_apoderado) values
  ('Valentina González',    'GON-26'),
  ('Martín Muñoz',          'MUN-26'),
  ('Sofía Rojas',           'ROJ-26'),
  ('Benjamín Díaz',         'DIA-26'),
  ('Isidora Pérez',         'PER-26'),
  ('Matías Soto',           'SOT-26'),
  ('Catalina Vargas',       'VAR-26'),
  ('Sebastián Castro',      'CAS-26'),
  ('Fernanda Morales',      'MOR-26'),
  ('Tomás Jiménez',         'JIM-26'),
  ('Antonia Silva',         'SIL-26'),
  ('Agustín Flores',        'FLO-26'),
  ('Camila Torres',         'TOR-26'),
  ('Diego Herrera',         'HER-26'),
  ('Javiera Mendoza',       'MEN-26'),
  ('Nicolás Pizarro',       'PIZ-26'),
  ('Renata Contreras',      'CON-26'),
  ('Felipe Espinoza',       'ESP-26');

alter table alumnos enable row level security;
alter table movimientos enable row level security;
alter table config enable row level security;

create policy "lectura publica alumnos" on alumnos
  for select using (true);

create policy "lectura publica movimientos" on movimientos
  for select using (true);

create policy "lectura publica config" on config
  for select using (true);

create policy "escritura service role alumnos" on alumnos
  for all using (auth.role() = 'service_role');

create policy "escritura service role movimientos" on movimientos
  for all using (auth.role() = 'service_role');

create policy "escritura service role config" on config
  for all using (auth.role() = 'service_role');
