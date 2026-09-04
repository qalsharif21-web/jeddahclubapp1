import crypto from 'node:crypto';
import {getState,putState,requireUser,json} from "./_common.mjs";

function canManage(u){ return u?.role==="main"; }

export default async req=>{
  try{
    const u=await requireUser(req);
    if(!canManage(u)) return json({error:"هذه العملية متاحة للحساب الرئيسي فقط"},403);
    const s=await getState();

    if(req.method==="GET") return json({employees:s.departmentEmployees||[]});

    if(req.method==="POST"){
      const {name,department,job}=await req.json();
      if(!name?.trim()||!department?.trim()) return json({error:"اسم الموظف والإدارة مطلوبان"},400);
      const employee={id:crypto.randomUUID(),name:name.trim(),department:department.trim(),job:(job||"").trim()||"—",createdAt:new Date().toISOString()};
      s.departmentEmployees=[...(s.departmentEmployees||[]),employee];
      await putState(s);
      return json({employees:s.departmentEmployees});
    }

    if(req.method==="PATCH"){
      const {id,name,department,job}=await req.json();
      const list=s.departmentEmployees||[];
      const i=list.findIndex(e=>String(e.id)===String(id));
      if(i<0) return json({error:"الموظف غير موجود"},404);
      list[i]={...list[i],name:(name||list[i].name).trim(),department:(department||list[i].department).trim(),job:(job||list[i].job).trim()||"—",updatedAt:new Date().toISOString()};
      await putState(s);
      return json({employees:list});
    }

    if(req.method==="DELETE"){
      const id=new URL(req.url).searchParams.get("id");
      const list=s.departmentEmployees||[];
      s.departmentEmployees=list.filter(e=>String(e.id)!==String(id));
      await putState(s);
      return json({employees:s.departmentEmployees});
    }

    return json({error:"Method not allowed"},405);
  }catch(e){ return e instanceof Response?e:json({error:e.message||"خطأ"},500); }
};
