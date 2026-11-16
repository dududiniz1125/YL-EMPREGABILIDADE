-- Áreas de todas as categorias de emprego (não só restaurantes).
-- Gerado por scripts/gerar-sql-areas.ts. Rode as partes em ordem.

-- Parte 1: coluna nova com as áreas agrupadas por categoria
alter table public.configuracoes
  add column if not exists areas_por_categoria jsonb not null default '[]'::jsonb;
update public.configuracoes set areas_por_categoria = '[]'::jsonb where id = 1;

-- Parte 2: Alimentação e hotelaria
update public.configuracoes
  set areas_por_categoria = areas_por_categoria || $$[{"nome":"Alimentação e hotelaria","areas":["Garçom / Garçonete","Cumim","Cozinheiro(a)","Auxiliar de cozinha","Chapeiro(a)","Pizzaiolo(a)","Confeiteiro(a)","Padeiro(a)","Barista","Bartender","Copeiro(a)","Recepcionista de hotel","Camareiro(a)"]}]$$::jsonb
  where id = 1;

-- Parte 3: Administrativo e escritório
update public.configuracoes
  set areas_por_categoria = areas_por_categoria || $$[{"nome":"Administrativo e escritório","areas":["Auxiliar administrativo","Assistente administrativo","Recepcionista","Secretário(a)","Auxiliar de escritório","Assistente financeiro","Auxiliar de contabilidade","Assistente de RH","Analista administrativo","Faturista","Almoxarife"]}]$$::jsonb
  where id = 1;

-- Parte 4: Comércio e vendas
update public.configuracoes
  set areas_por_categoria = areas_por_categoria || $$[{"nome":"Comércio e vendas","areas":["Vendedor(a)","Vendedor(a) externo","Representante comercial","Consultor(a) de vendas","Operador(a) de caixa","Repositor(a)","Promotor(a) de vendas","Fiscal de loja","Gerente de loja","Estoquista"]}]$$::jsonb
  where id = 1;

-- Parte 5: Educação e esportes
update public.configuracoes
  set areas_por_categoria = areas_por_categoria || $$[{"nome":"Educação e esportes","areas":["Professor(a) de educação física","Professor(a) de ensino fundamental","Professor(a) de educação infantil","Professor(a) de inglês","Auxiliar de classe","Monitor(a) escolar","Personal trainer","Instrutor(a) de academia","Recreador(a)"]}]$$::jsonb
  where id = 1;

-- Parte 6: Saúde, Limpeza e serviços gerais
update public.configuracoes
  set areas_por_categoria = areas_por_categoria || $$[{"nome":"Saúde","areas":["Técnico(a) de enfermagem","Enfermeiro(a)","Cuidador(a) de idosos","Auxiliar de saúde bucal","Recepcionista de clínica","Farmacêutico(a)","Atendente de farmácia","Fisioterapeuta"]},{"nome":"Limpeza e serviços gerais","areas":["Auxiliar de limpeza","Faxineiro(a)","Diarista","Zelador(a)","Porteiro(a)","Jardineiro(a)","Lavador(a) de veículos"]}]$$::jsonb
  where id = 1;

-- Parte 7: Logística e transporte, Construção e manutenção
update public.configuracoes
  set areas_por_categoria = areas_por_categoria || $$[{"nome":"Logística e transporte","areas":["Motorista","Motorista de caminhão","Entregador(a)","Motoboy","Auxiliar de logística","Conferente","Operador(a) de empilhadeira","Ajudante de carga e descarga"]},{"nome":"Construção e manutenção","areas":["Pedreiro(a)","Servente de obras","Eletricista","Encanador(a)","Pintor(a)","Marceneiro(a)","Técnico(a) de manutenção","Mestre de obras"]}]$$::jsonb
  where id = 1;

-- Parte 8: Beleza e estética, Atendimento e telemarketing
update public.configuracoes
  set areas_por_categoria = areas_por_categoria || $$[{"nome":"Beleza e estética","areas":["Cabeleireiro(a)","Manicure / Pedicure","Barbeiro(a)","Esteticista","Maquiador(a)","Depilador(a)"]},{"nome":"Atendimento e telemarketing","areas":["Atendente","Operador(a) de telemarketing","Atendente de SAC","Operador(a) de cobrança","Recepcionista de eventos"]}]$$::jsonb
  where id = 1;

-- Parte 9: Tecnologia, Segurança
update public.configuracoes
  set areas_por_categoria = areas_por_categoria || $$[{"nome":"Tecnologia","areas":["Suporte técnico / Help desk","Técnico(a) de informática","Desenvolvedor(a)","Analista de sistemas","Designer gráfico","Social media"]},{"nome":"Segurança","areas":["Vigilante","Controlador(a) de acesso","Agente de segurança","Bombeiro(a) civil","Monitor(a) de CFTV"]}]$$::jsonb
  where id = 1;

-- Parte 10: Indústria e produção, Outra
update public.configuracoes
  set areas_por_categoria = areas_por_categoria || $$[{"nome":"Indústria e produção","areas":["Auxiliar de produção","Operador(a) de máquinas","Montador(a)","Soldador(a)","Torneiro(a) mecânico","Inspetor(a) de qualidade","Costureiro(a)"]},{"nome":"Outra","areas":["Outra"]}]$$::jsonb
  where id = 1;

-- Parte 11: lista simples (usada nas provas e filtros), com "Outra" no fim
update public.configuracoes c
  set areas = (
    select array_agg(a order by o1, o2)
    from jsonb_array_elements(c.areas_por_categoria) with ordinality as cat(v, o1),
         jsonb_array_elements_text(cat.v -> 'areas') with ordinality as ar(a, o2)
  ),
  updated_at = now()
  where id = 1;
