import {cp,mkdir,readdir,rm,stat} from 'node:fs/promises';
import path from 'node:path';
if(process.env.DEPLOY_TARGET==='github-pages'){
  const source=path.resolve('dist/client'),destination=path.resolve('dist/pages');
  const base=(process.env.NEXT_PUBLIC_BASE_PATH||'').replace(/^\/+|\/+$/g,'');
  if(base&&!/^[a-zA-Z0-9._/-]+$/.test(base))throw new Error('Invalid Pages path');
  const assets=path.resolve(source,base,'_next');
  if(!assets.startsWith(source+path.sep)||destination!==path.join(process.cwd(),'dist','pages'))throw new Error('Build paths must remain inside the project');
  await stat(path.join(source,'index.html')); // A skipped prerender must fail deployment.
  await stat(assets);
  // GitHub mounts the artifact at /repository/; Vinext writes prefixed assets
  // under that directory as well. Remove the extra directory level in staging.
  await rm(destination,{recursive:true,force:true});
  await mkdir(destination,{recursive:true});
  for(const entry of await readdir(source,{withFileTypes:true})){
    if(['.vite','_next','sw.js',base.split('/')[0]].includes(entry.name))continue;
    await cp(path.join(source,entry.name),path.join(destination,entry.name),{recursive:true});
  }
  await cp(assets,path.join(destination,'_next'),{recursive:true});
}
