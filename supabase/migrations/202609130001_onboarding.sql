begin;
create table public.coaches(user_id uuid primary key references auth.users(id));
alter table public.coaches enable row level security;
revoke all on public.coaches from anon,authenticated;
create function public.is_coach() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.coaches where user_id=auth.uid()) $$;
revoke all on function public.is_coach() from public;
grant execute on function public.is_coach() to authenticated;
create table public.intakes(
 user_id uuid primary key references auth.users(id) on delete cascade,
 email text not null,
 answers jsonb not null default '{}' check(jsonb_typeof(answers)='object'),
 current_step integer not null default 0 check(current_step between 0 and 14),
 status text not null default 'draft' check(status in('draft','submitted','reviewed')),
 questionnaire_version integer not null default 1,
 consent_version text,
 consent_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 submitted_at timestamptz
);
alter table public.intakes enable row level security;
revoke all on public.intakes from anon,authenticated;
grant select on public.intakes to authenticated;
create policy intake_read on public.intakes for select to authenticated using(user_id=auth.uid() or public.is_coach());
create function public.save_intake(payload jsonb,step_index integer) returns void language plpgsql security definer set search_path='' as $$
declare actor uuid=auth.uid(); current_status text; account_email text;
begin
 if actor is null then raise exception 'Sign in to save your intake'; end if;
 if step_index not between 0 and 14 or step_index is null then raise exception 'Invalid section'; end if;
 if payload is null or jsonb_typeof(payload)<>'object' or octet_length(payload::text)>1000000 then raise exception 'Invalid answers'; end if;
 if exists(select 1 from jsonb_each(payload) where key not in('q719','q730','q750','q758','q774','q818','q853','q889','q954','q967','q988','q1082','q1135','q1265','q1392','q1485','q1547','q1605','q1664','q1743','q1823','q1985','q2089','q2144','q2242','q2346','q2499','q2573','q2650','q2750','q2884','q3019','q3133','q3188','q3305','q3451','q3619','q3806','q3872','q3928','q3973','q4006','q4082','q4098','q4107','q4122','q4128','q4220','q4325','q4390','q4424','q4458','q4500','q4534','q4676','q4702','q4733','q4750','q4771','q4788','q4815','q4884','q4957','q4996','q5056','q5108','q5169','q5254','q5334','q5369','q5442','q5488','q5581','q5675','q5755','q5825','q5911','q6004','q6065','q6098','q6163','q6256','q6323','q6384','q6441','q6495','q6532','q6538','q6553','q6563','q6583','q6647','q6788','q6848','q7016','q7037','q7057','q7088','q7132','q7217','q7307','q7375','q7452','q7475','q7538','q7580','q7695','q7828','q7848','q7876','q7907','q7923','q7949','q7955','q8008','q8117','q8170','q8222','q8286','cycling','q8405','q8484','q8600','q8659','q8728','q8779','q8809','q8846','q8890','q8983','q9035','q9067','q9142','q9164','q9201','q9221','q9291','q9474','q9611','q9754','q9771','q9790','q9815','q9865','q9906','q9964','q10019','q10076','q10127','q10191','q10252','q10352','q10397','q10482','q10528','q10571','q10592','q10676','q10725','q10748','q10810','q10873','q10921','q11012','q11148','q11224','q11274','q11320','q11366','q11416','q11475','q11546','q11618','q11681','q11730','photos','q12014','q12027','q12043','q12069','q12091','q12098','q12105','q12136','q12208','q12226','q12243','q12446','q12520','q12615','q12679','q12837','q12897') or jsonb_typeof(value)<>'string' or length(value#>>'{}')>5000) then raise exception 'Invalid answer'; end if;
 if payload->>'q4006' is distinct from 'Yes' then payload=payload-'q4082'; end if;
if payload->>'q4006' is distinct from 'Yes' then payload=payload-'q4098'; end if;
if payload->>'q4006' is distinct from 'Yes' then payload=payload-'q4107'; end if;
if payload->>'q4006' is distinct from 'Yes' then payload=payload-'q4122'; end if;
if payload->>'cycling' is distinct from 'Yes' then payload=payload-'q8405'; end if;
if payload->>'cycling' is distinct from 'Yes' then payload=payload-'q8484'; end if;
if payload->>'cycling' is distinct from 'Yes' then payload=payload-'q8600'; end if;
if payload->>'cycling' is distinct from 'Yes' then payload=payload-'q8659'; end if;
if payload->>'cycling' is distinct from 'Yes' then payload=payload-'q8728'; end if;
if payload->>'cycling' is distinct from 'Yes' then payload=payload-'q8779'; end if;
if payload->>'cycling' is distinct from 'Yes' then payload=payload-'q8809'; end if;
if payload->>'cycling' is distinct from 'Yes' then payload=payload-'q8846'; end if;
if payload->>'cycling' is distinct from 'Yes' then payload=payload-'q8890'; end if;
if payload->>'cycling' is distinct from 'Yes' then payload=payload-'q8983'; end if;
if payload->>'cycling' is distinct from 'Yes' then payload=payload-'q9035'; end if;
if payload->>'cycling' is distinct from 'Yes' then payload=payload-'q9067'; end if;
if payload->>'cycling' is distinct from 'Yes' then payload=payload-'q9142'; end if;
if payload->>'cycling' is distinct from 'Yes' then payload=payload-'q9164'; end if;
if payload->>'cycling' is distinct from 'Yes' then payload=payload-'q9201'; end if;
if payload->>'cycling' is distinct from 'Yes' then payload=payload-'q9221'; end if;
if payload->>'cycling' is distinct from 'Yes' then payload=payload-'q9291'; end if;
if payload->>'cycling' is distinct from 'Yes' then payload=payload-'q9474'; end if;
if payload->>'cycling' is distinct from 'Yes' then payload=payload-'q9611'; end if;
if payload->>'photos' is distinct from 'Yes' then payload=payload-'q12208'; end if;
if payload->>'photos' is distinct from 'Yes' then payload=payload-'q12226'; end if;
if payload->>'photos' is distinct from 'Yes' then payload=payload-'q12243'; end if;
 select email into account_email from auth.users where id=actor;
 insert into public.intakes(user_id,email) values(actor,account_email) on conflict(user_id) do nothing;
 select status into current_status from public.intakes where user_id=actor for update;
 if current_status<>'draft' then raise exception 'This intake has already been submitted'; end if;
 update public.intakes set answers=payload,current_step=step_index,updated_at=now() where user_id=actor;
end $$;
revoke all on function public.save_intake(jsonb,integer) from public;
grant execute on function public.save_intake(jsonb,integer) to authenticated;
create function public.submit_intake(notice_version text) returns void language plpgsql security definer set search_path='' as $$
declare record public.intakes;
begin
 if auth.uid() is null then raise exception 'Sign in to submit'; end if;
 select * into record from public.intakes where user_id=auth.uid() for update;
 if not found then raise exception 'Save your intake first'; end if;
 if record.status<>'draft' then return; end if;
 if length(trim(coalesce(record.answers->>'q719','')))=0 then raise exception 'Please provide your full name'; end if;
 if notice_version is distinct from '2026-09-13' then raise exception 'Please review the current privacy notice'; end if;
 update public.intakes set status='submitted',current_step=14,submitted_at=now(),consent_version=notice_version,consent_at=now(),updated_at=now() where user_id=auth.uid();
end $$;
revoke all on function public.submit_intake(text) from public;
grant execute on function public.submit_intake(text) to authenticated;
create function public.review_intake(member_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_coach() then raise exception 'Coach access required'; end if;
 update public.intakes set status='reviewed',updated_at=now() where user_id=member_id and status='submitted';
end $$;
revoke all on function public.review_intake(uuid) from public;
grant execute on function public.review_intake(uuid) to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('baseline-photos','baseline-photos',false,10485760,array['image/jpeg','image/png','image/webp']);
create policy photo_read on storage.objects for select to authenticated using(bucket_id='baseline-photos' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_coach()));
create policy photo_insert on storage.objects for insert to authenticated with check(bucket_id='baseline-photos' and (storage.foldername(name))[1]=auth.uid()::text and exists(select 1 from public.intakes where user_id=auth.uid() and status='draft'));
create policy photo_update on storage.objects for update to authenticated using(bucket_id='baseline-photos' and (storage.foldername(name))[1]=auth.uid()::text and exists(select 1 from public.intakes where user_id=auth.uid() and status='draft')) with check(bucket_id='baseline-photos' and (storage.foldername(name))[1]=auth.uid()::text);
commit;
