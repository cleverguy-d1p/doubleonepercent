-- The first migration is already applied to D1P Fitness. Preserve its strict
-- validation while adding the standalone age and three separate goal answers
-- that appear in the source questionnaire.
begin;

alter function public.save_intake(jsonb, integer) rename to save_intake_core;
revoke all on function public.save_intake_core(jsonb, integer) from public, authenticated;

create function public.save_intake(payload jsonb, step_index integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  additional jsonb;
begin
  if payload is null or jsonb_typeof(payload) <> 'object' then
    raise exception 'Invalid answers';
  end if;

  additional := payload - array[
    'q719','q730','q750','q758','q774','q818','q853','q889',
    'q954','q967','q988','q1082','q1135','q1265',
    'q1392','q1485','q1547','q1605','q1664','q1743','q1823','q1985','q2089','q2144','q2242',
    'q2346','q2499','q2573','q2650','q2750','q2884','q3019','q3133','q3188','q3305','q3451',
    'q3619','q3806','q3872','q3928','q3973','q4006','q4082','q4098','q4107','q4122','q4128','q4220','q4325','q4390','q4424','q4458','q4500','q4534','q4676','q4702','q4733','q4750','q4771','q4788','q4815','q4884','q4957','q4996','q5056','q5108','q5169','q5254','q5334','q5369','q5442','q5488','q5581','q5675','q5755','q5825',
    'q5911','q6004','q6065','q6098','q6163','q6256','q6323','q6384','q6441','q6495','q6532','q6538','q6553','q6563','q6583','q6647','q6788','q6848','q7016','q7037','q7057','q7088',
    'q7132','q7217','q7307','q7375','q7452','q7475','q7538','q7580','q7695','q7828','q7848','q7876','q7907','q7923','q7949','q7955','q8008','q8117','q8170','q8222','q8286','cycling','q8405','q8484','q8600','q8659','q8728','q8779','q8809','q8846','q8890','q8983','q9035','q9067','q9142','q9164','q9201','q9221','q9291','q9474','q9611',
    'q9754','q9771','q9790','q9815','q9865','q9906','q9964','q10019','q10076','q10127','q10191','q10252',
    'q10352','q10397','q10482','q10528','q10571','q10592','q10676','q10725','q10748','q10810','q10873','q10921',
    'q11012','q11148','q11224','q11274','q11320','q11366','q11416','q11475','q11546','q11618','q11681','q11730',
    'photos','q12014','q12027','q12043','q12069','q12091','q12098','q12105','q12136','q12208','q12226','q12243',
    'q12446','q12520','q12615','q12679','q12837','q12897'
  ];

  if exists (
    select 1 from jsonb_each(additional)
    where key not in ('q745','q1475','q1478','q1481')
      or jsonb_typeof(value) <> 'string'
      or length(value #>> '{}') > 500
  ) then
    raise exception 'Invalid answer';
  end if;

  perform public.save_intake_core(
    payload - array['q745','q1475','q1478','q1481'],
    step_index
  );

  update public.intakes
  set answers = answers || additional,
      updated_at = now()
  where user_id = auth.uid()
    and status = 'draft';
end
$$;

revoke all on function public.save_intake(jsonb, integer) from public;
grant execute on function public.save_intake(jsonb, integer) to authenticated;
commit;
