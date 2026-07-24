document.addEventListener('DOMContentLoaded', () => {

    // =====================================================
    // STARFIELD CANVAS
    // =====================================================
    const canvas = document.getElementById('stars-canvas');
    const ctx = canvas.getContext('2d');
    let stars = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function initStars() {
        stars = [];
        const count = Math.min(250, Math.floor(canvas.width * canvas.height / 5000));
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.4 + 0.2,
                baseAlpha: Math.random() * 0.6 + 0.2,
                twinkle: Math.random() * 0.015 + 0.003,
                offset: Math.random() * Math.PI * 2,
                dx: (Math.random() - 0.5) * 0.03,
                dy: (Math.random() - 0.5) * 0.015,
            });
        }
    }

    let shooters = [];
    function spawnShooter() {
        shooters.push({
            x: Math.random() * canvas.width * 0.7,
            y: Math.random() * canvas.height * 0.25,
            len: Math.random() * 100 + 50,
            speed: Math.random() * 9 + 5,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.4,
            alpha: 1, life: 0, max: 55,
        });
    }

    function render(t) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const s of stars) {
            const a = s.baseAlpha * (Math.sin(t * s.twinkle + s.offset) * 0.35 + 0.65);
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,255,127,${a * 0.06})`;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = s.r > 1 ? `rgba(255,255,255,${a * 0.9})` : `rgba(0,255,127,${a * 0.5})`;
            ctx.fill();
            s.x += s.dx; s.y += s.dy;
            if (s.x < 0) s.x = canvas.width;
            if (s.x > canvas.width) s.x = 0;
            if (s.y < 0) s.y = canvas.height;
            if (s.y > canvas.height) s.y = 0;
        }
        shooters = shooters.filter(s => s.life < s.max);
        for (const s of shooters) {
            s.life++; s.alpha = 1 - s.life / s.max;
            s.x += Math.cos(s.angle) * s.speed;
            s.y += Math.sin(s.angle) * s.speed;
            const tx = s.x - Math.cos(s.angle) * s.len;
            const ty = s.y - Math.sin(s.angle) * s.len;
            const g = ctx.createLinearGradient(tx, ty, s.x, s.y);
            g.addColorStop(0, 'transparent');
            g.addColorStop(1, `rgba(0,255,127,${s.alpha})`);
            ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(s.x, s.y);
            ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.beginPath(); ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${s.alpha})`; ctx.fill();
        }
        requestAnimationFrame(render);
    }

    resizeCanvas(); initStars(); requestAnimationFrame(render);
    window.addEventListener('resize', () => { resizeCanvas(); initStars(); });
    setInterval(spawnShooter, 5000);
    setTimeout(spawnShooter, 1500);

    // =====================================================
    // PARTICLES
    // =====================================================
    const particleBox = document.getElementById('particles-container');
    const pIcons = ['💚', '✨', '🍀', '💫', '⭐'];
    setInterval(() => {
        const el = document.createElement('div');
        el.className = 'particle';
        el.style.left = Math.random() * 100 + 'vw';
        el.innerText = pIcons[Math.floor(Math.random() * pIcons.length)];
        el.style.fontSize = (Math.random() * 10 + 10) + 'px';
        const dur = Math.random() * 6 + 7;
        el.style.animationDuration = dur + 's';
        particleBox.appendChild(el);
        setTimeout(() => el.remove(), dur * 1000);
    }, 1500);

    // =====================================================
    // MUSIC
    // =====================================================
    const musicBtn = document.getElementById('music-btn');
    const audio = document.getElementById('bg-music');
    let playing = false, started = false;
    function playM() {
        if (!started) { audio.currentTime = 40; started = true; }
        audio.play().catch(() => {});
        playing = true;
        musicBtn.innerHTML = '<i class="fas fa-pause"></i>';
        musicBtn.classList.add('playing');
    }
    function pauseM() {
        audio.pause(); playing = false;
        musicBtn.innerHTML = '<i class="fas fa-play"></i>';
        musicBtn.classList.remove('playing');
    }
    musicBtn.addEventListener('click', () => playing ? pauseM() : playM());

    document.getElementById('start-btn').addEventListener('click', () => {
        document.querySelector('[data-chapter="1"]').scrollIntoView({ behavior: 'smooth' });
        if (!playing) playM();
    });

    // =====================================================
    // CHAPTER NAV + SCROLL DETECTION
    // =====================================================
    const chapters = document.querySelectorAll('.chapter');
    const navC = document.getElementById('chapter-nav');
    chapters.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'chapter-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => chapters[i].scrollIntoView({ behavior: 'smooth' }));
        navC.appendChild(dot);
    });
    const dots = document.querySelectorAll('.chapter-dot');

    const chObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('in-view');
                const idx = +e.target.dataset.chapter;
                dots.forEach((d, i) => d.classList.toggle('active', i === idx));

                // Trigger chat replay when chat section enters view
                if (idx === 5 && !chatStarted) startChatReplay();
            }
        });
    }, { threshold: 0.4 });
    chapters.forEach(ch => chObs.observe(ch));

    // =====================================================
    // COUNTER — 08/07/2026 16:20
    // =====================================================
    const startDate = new Date(2026, 6, 8, 0, 0, 0);
    function tick() {
        const now = new Date();
        let diff = now - startDate;
        if (diff < 0) diff = 0;
        let mo = (now.getFullYear() - startDate.getFullYear()) * 12 + now.getMonth() - startDate.getMonth();
        if (now.getDate() < startDate.getDate()) mo--;
        if (mo < 0) mo = 0;
        const ref = new Date(startDate); ref.setMonth(ref.getMonth() + mo);
        const rem = now - ref;
        const d = Math.floor(rem / 864e5);
        const h = Math.floor((rem % 864e5) / 36e5);
        const m = Math.floor((rem % 36e5) / 6e4);
        const s = Math.floor((rem % 6e4) / 1e3);
        setT('months', mo); setT('days', d);
        setT('hours', String(h).padStart(2,'0'));
        setT('minutes', String(m).padStart(2,'0'));
        setT('seconds', String(s).padStart(2,'0'));
    }
    function setT(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }
    setInterval(tick, 1000); tick();

    // =====================================================
    // HORIZONTAL STORY SCROLL (drag)
    // =====================================================
    const storyScroll = document.getElementById('story-scroll');
    if (storyScroll) {
        let isDown = false, startX, scrollLeft;
        storyScroll.addEventListener('mousedown', e => {
            isDown = true; storyScroll.style.cursor = 'grabbing';
            startX = e.pageX - storyScroll.offsetLeft; scrollLeft = storyScroll.scrollLeft;
        });
        storyScroll.addEventListener('mouseleave', () => { isDown = false; storyScroll.style.cursor = 'grab'; });
        storyScroll.addEventListener('mouseup', () => { isDown = false; storyScroll.style.cursor = 'grab'; });
        storyScroll.addEventListener('mousemove', e => {
            if (!isDown) return; e.preventDefault();
            storyScroll.scrollLeft = scrollLeft - (e.pageX - storyScroll.offsetLeft - startX) * 1.5;
        });
    }

    // =====================================================
    // GALLERY LIGHTBOX
    // =====================================================
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const lbClose = document.querySelector('.lightbox-close');
    document.querySelectorAll('.mosaic-item').forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if(img) lbImg.src = img.src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            document.documentElement.style.scrollSnapType = 'none';
        });
    });
    function closeLB() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        document.documentElement.style.scrollSnapType = 'y mandatory';
    }
    lbClose.addEventListener('click', e => { e.stopPropagation(); closeLB(); });
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLB(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLB(); });

    // =====================================================
    // CHAT REPLAY ✨ NEW — WhatsApp-style message animation
    // =====================================================
    let chatStarted = false;

    const chatMessages = [
        { type: 'sent', text: 'Deftones? Muito bom', time: 'O começo' },
        { type: 'received', text: 'Oii! Siiim, amo demais', time: '' },
        { type: 'sent', text: 'Nossa achei que voce so gostasse de rocks pesados', time: '' },
        { type: 'received', text: 'kkkk que nada', time: '' },
        { type: 'sent', text: 'Já gostei de você', time: '' },
        { type: 'received', text: 'Para kkk tu nem me conhece', time: '' },
        { type: 'sent', text: 'Mas quero conhecer...', time: '' },
        { type: 'sent', text: 'Cada conversa com você é diferente', time: 'Semanas depois' },
        { type: 'received', text: 'Diferente como?', time: '' },
        { type: 'sent', text: 'Diferente tipo... eu não quero que acabe', time: '' },
        { type: 'received', text: 'ownn', time: '' },
        { type: 'sent', text: 'Preciso te falar uma coisa...', time: 'Quarta-feira, 08/07' },
        { type: 'received', text: 'Fala...', time: '' },
        { type: 'sent', text: 'Quer namorar comigo?', time: '' },
        { type: 'received', text: 'SIM!!', time: '' },
        { type: 'sent', text: 'Pra sempre?', time: '' },
        { type: 'received', text: 'Pra sempre.', time: '' },
    ];

    function startChatReplay() {
        chatStarted = true;
        const chatBody = document.getElementById('chat-body');
        chatBody.innerHTML = '';

        let delay = 0;

        chatMessages.forEach((msg, i) => {
            delay += 600 + Math.random() * 400;

            // Show typing indicator before received messages
            if (msg.type === 'received') {
                const typingDelay = delay;
                delay += 800;

                setTimeout(() => {
                    const typing = document.createElement('div');
                    typing.className = 'chat-typing';
                    typing.innerHTML = '<span></span><span></span><span></span>';
                    typing.id = 'typing-' + i;
                    chatBody.appendChild(typing);
                    chatBody.scrollTop = chatBody.scrollHeight;
                }, typingDelay);

                setTimeout(() => {
                    const t = document.getElementById('typing-' + i);
                    if (t) t.remove();
                }, delay);
            }

            setTimeout(() => {
                const el = document.createElement('div');
                el.className = `chat-msg ${msg.type}`;

                let html = msg.text;
                if (msg.time) {
                    html += `<span class="msg-time">${msg.time}</span>`;
                }
                el.innerHTML = html;

                chatBody.appendChild(el);
                chatBody.scrollTop = chatBody.scrollHeight;
            }, delay);

            // Extra pause after important messages
            if (msg.text.includes('namorar') || msg.text.includes('SIM')) {
                delay += 1200;
            }
        });
    }

    // =====================================================
    // PROMISES ✨ NEW — Interactive promise cards
    // =====================================================
    const promiseCards = document.querySelectorAll('.promise-card');
    const promiseReveal = document.getElementById('promise-reveal');
    const promiseText = document.getElementById('promise-reveal-text');

    promiseCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active from all
            promiseCards.forEach(c => c.classList.remove('active'));
            // Activate clicked
            card.classList.add('active');
            // Show reveal
            promiseText.textContent = card.dataset.promise;
            promiseReveal.classList.add('show');
        });

        // Touch support
        card.addEventListener('touchstart', () => {
            promiseCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            promiseText.textContent = card.dataset.promise;
            promiseReveal.classList.add('show');
        }, { passive: true });
    });

    // =====================================================
    // ROCK AMPLIFIER MINIGAME ✨ NEW
    // =====================================================
    const knobs = document.querySelectorAll('.knob');
    const ampLight = document.getElementById('amp-light');
    const ampTicket = document.getElementById('amp-ticket');
    const amp = document.getElementById('amp');
    let knobValues = { 1: 0, 2: 0, 3: 0 };
    let solved = false;

    knobs.forEach(knob => {
        let isDragging = false;
        let startY, startVal;
        
        knob.addEventListener('pointerdown', (e) => {
            if (solved) return;
            isDragging = true;
            startY = e.clientY;
            startVal = knobValues[knob.dataset.id] || 0;
            knob.setPointerCapture(e.pointerId);
        });

        knob.addEventListener('pointermove', (e) => {
            if (!isDragging || solved) return;
            e.preventDefault(); // Prevent scrolling on touch
            const deltaY = startY - e.clientY;
            let val = startVal + deltaY * 2.5;
            
            if (val < 0) val = 0;
            if (val > 260) val = 260; // Max rotation
            
            knobValues[knob.dataset.id] = val;
            knob.style.transform = `rotate(${-130 + val}deg)`;
            checkWin();
        });

        knob.addEventListener('pointerup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            knob.releasePointerCapture(e.pointerId);
            
            // Se for apenas um clique (não arrastou), aumenta o volume
            const deltaY = startY - e.clientY;
            if (Math.abs(deltaY) < 5) {
                let val = startVal + 55; // Aumenta 55 graus por clique
                if (val > 260) val = 260;
                knobValues[knob.dataset.id] = val;
                knob.style.transform = `rotate(${-130 + val}deg)`;
                checkWin();
            }
        });
    });

    function checkWin() {
        if (solved) return;
        const allMax = Object.values(knobValues).every(v => v >= 250);
        if (allMax) {
            solved = true;
            ampLight.classList.add('on');
            amp.classList.add('shaking');
            
            setTimeout(() => {
                amp.classList.remove('shaking');
                ampTicket.classList.add('show');
            }, 600);
        }
    }

});
