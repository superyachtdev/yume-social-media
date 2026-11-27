// Yume by Nyara carousel renderer (1080x1350). Used by scripts/build.py in headless Chrome.
window.__yume = (() => {
const W=1080,H=1350;
const SERIF='"Cormorant Garamond", "Times New Roman", serif', SANS='Manrope, -apple-system, sans-serif';
const HOME='M4 21V10l8-6 8 6v11M9 21v-6a3 3 0 0 1 6 0v6';
async function loadImg(url){const b=await fetch(url).then(r=>{if(!r.ok)throw new Error('img '+r.status+' '+url);return r.blob()});return await createImageBitmap(b);}
function cover(ctx,img,x,y,w,h,fy=0.5){const s=Math.max(w/img.width,h/img.height);const iw=img.width*s,ih=img.height*s;ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(img,x+(w-iw)/2,y+(h-ih)*fy,iw,ih);ctx.restore();}
function grad(ctx,h,rgb,stops){const g=ctx.createLinearGradient(0,0,0,h);stops.forEach(([p,a])=>g.addColorStop(p,`rgba(${rgb},${a})`));ctx.fillStyle=g;ctx.fillRect(0,0,W,h);}
function setF(ctx,f,ls=0){ctx.font=f;ctx.letterSpacing=ls+'px';}
// rich wrap: runs=[{t,font,color,ls}] -> lines of [{text,font,color,ls,w}]
function wrap(ctx,runs,maxW){const words=[];runs.forEach(r=>r.t.split(/(\s+)/).filter(s=>s.length).forEach(s=>words.push({...r,t:s})));
 const lines=[[]];let lw=0;for(const wd of words){setF(ctx,wd.font,wd.ls||0);const w=ctx.measureText(wd.t).width;const sp=/^\s+$/.test(wd.t);
  if(!sp&&lw+w>maxW&&lines[lines.length-1].length){lines.push([]);lw=0;}
  if(sp&&lines[lines.length-1].length===0)continue;lines[lines.length-1].push({...wd,w});lw+=w;}
 return lines.map(l=>{while(l.length&&/^\s+$/.test(l[l.length-1].t))l.pop();return l;});}
function block(ctx,runs,maxW,lh){const lines=wrap(ctx,runs,maxW);return{h:lines.length*lh,draw:(x,y)=>{lines.forEach((l,i)=>{let cx=x;l.forEach(p=>{setF(ctx,p.font,p.ls||0);ctx.fillStyle=p.color;ctx.textBaseline='alphabetic';ctx.fillText(p.t,cx,y+i*lh+lh*0.78);cx+=p.w;});});}};}
function pill(ctx,label){setF(ctx,`500 20px ${SANS}`,2);const tw=ctx.measureText(label).width;const w=tw+36,h=40,x=W-48-w,y=44;ctx.fillStyle='rgba(15,15,15,0.42)';ctx.beginPath();ctx.roundRect(x,y,w,h,20);ctx.fill();ctx.fillStyle='#fff';ctx.textBaseline='middle';ctx.fillText(label,x+18,y+h/2+1);}
function icon(ctx,color){ctx.save();ctx.translate(48,44);ctx.scale(44/24,44/24);ctx.strokeStyle=color;ctx.lineWidth=1.2;ctx.lineJoin='round';ctx.stroke(new Path2D(HOME));ctx.restore();}
function footer(ctx,credit,cc,hc){const cr=block(ctx,[{t:credit,font:`400 17px ${SANS}`,color:cc}],640,22);return{h:cr.h,draw:(x,y)=>{cr.draw(x,y);setF(ctx,`600 18px ${SANS}`,3);ctx.fillStyle=hc;ctx.textBaseline='alphabetic';const t='@YUMEBYNYARA';ctx.fillText(t,x+912-ctx.measureText(t).width,y+cr.h-4);}};}
function stack(ctx,items,bottom=60,x=84){const total=items.reduce((s,it)=>s+it.gap+it.b.h,0);let y=H-bottom-total;items.forEach(it=>{y+=it.gap;it.b.draw(x,y);y+=it.b.h;});return H-bottom-total;}
function spacer(h){return{h,draw(){}}}
async function render(s,n,total){
 const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');
 const img=await loadImg(s.img);
 const label=String(n).padStart(2,'0')+' / '+String(total).padStart(2,'0');
 const H1=(plain,it,size,lh,col,itcol)=>block(ctx,[{t:plain+' ',font:`400 ${size}px ${SERIF}`,color:col,ls:-size/62},{t:it,font:`italic 400 ${size}px ${SERIF}`,color:itcol||col,ls:-size/62}],912,lh);
 if(s.kind==='hook'){
  ctx.fillStyle='#1A1511';ctx.fillRect(0,0,W,H);cover(ctx,img,0,0,W,H,s.fy??0.5);
  grad(ctx,H,'26,21,17',[[0,0],[0.30,0],[0.58,0.72],[0.82,1],[1,1]]);icon(ctx,'rgba(255,255,255,0.85)');pill(ctx,label);
  stack(ctx,[
   {gap:0,b:block(ctx,[{t:s.eyebrow,font:`500 21px ${SANS}`,color:'rgba(255,255,255,0.75)',ls:4}],912,28)},
   {gap:22,b:H1(s.h1,s.h1it,124,121,'#FFFFFF','#E9DCCB')},
   {gap:30,b:block(ctx,[{t:s.sub,font:`400 31px ${SANS}`,color:'rgba(255,255,255,0.88)'}],820,43)},
   {gap:34,b:block(ctx,[{t:'SWIPE →',font:`600 20px ${SANS}`,color:'#FFFFFF',ls:4}],912,26)},
   {gap:40,b:footer(ctx,s.credit,'rgba(255,255,255,0.55)','#FFFFFF')}]);
 } else if(s.kind==='cta'){
  ctx.fillStyle='#E9E2D6';ctx.fillRect(0,0,W,H);cover(ctx,img,0,0,W,860,s.fy??0.5);
  grad(ctx,862,'233,226,214',[[0,0],[0.52,0],[0.80,0.9],[0.96,1],[1,1]]);icon(ctx,'#FFFFFF');pill(ctx,label);
  const btn={h:79,draw:(x,y)=>{setF(ctx,`600 26px ${SANS}`,0);const tw=ctx.measureText(s.button).width;ctx.fillStyle='#2B2119';ctx.beginPath();ctx.roundRect(x,y,tw+80,79,40);ctx.fill();ctx.fillStyle='#fff';ctx.textBaseline='middle';ctx.fillText(s.button,x+40,y+40);}};
  stack(ctx,[
   {gap:0,b:block(ctx,[{t:s.eyebrow,font:`500 21px ${SANS}`,color:'#5C5C5C',ls:4}],912,28)},
   {gap:18,b:H1(s.h1,s.h1it,112,110,'#0F0F0F','#4A3A2C')},
   {gap:26,b:block(ctx,[{t:s.body,font:`400 29px ${SANS}`,color:'#2E2B28'}],880,42)},
   {gap:34,b:btn},
   {gap:40,b:footer(ctx,s.credit,'#7A7570','#0F0F0F')}]);
 } else {
  ctx.fillStyle='#F0EEE9';ctx.fillRect(0,0,W,H);cover(ctx,img,0,0,W,860,s.fy??0.5);
  grad(ctx,862,'240,238,233',[[0,0],[0.48,0],[0.78,0.88],[0.96,1],[1,1]]);pill(ctx,label);
  const numRow={h:96,draw:(x,y)=>{setF(ctx,`italic 400 96px ${SERIF}`,0);ctx.fillStyle='#4A3A2C';ctx.textBaseline='alphabetic';const t='N° '+s.num;ctx.fillText(t,x,y+78);const w=ctx.measureText(t).width;setF(ctx,`500 21px ${SANS}`,4);ctx.fillStyle='#5C5C5C';ctx.fillText(s.place,x+w+22,y+78);}};
  stack(ctx,[
   {gap:0,b:numRow},
   {gap:18,b:H1(s.h1,s.h1it,92,92,'#0F0F0F')},
   {gap:14,b:block(ctx,[{t:s.answer,font:`italic 400 46px ${SERIF}`,color:'#4A3A2C'}],912,53)},
   {gap:22,b:block(ctx,[{t:s.body,font:`400 29px ${SANS}`,color:'#2E2B28'}],900,42)},
   {gap:40,b:footer(ctx,s.credit,'#7A7570','#0F0F0F')}]);
 }
 return c;
}
async function fonts(){const fs=[`400 92px "Cormorant Garamond"`,`italic 400 92px "Cormorant Garamond"`,`400 29px Manrope`,`500 21px Manrope`,`600 26px Manrope`];for(const f of fs)await document.fonts.load(f);return fs.map(f=>document.fonts.check(f));}
async function renderAll(slides){await fonts();const out=[];for(let i=0;i<slides.length;i++){const c=await render(slides[i],i+1,slides.length);out.push(c);}window.__yumeCanvases=out;return out.length;}
async function upload(urls){const res=[];for(let i=0;i<urls.length;i++){const b=await new Promise(r=>window.__yumeCanvases[i].toBlob(r,'image/jpeg',0.9));const r=await fetch(urls[i],{method:'PUT',body:b,headers:{'Content-Type':'image/jpeg'}});res.push([r.status,b.size]);}return res;}
function preview(){document.body.innerHTML='';document.body.style.cssText='margin:0;background:#222;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:6px';(window.__yumeCanvases||[]).forEach(c=>{c.style.cssText='width:100%;height:auto;display:block';document.body.appendChild(c);});}
function exportAll(q=0.9){return (window.__yumeCanvases||[]).map(c=>c.toDataURL('image/jpeg',q));}
return {renderAll,upload,preview,fonts,exportAll};
})();