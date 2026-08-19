// Scroll reveal
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
}, {threshold:0.1});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

// Force hero video autoplay (iOS Safari needs an explicit muted play() call)
const heroVideo = document.getElementById('heroVideo');
if(heroVideo){
  heroVideo.muted = true;
  heroVideo.setAttribute('muted', '');
  const tryPlay = () => heroVideo.play().catch(()=>{});
  tryPlay();
  document.addEventListener('visibilitychange', ()=>{
    if(!document.hidden) tryPlay();
  });
  // Some iOS versions only allow play() after the very first user touch
  document.addEventListener('touchstart', tryPlay, { once:true, passive:true });
  document.addEventListener('click', tryPlay, { once:true });
}

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

// Contact page: chip toggle + mailto submit
const chips = document.querySelectorAll('.chip');
chips.forEach(chip=>{
  chip.addEventListener('click', ()=> chip.classList.toggle('active'));
});

const contactForm = document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.getElementById('fullName').value.trim();
    const email = document.getElementById('emailField').value.trim();
    const phone = document.getElementById('phoneField').value.trim();
    const goal = document.getElementById('goalField').value.trim();
    const selected = Array.from(document.querySelectorAll('.chip.active')).map(c=>c.textContent.trim());

    let body = `Nom : ${name}\n`;
    body += `Email : ${email}\n`;
    if(phone) body += `Téléphone : ${phone}\n`;
    if(selected.length) body += `Je cherche : ${selected.join(', ')}\n`;
    if(goal) body += `Objectif : ${goal}\n`;

    const mailto = `mailto:contact@insertio.ch?subject=${encodeURIComponent('Nouvelle demande de contact — ' + (name || 'Site web'))}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  });
}
