import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

export const store=getStore("jeddah-club-prod");
const SESSION="jeddah-session";

export async function getState(){
  let s=await store.get("state",{type:"json"});
  // One-time migration from the previous demo seed.
  // After schemaVersion=3 is written, user-created data is never reset by deployment.
  if(!s || s.schemaVersion!==3){
    s={
      schemaVersion:3,
      players:[],
      requests:[],
      departmentEmployees:[
        {name:'سعيد الزهراني',department:'الإدارة المالية',job:'مسؤول مالي'},
        {name:'نورة الغامدي',department:'الموارد البشرية',job:'مسؤول موارد بشرية'},
        {name:'خالد العتيبي',department:'الإدارة القانونية',job:'مستشار قانوني'},
        {name:'عبدالله الحربي',department:'الحوكمة والامتثال والمخاطر',job:'مسؤول حوكمة وامتثال'},
        {name:'محمد القحطاني',department:'إدارة الرئيس التنفيذي',job:'منسق إدارة الرئيس التنفيذي'}
      ],
      subAccounts:[],
      users:[]
    };
    await store.setJSON("state",s);
  }
  // Backward compatibility: normalize legacy employee arrays to objects.
  s.departmentEmployees=(s.departmentEmployees||[]).map(e=>Array.isArray(e)?{name:e[0],department:e[1],job:e[2]}:e);
  return s;
}
export async function putState(s){await store.setJSON("state",s);return s}
export function cookieToken(req){const c=req.headers.get("cookie")||"";const m=c.match(/jeddah_session=([^;]+)/);return m?.[1]||null}
export async function sessionUser(req){const t=cookieToken(req);if(!t)return null;return await store.get(`session/${t}`,{type:"json"})}
export function hash(p,salt=crypto.randomBytes(16).toString("hex")){return salt+":"+crypto.scryptSync(p,salt,64).toString("hex")}
export function verify(p,stored){try{const [salt,h]=stored.split(":");const a=crypto.scryptSync(p,salt,64).toString("hex");return crypto.timingSafeEqual(Buffer.from(a),Buffer.from(h))}catch{return false}}
export function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8",...headers}})}
export async function requireUser(req){const u=await sessionUser(req);if(!u)throw new Response(JSON.stringify({error:"غير مصرح. سجل الدخول أولاً"}),{status:401,headers:{"content-type":"application/json"}});return u}
