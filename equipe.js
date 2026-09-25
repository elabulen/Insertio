// Pages profil de l'équipe : sommaire actif, barre de progression,
// frise qui se remplit au défilement et apparition des blocs.
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Le sommaire se colle juste sous l'en-tête du site
  var header = document.getElementById('siteHeader');
  function setHeaderHeight(){
    if(header) document.documentElement.style.setProperty('--hdr', header.offsetHeight + 'px');
  }
  setHeaderHeight();
  window.addEventListener('resize', setHeaderHeight);

  // Apparition des blocs (une seule fois)
  var fx = document.querySelectorAll('.fx');
  if('IntersectionObserver' in window && !reduce){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold:0.12, rootMargin:'0px 0px -40px 0px'});
    fx.forEach(function(el){ io.observe(el); });
  } else {
    fx.forEach(function(el){ el.classList.add('in'); });
  }

  // Sommaire : section active
  var links = Array.prototype.slice.call(document.querySelectorAll('.p-subnav a'));
  var sections = links.map(function(a){ return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  function setActive(id){
    links.forEach(function(a){
      var on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('active', on);
      if(on){ a.setAttribute('aria-current', 'true'); } else { a.removeAttribute('aria-current'); }
    });
    var cur = document.querySelector('.p-subnav a.active');
    if(cur && cur.parentNode.scrollTo){
      var bar = cur.parentNode;
      bar.scrollTo({left: cur.offsetLeft - bar.clientWidth/2 + cur.clientWidth/2, behavior: reduce ? 'auto' : 'smooth'});
    }
  }

  var progress = document.querySelector('.p-progress');
  var timelines = document.querySelectorAll('.tl');

  function onScroll(){
    var y = window.scrollY, vh = window.innerHeight;
    // barre de progression
    if(progress){
      var max = document.documentElement.scrollHeight - vh;
      progress.style.width = (max > 0 ? Math.min(100, y / max * 100) : 0) + '%';
    }
    // section active : la dernière dont le haut a passé le tiers de l'écran
    var current = sections.length ? sections[0].id : null;
    sections.forEach(function(s){ if(s.getBoundingClientRect().top < vh * 0.35) current = s.id; });
    if(current) setActive(current);
    // frises
    timelines.forEach(function(tl){
      var r = tl.getBoundingClientRect();
      var ratio = Math.max(0, Math.min(1, (vh * 0.6 - r.top) / r.height));
      var fill = tl.querySelector('.tl-fill');
      if(fill) fill.style.height = (ratio * (r.height - 16)) + 'px';
      tl.querySelectorAll('.tl-items > li').forEach(function(li){
        li.classList.toggle('reached', li.getBoundingClientRect().top + 30 < vh * 0.6);
      });
    });
  }
  var ticking = false;
  window.addEventListener('scroll', function(){
    if(!ticking){ ticking = true; requestAnimationFrame(function(){ onScroll(); ticking = false; }); }
  }, {passive:true});
  window.addEventListener('resize', onScroll);
  onScroll();
})();
