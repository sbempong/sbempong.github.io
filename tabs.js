(function(){'use strict';
var C=window.SITE_CONFIG||{},gh='https://github.com/'+C.githubUser;
document.querySelectorAll('[data-gh]').forEach(function(a){a.href=gh;a.textContent='github.com/'+C.githubUser});
document.querySelectorAll('[data-ghlink]').forEach(function(a){a.href=gh});
document.querySelectorAll('[data-repo]').forEach(function(a){a.href=gh+'/'+a.getAttribute('data-repo')});
/* Upgrade the anchor nav into an ARIA tablist. Without JavaScript the links simply jump to each section. */
var list=document.getElementById('tabs'),tabs=[].slice.call(list.querySelectorAll('a')),panels=tabs.map(function(t){return document.getElementById(t.hash.slice(1))});
list.setAttribute('role','tablist');list.parentNode.removeAttribute('aria-label');list.setAttribute('aria-label','Sections');
tabs.forEach(function(t,i){t.parentNode.setAttribute('role','presentation');t.setAttribute('role','tab');t.setAttribute('aria-controls',panels[i].id);
 panels[i].setAttribute('role','tabpanel');panels[i].setAttribute('aria-labelledby',t.id);panels[i].tabIndex=0;
 t.addEventListener('click',function(e){e.preventDefault();show(i,true)});
 t.addEventListener('keydown',function(e){var k=e.key,j=k==='ArrowRight'?(i+1)%tabs.length:k==='ArrowLeft'?(i+tabs.length-1)%tabs.length:k==='Home'?0:k==='End'?tabs.length-1:-1;if(j>=0){e.preventDefault();show(j,true);tabs[j].focus()}})});
function show(i,push){tabs.forEach(function(t,j){var on=i===j;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;panels[j].hidden=!on});if(push&&history.replaceState)history.replaceState(null,'',tabs[i].hash)}
var start=tabs.findIndex(function(t){return t.hash===location.hash});show(start<0?0:start,false);
document.documentElement.classList.add('js');
addEventListener('hashchange',function(){var j=tabs.findIndex(function(t){return t.hash===location.hash});if(j>=0)show(j,false)});
})();
