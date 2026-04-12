insert into config (clave, valor) values
  ('proxima_reunion', ''),
  ('secretaria_aviso', '')
on conflict (clave) do nothing;
