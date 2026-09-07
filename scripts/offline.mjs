import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=process.env.DEPLOY_TARGET==='github-pages'?'dist/pages':'dist/client';
const base=(process.env.NEXT_PUBLIC_BASE_PATH||'').replace(/\/$/,'');
if(base&&!/^\/[a-zA-Z0-9._/-]+$/.test(base))throw new Error('Invalid base path');
const prefix='edzesnaplom-'+createHash('sha256').update(base).digest('hex').slice(0,8)+'-';
const manifest=JSON.parse(await readFile('public/manifest.webmanifest','utf8'));
manifest.id=manifest.scope=manifest.start_url=base+'/';
manifest.icons=manifest.icons.map(icon=>({...icon,src:base+icon.src}));
await writeFile(path.join(root,'manifest.webmanifest'),JSON.stringify(manifest));
await writeFile(path.join(root,'.nojekyll'),'');
async function walk(dir){let files=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);files.push(...(e.isDirectory()?await walk(p):[p]));}return files;}
const files=(await walk(root)).filter(p=>!p.endsWith('sw.js')&&!p.endsWith('.map')&&!p.endsWith('.nojekyll')&&!p.includes('.vite'));
const hash=createHash('sha256');for(const f of files)hash.update(await readFile(f));
const urls=files.map(f=>base+'/'+path.relative(root,f).replaceAll('\\','/'));
urls.push(base+'/');
const code=`const PREFIX=${JSON.stringify(prefix)};
const CACHE=PREFIX+${JSON.stringify(hash.digest('hex').slice(0,12))};
const BASE=${JSON.stringify(base+'/')};
const ASSETS=${JSON.stringify(urls)};
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(BASE))return;
if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.match(BASE+'index.html')));return;}
event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));});
`;
await writeFile(path.join(root,'sw.js'),code);
console.log(`Offline shell: ${urls.length} assets cached at ${base||'/'}.`);
