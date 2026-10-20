/* Photography lightbox.
   - dialog element, close button, Escape, backdrop click, arrow keys, swipe that follows the finger.
   - The tile thumbnail is shown at once as a placeholder; the right-sized full image (srcset) is
     preloaded and decode()d, then swapped in. Neighbours are preloaded; a small cache keeps them.
   - Focus returns to the tile; the ring is shown only for keyboard users. */
(function(){'use strict';
var tiles=[].slice.call(document.querySelectorAll('.gallery .ph')),dlg=document.getElementById('lightbox');if(!tiles.length||!dlg||!dlg.showModal)return;
var stage=document.getElementById('lb-stage'),ph=document.getElementById('lb-ph'),main=document.getElementById('lb-img'),cap=document.getElementById('lb-cap');
var N=tiles.length,cur=0,SIZES='(min-width:700px) min(92vw, calc(82vh * 4 / 3)), 92vw';
function full(i){var b=tiles[i].dataset.full.replace(/\.webp$/,'');return {srcset:b+'-600.webp 600w, '+b+'-1080.webp 1080w, '+b+'.webp '+tiles[i].dataset.w+'w',src:b+'-1080.webp'}}
function thumb(i){return tiles[i].querySelector('img')}
/* small cache of preloaded, decoded Image objects (most recent last) */
var cache=new Map(),MAX=5;
function load(i){i=(i+N)%N;if(cache.has(i)){var e=cache.get(i);cache.delete(i);cache.set(i,e);return e}
 var im=new Image(),f=full(i);im.decoding='async';im.sizes=SIZES;im.srcset=f.srcset;im.src=f.src;
 var e={img:im,ready:(im.decode?im.decode():new Promise(function(r,j){im.onload=r;im.onerror=j})).then(function(){return im},function(){return null})};
 cache.set(i,e);while(cache.size>MAX){var k=cache.keys().next().value;if(k===cur)break;cache.delete(k)}return e}
function warmThumb(i){var t=thumb((i+N)%N);if(t.loading==='lazy')t.loading='eager'}
function neighbours(i){warmThumb(i+1);warmThumb(i-1);load(i+1);load(i-1)}
var token=0;
function show(i){cur=(i+N)%N;var t=thumb(cur),my=++token,f=full(cur);
 dlg.dataset.index=cur;cap.textContent=(cur+1)+' of '+N;
 /* placeholder: the tile thumbnail is already in memory, so it paints immediately */
 ph.src=t.currentSrc||t.src;ph.width=600;ph.height=450;
 main.classList.remove('on');main.alt=t.alt;
 var e=load(cur);
 e.ready.then(function(im){if(my!==token)return;
  main.width=+tiles[cur].dataset.w;main.height=+tiles[cur].dataset.h;main.sizes=SIZES;main.srcset=f.srcset;main.src=f.src;
  var go=function(){if(my===token)main.classList.add('on')};
  if(main.decode)main.decode().then(go,go);else go();
 });
 neighbours(cur)}
/* remember how the user last interacted, so focus can be returned without a ring after pointer use */
var lastPointer=false;
addEventListener('pointerdown',function(){lastPointer=true},true);
addEventListener('keydown',function(e){if(e.key!=='Escape')lastPointer=false},true);
var opener=null;
tiles.forEach(function(t,i){t.addEventListener('click',function(){opener=t;show(i);dlg.showModal();
 var c=document.getElementById('lb-close');if(lastPointer){c.focus({focusVisible:false});c.dataset.nofv=''}else{c.focus();delete c.dataset.nofv}})});
function step(d){show(cur+d)}
/* Buttons act on touch pointerup (no wait for a synthesized click, which can be dropped right after a swipe);
   mouse and keyboard use click. A click that follows a handled touch is ignored. */
function btn(id,fn){var el=document.getElementById(id),skip=0;
 el.addEventListener('pointerup',function(e){if(e.pointerType==='touch'||e.pointerType==='pen'){skip=Date.now();fn()}});
 el.addEventListener('click',function(){if(Date.now()-skip<600)return;fn()})}
btn('lb-prev',function(){step(-1)});btn('lb-next',function(){step(1)});btn('lb-close',function(){dlg.close()});
dlg.addEventListener('close',function(){token++;var t=tiles[cur]||opener;
 if(lastPointer){t.dataset.nofv='';t.focus({focusVisible:false,preventScroll:true});t.addEventListener('blur',function x(){delete t.dataset.nofv;t.removeEventListener('blur',x)})}
 else{delete t.dataset.nofv;t.focus({preventScroll:true})}});
dlg.addEventListener('click',function(e){if(swiped){swiped=false;return}if(e.target===dlg)dlg.close()});
dlg.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}else if(e.key==='ArrowRight'){e.preventDefault();step(1)}else if(e.key!=='Escape'&&e.key!=='Tab')return;
 /* keyboard use inside the dialog makes the ring legitimate again */
 if(e.key==='Tab'){lastPointer=false;[].forEach.call(dlg.querySelectorAll('[data-nofv]'),function(b){delete b.dataset.nofv})}});
/* swipe: follows the finger, small threshold, passive listeners */
var x0=null,y0=null,dx=0,dir=0,swiped=false,TH=30;
stage.addEventListener('touchstart',function(e){if(e.touches.length!==1)return;x0=e.touches[0].clientX;y0=e.touches[0].clientY;dx=0;dir=0;stage.classList.add('drag')},{passive:true});
stage.addEventListener('touchmove',function(e){if(x0===null)return;var mx=e.touches[0].clientX-x0,my=e.touches[0].clientY-y0;
 if(!dir&&(Math.abs(mx)>8||Math.abs(my)>8))dir=Math.abs(mx)>Math.abs(my)?1:2;if(dir!==1)return;dx=mx;stage.style.transform='translate3d('+dx+'px,0,0)'},{passive:true});
function endSwipe(){if(x0===null)return;stage.classList.remove('drag');stage.style.transform='';if(dir===1&&Math.abs(dx)>TH){swiped=true;step(dx<0?1:-1);setTimeout(function(){swiped=false},400)}x0=null}
stage.addEventListener('touchend',endSwipe,{passive:true});stage.addEventListener('touchcancel',endSwipe,{passive:true});
})();
