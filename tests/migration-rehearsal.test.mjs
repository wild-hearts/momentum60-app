import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {uuid_ossp} from '@electric-sql/pglite/contrib/uuid_ossp';
import {readFileSync, readdirSync} from 'node:fs';

// Rehearses all migrations against the pre-subscription schema as it was
// actually created (the root *.sql files), with Supabase's default grants and
// legacy rows in every state an existing account can be in.
const root=new URL('../',import.meta.url);
const read=name=>readFileSync(new URL(name,root),'utf8');
const U={active:'00000000-0000-4000-8000-000000000001',finished:'00000000-0000-4000-8000-000000000002',orphan:'00000000-0000-4000-8000-000000000003',partnerA:'00000000-0000-4000-8000-000000000004',partnerB:'00000000-0000-4000-8000-000000000005',noStart:'00000000-0000-4000-8000-000000000006',bare:'00000000-0000-4000-8000-000000000007'};
const as=(db,role,uid)=>db.exec(`RESET ROLE;SELECT set_config('request.jwt.claim.sub','${uid||''}',false);SET ROLE ${role};`);
const count=async(db,sql)=>Number((await db.query(`SELECT count(*) AS n FROM ${sql}`)).rows[0].n);

test('all migrations apply to the legacy schema and keep existing accounts usable',async()=>{
 const db=new PGlite({extensions:{uuid_ossp}});
 try {
  await db.exec(`CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role BYPASSRLS;
   CREATE SCHEMA auth;CREATE SCHEMA extensions;CREATE EXTENSION "uuid-ossp" SCHEMA extensions;
   CREATE TABLE auth.users(id uuid PRIMARY KEY,email text);
   CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
   GRANT USAGE ON SCHEMA auth,public,extensions TO anon,authenticated,service_role;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon,authenticated,service_role;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon,authenticated,service_role;
   SET search_path=public,extensions;`);
  for(const file of ['supabase_setup.sql','phase3_migration.sql','phase5_migration.sql','phase6_migration.sql','phase8_migration.sql','supabase/delete_own_account.sql'])await db.exec(read(file));
  await db.exec(`INSERT INTO auth.users(id,email) VALUES ${Object.values(U).map((id,i)=>`('${id}','user${i}@example.test')`).join(',')};
   INSERT INTO user_profiles(user_id,start_date,timezone,invite_code) VALUES
    ('${U.active}',now()-interval '9 days','UTC','AAAAAA'),('${U.finished}',now()-interval '200 days','UTC','BBBBBB'),
    ('${U.partnerA}',now()-interval '3 days','UTC','CCCCCC'),('${U.partnerB}',now()-interval '3 days','UTC','DDDDDD'),('${U.noStart}',NULL,'UTC','EEEEEE');
   UPDATE user_profiles SET partner_id='${U.partnerB}' WHERE user_id='${U.partnerA}';UPDATE user_profiles SET partner_id='${U.partnerA}' WHERE user_id='${U.partnerB}';
   INSERT INTO custom_rules(id,user_id,label,sort_order) VALUES('r1','${U.active}','Walk',1),('r2','${U.finished}','Read',1);
   INSERT INTO user_progress(user_id,day_number,rule_id) SELECT '${U.active}',d,'r1' FROM generate_series(1,9) d;
   INSERT INTO user_progress(user_id,day_number,rule_id) SELECT '${U.finished}',d,'r2' FROM generate_series(1,60) d;
   INSERT INTO user_progress(user_id,day_number,rule_id) VALUES('${U.orphan}',1,'gone'),('${U.partnerB}',1,'x'),('${U.noStart}',1,'x');
   INSERT INTO daily_reflections(user_id,day_number,content) VALUES('${U.active}',1,'Kept'),('${U.finished}',60,'Done'),('${U.orphan}',1,'Orphan');`);
  const before={};for(const t of ['auth.users','user_profiles','user_progress','daily_reflections','custom_rules'])before[t]=await count(db,t);

  const files=readdirSync(new URL('supabase/migrations/',root)).filter(f=>f.endsWith('.sql')).sort();
  assert.equal(files.length,13);
  for(const file of files)await db.exec(read('supabase/migrations/'+file));

  // No legacy row is lost or rewritten beyond the additive season stamp.
  for(const t of Object.keys(before))assert.equal(await count(db,t),before[t],t);
  assert.equal(await count(db,'user_progress p JOIN user_profiles u USING(user_id) WHERE p.season_started_at IS DISTINCT FROM u.start_date'),0);
  assert.equal(await count(db,"user_progress WHERE season_started_at IS NULL"),2); // orphan + NULL start_date
  // Every account that had started the programme keeps access; nobody else gains it.
  assert.equal(await count(db,"momentum_subscriptions WHERE legacy_access AND status='legacy'"),5);
  assert.equal(await count(db,`momentum_subscriptions WHERE user_id IN ('${U.orphan}','${U.bare}')`),0);

  // An existing mid-season member can read history, record today, and edit an earlier reflection.
  await as(db,'authenticated',U.active);
  assert.equal(await count(db,'user_progress'),9);assert.equal(await count(db,'daily_reflections'),1);
  await db.exec(`INSERT INTO user_progress(user_id,day_number,rule_id,season_started_at) SELECT user_id,10,'r1',start_date FROM user_profiles`);
  await assert.rejects(db.exec(`INSERT INTO user_progress(user_id,day_number,rule_id,season_started_at) SELECT user_id,11,'r1',start_date FROM user_profiles`),/current active/);
  await db.exec(`UPDATE daily_reflections SET content='Edited' WHERE day_number=1`);
  // A client built before these migrations omits the season stamp and is refused rather than corrupting data.
  await assert.rejects(db.exec(`INSERT INTO user_progress(user_id,day_number,rule_id) VALUES('${U.active}',10,'old-client')`),/season changed/);
  await assert.rejects(db.exec('SELECT get_partner_progress()'),/permission denied/);
  await assert.rejects(db.exec("SELECT link_partner_by_code('BBBBBB')"),/permission denied/);
  await assert.rejects(db.exec(`SELECT get_email_for_user('${U.finished}')`),/does not exist/);
  await assert.rejects(db.exec('SELECT delete_own_account()'),/does not exist/);
  await assert.rejects(db.exec(`SELECT delete_momentum_account('${U.active}')`),/permission denied/);
  await assert.rejects(db.exec(`SELECT begin_momentum_billing('${U.active}',false)`),/permission denied/);
  await assert.rejects(db.exec(`SELECT ensure_momentum_checkout('${U.active}')`),/permission denied/);
  await assert.rejects(db.exec(`UPDATE momentum_subscriptions SET legacy_access=true`),/permission denied/);
  // Store purchase records are invisible to the app and cannot be forged from it.
  await assert.rejects(db.exec('SELECT * FROM momentum_native_purchases'),/permission denied/);
  await assert.rejects(db.exec(`INSERT INTO momentum_native_purchases(store,purchase_id,user_id,product,entitled) VALUES('app_store','forged','${U.active}','monthly',true)`),/permission denied/);

  // A member whose 60 days ended long ago can archive and begin again with nothing lost.
  await as(db,'authenticated',U.finished);
  await assert.rejects(db.exec(`INSERT INTO user_progress(user_id,day_number,rule_id,season_started_at) SELECT user_id,1,'r2',start_date FROM user_profiles`),/current active/);
  await db.exec(`SELECT archive_and_start_season('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')`);
  const archive=(await db.query('SELECT jsonb_array_length(progress) AS days,jsonb_array_length(reflections) AS notes FROM momentum_season_archives')).rows[0];
  assert.deepEqual([archive.days,archive.notes],[60,1]);
  await db.exec(`INSERT INTO user_progress(user_id,day_number,rule_id,season_started_at) SELECT user_id,1,'r2',start_date FROM user_profiles`);

  // A profile with no start date is not stranded: starting a season repairs it.
  await as(db,'authenticated',U.noStart);
  await db.exec(`SELECT archive_and_start_season('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')`);
  await db.exec(`INSERT INTO user_progress(user_id,day_number,rule_id,season_started_at) SELECT user_id,1,'x',start_date FROM user_profiles`);

  // An account that never started has no paid access and cannot write programme data.
  await as(db,'authenticated',U.bare);
  await db.exec(`INSERT INTO user_profiles(user_id) VALUES('${U.bare}')`);
  await assert.rejects(db.exec(`INSERT INTO user_progress(user_id,day_number,rule_id,season_started_at) SELECT user_id,1,'x',start_date FROM user_profiles`),/row-level security/);
  await assert.rejects(db.exec(`INSERT INTO momentum_practices(user_id,normal_action,fallback_action,cue) VALUES('${U.bare}','a','b','c')`),/row-level security/);

  // Signed-out callers reach nothing new.
  await as(db,'anon');
  for(const t of ['momentum_subscriptions','momentum_season_archives','momentum_native_purchases'])await assert.rejects(db.exec(`SELECT * FROM ${t}`),/permission denied/);
  assert.equal(await count(db,'momentum_practices'),0);
  await assert.rejects(db.exec(`SELECT delete_momentum_account('${U.active}')`),/permission denied/);
  await assert.rejects(db.exec('SELECT get_partner_progress()'),/permission denied/);
  await assert.rejects(db.exec('SELECT set_momentum_pause(true)'),/Active access required/);
  await assert.rejects(db.exec(`SELECT archive_and_start_season('cccccccc-cccc-4ccc-8ccc-cccccccccccc')`),/Authentication required/);

  // The server role can delete a partnered account without breaking the partner's row.
  await as(db,'service_role');
  await db.exec(`SELECT delete_momentum_account('${U.partnerA}')`);
  await db.exec('RESET ROLE');
  assert.equal(await count(db,`auth.users WHERE id='${U.partnerA}'`),0);
  assert.equal(await count(db,`user_profiles WHERE user_id='${U.partnerB}' AND partner_id IS NULL`),1);
  assert.equal(await count(db,`momentum_subscriptions WHERE user_id='${U.partnerA}'`),0);
  // One store subscription belongs to one account, and leaves with that account.
  await db.exec(`INSERT INTO momentum_native_purchases(store,purchase_id,user_id,product,entitled) VALUES('app_store','1000001','${U.active}','monthly',true)`);
  await assert.rejects(db.exec(`INSERT INTO momentum_native_purchases(store,purchase_id,user_id,product,entitled) VALUES('app_store','1000001','${U.finished}','monthly',true)`),/duplicate key/);
  await assert.rejects(db.exec(`INSERT INTO momentum_native_purchases(store,purchase_id,user_id,product,entitled) VALUES('test_store','x','${U.active}','monthly',true)`),/check constraint/);
  await db.exec(`SELECT delete_momentum_account('${U.active}')`);
  assert.equal(await count(db,'momentum_native_purchases'),0);
 } finally {await db.close();}
});
