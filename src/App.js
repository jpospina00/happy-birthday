import React, { useEffect, useRef, useState, useCallback } from 'react';
import './App.css';

// ── Cursor trail ───────────────────────────────────────────────────────
function CursorTrail() {
  useEffect(() => {
    const trail = [];
    const MAX = 18;

    const onMove = (e) => {
      const dot = document.createElement('div');
      dot.className = 'cursor-dot';
      const symbols = ['✦','🌹','✿','❋','✦'];
      dot.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      dot.style.left = e.clientX + 'px';
      dot.style.top  = e.clientY + 'px';
      document.body.appendChild(dot);
      trail.push(dot);
      if (trail.length > MAX) {
        const old = trail.shift();
        old.remove();
      }
      setTimeout(() => { dot.classList.add('fade'); }, 100);
      setTimeout(() => { dot.remove(); const i = trail.indexOf(dot); if(i>-1) trail.splice(i,1); }, 700);
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
  return null;
}

// ── Petal particle system ──────────────────────────────────────────────
function Petals() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const petals = Array.from({ length: 38 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * -window.innerHeight,
      size: Math.random() * 10 + 5,
      speedY: Math.random() * 1.2 + 0.4,
      speedX: Math.random() * 0.6 - 0.3,
      opacity: Math.random() * 0.5 + 0.2,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      sway: Math.random() * 2,
      swayOffset: Math.random() * Math.PI * 2,
    }));
    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.01;
      petals.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(t + p.swayOffset) * p.sway * 0.3;
        p.rotation += p.rotSpeed;
        if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size*0.8,-p.size*0.6,p.size*0.8,p.size*0.6,0,p.size);
        ctx.bezierCurveTo(-p.size*0.8,p.size*0.6,-p.size*0.8,-p.size*0.6,0,-p.size);
        const grad = ctx.createRadialGradient(0,0,0,0,0,p.size);
        grad.addColorStop(0,'#f5c6d0'); grad.addColorStop(1,'#c8566e');
        ctx.fillStyle = grad; ctx.fill(); ctx.restore();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:'fixed',top:0,left:0,pointerEvents:'none',zIndex:0 }} />;
}

// ── Countdown / Gate ───────────────────────────────────────────────────
const BIRTHDAY = new Date('2026-06-18T00:00:00');

function useCountdown() {
  const calc = () => {
    const diff = BIRTHDAY - new Date();
    if (diff <= 0) return null;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function CountdownGate({ children }) {
  const time = useCountdown();
  const [unlocked, setUnlocked] = useState(false);

  // tiempo llegó
  if (!time && !unlocked) {
    // auto-unlock
    setTimeout(() => setUnlocked(true), 100);
  }

  if (time && !unlocked) {
    return (
      <div className="gate">
        <Petals />
        <CursorTrail />
        <div className="gate-content">
          <p className="gate-eyebrow">✦ algo especial se acerca ✦</p>
          <h1 className="gate-name">Sara</h1>
          <p className="gate-sub">Pronto podrás ver tu sorpresa</p>
          <div className="countdown">
            {[['días', time.d], ['horas', time.h], ['min', time.m], ['seg', time.s]].map(([label, val]) => (
              <div key={label} className="countdown-unit">
                <span className="countdown-num">{String(val).padStart(2,'0')}</span>
                <span className="countdown-label">{label}</span>
              </div>
            ))}
          </div>
          <p className="gate-hint">El 22 de junio esta página se abre solo para ti 🌹</p>
        </div>
        <div>
          <p> Si le quieres dejar un deseo puedes hacerlo aquí</p>
          <LibroDeseos showAnswers={false} />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ── Cake ───────────────────────────────────────────────────────────────
function Cake() {
  const [lit, setLit] = useState(false);
  const [blown, setBlown] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLit(true), 800); return () => clearTimeout(t); }, []);
  return (
    <div className="cake-section">
      <div className="cake-title-wrapper">
        <span className="cake-number">21</span>
        <span className="cake-anos">años</span>
      </div>
      <div className="cake-wrapper" onClick={() => !blown && setBlown(true)}>
        <svg viewBox="0 0 320 280" width="320" height="280" className="cake-svg">
          <ellipse cx="160" cy="258" rx="140" ry="12" fill="#1a0a0a" opacity="0.4" />
          <rect x="30" y="190" width="260" height="65" rx="8" fill="#2d0a12" />
          <rect x="30" y="190" width="260" height="18" rx="4" fill="#8B1A2F" />
          {[50,80,110,140,170,200,230,260].map((x,i) => (<ellipse key={i} cx={x} cy="190" rx="10" ry="6" fill="#f2c4ce" />))}
          {[50,80,110,140,170,200,230,260].map((x,i) => (<rect key={i} x={x-4} y="190" width="8" height={8+i%3*3} rx="4" fill="#f2c4ce" />))}
          <rect x="55" y="125" width="210" height="68" rx="8" fill="#3d0d18" />
          <rect x="55" y="125" width="210" height="18" rx="4" fill="#a0203a" />
          {[75,105,135,165,195,225,250].map((x,i) => (<ellipse key={i} cx={x} cy="125" rx="9" ry="5" fill="#f8d7dd" />))}
          {[75,105,135,165,195,225,250].map((x,i) => (<rect key={i} x={x-3} y="125" width="7" height={6+i%3*2} rx="3" fill="#f8d7dd" />))}
          <rect x="85" y="70" width="150" height="58" rx="8" fill="#4a1020" />
          <rect x="85" y="70" width="150" height="16" rx="4" fill="#b52542" />
          {[100,125,150,175,200,220].map((x,i) => (<ellipse key={i} cx={x} cy="70" rx="8" ry="5" fill="#fce4e8" />))}
          {[100,125,150,175,200,220].map((x,i) => (<rect key={i} x={x-3} y="70" width="7" height={5+i%3*2} rx="3" fill="#fce4e8" />))}
          {[[90,170],[145,170],[200,170],[245,205],[70,205]].map(([x,y],i) => (
            <g key={i}><circle cx={x} cy={y} r="8" fill="#c8566e" opacity="0.9"/><circle cx={x} cy={y} r="5" fill="#e07a8f" opacity="0.8"/><circle cx={x} cy={y} r="2.5" fill="#f2a6b4"/></g>
          ))}
          {Array.from({length:7},(_,i) => {
            const x=100+i*20; const candleH=i%2===0?32:26;
            const colors=['#c8a84b','#d4af37','#e8c84b','#f0d060','#c8a84b','#d4af37','#e8c84b'];
            return (
              <g key={i}>
                <rect x={x-3} y={70-candleH} width="6" height={candleH} rx="2" fill={colors[i]} />
                {!blown && lit && (
                  <g>
                    <ellipse cx={x} cy={70-candleH-6} rx="4" ry="7" fill="#ff9a3c" opacity="0.9">
                      <animate attributeName="ry" values="7;9;6;8;7" dur={`${0.8+i*0.1}s`} repeatCount="indefinite"/>
                    </ellipse>
                    <ellipse cx={x} cy={70-candleH-8} rx="2.5" ry="4" fill="#ffe570" opacity="0.8">
                      <animate attributeName="ry" values="4;6;3;5;4" dur={`${0.7+i*0.1}s`} repeatCount="indefinite"/>
                    </ellipse>
                  </g>
                )}
                {blown && <text x={x} y={70-candleH-4} textAnchor="middle" fontSize="10">💨</text>}
              </g>
            );
          })}
          <text x="160" y="108" textAnchor="middle" fontSize="22" fontWeight="700" fontFamily="Playfair Display, serif" fill="#d4af37" opacity="0.95">21</text>
        </svg>
        {!blown ? <p className="cake-hint">✨ Haz click para soplar las velas</p>
                : <p className="cake-hint blown">🎉 ¡Que se cumplan todos tus deseos!</p>}
      </div>
    </div>
  );
}

// ── Gallery ────────────────────────────────────────────────────────────
const PHOTOS = [
  { src:'/photos/photo1.png', caption:'La niña que se convirtió en reina ✨', tag:'entonces' },
  { src:'/photos/photo3.png', caption:'Siempre tan tú, mi vaquerita preciosa 🤠', tag:'ella' },
  { src:'/photos/photo4.png', caption:'Con flores, como mereces', tag:'ella' },
  { src:'/photos/photo8.png', caption:'Elegante sin esfuerzo', tag:'ella' },
  { src:'/photos/photo6.png', caption:'Campeona 🏅', tag:'ella' },
  { src:'/photos/photo7.png', caption:'Mi aventurera hermosa 🌟', tag:'ella' },
  { src:'/photos/photo9.png', caption:'Libre y hermosa 🌿', tag:'ella' },
  { src:'/photos/photo2.png', caption:'Siempre la más linda de donde estás 🦋', tag:'ella' },
  { src:'/photos/photo5.png', caption:'Juntos en nuestro mundo de colores 💙', tag:'nosotros' },
  { src:'/photos/photo10.png', caption:'De la mano, hacia todo lo que viene 🌺', tag:'nosotros' },
];

function Gallery() {
  const [active, setActive] = useState(null);
  return (
    <section className="gallery-section">
      <p className="section-eyebrow">recuerdos</p>
      <h2 className="section-title">21 años de historia</h2>
      <p className="section-sub">desde aquella niña peli corta hasta la mujer que eres hoy</p>
      <div className="gallery-grid">
        {PHOTOS.map((p,i) => (
          <div key={i} className={`gallery-item ${p.tag}`} onClick={() => setActive(i)} style={{animationDelay:`${i*0.07}s`}}>
            <div className="gallery-img-wrapper">
              <img src={p.src} alt={p.caption} loading="lazy" />
              <div className="gallery-overlay"><span>{p.caption}</span></div>
            </div>
          </div>
        ))}
      </div>
      {active !== null && (
        <div className="lightbox" onClick={() => setActive(null)}>
          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            <img src={PHOTOS[active].src} alt={PHOTOS[active].caption} />
            <p>{PHOTOS[active].caption}</p>
            <button onClick={() => setActive(null)}>✕</button>
          </div>
        </div>
      )}
    </section>
  );
}

// ── 21 Razones ─────────────────────────────────────────────────────────
const RAZONES = [
  "Tu sonrisa ilumina cualquier lugar en donde estés",
  "Eres la persona más fuerte que conozco, aunque no siempre lo notes",
  "Tu risa es contagiosa e unicamente tuya",
  "Tienes el corazón más grande y más bonito del mundo",
  "Eres demasiado habilidosa",
  "Tu determinación, fuerza de voluntad y dedicación no tiene límites unos 10K con medalla lo prueba 🏅",
  "Sabes comprender a las personas incluso en sus peores momentos",
  "Eres hermosa de una manera que va mucho más allá de lo físico",
  "Tu energía llena de vida todos los espacios que habitas",
  "Eres auténtica, nunca finges ser quien no eres",
  "Tienes un estilo único que te hace inconfundible",
  "Inspiras a las personas a su alrededor sin darte cuenta",
  "Tu curiosidad y ganas de aprender no tienen limites",
  "Conviertes los momentos simples en recuerdos que valen para siempre",
  "Eres aventurera, siempre lista para lo que venga",
  "Tu presencia hace que todo sea mejor, sin excepción",
  "Tienes la elegancia natural que no se puede enseñar",
  "Eres valiente aunque por dentro estes cagada de miedo, y eso es algo admirable",
  "Das amor sin pedir nada a cambio",
  "Haces que querer quererte sea lo más fácil del mundo",
  "El mundo es definitivamente mejor porque tú estás en él 🌹",
];

function Razones() {
  const [revealed, setRevealed] = useState([]);
  const [allOpen, setAllOpen] = useState(false);

  const toggle = (i) => {
    setRevealed(prev => prev.includes(i) ? prev.filter(x=>x!==i) : [...prev, i]);
  };

  const revealAll = () => {
    setRevealed(RAZONES.map((_,i)=>i));
    setAllOpen(true);
  };

  return (
    <section className="razones-section">
      <p className="section-eyebrow">por qué eres especial</p>
      <h2 className="section-title">21 razones</h2>
      <p className="section-sub">una por cada año que has existido y hecho el mundo más bonito</p>

      <div className="razones-grid">
        {RAZONES.map((r, i) => (
          <div
            key={i}
            className={`razon-card ${revealed.includes(i) ? 'open' : ''}`}
            onClick={() => toggle(i)}
          >
            <div className="razon-front">
              <span className="razon-num">{String(i+1).padStart(2,'0')}</span>
              <span className="razon-tap">tócame 🌹</span>
            </div>
            <div className="razon-back">
              <span className="razon-num-back">{i+1}</span>
              <p>{r}</p>
            </div>
          </div>
        ))}
      </div>

      {!allOpen && (
        <button className="razones-cta" onClick={revealAll}>
          Revelar todas ✦
        </button>
      )}
    </section>
  );
}

// ── Song player ────────────────────────────────────────────────────────
function SongPlayer() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause(); else audioRef.current.play().catch(()=>{});
    setPlaying(!playing);
  };
  return (
    <section className="song-section">
      <p className="section-eyebrow">Tú canción</p>
      <h2 className="section-title">Bonita Bonita</h2>
      <p className="song-artist">4AMTapes</p>
      <div className="player-card">
        <div className="vinyl-wrapper">
          <div className={`vinyl ${playing ? 'spinning' : ''}`}>
            <div className="vinyl-inner"><span>♫</span></div>
          </div>
        </div>
        <div className="player-controls">
          <button className="play-btn" onClick={toggle}>{playing ? '⏸' : '▶'}</button>
          <div className="progress-bar"><div className="progress-fill" style={{width:`${progress}%`}} /></div>
        </div>
        <p className="player-note">Por la niña más hermosa que conozco. 🎵</p>
      </div>
      <audio ref={audioRef} src="/song.mp3"
        onTimeUpdate={e => setProgress((e.target.currentTime/(e.target.duration||1))*100)}
        onEnded={() => setPlaying(false)} />
    </section>
  );
}

// ── Libro de deseos ────────────────────────────────────────────────────
function LibroDeseos({showAnswers}) {
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [wishes, setWishes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sara_wishes') || '[]'); } catch { return []; }
  });
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (!name.trim() || !msg.trim()) return;
    const nuevo = { name: name.trim(), msg: msg.trim(), time: new Date().toLocaleDateString('es-CO', {day:'numeric',month:'long'}) };
    const updated = [nuevo, ...wishes];
    setWishes(updated);
    localStorage.setItem('sara_wishes', JSON.stringify(updated));
    setName(''); setMsg(''); setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <section className="deseos-section">
      <p className="section-eyebrow">para Sara</p>
      <h2 className="section-title">Libro de deseos</h2>
      <p className="section-sub">deja un mensaje para la cumpleañera</p>

      <div className="deseos-form">
        <input
          className="deseo-input"
          placeholder="Tu nombre"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={40}
        />
        <textarea
          className="deseo-textarea"
          placeholder="Tu mensaje para Sara..."
          value={msg}
          onChange={e => setMsg(e.target.value)}
          maxLength={280}
          rows={4}
        />
        <button className="deseo-btn" onClick={submit}>
          {sent ? '¡Enviado! 🌹' : 'Dejar mi deseo ✦'}
        </button>
      </div>

      {(wishes.length > 0 && showAnswers) && (
        <div className="deseos-list">
          {wishes.map((w, i) => (
            <div key={i} className="deseo-card">
              <div className="deseo-header">
                <span className="deseo-name">{w.name}</span>
                <span className="deseo-time">{w.time}</span>
              </div>
              <p className="deseo-msg">{w.msg}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Love letter ────────────────────────────────────────────────────────
function Letter() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section className="letter-section" ref={ref}>
      <p className="section-eyebrow">para ti</p>
      <h2 className="section-title">Con todo mi amor</h2>
      <div className={`letter-card ${visible ? 'visible' : ''}`}>
        <div className="letter-deco">🌹</div>
        <p className="letter-text">Sara,</p>
        <p className="letter-text">
          Hoy ya cumples 21 años, y cada uno de ellos ha construido a la persona más
          amigable, increíble, divertida y genial que conozco. Esa niña curiosa y llena de vida se convirtió en
          una mujer que ilumina todo a su alrededor.
        </p>
        <p className="letter-text">
          Que este año te traiga todo lo que mereces, lo cual es muchísimo.
          Que tus sueños sigan siendo más grandes que tus miedos,
          y que siempre tengas flores, risas, y alegría en tu vida.
        </p>
        <p className="letter-text letter-closing">
          Feliz cumpleaños, bonita. Te quiero muchísimo y estoy muy agradecido de compartir esta vida contigo. ❤️
        </p>
        <div className="letter-signature">Con amor ✨</div>
      </div>
    </section>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────
function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);
  return (
    <section className="hero">
      <div className={`hero-content ${loaded ? 'loaded' : ''}`}>
        <p className="hero-eyebrow">✦ 22 · junio · 2026 ✦</p>
        <h1 className="hero-name">Sara</h1>
        <p className="hero-tagline"><em>feliz cumpleaños</em></p>
        <div className="hero-divider">
          <span>⸻</span><span className="hero-rose">🌹</span><span>⸻</span>
        </div>
        <p className="hero-subtitle">Hoy el mundo celebra que existes</p>
        <a href="#pastel" className="hero-cta">Celebrar ↓</a>
      </div>
    </section>
  );
}

// ── App ────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <CountdownGate>
      <div className="app">
        <Petals />
        <CursorTrail />
        <Hero />
        <div id="pastel"><Cake /></div>
        <Gallery />
        <Razones />
        <SongPlayer />
        <LibroDeseos showAnswers={true} />
        <Letter />
        <footer className="footer">
          <p>Hecho con mucho ❤️ para Sara · jeje</p>
        </footer>
      </div>
    </CountdownGate>
  );
}
