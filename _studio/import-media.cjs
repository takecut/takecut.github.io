/* Explicit, repeatable media import. Original supplied files are never modified. */
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const [inputDirectory, manifestFile] = process.argv.slice(2);
assert.ok(inputDirectory && manifestFile, 'Usage: node _studio/import-media.cjs INPUT_DIRECTORY MANIFEST_JSON');
const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
const run = args => execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], {stdio:'inherit'});
for (const folder of ['videos','posters','previews']) fs.mkdirSync(path.join(root, 'assets', folder), {recursive:true});
for (const entry of manifest) {
  assert.match(entry.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.equal(path.basename(entry.file), entry.file, 'Input must be a filename');
  assert.ok(Number.isFinite(entry.posterAt) && entry.posterAt >= 0);
  assert.ok(Number.isFinite(entry.previewAt) && entry.previewAt >= 0);
  const input = path.resolve(inputDirectory, entry.file);
  assert.ok(fs.existsSync(input), 'Missing ' + entry.file);
  const output = path.join(root, 'assets/videos', entry.id + '.mp4');
  assert.notEqual(input, output);
  // Lossless remux: retain video/audio, discard editor metadata tracks, move the index first.
  run(['-i',input,'-map','0:v:0','-map','0:a:0?','-c','copy','-map_metadata','-1','-movflags','+faststart',output]);
  for (const width of [480,960]) {
    run(['-ss',String(entry.posterAt),'-i',input,'-frames:v','1','-vf',`scale='min(${width},iw)':-2`,'-c:v','libwebp','-quality','82',path.join(root,'assets/posters',entry.id+'-'+width+'.webp')]);
  }
  run(['-ss',String(entry.previewAt),'-i',input,'-t','6','-an','-sn','-dn','-vf',"scale='if(gt(iw,ih),640,-2)':'if(gt(iw,ih),-2,640)',fps=24",'-c:v','libx264','-crf','26','-preset','medium','-pix_fmt','yuv420p','-map_metadata','-1','-movflags','+faststart',path.join(root,'assets/previews',entry.id+'.mp4')]);
  console.log('Prepared ' + entry.id);
}
