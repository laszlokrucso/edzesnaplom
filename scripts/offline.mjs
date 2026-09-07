import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root='dist/client';
async function walk(dir){let files=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);files.push(...(e.isDirectory()?await walk(p):[p]));}return files;}
const files=(await walk(root)).filter(p=>!p.endsWith('sw.js')&&!p.endsWith('.map')&&!p.includes('.vite'));
const hash=createHash('sha256');for(const f of files)hash.update(await readFile(f));
const urls=files.map(f=>'/'+path.relative(root,f).replaceAll('\\','/'));
urls.push('/');
const code=`const CACHE='edzesnaplom-${hash.digest('hex').slice(0,12)}';
const ASSETS=${JSON.stringify(urls)};
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('edzesnaplom-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.match('/index.html')));return;}
event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));});
`;
await writeFile(path.join(root,'sw.js'),code);
console.log(`Offline shell: ${urls.length} assets cached.`);

