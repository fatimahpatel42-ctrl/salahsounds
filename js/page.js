
(function(){
  var mb=document.querySelector('[data-mode]');
  if(mb)mb.addEventListener('click',function(){var d=document.documentElement.getAttribute('data-theme')!=='dark';if(d)document.documentElement.setAttribute('data-theme','dark');else document.documentElement.removeAttribute('data-theme');try{localStorage.setItem('ss-theme',d?'dark':'light')}catch(e){}});
  var bg=document.querySelector('[data-burger]'),nv=document.getElementById('main-nav');
  if(bg&&nv){var X='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>',B=bg.innerHTML;
    var set=function(o){nv.classList.toggle('open',o);bg.setAttribute('aria-expanded',o?'true':'false');bg.innerHTML=o?X:B};
    bg.addEventListener('click',function(){set(!nv.classList.contains('open'))});nv.addEventListener('click',function(e){if(e.target.closest('a'))set(false)});}
  var WA='https://wa.me/442038177858?text=';
  // chip groups
  document.querySelectorAll('.pick').forEach(function(g){
    g.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
      g.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
      var send=document.querySelector('[data-send]');if(send&&g.dataset.group==='pref'){var v=b.textContent.trim();send.querySelector('span').textContent=v==='Email'?'Send by email':v==='Phone call'?'Request a call back':'Send on WhatsApp';}
    });
  });
  var sel=function(group){var b=document.querySelector('.pick[data-group="'+group+'"] button[aria-pressed="true"]');return b?b.textContent.trim():'';};
  var send=document.querySelector('[data-send]');
  if(send)send.addEventListener('click',function(){
    var f=send.closest('form');var v=function(n){var el=f.querySelector('[name="'+n+'"]');return el&&el.value.trim();};
    var lines=['Assalamu alaikum, new enquiry from the website ('+document.title.split('|')[0].trim()+').','Need: '+sel('need'),
      v('name')?'Name: '+v('name'):null,v('phone')?'Phone / WhatsApp: '+v('phone'):null,v('org')?'Masjid / organisation: '+v('org'):null,
      'Best way to reach me: '+sel('pref'),v('msg')?'\n'+v('msg'):null].filter(Boolean).join('\n');
    var url=sel('pref')==='Email'?'mailto:sales@salahsounds.co.uk?subject='+encodeURIComponent('Website enquiry: '+sel('need'))+'&body='+encodeURIComponent(lines):WA+encodeURIComponent(lines);
    window.open(url,'_blank','noopener');
  });
  // before/after player
  var p=document.querySelector('.player');
  if(p){
    var aB=p.querySelector('audio[data-m=before]'),aA=p.querySelector('audio[data-m=after]'),mode='after',on=false;
    var bars=p.querySelector('.bars'),tag=p.querySelector('.tag'),note=p.querySelector('.note'),btn=p.querySelector('.play');
    var drawBars=function(){bars.innerHTML='';for(var i=0;i<36;i++){var h,c,d;if(mode==='after'){h=Math.round(22+56*Math.pow(Math.sin(Math.PI*(i+.5)/36),1.4));c='linear-gradient(180deg,#4F7FE0,#7A4FC0)';d=1.2+(i%5)*.12}else{var r=(i*37+11)%13;h=12+r*5;c=h>64?'#E2665C':'#525C72';d=.35+(i%4)*.08}
      if(!on)h=Math.max(8,Math.round(h*.35));var el=document.createElement('i');el.style.height=h+'px';el.style.background=c;el.style.animationDuration=d+'s';el.style.animationDelay=((i%9)*.09)+'s';bars.appendChild(el)}};
    var cur=function(){return mode==='after'?aA:aB};
    var stop=function(){aA.pause();aB.pause()};
    var start=function(){stop();var a=cur();a.currentTime=0;var pr=a.play();if(pr&&pr.catch)pr.catch(function(){})};
    var ui=function(){p.classList.toggle('on',on);tag.textContent=mode==='after'?'After':'Before';tag.classList.toggle('after',mode==='after');
      note.textContent=mode==='after'?'After: new digital mixer, our 3-tier mic system and Haramain EQ. Clear, warm and even across the hall.':'Before: the masjid’s original setup. Press play, then switch to After to hear the difference.';
      btn.innerHTML=on?'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>':'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="margin-left:3px"><path d="M7 4.5v15l13-7.5z"/></svg>';
      btn.setAttribute('aria-label',on?'Pause':'Play recording');
      p.querySelectorAll('.seg button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.m===mode?'true':'false')});drawBars()};
    btn.addEventListener('click',function(){if(on){stop();on=false}else{start();on=true}ui()});
    p.querySelectorAll('.seg button').forEach(function(b){b.addEventListener('click',function(){mode=b.dataset.m;if(on)start();ui()})});
    [aA,aB].forEach(function(a){a.addEventListener('ended',function(){on=false;ui()})});
    ui();
  }
})();
