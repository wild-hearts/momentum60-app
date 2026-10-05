import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
export function databaseService() {
 const url=process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
 if(!url || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Service is not configured');
 return createClient(url,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
}
export function stripeService() {
 if(!process.env.STRIPE_SECRET_KEY) throw new Error('Web billing is not configured');
 return new Stripe(process.env.STRIPE_SECRET_KEY);
}
export function services() {
 return {db:databaseService(),stripe:stripeService()};
}
export async function identity(req,db) {
 const token=req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
 if(!token) throw new Error('Sign in required');
 const {data,error}=await db.auth.getUser(token);
 if(error || !data.user) throw new Error('Sign in required');
 return data.user;
}
export function siteOrigin(){const url=new URL(process.env.APP_ORIGIN || 'https://challenge.themomentumrule.com');if(url.protocol!=='https:')throw Error('HTTPS origin required');return url.origin;}
export function requestBody(req){return typeof req.body==='string'?JSON.parse(req.body):req.body || {};}
export function allowClient(req,res){
 const origin=req.headers.origin;
 const allowed=new Set(['capacitor://localhost','http://localhost','https://localhost',siteOrigin()]);
 if(origin&&allowed.has(origin)){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type');res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');}
 if(req.method==='OPTIONS'){res.status(204).end();return true;}return false;
}
