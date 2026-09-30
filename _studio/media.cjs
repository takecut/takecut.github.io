// One-time media derivatives. Originals are never overwritten.
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const sharp = require(process.env.SHARP_PATH || 'sharp');
const root = path.resolve(__dirname,'..');
const legacy = require('./legacy.json');
const out = path.join(root,'assets');
const encode = process.env.FFMPEG_PATH || 'ffmpeg';
(async()=>{
  for(const dir of ['posters','previews','images'])fs.mkdirSync(path.join(out,dir),{recursive:true});
  const featured=['ia-marca','produto-ia-chaveiros','reels-esmalteria','youtube-narrativo','criativo-trafego-pago-3d'];
  const compressed={'/video1.mp4':'/video1c.mp4','/video4.mp4':'/video4c.mp4','/video5.mp4':'/video5c.mp4','/videor.mp4':'/videorc.mp4','/videor2.mp4':'/videor2c.mp4'};
  const projects=[];
  for(const [index,p] of legacy.projects.entries()){
    const info=legacy.assets.find(a=>'/'+a.file===p.video);
    const orientation=info.width===info.height?'square':info.width>info.height?'horizontal':'vertical';
    const categories=[...(p.format==='ia'?['IA']:[]),...(p.niche==='produto'?['Produto']:[]),...(p.id==='conteudo-social'?['Automotive']:[]),...(p.format==='reels'?['Social']:[]),...(p.niche==='turismo'?['Turismo']:[]),...(p.format==='youtube'?['YouTube']:[]),...(p.format==='institucional'?['Institucional']:[]),...(['comerciais','ia'].includes(p.format)?['Publicidade']:[])];
    const objectives=p.objective==='vender'?['vender','atencao']:p.objective==='criar-impossivel'?['impressionar','atencao']:p.objective==='prender-atencao'?['atencao','vender']:p.format==='emocionais'?['emocionar']:['explicar','impressionar'];
    for(const width of [480,960]){
      const target=path.join(out,'posters',p.id+'-'+width+'.webp');
      if(!fs.existsSync(target))await sharp(path.join(root,p.thumbnail)).resize({width,withoutEnlargement:true}).webp({quality:82}).toFile(target);
    }
    const preview=path.join(out,'previews',p.id+'.mp4');
    if(!fs.existsSync(preview))execFileSync(encode,['-hide_banner','-loglevel','error','-y','-i',path.join(root,p.video),'-t','6','-vf',`scale=${orientation==='horizontal'?720:360}:-2,fps=24`,'-an','-c:v','libx264','-preset','fast','-crf','30','-pix_fmt','yuv420p','-movflags','+faststart',preview],{windowsHide:true});
    projects.push({id:p.id,title:p.title,slug:p.id,year:'',client:'',category:categories,objective:objectives,format:p.format,thumbnail:'/assets/posters/'+p.id+'-960.webp',thumbnailSmall:'/assets/posters/'+p.id+'-480.webp',previewVideo:'/assets/previews/'+p.id+'.mp4',fullVideo:compressed[p.video]||p.video,orientation,width:info.width,height:info.height,duration:info.duration,featured:featured.includes(p.id),description:p.description,shortTitle:p.shortTitle,techniques:p.techniques,order:index+1});
    console.log('Prepared '+p.id);
  }
  // Data is the authoring source, shared by the static page builder and browser.
  const catalog=path.join(root,'assets/projects.json');
  if(!fs.existsSync(catalog))fs.writeFileSync(catalog,JSON.stringify(projects,null,2)+'\n');
  const images=['bg-poster-desktop.jpg','bg-poster-mobile.jpg',...legacy.pages['produtos/index.html'].items.map(i=>i.image.slice(1)),...legacy.pages['index.html'].clients.map(c=>c.image.slice(1))];
  for(const file of images){
    const target=path.join(out,'images',path.parse(file).name+'.webp');
    if(!fs.existsSync(target))await sharp(path.join(root,file)).resize({width:file.includes('bg-poster')?1600:800,withoutEnlargement:true}).webp({quality:84}).toFile(target);
  }
})();
