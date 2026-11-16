// Insertio : menus déroulants, menu mobile et prise de rendez-vous en fenêtre.
(function(){
  // Lien de réservation Calendly. Si le lien change dans Calendly, il suffit de le modifier ici et dans contact.html.
  var CAL_URL = 'https://calendly.com/contact-insertio/1h?hide_gdpr_banner=1&primary_color=5d5fec';
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
  // Le calendrier est préparé en arrière-plan (fenêtre cachée) peu après l'arrivée sur la page,
  // ou dès qu'on survole le bouton : au clic, il s'affiche tout de suite, sans attendre le chargement.
  ['https://calendly.com', 'https://assets.calendly.com'].forEach(function(h){
    var l = document.createElement('link'); l.rel = 'preconnect'; l.href = h; l.crossOrigin = ''; document.head.appendChild(l);
  });
  var modal = null, frame = null;
  function prepare(){
    if(modal) return;
    var st = document.createElement('style');
    st.textContent = '.cal-modal{position:fixed;inset:0;z-index:9998;display:flex;align-items:center;justify-content:center;background:rgba(20,20,43,.55);padding:16px;visibility:hidden;opacity:0;transition:opacity .18s}'+
      '.cal-modal.open{visibility:visible;opacity:1}'+
      '.cal-box{position:relative;width:100%;max-width:1000px;height:min(760px,calc(100vh - 32px));background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 20px 60px rgba(20,20,43,.35)}'+
      '.cal-box iframe{position:relative;z-index:1;width:100%;height:100%;border:0;background:transparent}'+
      '.cal-wait{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:10px;font-weight:700;color:#5d5fec}'+
      '.cal-close{position:absolute;top:10px;right:10px;z-index:2;width:40px;height:40px;border-radius:50%;border:0;background:#14142b;color:#fff;font-size:22px;line-height:40px;cursor:pointer}'+
      '@media (max-width:640px){.cal-modal{padding:0}.cal-box{height:100%;max-width:none;border-radius:0}}';
    document.head.appendChild(st);
    modal = document.createElement('div'); modal.className = 'cal-modal'; modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true'); modal.setAttribute('aria-label','Prendre rendez-vous');
    modal.innerHTML = '<div class="cal-box"><div class="cal-wait">Chargement du calendrier…</div><button type="button" class="cal-close" aria-label="Fermer">×</button></div>';
    frame = document.createElement('iframe'); frame.title = 'Prendre rendez-vous avec Insertio'; frame.src = CAL_URL; frame.setAttribute('allow','payment');
    modal.querySelector('.cal-box').appendChild(frame);
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e){ if(e.target === modal || e.target.closest('.cal-close')) closeCal(); });
  }
  var lastFocus = null;
  function openCal(){ prepare(); lastFocus = document.activeElement; modal.classList.add('open'); document.documentElement.style.overflow = 'hidden'; modal.querySelector('.cal-close').focus(); }
  function closeCal(){ if(!modal) return; modal.classList.remove('open'); document.documentElement.style.overflow = ''; if(lastFocus && lastFocus.focus) lastFocus.focus(); }
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && modal && modal.classList.contains('open')) closeCal(); });

  var onContactPage = !!document.getElementById('rdv');
  var hasButton = !!document.querySelector('[data-rdv]');
  var saveData = navigator.connection && navigator.connection.saveData;
  if(!onContactPage && hasButton){
    // préparation en arrière-plan, quand la page a fini de se charger
    window.addEventListener('load', function(){ if(!saveData) setTimeout(prepare, 2500); });
    // ou dès qu'on approche le bouton
    ['mouseover','touchstart','focusin'].forEach(function(ev){
      document.addEventListener(ev, function(e){ if(e.target.closest && e.target.closest('[data-rdv]')) prepare(); }, {passive:true});
    });
  }
  document.addEventListener('click', function(e){
    var a = e.target.closest('[data-rdv]');
    if(!a) return;
    if(onContactPage) return; // sur la page contact, on descend simplement au calendrier
    e.preventDefault();
    openCal();
  });
})();
