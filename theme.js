/* Light/dark toggle. The button is a toggle for "Dark theme" (aria-pressed). The choice is saved
   in localStorage; with no saved choice the page follows prefers-color-scheme. */
(function(){'use strict';
var b=document.getElementById('theme-toggle');if(!b)return;var root=document.documentElement,mq=window.matchMedia('(prefers-color-scheme: dark)');
function isDark(){var t=root.dataset.theme;return t?t==='dark':mq.matches}
var su=b.querySelector('.sun'),mo=b.querySelector('.moon');
function show(el,on){if(!el)return;el.hidden=!on;el.style.display=on?'block':'none'}
function sync(){var d=isDark();b.setAttribute('aria-pressed',d?'true':'false');show(su,!d);show(mo,d)}
b.addEventListener('click',function(){var t=isDark()?'light':'dark';root.dataset.theme=t;try{localStorage.setItem('theme',t)}catch(e){}sync()});
if(mq.addEventListener)mq.addEventListener('change',sync);sync();
})();
