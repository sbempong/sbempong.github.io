/* Home "now" rows: Recently played (data/recent.json, Last.fm) and Currently watching / reading
   (data/anilist.json, AniList). Each row hides when empty; everything stays hidden if a file is
   missing or broken. Results that arrive before first paint (600 ms window) re-centre the laptop
   layout once; anything later only extends downward, so the tabs never move on screen. No audio. */
(function(){'use strict';
if(!window.fetch)return;
var root=document.documentElement;
var STAR='2a96cbd8b46e442fc41c2b86b821562f';
var ICON={
 note:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
 screen:'<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
 book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>'};
function okUrl(u){return typeof u==='string'&&/^https:\/\//.test(u)&&u.indexOf(STAR)<0?u:null}
function ph(label,icon){var s=document.createElement('span');s.className='art art-ph';s.setAttribute('role','img');s.setAttribute('aria-label',label);
 s.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+ICON[icon]+'</svg>';return s}
function get(name,url){return window[name]||fetch(url,{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.json()})}
/* one tile: {href, name (accessible), title (tooltip), alt, src, icon, line1, line2, extra} */
function tile(o){var li=document.createElement('li'),a=document.createElement(okUrl(o.href)?'a':'span'),el,src=okUrl(o.src);
 if(a.tagName==='A'){a.href=o.href;a.target='_blank';a.rel='noopener';a.setAttribute('aria-label',o.name)}
 a.title=o.title;a.className='rt';
 if(src){el=document.createElement('img');el.className='art';el.width=34;el.height=34;el.decoding='async';el.alt=o.alt;el.referrerPolicy='no-referrer';
  el.addEventListener('error',function(){el.replaceWith(ph(o.alt,o.icon))});el.src=src}else el=ph(o.alt,o.icon);
 a.appendChild(el);var m=document.createElement('span');m.className='meta';
 var t=document.createElement('span');t.className='t';t.textContent=o.line1;var b=document.createElement('span');b.className='a';b.textContent=o.line2;
 if(o.extra){var n=document.createElement('span');n.className='np';n.textContent=o.extra;b.appendChild(n)}
 m.appendChild(t);m.appendChild(b);a.appendChild(m);li.appendChild(a);return li}
function sync(){document.getElementById('now').hidden=['recent','watching','reading'].every(function(id){return document.getElementById(id).hidden})}
function fill(id,items){var box=document.getElementById(id);if(!box)return false;var ul=box.querySelector('ul');ul.textContent='';
 if(!items.length){box.hidden=true;sync();return false}items.forEach(function(o){ul.appendChild(tile(o))});box.hidden=false;sync();return true}
function music(d){var tr=(d&&Array.isArray(d.tracks)?d.tracks:[]).filter(function(t){return t&&t.title&&t.artist}).slice(0,4);
 return fill('recent',tr.map(function(t){var x=t.title+' by '+t.artist,img=okUrl(t.art);
  if(!img&&Array.isArray(t.image)){var by={};t.image.forEach(function(i){if(i&&i.size)by[i.size]=okUrl(i['#text'])});img=by.large||by.medium||null}
  return {href:t.url,name:x+(t.nowPlaying?', now playing':'')+' (opens Last.fm)',title:x+(t.nowPlaying?' (now playing)':''),alt:'Album art for '+x,src:img,icon:'note',line1:t.title,line2:t.artist,extra:t.nowPlaying?' \u00b7 now':''}}))}
function media(list,kind){var ep=kind==='watching';
 return (Array.isArray(list)?list:[]).filter(function(m){return m&&m.title}).sort(function(a,b){return (b.updatedAt||0)-(a.updatedAt||0)}).slice(0,4).map(function(m){
  var n=Math.max(0,parseInt(m.progress,10)||0),word=ep?'episode':'chapter',short=(ep?'Ep ':'Ch ')+n;
  return {href:m.url,name:m.title+', '+word+' '+n+', opens AniList',title:m.title+' \u00b7 '+short,alt:'Cover of '+m.title,src:m.cover,icon:ep?'screen':'book',line1:m.title,line2:short}})}
function anilist(d){if(!d||typeof d!=='object')throw 0;var w=fill('watching',media(d.watching,'watching')),r=fill('reading',media(d.reading,'reading'));return w||r}
function hideAL(){['watching','reading'].forEach(function(id){document.getElementById(id).hidden=true});sync()}
var desk=window.matchMedia('(min-width:700px) and (min-height:600px)');
function recentre(){/* layout is still invisible here: compute the shift from the measured layout */
 if(!desk.matches)return;var shown=['recent','watching','reading'].some(function(id){return !document.getElementById(id).hidden});if(!shown)return;
 root.classList.add('has-recent');root.style.setProperty('--rp-shift','0px');
 var top=document.querySelector('.avatar').getBoundingClientRect().top+scrollY,bot=document.getElementById('now').getBoundingClientRect().bottom+scrollY,below=innerHeight-bot,r=0.86;
 var d=Math.round((top-r*below)/(1+r));root.style.setProperty('--rp-shift',Math.max(0,d)+'px')}
var early=true;
var pm=get('__rp','data/recent.json').then(music).catch(function(){document.getElementById('recent').hidden=true;sync()});
var pa=get('__al','data/anilist.json').then(anilist).catch(hideAL);
/* both settled: if still before first paint, centre once and reveal */
Promise.all([pm,pa]).then(function(){if(early&&root.classList.contains('rp-wait'))recentre();root.classList.remove('rp-wait')});
setTimeout(function(){early=false},600);
})();
