/* Photography lightbox: dialog, close button and Escape, arrow keys, swipe, focus returns to the tile. */
(function(){'use strict';
var tiles=[].slice.call(document.querySelectorAll('.gallery .ph')),dlg=document.getElementById('lightbox');if(!tiles.length||!dlg||!dlg.showModal)return;
var img=document.getElementById('lb-img'),cap=document.getElementById('lb-cap'),cur=0,opener=null;
function show(i){cur=(i+tiles.length)%tiles.length;var t=tiles[cur],th=t.querySelector('img');img.src=t.dataset.full;img.width=+t.dataset.w;img.height=+t.dataset.h;img.alt=th.alt;cap.textContent=(cur+1)+' of '+tiles.length;dlg.dataset.index=cur}
tiles.forEach(function(t,i){t.addEventListener('click',function(){opener=t;show(i);dlg.showModal();document.getElementById('lb-close').focus()})});
document.getElementById('lb-prev').addEventListener('click',function(){show(cur-1)});
document.getElementById('lb-next').addEventListener('click',function(){show(cur+1)});
document.getElementById('lb-close').addEventListener('click',function(){dlg.close()});
dlg.addEventListener('close',function(){(tiles[cur]||opener).focus()});
dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
dlg.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'){e.preventDefault();show(cur-1)}else if(e.key==='ArrowRight'){e.preventDefault();show(cur+1)}});
var x0=null,y0=null;dlg.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
dlg.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy))show(cur+(dx<0?1:-1));x0=null},{passive:true});
})();
