// Insertio : menus déroulants, menu mobile et prise de rendez-vous en fenêtre.
(function(){
  var CAL_URL = 'https://calendly.com/contact-insertio/30min?hide_gdpr_banner=1&primary_color=5d5fec';
  var header = document.getElementById('siteHeader');

  // Hauteur de l'en-tête (pour placer le menu mobile juste dessous)
  function setH(){ if(header) document.documentElement.style.setProperty('--hdr-h', header.offsetHeight + 'px'); }
  setH(); window.addEventListener('resize', setH);

  // ---------- Menus déroulants (clic, clavier, survol à la souris) ----------
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.menu-btn'));
  function closeAll(except){
    buttons.forEach(function(b){
      if(b === except) return;
      b.setAttribute('aria-expanded', 'false');
      var m = document.getElementById(b.getAttribute('aria-controls'));
      if(m) m.classList.remove('open');
    });
  }
  function toggle(btn, force){
    var menu = document.getElementById(btn.getAttribute('aria-controls'));
    var open = typeof force === 'boolean' ? force : btn.getAttribute('aria-expanded') !== 'true';
    if(open) closeAll(btn);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if(menu) menu.classList.toggle('open', open);
  }
  buttons.forEach(function(btn){
    var li = btn.parentNode, timer;
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      // si le menu vient de s'ouvrir au survol, le clic le garde ouvert
      if(btn._hoverAt && Date.now() - btn._hoverAt < 700){ toggle(btn, true); return; }
      toggle(btn);
    });
    btn.addEventListener('keydown', function(e){
      if(e.key === 'ArrowDown'){ e.preventDefault(); toggle(btn, true); var f = li.querySelector('.menu a'); if(f) f.focus(); }
    });
    // survol uniquement avec une vraie souris
    li.addEventListener('pointerenter', function(e){ if(e.pointerType === 'mouse'){ clearTimeout(timer); if(btn.getAttribute('aria-expanded') !== 'true') btn._hoverAt = Date.now(); toggle(btn, true); } });
    li.addEventListener('pointerleave', function(e){ if(e.pointerType === 'mouse'){ timer = setTimeout(function(){ toggle(btn, false); }, 160); } });
  });
  document.addEventListener('click', function(e){ if(!e.target.closest('.has-menu')) closeAll(); });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      var open = buttons.filter(function(b){ return b.getAttribute('aria-expanded') === 'true'; })[0];
      closeAll(); closeMobile();
      if(open) open.focus();
    }
  });

  // ---------- Menu mobile ----------
  var burger = document.querySelector('.burger');
  var mobile = document.getElementById('mobileMenu');
  function closeMobile(){
    if(!burger || !mobile) return;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    mobile.classList.remove('open');
    document.body.classList.remove('menu-open');
  }
  if(burger && mobile){
    burger.addEventListener('click', function(){
      var open = burger.getAttribute('aria-expanded') !== 'true';
      setH();
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      mobile.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
    });
    mobile.addEventListener('click', function(e){ if(e.target.closest('a')) closeMobile(); });
  }

  // ---------- Prise de rendez-vous en fenêtre (Calendly) ----------
  var loading = null;
  function loadCalendly(cb){
    if(window.Calendly && window.Calendly.initPopupWidget) return cb(true);
    if(!loading){
      loading = [];
      var css = document.createElement('link');
      css.rel = 'stylesheet'; css.href = 'https://assets.calendly.com/assets/external/widget.css';
      document.head.appendChild(css);
      var s = document.createElement('script');
      s.src = 'https://assets.calendly.com/assets/external/widget.js'; s.async = true;
      s.onload = function(){ loading.forEach(function(f){ f(true); }); loading = null; };
      s.onerror = function(){ loading.forEach(function(f){ f(false); }); loading = null; };
      document.head.appendChild(s);
    }
    if(loading) loading.push(cb);
  }
  // Préchargement discret dès que la page est prête
  window.addEventListener('load', function(){ setTimeout(function(){ loadCalendly(function(){}); }, 1500); });

  var onContactPage = !!document.getElementById('rdv');
  document.addEventListener('click', function(e){
    var a = e.target.closest('[data-rdv]');
    if(!a) return;
    if(onContactPage) return; // sur la page contact, on descend simplement au calendrier
    e.preventDefault();
    var fallback = a.getAttribute('href') || 'contact.html#rdv';
    var tip = document.createElement('div');
    tip.className = 'rdv-loading'; tip.setAttribute('role', 'status'); tip.textContent = 'Ouverture du calendrier…';
    document.body.appendChild(tip);
    var done = false;
    var t = setTimeout(function(){ if(!done){ done = true; tip.remove(); window.location.href = fallback; } }, 5000);
    loadCalendly(function(ok){
      if(done) return; done = true; clearTimeout(t); tip.remove();
      if(ok && window.Calendly){ window.Calendly.initPopupWidget({url: CAL_URL}); }
      else { window.location.href = fallback; }
    });
  });
})();
