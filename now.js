/* "Now" tab: Recently played (data/recent.json, Last.fm) and Currently watching / reading
   (data/anilist.json, AniList), plus the one-line "Now playing" / "Last played" link on Home.
   Each block hides when empty; a missing or broken file hides only its own blocks. The Home line
   keeps a fixed reserved height, so nothing moves when the data lands. No audio. */
(function(){'use strict';
if(!window.fetch)return;
var STAR='2a96cbd8b46e442fc41c2b86b821562f';
function okUrl(u){return typeof u==='string'&&/^https:\/\//.test(u)&&u.indexOf(STAR)<0?u:null}
function get(name,url){return window[name]||fetch(url,{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.json()})}
function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
function sr(text){return el('span','sr',text)}
var ICON={note:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
 screen:'<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
 book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>'};
function placeholder(icon){var s=el('span','cv cv-ph');s.setAttribute('aria-hidden','true');
 s.innerHTML='<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+ICON[icon]+'</svg>';return s}
/* cover image: srcset from [[url,width],...]; decorative (the card text names it) */
function cover(list,sizes,w,h,icon){var c=list.filter(function(x){return okUrl(x[0])});if(!c.length)return placeholder(icon);
 var i=el('img','cv');i.width=w;i.height=h;i.loading='lazy';i.decoding='async';i.alt='';i.referrerPolicy='no-referrer';
 var seen={};c=c.filter(function(x){if(seen[x[0]])return false;seen[x[0]]=1;return true});
 if(c.length>1){i.srcset=c.map(function(x){return x[0]+' '+x[1]+'w'}).join(', ');i.sizes=sizes}
 i.src=c[c.length-1][0];i.addEventListener('error',function(){i.replaceWith(placeholder(icon))});return i}
var rtf=window.Intl&&Intl.RelativeTimeFormat?new Intl.RelativeTimeFormat('en',{numeric:'auto'}):null;
function ago(iso){var t=Date.parse(iso);if(!t)return '';var s=Math.round((t-Date.now())/1000),a=Math.abs(s),
 u=a<60?['second',s]:a<3600?['minute',Math.round(s/60)]:a<86400?['hour',Math.round(s/3600)]:a<2592000?['day',Math.round(s/86400)]:['month',Math.round(s/2592000)];
 if(a<60)return 'just now';return rtf?rtf.format(u[1],u[0]):Math.abs(u[1])+' '+u[0]+(Math.abs(u[1])===1?'':'s')+' ago'}
/* phone shows 2 per row: an odd list (over 1) drops its last item so no card sits alone */
function even(a){return a.length>1&&a.length%2?a.slice(0,-1):a}
function block(id,items){var box=document.getElementById(id);if(!box)return 0;var ul=box.querySelector('ul');ul.textContent='';
 items.forEach(function(li){ul.appendChild(li)});ul.dataset.n=items.length;box.hidden=!items.length;return items.length}
function empty(){var any=['recent','watching','reading'].some(function(id){return !document.getElementById(id).hidden});document.getElementById('nw-empty').hidden=any}

function song(t){var li=el('li'),a=el('a','card sc');var href=okUrl(t.url);if(href){a.href=href;a.target='_blank';a.rel='noopener'}else a=el('div','card sc');
 a.appendChild(cover([[t.artSmall,174],[t.art,300]],'(max-width:699px) calc(50vw - 30px), 150px',300,300,'note'));
 var m=el('span','meta');if(t.nowPlaying){var b=el('span','badge','Now playing');m.appendChild(b)}
 m.appendChild(el('span','ti',t.title));m.appendChild(el('span','ar',t.artist));if(t.album)m.appendChild(el('span','al',t.album));
 if(!t.nowPlaying&&t.playedAt){var tm=el('time','when',ago(t.playedAt));tm.dateTime=t.playedAt;m.appendChild(tm)}
 if(href)m.appendChild(sr(' (opens Last.fm in a new tab)'));a.appendChild(m);li.appendChild(a);return li}
function music(d){var tr=(d&&Array.isArray(d.tracks)?d.tracks:[]).filter(function(t){return t&&t.title&&t.artist}).slice(0,4);
 block('recent',even(tr).map(song));line(tr[0]);return tr.length}

var uid=0;
function show(m,ep){var li=el('li'),c=el('div','card mc'),href=okUrl(m.url),n=Math.max(0,parseInt(m.progress,10)||0),tot=parseInt(m.total,10)||0;
 var cv=cover([[m.coverSmall,100],[m.cover,230],[m.coverXL,460]],'(max-width:699px) calc(50vw - 30px), 120px',230,326,ep?'screen':'book');
 if(href){var ca=el('a','cvl');ca.href=href;ca.target='_blank';ca.rel='noopener';ca.tabIndex=-1;ca.setAttribute('aria-hidden','true');ca.appendChild(cv);c.appendChild(ca)}else c.appendChild(cv);
 var body=el('div','meta'),h=el('h4','ti');if(href){var ta=el('a');ta.href=href;ta.target='_blank';ta.rel='noopener';ta.textContent=m.title;ta.appendChild(sr(' (opens AniList in a new tab)'));h.appendChild(ta)}else h.textContent=m.title;body.appendChild(h);
 var word=ep?'Episode':'Chapter';body.appendChild(el('p','prog',word+' '+n+(tot?' of '+tot:'')));
 if(tot){var bar=el('span','bar');bar.setAttribute('aria-hidden','true');var f=el('span');f.style.width=Math.min(100,Math.round(n/tot*100))+'%';bar.appendChild(f);body.appendChild(bar)}
 if(m.description){var p=el('p','desc',m.description);p.id='desc-'+(++uid);body.appendChild(p);
  if(m.description.length>110){var b=el('button','more','Read more');b.type='button';b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls',p.id);
   b.addEventListener('click',function(){var o=p.classList.toggle('open');b.setAttribute('aria-expanded',o);b.textContent=o?'Show less':'Read more'});body.appendChild(b)}}
 c.appendChild(body);li.appendChild(c);return li}
function media(list,ep){return even((Array.isArray(list)?list:[]).filter(function(m){return m&&m.title}).sort(function(a,b){return (b.updatedAt||0)-(a.updatedAt||0)}).slice(0,4)).map(function(m){return show(m,ep)})}
function anilist(d){if(!d||typeof d!=='object')throw 0;block('watching',media(d.watching,true));block('reading',media(d.reading,false))}

/* Home line: "Now playing: X by Y" or "Last played: X by Y"; the space is reserved in CSS */
function line(t){var p=document.getElementById('np-line');if(!p||!t)return;var a=p.querySelector('a');
 p.querySelector('.np-k').textContent=t.nowPlaying?'Now playing':'Last played';p.querySelector('.np-v').textContent=t.title+' by '+t.artist;a.title=p.textContent;p.classList.add('on')}
var go=document.querySelector('#np-line a');if(go)go.addEventListener('click',function(e){var tab=document.getElementById('t-now');if(!tab)return;e.preventDefault();tab.click();scrollTo(0,0);document.getElementById('now').focus({preventScroll:true})});

var pm=get('__rp','data/recent.json').then(music).catch(function(){document.getElementById('recent').hidden=true});
var pa=get('__al','data/anilist.json').then(anilist).catch(function(){['watching','reading'].forEach(function(id){document.getElementById(id).hidden=true})});
Promise.all([pm,pa]).then(empty);
})();
