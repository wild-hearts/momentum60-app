import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const text=readFileSync(new URL('../src/context/AuthContext.jsx',import.meta.url),'utf8');
const body=text.split('  const fetchUserData = async (userId) => {')[1].split('\n  const updateRules')[0].replace(/\n  };\s*$/,'');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
function fixture({dirty=false, draft=null}={}) {
 let journal=dirty?{1:'new'}:{},finish; const journalDirty={current:dirty?{'a:1':true}:{}},journalEdits={current:{}},currentUserId={current:'a'};
 const response=new Promise(r=>finish=r);const supabase={from:table=>{const q={select:()=>q,order:async()=>({data:[]}),single:async()=>({data:{}}),eq:()=>q,then:(yes,no)=>(table==='daily_reflections'?response:Promise.resolve({data:[]})).then(yes,no)};return q}};
 const scope={fetchEpoch:{current:0},currentUserId,journalEdits,journalDirty,localStorage:{getItem:key=>key.endsWith(':1')?draft:null},draftKey:(id,day)=>`${id}:${day}`,setDailyReflections:x=>journal=typeof x==='function'?x(journal):x,setJournalStatus:()=>{},setLoading:()=>{},supabase,setCustomRules:()=>{},setUserData:()=>{},setUserProfile:()=>{},setTeamMember:()=>{},cacheSnapshot:()=>{},readSnapshot:()=>({dailyReflections:{1:'cached'}}),setUsingCachedData:()=>{},setSaveError:()=>{}};
 const run=new AsyncFunction('userId',...Object.keys(scope),body);
 return {run:()=>run('a',...Object.values(scope)),finish,get:()=>journal,edit:()=>{journal={1:'latest'};journalEdits.current['a:1']=1;journalDirty.current['a:1']=true}};
}
test('pending in-memory text survives older server response without local storage',async()=>{const f=fixture({dirty:true});const pending=f.run();f.finish({data:[{day_number:1,content:'old'}]});await pending;assert.equal(f.get()[1],'new')});
test('edit during fetch survives cached fallback',async()=>{const f=fixture({draft:'restored'});const pending=f.run();f.edit();f.finish({get data(){throw Error('offline')}});await pending;assert.equal(f.get()[1],'latest')});
test('draft restores before network response',async()=>{const f=fixture({draft:'recovered'});const pending=f.run();assert.equal(f.get()[1],'recovered');f.finish({data:[]});await pending;assert.equal(f.get()[1],'recovered')});
