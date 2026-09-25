"use strict";
(function(){
const CELL=40;
const LEVELS=[
 {name:'Green Reach',theme:'#1c3a2c',deco:'#2f5c3f',path:[[0,3],[4,3],[4,1],[8,1],[8,6],[11,6],[11,3],[15,3]],
  decor:[[1,7,'rock'],[13,1,'bush'],[6,8,'bush'],[9,8,'rock'],[2,1,'bush'],[13,7,'rock']],
  waves:[
   {list:[['grunt',6,700]]},{list:[['grunt',8,600],['runner',2,900]]},
   {list:[['runner',6,500],['grunt',6,600]]},{list:[['grunt',10,500],['tank',2,1400]]},
   {list:[['runner',8,400],['tank',3,1200],['grunt',6,400]]}]},
 {name:'Sun Wastes',theme:'#4a3a1c',deco:'#7a5a2a',path:[[0,1],[6,1],[6,7],[2,7],[2,9],[10,9],[10,2],[15,2]],
  decor:[[4,3,'rock'],[8,6,'bone'],[12,6,'rock'],[0,8,'bone'],[13,8,'rock']],
  waves:[
   {list:[['grunt',8,600]]},{list:[['runner',6,500],['grunt',6,500]]},
   {list:[['tank',3,1300],['grunt',8,450]]},{list:[['runner',10,400],['tank',3,1100]]},
   {list:[['grunt',12,400],['runner',8,350],['tank',4,1000]]}]},
 {name:'Frost Hollow',theme:'#22344a',deco:'#5a7aa0',path:[[0,5],[3,5],[3,1],[7,1],[7,9],[11,9],[11,4],[15,4]],
  decor:[[1,1,'ice'],[5,7,'ice'],[9,2,'rock'],[13,8,'ice'],[13,1,'rock']],
  waves:[
   {list:[['runner',6,500],['grunt',6,600]]},{list:[['tank',4,1200],['grunt',8,450]]},
   {list:[['runner',10,380],['tank',4,1000]]},{list:[['grunt',14,380],['runner',10,350]]},
   {list:[['tank',6,900],['runner',10,320],['grunt',10,320]]}]},
 {name:'Ashen Crater',theme:'#3a1c18',deco:'#7a3020',path:[[0,4],[2,4],[2,8],[6,8],[6,2],[9,2],[9,7],[12,7],[12,3],[15,3]],
  decor:[[4,1,'rock'],[8,9,'bone'],[11,1,'rock'],[14,6,'bone'],[1,8,'rock']],
  waves:[
   {list:[['grunt',10,450],['runner',6,400]]},{list:[['tank',5,1000],['grunt',10,380]]},
   {list:[['runner',12,320],['tank',5,900]]},{list:[['grunt',16,350],['tank',6,850]]},
   {list:[['runner',14,280],['tank',7,800],['grunt',10,300]]}]},
 {name:'Deep Trench',theme:'#182f42',deco:'#2a5a70',path:[[0,8],[3,8],[3,3],[6,3],[6,0],[6,3],[9,3],[9,8],[12,8],[12,2],[15,2]],
  decor:[[1,2,'coral'],[5,6,'coral'],[10,5,'coral'],[13,7,'coral'],[8,1,'coral']],
  waves:[
   {list:[['runner',12,320],['grunt',10,400]]},{list:[['tank',6,850],['runner',10,300]]},
   {list:[['grunt',18,320],['tank',6,800]]},{list:[['runner',16,260],['tank',8,750]]},
   {list:[['tank',9,700],['runner',16,250],['grunt',14,260]]}]},
 {name:'Storm Peak',theme:'#3a3a44',deco:'#8a8aa0',path:[[0,0],[0,9],[5,9],[5,1],[10,1],[10,9],[15,9],[15,5]],
  decor:[[3,4,'ice'],[7,5,'rock'],[12,3,'ice'],[13,7,'rock'],[2,7,'rock']],
  waves:[
   {list:[['grunt',14,340],['runner',12,300]]},{list:[['tank',8,750],['grunt',14,320]]},
   {list:[['runner',18,240],['tank',8,700]]},{list:[['grunt',20,280],['tank',10,650],['runner',12,240]]},
   {list:[['tank',12,600],['runner',20,220],['grunt',16,240]]}]}
];
const TOWERS={
 gunner:{name:'Gunner',cost:50,range:120,dmg:9,rate:400,color:'#5ecbff',proj:'#8fe0ff',up:1.35,req:0},
 sniper:{name:'Sniper',cost:90,range:230,dmg:34,rate:1100,color:'#ffb54c',proj:'#ffd58a',up:1.4,req:0},
 cryo:{name:'Cryo',cost:70,range:100,dmg:3,rate:600,color:'#7ce8d8',proj:'#bff5ea',up:1.3,slow:.5,req:0},
 bomber:{name:'Bomber',dmg:18,cost:110,range:110,rate:900,color:'#ff7a5c',proj:'#ffb199',up:1.35,splash:55,req:0},
 support:{name:'Support',cost:80,range:95,dmg:0,rate:0,color:'#c17bff',proj:'#c17bff',up:1.3,buff:.3,req:0},
 flame:{name:'Flame',cost:130,range:85,dmg:6,rate:180,color:'#ff5a2e',proj:'#ffb14a',up:1.3,splash:34,req:2},
 railgun:{name:'Railgun',cost:220,range:280,dmg:70,rate:1700,color:'#e8e8ff',proj:'#aef3ff',up:1.45,pierce:true,req:4}
};
const ENEMIES={
 grunt:{hp:32,spd:38,rw:6,color:'#5fbf4a',spot:'#a8e08a',size:12},
 runner:{hp:20,spd:70,rw:7,color:'#e0c33f',spot:'#f0e08a',size:9},
 tank:{hp:130,spd:24,rw:16,color:'#7a4fd6',spot:'#b399f0',size:18}
};
let level,money,lives,waveIdx,enemies,towers,projectiles,gameState,selTower,selType,spawnQ,unlocked,speed=1,path,pathPx;
try{ unlocked=JSON.parse(localStorage.getItem('btd_unlocked')||'[0]'); }catch(e){ unlocked=[0]; }

function buildLvlGrid(){
 const wrap=document.getElementById('lvlGrid'); wrap.innerHTML='';
 LEVELS.forEach((l,i)=>{
  const d=document.createElement('div'); d.className='lvlCard';
  const locked = !unlocked.includes(i);
  d.innerHTML=`<b>${locked?'🔒':'⚔'} ${l.name}</b><span>${l.waves.length} waves</span>`;
  if(locked) d.style.opacity=.4; else d.onclick=()=>startLevel(i);
  wrap.appendChild(d);
 });
}
buildLvlGrid();

function cellCenter(gx,gy){ return {x:gx*CELL+CELL/2, y:gy*CELL+CELL/2}; }
function buildPath(raw){
 const pts=raw.map(([x,y])=>cellCenter(x,y));
 let segs=[]; for(let i=0;i<pts.length-1;i++) segs.push({a:pts[i],b:pts[i+1],len:Math.hypot(pts[i+1].x-pts[i].x,pts[i+1].y-pts[i].y)});
 return {pts,segs};
}
function posOnPath(dist){
 let d=dist;
 for(const s of pathPx.segs){
  if(d<=s.len){ const t=d/s.len; return {x:s.a.x+(s.b.x-s.a.x)*t, y:s.a.y+(s.b.y-s.a.y)*t}; }
  d-=s.len;
 }
 const last=pathPx.pts[pathPx.pts.length-1]; return {x:last.x,y:last.y,end:true};
}
function pathTotalLen(){ return pathPx.segs.reduce((a,s)=>a+s.len,0); }
function nearPath(x,y,pad){
 for(const s of pathPx.segs){
  const l2=s.len*s.len||1;
  let t=((x-s.a.x)*(s.b.x-s.a.x)+(y-s.a.y)*(s.b.y-s.a.y))/l2;
  t=Math.max(0,Math.min(1,t));
  const px=s.a.x+(s.b.x-s.a.x)*t, py=s.a.y+(s.b.y-s.a.y)*t;
  if(Math.hypot(x-px,y-py)<pad) return true;
 }
 return false;
}

function startLevel(i){
 level=i; const L=LEVELS[i];
 path=L.path; pathPx=buildPath(path);
 money=150; lives=20; waveIdx=0; enemies=[]; towers=[]; projectiles=[]; spawnQ=[];
 gameState='build'; selTower=null; selType=null; speed=1;
 document.getElementById('startOverlay').classList.add('hidden');
 document.getElementById('endOverlay').classList.add('hidden');
 document.getElementById('waveBtn').classList.remove('hidden');
 document.getElementById('speedBtn').classList.remove('hidden');
 document.getElementById('speedBtn').textContent='1x';
 document.getElementById('waveTotal').textContent=L.waves.length;
 buildShop();
 updateHud();
 resizeWorld();
 banner(L.name,1400);
}
function buildShop(){
 const wrap=document.getElementById('shop'); wrap.innerHTML='';
 Object.entries(TOWERS).forEach(([k,t])=>{
  const locked = !unlocked.includes(t.req);
  const d=document.createElement('div'); d.className='tCard'; d.id='shop_'+k;
  d.innerHTML = locked
   ? `<b>🔒 ${t.name}</b><span>Lvl ${t.req+1}</span>`
   : `<b style="color:${t.color}">${t.name}</b><span>$${t.cost}</span>`;
  if(locked){ d.style.opacity=.4; }
  else d.onclick=()=>{ selType=(selType===k)?null:k; selTower=null; refreshShopSel(); refreshPanel(); };
  wrap.appendChild(d);
 });
}
function refreshShopSel(){
 document.querySelectorAll('.tCard').forEach(c=>c.classList.remove('sel'));
 if(selType) document.getElementById('shop_'+selType).classList.add('sel');
 Object.entries(TOWERS).forEach(([k,t])=>{
  if(unlocked.includes(t.req)) document.getElementById('shop_'+k).classList.toggle('unaff', money<t.cost);
 });
}
function banner(t,ms){ const b=document.getElementById('banner'); b.textContent=t; b.classList.add('show'); clearTimeout(b._t); b._t=setTimeout(()=>b.classList.remove('show'),ms||1500); }
function updateHud(){
 document.getElementById('money').textContent=money;
 document.getElementById('lives').textContent=lives;
 document.getElementById('wave').textContent=waveIdx;
 refreshShopSel();
}

function refreshPanel(){
 const p=document.getElementById('panel');
 if(selTower){
  const t=selTower, def=TOWERS[t.type];
  const upCost=Math.round(def.cost*0.7*Math.pow(1.4,t.lvl-1));
  p.classList.remove('hidden');
  p.innerHTML=`<b>${def.name} Lv${t.lvl}</b><p style="margin:6px 0;font-size:12px;">Dmg ${Math.round(t.dmg)} · Rng ${Math.round(t.range)}</p>
   <div class="btn" style="width:100%;margin:4px 0;font-size:12px;padding:8px;" id="upBtn">Upgrade $${upCost}</div>
   <div class="btn" style="width:100%;margin:4px 0;font-size:12px;padding:8px;background:#ff4d5e;box-shadow:0 5px 0 #a52530;" id="sellBtn">Sell $${Math.round(t.spent*0.6)}</div>`;
  document.getElementById('upBtn').onclick=()=>{ if(money>=upCost){ money-=upCost; t.spent+=upCost; t.lvl++; t.dmg*=def.up; t.range*=1.06; refreshPanel(); updateHud(); } };
  document.getElementById('sellBtn').onclick=()=>{ money+=Math.round(t.spent*0.6); towers=towers.filter(x=>x!==t); selTower=null; p.classList.add('hidden'); updateHud(); };
 } else { p.classList.add('hidden'); }
}

const canvas=document.getElementById('g'); const ctx=canvas.getContext('2d');
let worldW=600, worldH=400, scale=1, offX=0, offY=0;
function resizeWorld(){
 const dpr=window.devicePixelRatio||1;
 canvas.width=Math.max(1,Math.round(window.innerWidth*dpr));
 canvas.height=Math.max(1,Math.round(window.innerHeight*dpr));
 canvas.style.width=window.innerWidth+'px'; canvas.style.height=window.innerHeight+'px';
 worldW=15*CELL; worldH=10*CELL;
 scale=Math.min(canvas.width/worldW, canvas.height/worldH)*0.92;
 offX=(canvas.width-worldW*scale)/2; offY=(canvas.height-worldH*scale)/2+10*dpr;
}
window.addEventListener('resize',resizeWorld);
function toWorld(cx,cy){ return {x:(cx-offX)/scale, y:(cy-offY)/scale}; }

canvas.addEventListener('click',e=>{
 if(gameState!=='build'&&gameState!=='wave') return;
 const rect=canvas.getBoundingClientRect();
 const dpr=window.devicePixelRatio||1;
 const cx=(e.clientX-rect.left)*dpr, cy=(e.clientY-rect.top)*dpr;
 const w=toWorld(cx,cy);
 if(w.x<0||w.y<0||w.x>worldW||w.y>worldH) return;
 const hitTower=towers.find(t=>Math.hypot(t.x-w.x,t.y-w.y)<16);
 if(hitTower){ selTower=hitTower; selType=null; refreshShopSel(); refreshPanel(); return; }
 if(selType){
  const def=TOWERS[selType];
  if(money<def.cost) return;
  if(nearPath(w.x,w.y,24)) return;
  if(towers.some(t=>Math.hypot(t.x-w.x,t.y-w.y)<30)) return;
  money-=def.cost;
  towers.push({type:selType,x:w.x,y:w.y,lvl:1,dmg:def.dmg,range:def.range,rate:def.rate,cd:0,spent:def.cost,angle:0});
  updateHud();
 } else { selTower=null; refreshPanel(); }
});

function queueWave(){
 const w=LEVELS[level].waves[waveIdx];
 spawnQ=[];
 w.list.forEach(([type,count,interval])=>{ for(let i=0;i<count;i++) spawnQ.push({type,delay:i*interval}); });
 spawnQ.sort((a,b)=>a.delay-b.delay);
 spawnQ.forEach(s=>s.t=0);
 gameState='wave';
}
document.getElementById('waveBtn').onclick=()=>{
 if(gameState!=='build') return;
 queueWave();
 document.getElementById('waveBtn').classList.add('hidden');
};
document.getElementById('speedBtn').onclick=()=>{
 speed = speed===1?2:(speed===2?3:1);
 document.getElementById('speedBtn').textContent=speed+'x';
};
document.getElementById('retryBtn').onclick=()=>startLevel(level);
document.getElementById('menuBtn').onclick=()=>{
 document.getElementById('endOverlay').classList.add('hidden');
 buildLvlGrid();
 document.getElementById('startOverlay').classList.remove('hidden');
 document.getElementById('waveBtn').classList.add('hidden');
 document.getElementById('speedBtn').classList.add('hidden');
 document.getElementById('shop').innerHTML='';
 gameState='menu';
};

function spawnEnemy(type){
 const def=ENEMIES[type];
 enemies.push({type,hp:def.hp,maxHp:def.hp,spd:def.spd,dist:0,slow:1,slowT:0,rw:def.rw});
}

let lastT=performance.now();
function update(dt){
 if(gameState==='wave'){
  spawnQ.forEach(s=>s.t+=dt*1000);
  while(spawnQ.length && spawnQ[0].t>=spawnQ[0].delay){ const s=spawnQ.shift(); spawnEnemy(s.type); }
  enemies.forEach(en=>{
   if(en.slowT>0){ en.slowT-=dt; if(en.slowT<=0) en.slow=1; }
   en.dist += en.spd*en.slow*dt;
  });
  const total=pathTotalLen();
  enemies=enemies.filter(en=>{
   if(en.dist>=total){ lives--; return false; }
   return en.hp>0;
  });
  if(lives<=0){ endGame(false); return; }
  towers.forEach(t=>{
   t.cd-=dt*1000;
   let buffed=t.dmg;
   if(TOWERS[t.type].buff===undefined){
    towers.forEach(o=>{ if(TOWERS[o.type].buff && Math.hypot(o.x-t.x,o.y-t.y)<o.range) buffed*= (1+TOWERS[o.type].buff); });
   }
   if(t.cd<=0 && TOWERS[t.type].rate>0){
    let best=null,bestDist=-1;
    enemies.forEach(en=>{ const p=posOnPath(en.dist); const d=Math.hypot(p.x-t.x,p.y-t.y); if(d<t.range && en.dist>bestDist){ bestDist=en.dist; best=en; } });
    if(best){
     const p=posOnPath(best.dist);
     t.angle=Math.atan2(p.y-t.y,p.x-t.x);
     t.cd=TOWERS[t.type].rate;
     projectiles.push({x:t.x,y:t.y,target:best,dmg:buffed,color:TOWERS[t.type].proj,speed:260,splash:TOWERS[t.type].splash,slow:TOWERS[t.type].slow});
    }
   }
  });
  projectiles.forEach(pr=>{
   if(!enemies.includes(pr.target)){ pr.dead=true; return; }
   const p=posOnPath(pr.target.dist);
   const dx=p.x-pr.x,dy=p.y-pr.y,d=Math.hypot(dx,dy);
   if(d<8){
    pr.target.hp-=pr.dmg;
    if(pr.slow){ pr.target.slow=pr.slow; pr.target.slowT=1.2; }
    if(pr.splash) enemies.forEach(en=>{ if(en!==pr.target){ const ep=posOnPath(en.dist); if(Math.hypot(ep.x-p.x,ep.y-p.y)<pr.splash) en.hp-=pr.dmg*0.6; } });
    pr.dead=true;
   } else { pr.x+=dx/d*pr.speed*dt; pr.y+=dy/d*pr.speed*dt; }
  });
  const deadEnemies=enemies.filter(en=>en.hp<=0);
  deadEnemies.forEach(en=>{ money+=Math.round(ENEMIES[en.type].hp*0.6); });
  if(deadEnemies.length){ updateHud(); }
  projectiles=projectiles.filter(p=>!p.dead);
  if(enemies.length===0 && spawnQ.length===0){
   gameState='build';
   waveIdx++;
   updateHud();
   if(waveIdx>=LEVELS[level].waves.length){ endGame(true); }
   else { document.getElementById('waveBtn').classList.remove('hidden'); banner('Wave clear!',1200); }
  }
 }
}
function endGame(won){
 gameState='end';
 if(won && !unlocked.includes(level+1) && level+1<LEVELS.length){ unlocked.push(level+1); try{localStorage.setItem('btd_unlocked',JSON.stringify(unlocked));}catch(e){} }
 document.getElementById('endTitle').textContent = won?'Front Secured':'Gate Fell';
 document.getElementById('endDesc').textContent = won?'You held every wave. The next front is open.':'The raiders broke through. Reinforce and try again.';
 document.getElementById('endOverlay').classList.remove('hidden');
}

function drawDecor(shape,x,y,c){
 ctx.fillStyle=c; ctx.strokeStyle='rgba(0,0,0,.3)'; ctx.lineWidth=1.5;
 if(shape==='rock'){ ctx.beginPath(); ctx.arc(x-4,y,7,0,7); ctx.arc(x+5,y+2,8,0,7); ctx.arc(x,y-4,6,0,7); ctx.fill(); ctx.stroke(); }
 else if(shape==='bush'){ ctx.beginPath(); ctx.arc(x-6,y,7,0,7); ctx.arc(x+6,y,7,0,7); ctx.arc(x,y-6,8,0,7); ctx.fill(); }
 else if(shape==='bone'){ ctx.strokeStyle=c; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(x-10,y-6); ctx.lineTo(x+10,y+6); ctx.stroke();
  ctx.fillStyle=c; [[x-10,y-6],[x+10,y+6]].forEach(p=>{ ctx.beginPath(); ctx.arc(p[0],p[1],4,0,7); ctx.fill(); }); }
 else if(shape==='ice'){ ctx.beginPath(); ctx.moveTo(x,y-12); ctx.lineTo(x+7,y+6); ctx.lineTo(x-7,y+6); ctx.closePath(); ctx.fill(); ctx.stroke(); }
 else if(shape==='coral'){ ctx.strokeStyle=c; ctx.lineWidth=3; [-1,0,1].forEach(i=>{ ctx.beginPath(); ctx.moveTo(x+i*5,y+8); ctx.lineTo(x+i*8,y-10); ctx.stroke(); }); }
}
function drawTurret(t,def){
 ctx.save(); ctx.translate(t.x,t.y);
 ctx.fillStyle='#151830'; ctx.beginPath(); ctx.arc(0,0,16,0,7); ctx.fill();
 ctx.strokeStyle='#3a4166'; ctx.lineWidth=2; ctx.stroke();
 for(let i=0;i<6;i++){ const a=i/6*7; ctx.beginPath(); ctx.arc(Math.cos(a)*13,Math.sin(a)*13,1.6,0,7); ctx.fillStyle='#4a5280'; ctx.fill(); }
 ctx.fillStyle=def.color; ctx.beginPath(); ctx.arc(0,0,10,0,7); ctx.fill();
 ctx.rotate(t.angle||0);
 ctx.fillStyle=def.color; ctx.strokeStyle='rgba(0,0,0,.35)'; ctx.lineWidth=1.5;
 if(t.type==='sniper'){ ctx.beginPath(); ctx.roundRect(0,-3,32,6,2); ctx.fill(); ctx.stroke(); ctx.fillStyle='#2a2a2a'; ctx.beginPath(); ctx.roundRect(26,-4,6,8,2); ctx.fill(); }
 else if(t.type==='bomber'){ ctx.beginPath(); ctx.roundRect(0,-7,18,14,4); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(18,0,7,0,7); ctx.fill(); ctx.stroke(); }
 else if(t.type==='cryo'){ ctx.beginPath(); ctx.roundRect(0,-4,20,8,2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#dffcf7'; ctx.beginPath(); ctx.moveTo(24,0); ctx.lineTo(19,-6); ctx.lineTo(30,0); ctx.lineTo(19,6); ctx.closePath(); ctx.fill(); }
 else if(t.type==='support'){ ctx.rotate(-(t.angle||0)); ctx.rotate(performance.now()/900);
  ctx.strokeStyle=def.color; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,15,0,4.6); ctx.stroke();
  ctx.fillStyle=def.color; ctx.beginPath(); ctx.arc(15,0,3,0,7); ctx.fill(); }
 else if(t.type==='flame'){ ctx.beginPath(); ctx.roundRect(0,-6,16,12,3); ctx.fill(); ctx.stroke();
  ctx.fillStyle='rgba(255,140,50,.55)'; ctx.beginPath(); ctx.arc(20,0,8+Math.sin(performance.now()/90)*2,0,7); ctx.fill(); }
 else if(t.type==='railgun'){ [-4,4].forEach(o=>{ ctx.fillStyle=def.color; ctx.beginPath(); ctx.roundRect(0,o-2,34,4,2); ctx.fill(); });
  ctx.fillStyle='#8fe8ff'; ctx.beginPath(); ctx.arc(14,0,3,0,7); ctx.fill(); }
 else { ctx.beginPath(); ctx.roundRect(0,-5,22,10,3); ctx.fill(); ctx.stroke(); }
 ctx.restore();
 ctx.fillStyle='rgba(0,0,0,.55)'; ctx.font='10px Fredoka'; ctx.textAlign='center'; ctx.fillText('Lv'+t.lvl,t.x,t.y+26);
}
function drawSlime(p,def,en){
 const s=def.size, bob=Math.sin(performance.now()/220+en.dist)*1.5;
 ctx.save(); ctx.translate(p.x,p.y+bob);
 ctx.fillStyle='rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0,s*0.75,s*0.9,s*0.28,0,0,7); ctx.fill();
 ctx.fillStyle=en.slow<1?'#9fd8ff':def.color;
 ctx.beginPath(); ctx.roundRect(-s,-s*0.7,s*2,s*1.6,s*0.5); ctx.fill();
 ctx.strokeStyle='rgba(0,0,0,.35)'; ctx.lineWidth=1.5; ctx.stroke();
 ctx.fillStyle=def.spot; ctx.globalAlpha=.55;
 ctx.beginPath(); ctx.arc(-s*0.4,-s*0.35,s*0.28,0,7); ctx.fill(); ctx.globalAlpha=1;
 [-1,1].forEach(side=>{ ctx.fillStyle='#0e0e0e'; ctx.beginPath(); ctx.ellipse(side*s*0.4,-s*0.1,s*0.24,s*0.3,0,0,7); ctx.fill();
  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(side*s*0.4-2,-s*0.18,s*0.08,0,7); ctx.fill(); });
 ctx.fillStyle='#fff'; for(let i=-2;i<=2;i++){ ctx.beginPath(); ctx.moveTo(i*s*0.22-s*0.1,s*0.35); ctx.lineTo(i*s*0.22+s*0.1,s*0.35); ctx.lineTo(i*s*0.22,s*0.35+s*0.28); ctx.closePath(); ctx.fill(); }
 ctx.restore();
 ctx.fillStyle='#111'; ctx.fillRect(p.x-12,p.y-s-9,24,4);
 ctx.fillStyle='#ff4d5e'; ctx.fillRect(p.x-12,p.y-s-9,24*(en.hp/en.maxHp),4);
}
function draw(){
 const dpr=window.devicePixelRatio||1;
 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.fillStyle='#070912'; ctx.fillRect(0,0,canvas.width,canvas.height);
 if(!path) return;
 const L=LEVELS[level];
 ctx.save(); ctx.translate(offX,offY); ctx.scale(scale,scale);
 ctx.fillStyle=L.theme; ctx.fillRect(0,0,worldW,worldH);
 for(let x=0;x<worldW;x+=CELL) for(let y=0;y<worldH;y+=CELL){ ctx.strokeStyle='rgba(255,255,255,.04)'; ctx.strokeRect(x,y,CELL,CELL); }
 (L.decor||[]).forEach(([gx,gy,shape])=>{ const c=cellCenter(gx,gy); drawDecor(shape,c.x,c.y,L.deco); });
 ctx.strokeStyle='#3a3f2b'; ctx.lineWidth=CELL*0.9; ctx.lineCap='round'; ctx.lineJoin='round';
 ctx.beginPath(); pathPx.pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.stroke();
 ctx.strokeStyle='#5a5f45'; ctx.lineWidth=CELL*0.55;
 ctx.beginPath(); pathPx.pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.stroke();
 const gate=pathPx.pts[pathPx.pts.length-1];
 ctx.fillStyle='#ffd25a'; ctx.beginPath(); ctx.arc(gate.x,gate.y,12,0,7); ctx.fill();

 towers.forEach(t=>{
  const def=TOWERS[t.type];
  if(t===selTower){ ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(t.x,t.y,t.range,0,7); ctx.stroke(); }
  drawTurret(t,def);
 });
 enemies.forEach(en=>{ const p=posOnPath(en.dist); drawSlime(p,ENEMIES[en.type],en); });
 projectiles.forEach(pr=>{ ctx.fillStyle=pr.color; ctx.beginPath(); ctx.arc(pr.x,pr.y,4,0,7); ctx.fill(); });
 ctx.restore();
}

function loop(t){
 const dt=Math.min(0.05,(t-lastT)/1000); lastT=t;
 try{ if(gameState==='wave'){ for(let i=0;i<speed;i++) update(dt); } } catch(e){ console.error(e); }
 try{ draw(); } catch(e){ console.error(e); }
 requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
})();
