// Section Instagram : affiche automatiquement les 4 dernières publications d'Insertio.
// Le flux vient de Behold (behold.so), qui se met à jour tout seul à chaque nouveau post.
// Pour l'activer : coller l'identifiant du flux Behold dans data-feed="..." (index.html).
(function(){
  var box = document.getElementById('igFeed');
  if(!box) return;
  var feed = (box.getAttribute('data-feed') || '').trim();
  var profile = box.getAttribute('data-profile');
  var max = parseInt(box.getAttribute('data-count') || '4', 10);
  if(!feed){ box.classList.add('ig-empty'); return; }

  function esc(s){ return String(s || '').replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }
  function img(p){
    var s = p.sizes || {};
    var pick = (s.medium && s.medium.mediaUrl) || (s.large && s.large.mediaUrl) || p.thumbnailUrl || p.mediaUrl;
    return pick;
  }
  var url = /^https?:/.test(feed) ? feed : 'https://feeds.behold.so/' + feed;
  fetch(url).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); }).then(function(data){
    var posts = Array.isArray(data) ? data : (data.posts || []);
    posts = posts.filter(function(p){ return img(p); }).slice(0, max);
    if(!posts.length){ box.classList.add('ig-empty'); return; }
    box.innerHTML = posts.map(function(p){
      var cap = p.prunedCaption || p.caption || '';
      var video = p.mediaType === 'VIDEO';
      return '<a class="ig-post" href="' + esc(p.permalink || profile) + '" target="_blank" rel="noopener" aria-label="Voir la publication sur Instagram">' +
        '<img src="' + esc(img(p)) + '" alt="' + esc(cap.slice(0, 120)) + '" loading="lazy">' +
        (video ? '<span class="ig-badge" aria-hidden="true">▶</span>' : '') +
        '<span class="ig-cap">' + esc(cap.slice(0, 110)) + (cap.length > 110 ? '…' : '') + '</span></a>';
    }).join('');
    box.classList.add('ig-ready');
  }).catch(function(){ box.classList.add('ig-empty'); });
})();
