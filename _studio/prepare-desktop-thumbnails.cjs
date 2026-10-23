/* Offline derivatives from existing still images only. No video reads or AI synthesis. */
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const sharp=require('sharp');
const root=path.resolve(__dirname,'..');
const projects=require('../assets/projects.json');
const legacy=require('./legacy.json');
const file=p=>path.join(root,p);
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(file(p))).digest('hex');
async function info(p){const m=await sharp(file(p)).metadata();return {path:p,width:m.width,height:m.height,format:m.format,bytes:fs.statSync(file(p)).size,sha256:hash(p)};}
async function pixels(p,w,h){return sharp(file(p)).resize(w,h,{fit:'fill',fastShrinkOnLoad:false}).removeAlpha().raw().toBuffer();}
function rmse(a,b){let n=0;for(let i=0;i<a.length;i++)n+=(a[i]-b[i])**2;return Math.sqrt(n/a.length);}
(async()=>{
  fs.mkdirSync(file('/assets/posters/desktop'),{recursive:true});
  const records=[];
  for(const p of projects){
    const current=await info(p.thumbnail),small=await info(p.thumbnailSmall);
    // ia-marca was replaced by a different project; its legacy still is NOT the same image.
    const original=p.id==='ia-marca'?null:legacy.projects.find(x=>x.id===p.id)?.thumbnail;
    const record={id:p.id,title:p.title,current,small,original:original?await info(original):null,variants:[]};
    if(original){
      const source=record.original;
      record.compositionRmse=+rmse(await pixels(original,64,64),await pixels(p.thumbnail,64,64)).toFixed(3);
      assert.ok(record.compositionRmse<12,p.id+': source must depict the identical still');
      const widths=[...new Set([640,960,1280].filter(w=>w<source.width*.8).concat(source.width))];
      for(const width of widths){
        const output='/assets/posters/desktop/'+p.id+'.desktop-'+width+'.webp';
        await sharp(file(original)).resize({width,withoutEnlargement:true}).webp({quality:92,effort:6,smartSubsample:true}).toFile(file(output));
        record.variants.push(await info(output));
      }
      const reference=await pixels(original,source.width,source.height);
      record.originalErrorBefore=+rmse(reference,await pixels(p.thumbnail,source.width,source.height)).toFixed(3);
      record.originalErrorAfter=+rmse(reference,await pixels(record.variants.at(-1).path,source.width,source.height)).toFixed(3);
      assert.ok(record.originalErrorAfter<record.originalErrorBefore,p.id+': reject derivative that is less faithful');
      record.result=source.width>current.width?'native-resolution-restored':'less-lossy-from-original';
    }else{
      record.result='source-limited';
      record.limitation='Only existing WebP stills are available. No installed faithful super-resolution model. No enlargement or replacement frame was created.';
    }
    records.push(record);
  }
  fs.writeFileSync(path.join(__dirname,'desktop-thumbnails.json'),JSON.stringify({breakpoint:901,method:'Existing original stills, WebP quality 92, no enlargement, no sharpening, no generated details',records},null,2)+'\n');
  console.log(records.map(r=>r.id+': '+r.result).join('\n'));
})().catch(e=>{console.error(e);process.exitCode=1});
