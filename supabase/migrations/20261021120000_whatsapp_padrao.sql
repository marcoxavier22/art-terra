-- WhatsApp oficial de atendimento: (24) 99201-1676
alter table public.configuracoes alter column whatsapp set default '5524992011676';
update public.configuracoes set whatsapp = '5524992011676' where id = 1;
