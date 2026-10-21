/* "Now" tab: Recently played (data/recent.json, Last.fm) and Currently watching / reading
   (data/anilist.json, AniList), Movies and TV (data/trakt.json, Trakt), Books (data/books.json,
   Hardcover), plus the one-line "Now playing" / "Last played" link on Home.
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
function empty(){var any=['recent','tv','watching','reading','books'].some(function(id){return !document.getElementById(id).hidden});document.getElementById('nw-empty').hidden=any}

/* album card: cover, album, artist, "N songs", last played (or a Now playing badge with the track) */
function plural(n,w){return n+' '+w+(n===1?'':'s')}
function album(x){var li=el('li'),href=okUrl(x.url),a=href?el('a','card sc'):el('div','card sc');if(href){a.href=href;a.target='_blank';a.rel='noopener'}
 a.appendChild(cover([[x.artSmall,174],[x.art,300]],'(max-width:699px) calc(50vw - 30px), (min-width:700px) 200px',300,300,'note'));
 var m=el('span','meta');if(x.nowPlaying){m.appendChild(el('span','badge','Now playing'));if(x.nowTrack)m.appendChild(el('span','nt',x.nowTrack))}
 m.appendChild(el('span','ti',x.album));m.appendChild(el('span','ar',x.artist));
 var n=Math.max(1,parseInt(x.songs,10)||1);m.appendChild(el('span','al',x.isTrack?'Single track':plural(n,'song')));
 if(!x.nowPlaying&&x.lastPlayedAt){var tm=el('time','when',ago(x.lastPlayedAt));tm.dateTime=x.lastPlayedAt;m.appendChild(tm)}
 if(href)m.appendChild(sr(' (opens Last.fm in a new tab)'));a.appendChild(m);li.appendChild(a);return li}
/* older data files only have tracks: group them here the same way the workflow does */
function group(tr){var out=[],by={};tr.forEach(function(t){var k=t.artist.toLowerCase().split(', ')[0].split(' & ')[0].split(' feat')[0].split(' ft.')[0]+'|'+(t.album?'a:'+t.album.toLowerCase():'t:'+t.title.toLowerCase()),g=by[k];
 if(!g){g=by[k]={album:t.album||t.title,artist:t.artist,isTrack:!t.album,art:t.art,artSmall:t.artSmall,url:t.album?'https://www.last.fm/music/'+encodeURIComponent(t.artist).replace(/%20/g,'+')+'/'+encodeURIComponent(t.album).replace(/%20/g,'+'):t.url,titles:{},lastPlayedAt:t.playedAt,nowPlaying:!!t.nowPlaying,nowTrack:t.nowPlaying?t.title:null};out.push(g)}
 g.titles[t.title.toLowerCase()]=1;if(t.artist.length<g.artist.length)g.artist=t.artist;g.lastPlayedAt=g.lastPlayedAt||t.playedAt;g.art=g.art||t.art;g.artSmall=g.artSmall||t.artSmall});
 return out.map(function(g){g.songs=Object.keys(g.titles).length;return g})}
function music(d){var tr=(d&&Array.isArray(d.tracks)?d.tracks:[]).filter(function(t){return t&&t.title&&t.artist});
 var al=(d&&Array.isArray(d.albums)?d.albums:group(tr)).filter(function(x){return x&&x.album&&x.artist}).slice(0,6);
 block('recent',even(al).map(album));line(tr[0]);return al.length}

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

/* Movies and TV (data/trakt.json): one card per show (latest episode) or movie; posters from Trakt */
function tv(x){var li=el('li'),href=okUrl(x.url),a=href?el('a','card sc tc'):el('div','card sc tc');if(href){a.href=href;a.target='_blank';a.rel='noopener'}
 a.appendChild(cover([[x.poster,300]],'',300,450,'screen'));var m=el('span','meta');if(x.nowWatching)m.appendChild(el('span','badge','Watching now'));
 m.appendChild(el('span','ti',x.title+(x.year?' ('+x.year+')':'')));
 var e=x.episode;m.appendChild(el('span','al',x.type==='movie'?'Movie':e?'Season '+e.season+', episode '+e.number+(e.title?': '+e.title:''):'TV show'));
 if(!x.nowWatching&&x.watchedAt){var tm=el('time','when',ago(x.watchedAt));tm.dateTime=x.watchedAt;m.appendChild(tm)}
 if(href)m.appendChild(sr(' (opens Trakt in a new tab)'));a.appendChild(m);li.appendChild(a);return li}
function trakt(d){if(!d||typeof d!=='object')throw 0;block('tv',even((Array.isArray(d.items)?d.items:[]).filter(function(x){return x&&x.title}).slice(0,6)).map(tv))}

/* Books (data/books.json, Hardcover): reading now as cards, read books grouped by year */
var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function day(s){var m=/^(\d{4})-(\d{2})-(\d{2})/.exec(s||'');return m?(+m[3])+' '+MON[+m[2]-1]+' '+m[1]:''}
function stars(r){var n=parseFloat(r);if(!(n>0))return null;var s=el('span','rate','\u2605 '+n.toFixed(n%1?1:0));s.setAttribute('aria-label','Rated '+n+' out of 5');s.setAttribute('role','img');return s}
function bookCard(b){var li=el('li'),c=el('div','card mc'),href=okUrl(b.url);var cv=cover([[b.cover,300]],'',230,345,'book');
 if(href){var ca=el('a','cvl');ca.href=href;ca.target='_blank';ca.rel='noopener';ca.tabIndex=-1;ca.setAttribute('aria-hidden','true');ca.appendChild(cv);c.appendChild(ca)}else c.appendChild(cv);
 var body=el('div','meta'),h=el('h5','ti');if(href){var ta=el('a');ta.href=href;ta.target='_blank';ta.rel='noopener';ta.textContent=b.title;ta.appendChild(sr(' (opens Hardcover in a new tab)'));h.appendChild(ta)}else h.textContent=b.title;body.appendChild(h);
 if(b.author)body.appendChild(el('p','prog',b.author));if(b.startedAt)body.appendChild(el('p','prog','Started '+day(b.startedAt)));var st=stars(b.rating);if(st)body.appendChild(st);
 c.appendChild(body);li.appendChild(c);return li}
function bookRow(b){var li=el('li','bk'),href=okUrl(b.url),cv=cover([[b.cover,300]],'',44,66,'book');li.appendChild(cv);var m=el('div','meta');
 var t=el('span','ti');if(href){var a=el('a');a.href=href;a.target='_blank';a.rel='noopener';a.textContent=b.title;a.appendChild(sr(' (opens Hardcover in a new tab)'));t.appendChild(a)}else t.textContent=b.title;m.appendChild(t);
 if(b.author)m.appendChild(el('span','ar',b.author));var line=el('span','al');var st=stars(b.rating);if(st)line.appendChild(st);if(b.finishedAt){if(st)line.appendChild(document.createTextNode(' \u00b7 '));line.appendChild(document.createTextNode('Finished '+day(b.finishedAt)))}
 if(line.childNodes.length)m.appendChild(line);li.appendChild(m);return li}
function books(d){if(!d||typeof d!=='object')throw 0;var box=document.getElementById('books');
 var rd=(Array.isArray(d.reading)?d.reading:[]).filter(function(b){return b&&b.title}),yrs=(Array.isArray(d.read)?d.read:[]).filter(function(y){return y&&Array.isArray(y.books)&&y.books.length});
 var r=document.getElementById('books-reading'),ul=r.querySelector('ul');ul.textContent='';even(rd.slice(0,4)).forEach(function(b){ul.appendChild(bookCard(b))});ul.dataset.n=ul.children.length;r.hidden=!rd.length;
 var w=document.getElementById('books-read'),ys=w.querySelector('.years');ys.textContent='';
 yrs.forEach(function(y,i){var dt=el('details','yr');if(i===0)dt.open=true;var su=el('summary');su.appendChild(el('span','y',y.year?String(y.year):'No finish date'));su.appendChild(el('span','n',' '+plural(y.books.length,'book')));dt.appendChild(su);
  var l=el('ul','bks');y.books.forEach(function(b){if(b&&b.title)l.appendChild(bookRow(b))});dt.appendChild(l);ys.appendChild(dt)});
 w.hidden=!yrs.length;document.getElementById('books-empty').hidden=!!(rd.length||yrs.length);box.hidden=false}

/* ---- Live layer: paint from the workflow JSON first, then swap in live data from the public APIs.
   Any live failure (network, CORS, rate limit) silently keeps the JSON. Results are cached in
   sessionStorage for 60 s to respect rate limits. Hardcover stays JSON-only (its token is private). */
var LV=(window.SITE_CONFIG||{}).live||{},TTL=60000;
function cached(name,fn){var k='live:v1:'+name;try{var c=JSON.parse(sessionStorage.getItem(k)||'null');if(c&&Date.now()-c.t<TTL)return Promise.resolve(c.d)}catch(e){}
 return fn().then(function(d){try{sessionStorage.setItem(k,JSON.stringify({t:Date.now(),d:d}))}catch(e){}return d})}
function fetchJ(url,opt){var ac=window.AbortController?new AbortController():null,o=opt||{};if(ac){o.signal=ac.signal;setTimeout(function(){ac.abort()},8000)}
 return fetch(url,o).then(function(r){if(r.status===204)return null;if(!r.ok)throw new Error('http '+r.status);return r.json()})}
function liveLastfm(){if(!LV.lastfmKey)return Promise.reject(0);
 return cached('lastfm',function(){return fetchJ('https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&format=json&limit=100&user='+encodeURIComponent(LV.lastfmUser)+'&api_key='+encodeURIComponent(LV.lastfmKey)).then(function(j){
  if(!j||j.error||!j.recenttracks)throw 0;var raw=j.recenttracks.track;raw=Array.isArray(raw)?raw:raw?[raw]:[];
  var tr=raw.map(function(t){var by={};(t.image||[]).forEach(function(i){if(i&&i.size)by[i.size]=okUrl(i['#text'])});
   return {title:t.name,artist:(t.artist&&(t.artist['#text']||t.artist.name))||'',album:(t.album&&t.album['#text'])||null,art:by.extralarge||by.large||by.medium||null,artSmall:by.large||by.medium||null,url:t.url,
    nowPlaying:!!(t['@attr']&&t['@attr'].nowplaying==='true'),playedAt:t.date&&t.date.uts?new Date(t.date.uts*1000).toISOString().replace('.000',''):null}}).filter(function(t){return t.title&&t.artist});
  return {tracks:tr.slice(0,4),albums:group(tr).slice(0,6)}})})}
var AQ='entries{progress updatedAt media{id siteUrl title{english romaji} coverImage{medium large extraLarge} episodes chapters description(asHtml:false)}}';
function plain(d){if(!d)return null;var t=document.createElement('textarea');t.innerHTML=String(d).replace(/<br\s*\/?>/gi,' ').replace(/<[^>]*>/g,'');var s=t.value.replace(/\(Source:[^)]*\)/g,'').replace(/\s+/g,' ').trim();
 if(!s)return null;return s.length>600?s.slice(0,600).replace(/ \S*$/,'')+'...':s}
function liveAnilist(){if(!LV.anilistUser)return Promise.reject(0);
 return cached('anilist',function(){return fetchJ('https://graphql.anilist.co',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
  body:JSON.stringify({query:'query($u:String){a:MediaListCollection(userName:$u,type:ANIME,status:CURRENT){lists{'+AQ+'}} m:MediaListCollection(userName:$u,type:MANGA,status:CURRENT){lists{'+AQ+'}}}',variables:{u:LV.anilistUser}})}).then(function(j){
  if(!j||j.errors||!j.data)throw 0;function items(c,unit){var e=[];((c&&c.lists)||[]).forEach(function(l){(l.entries||[]).forEach(function(x){e.push(x)})});
   return e.sort(function(a,b){return b.updatedAt-a.updatedAt}).slice(0,4).map(function(x){var m=x.media,ci=m.coverImage||{};return {id:m.id,title:(m.title&&(m.title.english||m.title.romaji))||'',progress:x.progress||0,unit:unit,url:m.siteUrl,
    total:unit==='Ep'?m.episodes:m.chapters,description:plain(m.description),cover:okUrl(ci.large)||okUrl(ci.medium),coverXL:okUrl(ci.extraLarge),coverSmall:okUrl(ci.medium),updatedAt:x.updatedAt}})}
  return {watching:items(j.data.a,'Ep'),reading:items(j.data.m,'Ch')}})})}
function liveTrakt(){if(!LV.traktClientId)return Promise.reject(0);var H={headers:{'Content-Type':'application/json','trakt-api-version':'2','trakt-api-key':LV.traktClientId}},U='https://api.trakt.tv/users/'+encodeURIComponent(LV.traktUser)+'/';
 return cached('trakt',function(){return Promise.all([fetchJ(U+'watching?extended=images',H).catch(function(){return null}),fetchJ(U+'history?limit=100&extended=images',H)]).then(function(r){
  function img(m){var i=m&&m.images||{},u=(i.poster||[])[0]||(i.thumb||[])[0];return u?(/^https?:\/\//.test(u)?u.replace(/^http:/,'https:'):'https://'+u):null}
  function card(e,now){var sl=function(o){return (o.ids&&(o.ids.slug||o.ids.trakt))||''};
   if(e.type==='episode'&&e.show)return {key:'show:'+sl(e.show),type:'show',title:e.show.title,year:e.show.year,url:'https://trakt.tv/shows/'+sl(e.show),poster:img(e.show),episode:{season:e.episode.season,number:e.episode.number,title:e.episode.title},watchedAt:now?null:e.watched_at,nowWatching:now};
   if(e.type==='movie'&&e.movie)return {key:'movie:'+sl(e.movie),type:'movie',title:e.movie.title,year:e.movie.year,url:'https://trakt.tv/movies/'+sl(e.movie),poster:img(e.movie),episode:null,watchedAt:now?null:e.watched_at,nowWatching:now};return null}
  if(!Array.isArray(r[1]))throw 0;var all=[],seen={};[r[0]&&typeof r[0]==='object'?card(r[0],true):null].concat(r[1].map(function(e){return card(e,false)})).forEach(function(c){if(c&&!seen[c.key]){seen[c.key]=1;delete c.key;all.push(c)}});
  return {items:all.slice(0,6)}})})}

/* one feed: JSON paints first (unless live already landed), live replaces it when different */
function feed(name,url,render,live,hide){var shown=null,liveIn=false;
 var pj=get(name,url).then(function(d){if(liveIn)return;render(d);shown=JSON.stringify(d)}).catch(function(){if(!liveIn)hide()});
 var pl=live().then(function(d){liveIn=true;var j=JSON.stringify(d);if(j!==shown){render(d);shown=j}document.documentElement.dataset['live'+name.replace(/\W/g,'')]='1'}).catch(function(){});
 return Promise.all([pj,pl])}
var pm=feed('__rp','data/recent.json',music,liveLastfm,function(){document.getElementById('recent').hidden=true});
var pa=feed('__al','data/anilist.json',anilist,liveAnilist,function(){['watching','reading'].forEach(function(id){document.getElementById(id).hidden=true})});
var pt=feed('__tk','data/trakt.json',trakt,liveTrakt,function(){document.getElementById('tv').hidden=true});
var pb=get('__bk','data/books.json').then(books).catch(function(){document.getElementById('books').hidden=true});
pm.then(empty);pa.then(empty);pt.then(empty);Promise.all([pm,pa,pt,pb]).then(empty);
})();
