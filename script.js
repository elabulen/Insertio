// Scroll reveal
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
}, {threshold:0.1});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

// Force muted autoplay videos to actually play (mobile browsers need an explicit
// muted play() call, retried across several lifecycle events since a single early
// call can fail silently). Applies to the hero video and the program card videos.
function forceAutoplay(video){
  if(!video) return;
  video.muted = true;
  video.defaultMuted = true;
  video.setAttribute('muted', '');
  let played = false;
  const tryPlay = () => {
    if(played) return;
    const p = video.play();
    if(p && typeof p.then === 'function'){
      p.then(()=>{ played = true; }).catch(()=>{});
    }
  };
  tryPlay();
  ['loadedmetadata','loadeddata','canplay','canplaythrough'].forEach(evt=>{
    video.addEventListener(evt, tryPlay);
  });
  window.addEventListener('load', tryPlay);
  document.addEventListener('visibilitychange', ()=>{
    if(!document.hidden) tryPlay();
  });
  // Some browsers only allow play() right after the very first user gesture
  document.addEventListener('touchstart', tryPlay, { once:true, passive:true });
  document.addEventListener('click', tryPlay, { once:true });
  // Manual fallback: tapping the video itself always starts it
  video.addEventListener('click', ()=> video.play().catch(()=>{}));
}

const heroVideo = document.getElementById('heroVideo');
forceAutoplay(heroVideo);
document.querySelectorAll('.program-media video').forEach(forceAutoplay);

// Header background on scroll
const header = document.getElementById('siteHeader');
const stickyCta = document.getElementById('stickyCta');
function onScroll(){
  const y = window.scrollY;
  if(header) header.classList.toggle('scrolled', y > 40);
  if(stickyCta) stickyCta.classList.toggle('show', y > 600);
}
window.addEventListener('scroll', onScroll);
onScroll();

// Back to top
const backToTop = document.getElementById('backToTop');
if(backToTop){
  backToTop.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
}

// Team member click-to-expand panel
const memberWraps = document.querySelectorAll('.member-wrap');
memberWraps.forEach(wrap=>{
  const btn = wrap.querySelector('.member');
  btn.addEventListener('click', ()=>{
    const isOpen = wrap.classList.contains('open');
    memberWraps.forEach(w=> w.classList.remove('open'));
    if(!isOpen) wrap.classList.add('open');
  });
});
document.addEventListener('click', (e)=>{
  if(!e.target.closest('.member-wrap')){
    memberWraps.forEach(w=> w.classList.remove('open'));
  }
});

// Contact page: chip toggle + real Web3Forms submission (stays on site)
const chips = document.querySelectorAll('.chip');
const selectedNeeds = document.getElementById('selectedNeeds');
chips.forEach(chip=>{
  chip.addEventListener('click', ()=>{
    chip.classList.toggle('active');
    if(selectedNeeds){
      const selected = Array.from(document.querySelectorAll('.chip.active')).map(c=>c.textContent.trim());
      selectedNeeds.value = selected.join(', ');
    }
  });
});

const contactForm = document.getElementById('contactForm');
if(contactForm){
  const submitBtn = document.getElementById('submitBtn');
  const formNote = document.getElementById('formNote');

  contactForm.addEventListener('submit', async function(e){
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';

    try{
      const formData = new FormData(contactForm);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });
      const result = await response.json();

      if(result.success){
        contactForm.reset();
        chips.forEach(c=> c.classList.remove('active'));
        submitBtn.textContent = 'Envoyé ✓';
        formNote.textContent = "Merci ! Ta demande a bien été envoyée, on te recontacte sous 24 heures.";
        formNote.style.color = 'var(--violet)';
      } else {
        throw new Error(result.message || 'Erreur inconnue');
      }
    } catch(err){
      submitBtn.textContent = 'Envoyer ma demande';
      formNote.textContent = "L'envoi a échoué. Réessaie, ou écris-nous directement à contact@insertio.ch.";
      formNote.style.color = '#D14885';
    } finally {
      submitBtn.disabled = false;
      setTimeout(()=>{ if(submitBtn.textContent === 'Envoyé ✓') submitBtn.textContent = 'Envoyer ma demande'; }, 4000);
    }
  });
}
