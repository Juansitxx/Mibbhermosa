// Manejo de la galería y lightbox
(function(){
  const gallery = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxVideo = document.getElementById('lightbox-video');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const openGalleryBtn = document.getElementById('open-gallery');
  let currentIndex = 0;


  // cursor trail element
  const cursorTrail = document.getElementById('cursor-trail');

  // Hero parallax and title glitch
  const hero = document.getElementById('hero');
  const heroInner = document.querySelector('.hero-inner');
  const heroShapes = document.querySelectorAll('.hero-shapes .shape');
  const titleEl = document.querySelector('.title');

  if(hero){
    hero.addEventListener('mousemove', (e)=>{
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) - r.width/2;
      const y = (e.clientY - r.top) - r.height/2;
      const tx = x/40; const ty = y/50;
      if(heroInner) heroInner.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      heroShapes && heroShapes.forEach((s, i)=>{ const fx = (x/(40 + i*20)); const fy = (y/(60 + i*30)); s.style.transform = `translate3d(${fx}px, ${fy}px, 0) rotate(${i*10}deg)`; });
    });
    hero.addEventListener('mouseleave', ()=>{ if(heroInner) heroInner.style.transform=''; heroShapes && heroShapes.forEach(s=> s.style.transform=''); });
  }

  // subtle glitch effect on the title every few seconds
  if(titleEl){ setInterval(()=>{ titleEl.classList.add('glitch'); setTimeout(()=> titleEl.classList.remove('glitch'), 600); }, 3800); }

  // Splash and audio: espera interacción del usuario para desbloquear audio
  const splash = document.getElementById('splash');
  const splashBtn = document.getElementById('splash-button');
  const bgAudio = document.getElementById('bg-audio');
  const volumeSlider = document.getElementById('volume-slider');
  let musicPlaying = false;

  // make music quieter by default (after bgAudio is available)
  if(bgAudio){ try{ bgAudio.volume = 0.12; if(volumeSlider) volumeSlider.value = Math.round(bgAudio.volume * 100); }catch(e){} }

  function hideSplash(){ if(!splash) return; splash.setAttribute('aria-hidden','true'); }
  function tryPlayAudio(){ if(!bgAudio) return Promise.resolve(); return bgAudio.play().then(()=>{ musicPlaying = true; }).catch(()=>{}); }

  if(splashBtn){
    const splashHandler = ()=>{
      // ocultar splash y reproducir audio si existe
      hideSplash();
      document.body.classList.remove('splash-active-body');
      tryPlayAudio();
    };
    splashBtn.addEventListener('click', splashHandler);
    // pointerdown para mejor respuesta en móviles
    splashBtn.addEventListener('pointerdown', splashHandler);
  }

  // permitir click en cualquier parte del splash para entrar
  // Do NOT allow clicking the splash background or pressing global Enter/Space to dismiss.
  // The splash should only be dismissed via the explicit splash button (handled above).
  // Keep the block intentionally empty to avoid accidental dismissal from clicks/keys.
  if(splash){
    // no-op: only splashBtn click/pointerdown should dismiss
  }

  // Volume slider behavior: change audio volume in real time
  if(volumeSlider){
    // ensure initial slider value matches audio volume
    try{ if(bgAudio) volumeSlider.value = Math.round(bgAudio.volume * 100); }catch(e){}

    // helper to update the slider visual fill (uses CSS variables via inline background)
    function updateSliderFill(val){
      // val: 0..100
      if(!volumeSlider) return;
      // use CSS var for accent color; inline background uses var() so it resolves in the element context
      volumeSlider.style.background = `linear-gradient(90deg, var(--accent) ${val}%, rgba(255,255,255,0.04) ${val}%)`;
    }

    // initial fill
    try{ updateSliderFill(Number(volumeSlider.value)); }catch(e){}

    volumeSlider.addEventListener('input', (ev)=>{
      const raw = Number(ev.target.value);
      const v = raw / 100;
      if(bgAudio) bgAudio.volume = v;
      updateSliderFill(raw);
    });
  }

  // cuando se carga la página, asegurarnos de que el splash oculte el scroll
  if(splash && splash.getAttribute && splash.getAttribute('aria-hidden') !== 'true'){
    document.body.classList.add('splash-active-body');
  }

  function showLightbox(index){
    const item = gallery[index];
    if(!item) return;
    // Determine if item is image or video
    const type = item.dataset && item.dataset.type ? item.dataset.type : (item.tagName === 'VIDEO' ? 'video' : 'image');
    if(type === 'video'){
      // show video
      lightboxImg.style.display = 'none';
      lightboxVideo.style.display = '';
      lightboxVideo.src = item.currentSrc || item.src || item.getAttribute('src');
      lightboxVideo.muted = true; // autoplay allowed when muted
      lightboxVideo.play().catch(()=>{});
    } else {
      // show image
      lightboxVideo.pause();
      lightboxVideo.src = '';
      lightboxVideo.style.display = 'none';
      lightboxImg.style.display = '';
      lightboxImg.src = item.currentSrc || item.src || item.getAttribute('src');
      lightboxImg.alt = item.alt || 'Foto';
    }
    lightbox.setAttribute('aria-hidden','false');
    currentIndex = index;
  }
  function closeLightbox(){
    lightbox.setAttribute('aria-hidden','true');
    lightboxImg.src = '';
    if(lightboxVideo){ lightboxVideo.pause(); lightboxVideo.src = ''; lightboxVideo.style.display = 'none'; }
  }

  gallery.forEach((el, i)=>{ 
    // show thumbnail previews for videos
    if(el.tagName === 'VIDEO'){ el.muted = true; el.loop = true; el.play().catch(()=>{}); }
    el.addEventListener('click', ()=> showLightbox(i));
  });

  // 3D tilt for gallery items + cursor trail
  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
  gallery.forEach((el)=>{
    // add mousemove tilt
    el.addEventListener('mousemove', (ev)=>{
      const r = el.getBoundingClientRect();
      const px = (ev.clientX - r.left)/r.width - 0.5; // -0.5 .. 0.5
      const py = (ev.clientY - r.top)/r.height - 0.5;
      const rotX = clamp(-py*12, -18, 18);
      const rotY = clamp(px*16, -20, 20);
      el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
      // create small cursor dot occasionally
      if(cursorTrail && Math.random() > 0.92){ const dot = document.createElement('div'); dot.className='cursor-dot'; dot.style.left = ev.pageX+'px'; dot.style.top = ev.pageY+'px'; cursorTrail.appendChild(dot); setTimeout(()=> dot.remove(),900); }
    });
    el.addEventListener('mouseleave', ()=>{ el.style.transform=''; });
  });

  // global cursor trail (small particles following cursor)
  if(cursorTrail){
    let lastAdd = 0;
    document.addEventListener('mousemove', (e)=>{
      const now = Date.now();
      if(now - lastAdd < 40) return; lastAdd = now;
      const d = document.createElement('div'); d.className = 'cursor-dot'; d.style.left = e.pageX + 'px'; d.style.top = e.pageY + 'px'; d.style.width = (6 + Math.random()*10) + 'px'; d.style.height = d.style.width; d.style.opacity = 0.9 * (0.6 + Math.random()*0.4);
      cursorTrail.appendChild(d);
      setTimeout(()=>{ d.style.transition = 'transform 700ms cubic-bezier(.2,.9,.2,1), opacity 700ms'; d.style.transform = 'translateY(-40px) scale(0.3)'; d.style.opacity = '0'; }, 20);
      setTimeout(()=> d.remove(), 900);
    });
  }
  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e)=>{ if(e.target===lightbox) closeLightbox(); });
  prevBtn.addEventListener('click', ()=> showLightbox((currentIndex-1+gallery.length)%gallery.length));
  nextBtn.addEventListener('click', ()=> showLightbox((currentIndex+1)%gallery.length));
  openGalleryBtn && openGalleryBtn.addEventListener('click', ()=> document.getElementById('gallery').scrollIntoView({behavior:'smooth'}));

  // Botón "Te amo" lanza confetti y corazones
  const sendLove = document.getElementById('send-love');
  const confettiCanvas = document.getElementById('confetti-canvas');
  let confCtx = null;
  if(confettiCanvas){ confCtx = confettiCanvas.getContext('2d'); resizeCanvas(); window.addEventListener('resize', resizeCanvas); }

  function resizeCanvas(){ if(!confettiCanvas) return; confettiCanvas.width = confettiCanvas.clientWidth; confettiCanvas.height = confettiCanvas.clientHeight; }

  sendLove && sendLove.addEventListener('click', ()=>{
    launchConfetti();
    emitHearts(12);
    // Fullscreen heart blast (big, covering the screen)
    createFullScreenHearts(80);
  });

  /* ---- Effects panel handlers ---- */
  const effectsToggle = document.getElementById('effects-toggle');
  const effectsPanel = document.getElementById('effects-panel');
  if(effectsToggle && effectsPanel){
    effectsToggle.addEventListener('click', ()=>{
      const hidden = effectsPanel.getAttribute('aria-hidden') === 'true';
      effectsPanel.setAttribute('aria-hidden', hidden ? 'false' : 'true');
    });
    // delegate clicks
    effectsPanel.addEventListener('click',(e)=>{
      const btn = e.target.closest('.effect-btn'); if(!btn) return;
      const eff = btn.dataset.effect;
      if(eff === 'hearts') createFullScreenHearts(60);
      if(eff === 'msgs') createFloatingMessages(8);
      if(eff === 'rain') createRain(180);
      if(eff === 'stars') createStars(120);
      if(eff === 'moon') createMoon();
    });
  }

  // Floating messages
  function createFloatingMessages(count){
    const texts = ['Te quiero', 'Eres preciosa', 'Contigo', 'Siempre', 'Mi Preciosa', 'Mi Amor' , 'Mi Flaca'];
    for(let i=0;i<count;i++){
      const msg = document.createElement('div'); msg.className='floating-msg'; msg.textContent = texts[i % texts.length];
      const offset = (Math.random()*40 - 20); msg.style.left = `calc(50% + ${offset}%)`;
      const delay = Math.floor(Math.random()*400);
      const dur = 4000 + Math.floor(Math.random()*3000);
      msg.style.animation = `float-msg ${dur}ms linear ${delay}ms forwards`;
      document.body.appendChild(msg);
      msg.addEventListener('animationend', ()=> msg.remove());
    }
  }

  // Rain effect: many drops falling
  function createRain(count){
    const overlay = document.createElement('div'); overlay.className = 'rains-overlay';
    document.body.appendChild(overlay);
    const w = window.innerWidth;
    for(let i=0;i<count;i++){
      const drop = document.createElement('div'); drop.className = 'drop';
      const left = Math.random()*100; const delay = Math.random()*1000; const dur = 1200 + Math.random()*1600;
      drop.style.left = left + '%'; drop.style.height = (12 + Math.random()*24) + 'px';
      drop.style.animation = `drop-fall ${dur}ms linear ${delay}ms forwards`;
      drop.style.opacity = (0.04 + Math.random()*0.12).toFixed(2);
      overlay.appendChild(drop);
      drop.addEventListener('animationend', ()=> drop.remove());
    }
    // remove overlay after a while
    setTimeout(()=>{ if(document.body.contains(overlay)) overlay.remove(); }, 7000);
  }

  // Stars effect: add many twinkling stars
  function createStars(count){
    const overlay = document.createElement('div'); overlay.className = 'stars-overlay';
    document.body.appendChild(overlay);
    for(let i=0;i<count;i++){
      const s = document.createElement('div'); s.className = 'star';
      s.style.left = (Math.random()*100) + '%'; s.style.top = (Math.random()*80) + '%';
      s.style.width = (1 + Math.random()*3) + 'px'; s.style.height = s.style.width;
      s.style.opacity = (0.4 + Math.random()*0.8).toFixed(2);
      s.style.animationDelay = (Math.random()*2500) + 'ms';
      overlay.appendChild(s);
    }
    // keep stars for a while then remove
    setTimeout(()=>{ if(document.body.contains(overlay)) overlay.remove(); }, 20000);
  }

  // Moon: place a moon element with glow
  function createMoon(){
    // create multiple moons scattered across the viewport
    const count = 8 + Math.floor(Math.random() * 6); // 8..13 moons
    const moons = [];
    for(let i=0;i<count;i++){
      const m = document.createElement('div');
      m.className = 'moon';
      const size = Math.floor(60 + Math.random()*160); // px
      const left = Math.random() * 100; // percent
      const top = Math.random() * 60; // percent from top
      m.style.width = size + 'px';
      m.style.height = size + 'px';
      m.style.left = left + '%';
      m.style.top = top + '%';
      m.style.opacity = '0';
      // vary float duration and start delay so moons feel organic
      const delay = Math.floor(Math.random() * 1200);
      const dur = 6000 + Math.floor(Math.random() * 8000);
      m.style.animation = `moon-float ${dur}ms ease-in-out ${delay}ms infinite`;
      // slight variation in shadow
      m.style.boxShadow = `0 ${8 + Math.random()*18}px ${20 + Math.random()*30}px rgba(150,110,190,${0.08 + Math.random()*0.12})`;
      document.body.appendChild(m);
      // trigger glow class on next frame
      requestAnimationFrame(()=> m.classList.add('glow'));
      moons.push(m);
    }
    // cleanup after visible period
    setTimeout(()=>{
      moons.forEach(m=>{ if(m){ m.classList.remove('glow'); setTimeout(()=> m.remove(), 800); } });
    }, 18000);
  }

  // Create many large hearts across the screen for dramatic effect
  function createFullScreenHearts(count){
    if(!count || count <= 0) return;
    const overlay = document.createElement('div'); overlay.className = 'hearts-overlay';
    document.body.appendChild(overlay);
    let removed = 0;
    for(let i=0;i<count;i++){
      const h = document.createElement('div');
      h.className = 'heart-large';
      h.textContent = '❤';
      // random origin across width
      const left = Math.random()*100; // percent
      const tx = (Math.random()*200 - 100) + 'vw'; // horizontal travel
      const ty = Math.floor(Math.random()*200 - 50) + 'vh';
      const rot = Math.floor(Math.random()*720 - 360) + 'deg';
      const s = (0.8 + Math.random()*1.6).toFixed(2);
      const delay = Math.floor(Math.random()*400);
      const dur = 2500 + Math.floor(Math.random()*3500);
      h.style.left = left + '%';
      h.style.setProperty('--tx', tx);
      h.style.setProperty('--ty', ty + '');
      h.style.setProperty('--rot', rot);
      h.style.setProperty('--s', s);
      h.style.fontSize = (28 + Math.random()*80) + 'px';
      // color palette
      const colors = ['#ff6b98','#ff9cc2','#ffc1e3','#ff6b66','#ffd166'];
      h.style.color = colors[Math.floor(Math.random()*colors.length)];
      h.style.animation = `heart-pop ${dur}ms cubic-bezier(.2,.8,.2,1) ${delay}ms forwards`;
      overlay.appendChild(h);
      // cleanup after animation
      h.addEventListener('animationend', ()=>{
        h.remove();
        removed++;
        if(removed === count){ overlay.remove(); }
      });
    }
    // safety: remove overlay after max time
    setTimeout(()=>{ if(document.body.contains(overlay)) overlay.remove(); }, 12000);
  }

  // Reveal on scroll using IntersectionObserver
  function initReveal(){
    const revealElems = [].slice.call(document.querySelectorAll('.card, .gallery-item, .hero-inner'));
    revealElems.forEach(el=> el.classList.add('reveal'));
    if('IntersectionObserver' in window){
      const obs = new IntersectionObserver((entries)=>{
        entries.forEach(ent=>{
          if(ent.isIntersecting){ ent.target.classList.add('visible'); obs.unobserve(ent.target); }
        });
      },{threshold:0.15});
      revealElems.forEach(e=> obs.observe(e));
    } else {
      // fallback: show all
      revealElems.forEach(e=> e.classList.add('visible'));
    }
  }
  initReveal();

  // Keyboard navigation for lightbox
  document.addEventListener('keydown', (ev)=>{
    const isOpen = lightbox && lightbox.getAttribute && lightbox.getAttribute('aria-hidden') === 'false';
    if(!isOpen) return;
    if(ev.key === 'ArrowLeft'){ prevBtn && prevBtn.click(); }
    if(ev.key === 'ArrowRight'){ nextBtn && nextBtn.click(); }
    if(ev.key === 'Escape'){ closeLightbox(); }
  });

  // Slideshow (autoplay) controls
  const playBtn = document.getElementById('play');
  let slideshowTimer = null;
  function startSlideshow(){ if(slideshowTimer) return; slideshowTimer = setInterval(()=>{ nextBtn && nextBtn.click(); }, 2600); if(playBtn) playBtn.textContent = '⏸'; }
  function stopSlideshow(){ if(!slideshowTimer) return; clearInterval(slideshowTimer); slideshowTimer = null; if(playBtn) playBtn.textContent = '⏵'; }
  if(playBtn){ playBtn.addEventListener('click', ()=>{ if(slideshowTimer) stopSlideshow(); else startSlideshow(); }); }

  // Stop slideshow when closing lightbox
  const origClose = closeLightbox;
  function closeLightboxAndStop(){ stopSlideshow(); origClose(); }
  closeBtn.removeEventListener && closeBtn.removeEventListener('click', closeLightbox);
  closeBtn.addEventListener('click', closeLightboxAndStop);
  lightbox.addEventListener('click', (e)=>{ if(e.target===lightbox){ closeLightboxAndStop(); } });

  // Simple confetti implementation (canvas-based)
  function launchConfetti(){ if(!confCtx) return; const particles = []; const w = confettiCanvas.width; const h = confettiCanvas.height; const colors = ['#ff6b98','#ffd166','#6bd3ff','#c7f9cc'];
    for(let i=0;i<120;i++){ particles.push({x:Math.random()*w,y:Math.random()*h*0.6,vy:2+Math.random()*4, vx:-6+Math.random()*12, size:4+Math.random()*8, color:colors[Math.floor(Math.random()*colors.length)], rot:Math.random()*360, vr: -6+Math.random()*12}); }
    let t=0; function frame(){ t++; confCtx.clearRect(0,0,w,h); for(let p of particles){ p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.rot += p.vr; confCtx.save(); confCtx.translate(p.x,p.y); confCtx.rotate(p.rot*Math.PI/180); confCtx.fillStyle = p.color; confCtx.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.6); confCtx.restore(); }
      if(t<150) requestAnimationFrame(frame); else confCtx.clearRect(0,0,w,h);
    }
    frame();
  }

  // Emitir corazones flotantes
  function emitHearts(count){ for(let i=0;i<count;i++){ const heart = document.createElement('div'); heart.className='heart'; heart.textContent='❤'; document.body.appendChild(heart); const left = (50 + (Math.random()*40-20)) + (Math.random()*60-30); heart.style.left = left + '%'; heart.style.bottom = (10+Math.random()*10)+'%'; heart.style.fontSize = (14+Math.random()*18)+'px'; heart.style.color = ['#ff6b98','#ff9cc2','#ffc1e3'][Math.floor(Math.random()*3)]; setTimeout(()=> heart.remove(),1600); }}

})();
