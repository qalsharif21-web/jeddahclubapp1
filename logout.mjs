import {store,cookieToken,json} from "./_common.mjs";
export default async req=>{const t=cookieToken(req);if(t)await store.delete(`session/${t}`);return new Response(JSON.stringify({ok:true}),{headers:{"content-type":"application/json","set-cookie":"jeddah_session=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0"}})};
