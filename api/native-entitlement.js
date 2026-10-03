import {createClient} from '@supabase/supabase-js';
import {identity,allowClient} from './_lib/billing.js';
import {reconcileNative} from './_lib/nativeAccess.js';
export default async function handler(req,res){if(allowClient(req,res))return;if(req.method!=='POST')return res.status(405).end();try{const db=createClient(process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});const user=await identity(req,db);await reconcileNative(db,user.id);return res.json({reconciled:true})}catch{return res.status(503).json({error:'Purchase verification is unavailable. Your store receipt can be restored when the connection returns.'})}}
