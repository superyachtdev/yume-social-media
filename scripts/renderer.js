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
function icon(ctx,color){ctx.save();ctx.translate(44,40);ctx.scale(48/24,48/24);ctx.strokeStyle=color;ctx.lineWidth=1.2;ctx.lineJoin='round';ctx.stroke(new Path2D(HOME));ctx.restore();}
function footer(ctx,credit,cc,hc){const cr=block(ctx,[{t:credit,font:`400 17px ${SANS}`,color:cc}],640,22);return{h:cr.h,draw:(x,y)=>{cr.draw(x,y);setF(ctx,`600 18px ${SANS}`,3);ctx.fillStyle=hc;ctx.textBaseline='alphabetic';const t='@YUMEBYNYARA';ctx.fillText(t,x+912-ctx.measureText(t).width,y+cr.h-4);}};}
function stack(ctx,items,bottom=60,x=84){const total=items.reduce((s,it)=>s+it.gap+it.b.h,0);let y=H-bottom-total;items.forEach(it=>{y+=it.gap;it.b.draw(x,y);y+=it.b.h;});return H-bottom-total;}
function spacer(h){return{h,draw(){}}}
// Bold style (Nov 2026): full-bleed photo, dark fade, heavy sans headline with a warm accent.
const ACC='#E6D3B8', INK='#FFFFFF';
function shade(ctx){const g=ctx.createLinearGradient(0,0,0,H);[[0,'rgba(10,8,6,0.22)'],[0.12,'rgba(10,8,6,0)'],[0.3,'rgba(10,8,6,0)'],[0.5,'rgba(10,8,6,0.5)'],[0.68,'rgba(10,8,6,0.82)'],[1,'rgba(10,8,6,0.93)']].forEach(([p,c])=>g.addColorStop(p,c));ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
function counter(ctx,n,total){const t=n+'/'+total;setF(ctx,`500 26px ${SANS}`,0);const w=ctx.measureText(t).width+40,h=52,x=W-44-w,y=40;ctx.fillStyle='rgba(40,40,40,0.55)';ctx.beginPath();ctx.roundRect(x,y,w,h,26);ctx.fill();ctx.fillStyle='rgba(255,255,255,0.92)';ctx.textBaseline='middle';ctx.fillText(t,x+20,y+h/2+1);}
function head(ctx,plain,acc,size){const ls=-size*0.03;return block(ctx,[{t:plain+(acc?' ':''),font:`800 ${size}px ${SANS}`,color:INK,ls},{t:acc||'',font:`800 ${size}px ${SANS}`,color:ACC,ls}],920,Math.round(size*1.04));}
function foot(ctx,credit){const cr=block(ctx,[{t:credit,font:`400 19px ${SANS}`,color:'rgba(255,255,255,0.62)'}],700,25);return{h:cr.h,draw:(x,y)=>{cr.draw(x,y);setF(ctx,`600 18px ${SANS}`,2);ctx.fillStyle='rgba(255,255,255,0.8)';ctx.textBaseline='alphabetic';const t='@YUMEBYNYARA';ctx.fillText(t,x+920-ctx.measureText(t).width,y+cr.h-5);}};}
async function render(s,n,total){
 const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');
 const img=await loadImg(s.img);
 ctx.fillStyle='#14110E';ctx.fillRect(0,0,W,H);cover(ctx,img,0,0,W,H,s.fy??0.5);shade(ctx);counter(ctx,n,total);
 const lab=(t)=>block(ctx,[{t:t,font:`600 28px ${SANS}`,color:ACC}],920,36);
 const items=[];
 if(s.kind==='hook'){
  icon(ctx,'rgba(255,255,255,0.9)');
  if(s.eyebrow) items.push({gap:0,b:lab(s.eyebrow)});
  items.push({gap:items.length?16:0,b:head(ctx,s.h1,s.h1it,116)});
  items.push({gap:30,b:block(ctx,[{t:s.sub,font:`400 34px ${SANS}`,color:'rgba(255,255,255,0.92)'}],900,46)});
  items.push({gap:30,b:block(ctx,[{t:'Swipe →',font:`700 30px ${SANS}`,color:INK}],920,38)});
 } else if(s.kind==='cta'){
  icon(ctx,'rgba(255,255,255,0.9)');
  if(s.eyebrow) items.push({gap:0,b:lab(s.eyebrow)});
  items.push({gap:items.length?16:0,b:head(ctx,s.h1,s.h1it,108)});
  items.push({gap:26,b:block(ctx,[{t:s.body,font:`400 32px ${SANS}`,color:'rgba(255,255,255,0.92)'}],900,45)});
  const btn={h:84,draw:(x,y)=>{setF(ctx,`700 28px ${SANS}`,0);const tw=ctx.measureText(s.button).width;ctx.fillStyle=ACC;ctx.beginPath();ctx.roundRect(x,y,tw+84,84,42);ctx.fill();ctx.fillStyle='#1A1511';ctx.textBaseline='middle';ctx.fillText(s.button,x+42,y+43);}};
  items.push({gap:34,b:btn});
 } else {
  const lt=s.label||((s.num?s.num+' · ':'')+(s.place?s.place.charAt(0)+s.place.slice(1).toLowerCase():''));
  items.push({gap:0,b:lab(lt)});
  items.push({gap:16,b:head(ctx,s.h1,s.h1it,92)});
  const runs=[];if(s.answer)runs.push({t:s.answer+' ',font:`700 32px ${SANS}`,color:INK});runs.push({t:s.body,font:`400 32px ${SANS}`,color:'rgba(255,255,255,0.92)'});
  items.push({gap:26,b:block(ctx,runs,920,45)});
 }
 items.push({gap:34,b:foot(ctx,s.credit||'')});
 stack(ctx,items,64,80);
 return c;
}
async function fonts(){const fs=[`800 92px Manrope`,`700 32px Manrope`,`600 28px Manrope`,`400 92px "Cormorant Garamond"`,`italic 400 92px "Cormorant Garamond"`,`400 29px Manrope`,`500 21px Manrope`,`600 26px Manrope`];for(const f of fs)await document.fonts.load(f);return fs.map(f=>document.fonts.check(f));}
async function renderAll(slides){await fonts();const out=[];for(let i=0;i<slides.length;i++){const c=await render(slides[i],i+1,slides.length);out.push(c);}window.__yumeCanvases=out;return out.length;}
async function upload(urls){const res=[];for(let i=0;i<urls.length;i++){const b=await new Promise(r=>window.__yumeCanvases[i].toBlob(r,'image/jpeg',0.9));const r=await fetch(urls[i],{method:'PUT',body:b,headers:{'Content-Type':'image/jpeg'}});res.push([r.status,b.size]);}return res;}
function preview(){document.body.innerHTML='';document.body.style.cssText='margin:0;background:#222;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:6px';(window.__yumeCanvases||[]).forEach(c=>{c.style.cssText='width:100%;height:auto;display:block';document.body.appendChild(c);});}
function exportAll(q=0.9){return (window.__yumeCanvases||[]).map(c=>c.toDataURL('image/jpeg',q));}
return {renderAll,upload,preview,fonts,exportAll};
})();