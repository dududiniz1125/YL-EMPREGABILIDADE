-- Regra do cliente: o site não usa mais WhatsApp. Todo contato é por e-mail.
-- Remove as colunas de WhatsApp (o dado deixa de existir, como diz a
-- Política de Privacidade) e passa a mostrar o E-MAIL do candidato para a
-- empresa só a partir da etapa "entrevista" (mesma regra de antes).
-- Tudo numa transação: se algo falhar, nada muda.

begin;

-- 1) view da empresa: troca whatsapp por email (mesma regra de privacidade)
drop view if exists public.inscritos_empresa;

create view public.inscritos_empresa
with (security_barrier = true)
as
select
  c.id as candidatura_id,
  c.vaga_id,
  c.status,
  c.created_at,
  ca.nome,
  ca.area_principal,
  ca.experiencias,
  (select r.nota from public.respostas_prova r
     join public.provas p on p.id = r.prova_id
    where r.candidato_id = ca.id and p.area = v.area
    limit 1) as nota_prova,
  case
    when c.status in ('entrevista', 'contratado')
      or (c.status = 'nao_selecionado' and c.chegou_entrevista)
    then ca.email
  end as email
from public.candidaturas c
join public.vagas v on v.id = c.vaga_id
join public.candidatos ca on ca.id = c.candidato_id
where v.empresa_id = auth.uid();

revoke all on public.inscritos_empresa from anon, public;
grant select on public.inscritos_empresa to authenticated;

-- 2) cadastro automático sem whatsapp
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  r text := m ->> 'role';
begin
  if r = 'candidato' then
    insert into public.profiles (id, role, nome) values (new.id, 'candidato', coalesce(m ->> 'nome', ''));
    insert into public.candidatos (
      id, nome, email, cidade, area_principal, outras_areas,
      pretensao_salarial, turnos, experiencias, consentimento_lgpd_em
    ) values (
      new.id,
      m ->> 'nome',
      new.email,
      m ->> 'cidade',
      m ->> 'area_principal',
      coalesce(array(select jsonb_array_elements_text(m -> 'outras_areas')), '{}'),
      nullif(m ->> 'pretensao_salarial', '')::numeric,
      coalesce(array(select jsonb_array_elements_text(m -> 'turnos')), '{}'),
      coalesce(m -> 'experiencias', '[]'::jsonb),
      case when (m ->> 'consentimento')::boolean then now() else null end
    );
  elsif r = 'empresa' then
    insert into public.profiles (id, role, nome) values (new.id, 'empresa', coalesce(m ->> 'responsavel', ''));
    insert into public.empresas (
      id, nome, cnpj, responsavel, email, bairro, consentimento_lgpd_em
    ) values (
      new.id,
      m ->> 'empresa',
      nullif(m ->> 'cnpj', ''),
      m ->> 'responsavel',
      new.email,
      nullif(m ->> 'bairro', ''),
      case when (m ->> 'consentimento')::boolean then now() else null end
    );
  end if;
  return new;
end $$;

-- 3) remove as colunas
alter table public.candidatos drop column if exists whatsapp;
alter table public.empresas drop column if exists whatsapp;
alter table public.configuracoes drop column if exists whatsapp;

commit;
