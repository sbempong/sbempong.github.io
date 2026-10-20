/* Recently played strip from data/recent.json (written by .github/workflows/lastfm.yml).
   Stays hidden when the file is missing, empty or broken. No audio. */
(function(){'use strict';
var box=document.getElementById('recent');if(!box||!window.fetch)return;
var STAR='2a96cbd8b46e442fc41c2b86b821562f';
var NOTE='<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
function okUrl(u){return typeof u==='string'&&/^https:\/\//.test(u)&&u.indexOf(STAR)<0?u:null}
function artOf(t){var a=okUrl(t.art);if(a)return a;if(Array.isArray(t.image)){var by={};t.image.forEach(function(i){if(i&&i.size)by[i.size]=okUrl(i['#text'])});return by.large||by.medium||null}return null}
function ph(label){var s=document.createElement('span');s.className='art art-ph';s.setAttribute('role','img');s.setAttribute('aria-label',label);s.innerHTML=NOTE;return s}
var root=document.documentElement;
(window.__rp||fetch('data/recent.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.json()})).then(function(d){
 var tr=(d&&Array.isArray(d.tracks)?d.tracks:[]).filter(function(t){return t&&t.title&&t.artist}).slice(0,4);if(!tr.length)return;
 var ul=box.querySelector('ul');
 tr.forEach(function(t){var li=document.createElement('li'),label='Album art for '+t.title+' by '+t.artist,el,src=artOf(t);
  var a=document.createElement(okUrl(t.url)?'a':'span');if(a.tagName==='A'){a.href=t.url;a.target='_blank';a.rel='noopener'}
  a.title=t.title+' by '+t.artist+(t.nowPlaying?' (now playing)':'');if(a.tagName==='A')a.setAttribute('aria-label',t.title+' by '+t.artist+(t.nowPlaying?', now playing':'')+' (opens Last.fm)');a.className='rt';
  if(src){el=document.createElement('img');el.className='art';el.width=34;el.height=34;el.decoding='async';el.alt=label;el.referrerPolicy='no-referrer';
   el.addEventListener('error',function(){el.replaceWith(ph(label))});el.src=src}else el=ph(label);
  a.appendChild(el);var m=document.createElement('span');m.className='meta';
  var ti=document.createElement('span');ti.className='t';ti.textContent=t.title;var ar=document.createElement('span');ar.className='a';ar.textContent=t.artist;
  if(t.nowPlaying){var n=document.createElement('span');n.className='np';n.textContent=' \u00b7 now';ar.appendChild(n)}
  m.appendChild(ti);m.appendChild(ar);a.appendChild(m);
  li.appendChild(a);ul.appendChild(li)});
 /* Re-centre only if the page has not been painted yet; a late result just extends downward. */
 if(root.classList.contains('rp-wait'))root.classList.add('has-recent');
 box.hidden=false}).catch(function(){box.hidden=true}).then(function(){root.classList.remove('rp-wait')});
})();
