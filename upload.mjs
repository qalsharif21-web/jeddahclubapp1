import {getStore} from "@netlify/blobs";
import {sessionUser,json} from "./_common.mjs";
import crypto from "node:crypto";
export default async req=>{const u=await sessionUser(req);if(!u)return json({error:"غير مصرح"},401);if(req.method!=="POST")return json({error:"Method not allowed"},405);const form=await req.formData();const file=form.get("file");if(!(file instanceof File))return json({error:"لم يتم اختيار ملف"},400);if(file.size>5*1024*1024)return json({error:"الحد الأقصى للمرفق 5MB"},400);const key=`${Date.now()}-${crypto.randomUUID()}`;const store=getStore("jeddah-club-files");await store.set(key,file,{metadata:{name:file.name,type:file.type||"application/octet-stream",owner:u.username,uploadedAt:Date.now()}});return json({key,name:file.name})};
