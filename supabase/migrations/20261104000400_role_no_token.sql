-- Copia o papel (profiles.role) para o app_metadata do usuário.
-- Assim o papel vai dentro do token de login e o site confere o acesso às
-- áreas sem consultar o banco a cada clique. O app_metadata só pode ser
-- alterado pelo banco/servidor, nunca pelo próprio usuário.

create or replace function public.sync_role_to_auth()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  update auth.users
     set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', new.role::text)
   where id = new.id;
  return new;
end $$;

drop trigger if exists profiles_sync_role on public.profiles;
create trigger profiles_sync_role
  after insert or update of role on public.profiles
  for each row execute function public.sync_role_to_auth();

-- usuários que já existem
update auth.users u
   set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', p.role::text)
  from public.profiles p
 where p.id = u.id;
