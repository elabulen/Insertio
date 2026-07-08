// Scroll reveal
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
}, {threshold:0.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

// Team philosophy bubbles: hover works natively via CSS.
// On touch devices (no hover), tap toggles the bubble instead.
const teamMembers = document.querySelectorAll('.member');
if(teamMembers.length){
  teamMembers.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const alreadyShown = btn.classList.contains('show');
      teamMembers.forEach(m=> m.classList.remove('show'));
      if(!alreadyShown) btn.classList.add('show');
    });
  });
  document.addEventListener('click', (e)=>{
    if(!e.target.closest('.member')){
      teamMembers.forEach(m=> m.classList.remove('show'));
    }
  });
}

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
