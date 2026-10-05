import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
test('old installed clients cannot link or read partner progress after privacy migration',async()=>{
 const db=new PGlite();
 try {
  await db.exec(`CREATE ROLE anon;CREATE ROLE authenticated;CREATE SCHEMA auth;CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT current_setting('test.uid')::uuid $$;CREATE TABLE user_profiles(user_id uuid PRIMARY KEY);CREATE TABLE user_progress(user_id uuid,day_number int);`);
  for(const file of ['phase5_migration.sql','phase8_migration.sql'])await db.exec(readFileSync(new URL('../'+file,import.meta.url),'utf8'));
  const a='00000000-0000-0000-0000-000000000001',b='00000000-0000-0000-0000-000000000002';
  await db.exec(`INSERT INTO user_profiles VALUES ('${a}','AAAAAA',null),('${b}','BBBBBB',null);INSERT INTO user_progress VALUES('${b}',1);SET test.uid='${a}';SELECT link_partner_by_code('BBBBBB');UPDATE user_profiles SET partner_id=null WHERE user_id='${b}';`);
  assert.equal((await db.query('SELECT get_partner_progress() AS n')).rows[0].n,1);
  await db.exec(readFileSync(new URL('../supabase/migrations/202610030011_disable_partner_sharing.sql',import.meta.url),'utf8'));
  await db.exec('SET ROLE authenticated');
  await assert.rejects(db.exec('SELECT get_partner_progress()'),/permission denied/);
  await assert.rejects(db.exec("SELECT link_partner_by_code('BBBBBB')"),/permission denied/);
  await db.exec('RESET ROLE;SET ROLE anon');
  await assert.rejects(db.exec('SELECT get_partner_progress()'),/permission denied/);
 } finally {await db.close();}
});
