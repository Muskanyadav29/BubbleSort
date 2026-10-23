import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GAME_NAME } from '../config/gameConfig';
import Mascot from '../components/Mascot';
import { Play, Sparkles, Trophy, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

// ─── Injected keyframes (landing-only, prefixed lp-) ─────────────────────────
const LANDING_CSS = `
@keyframes lp-float-up {
  0%   { transform: translate(0,0) scale(1); opacity:0; }
  8%   { opacity: var(--op); }
  85%  { opacity: calc(var(--op) * .6); }
  100% { transform: translate(var(--dx), var(--dy)) scale(var(--ds)); opacity:0; }
}
@keyframes lp-hero-shimmer {
  0%   { background-position: -250% center; }
  100% { background-position:  250% center; }
}
@keyframes lp-pulse-glow {
  0%,100% { box-shadow: 0 0 30px rgba(139,92,246,.35), 0 0 60px rgba(56,189,248,.2); }
  50%     { box-shadow: 0 0 50px rgba(139,92,246,.55), 0 0 90px rgba(56,189,248,.35); }
}
@keyframes lp-title-glow {
  0%,100% { filter: drop-shadow(0 0 14px rgba(56,189,248,.45)); }
  50%     { filter: drop-shadow(0 0 28px rgba(168,85,247,.65)); }
}
@keyframes lp-slide-up {
  from { opacity:0; transform: translateY(32px) scale(.96); }
  to   { opacity:1; transform: translateY(0)    scale(1);   }
}
@keyframes lp-bounce-in {
  0%   { opacity:0; transform: scale(.6) translateY(30px); }
  50%  { transform: scale(1.08) translateY(-4px); }
  100% { opacity:1; transform: scale(1) translateY(0); }
}
@keyframes lp-rotate-ring {
  from { transform: translate(-50%,-50%) rotate(0deg); }
  to   { transform: translate(-50%,-50%) rotate(360deg); }
}
@keyframes lp-sway {
  0%,100% { transform: translateY(0) rotate(-2deg); }
  50%     { transform: translateY(-12px) rotate(2deg); }
}
@keyframes lp-orbiting {
  0%   { transform: rotate(0deg)   translateX(140px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(140px) rotate(-360deg); }
}
.lp-feature-card {
  position:relative; overflow:hidden; cursor:default;
  transition: transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease;
}
.lp-feature-card:hover {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 20px 50px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.1) !important;
}
.lp-feature-card::after {
  content:''; position:absolute; inset:0; pointer-events:none; border-radius:inherit;
  background: linear-gradient(135deg, rgba(255,255,255,.1) 0%, transparent 55%);
}
.lp-rule-item {
  transition: transform .2s ease, background .2s;
  border-radius: .75rem; padding: .85rem 1rem;
}
.lp-rule-item:hover {
  transform: translateX(6px);
  background: rgba(56,189,248,.06);
}
.lp-cta:hover { transform: translateY(-3px) scale(1.04) !important; }
.lp-cta:active { transform: translateY(1px) scale(.98) !important; }
`;

function injectCSS() {
  if (document.getElementById('landing-styles')) return;
  const el = document.createElement('style');
  el.id = 'landing-styles';
  el.textContent = LANDING_CSS;
  document.head.appendChild(el);
}

// ─── Bubble colors from game ────────────────────────────────────────────────
const ORB_PALETTE = [
  { c1:'#FF2A4D', c2:'#FFA3B5', glow:'rgba(255,42,77,.6)'  },
  { c1:'#1A8CFF', c2:'#85C5FF', glow:'rgba(26,140,255,.6)' },
  { c1:'#10D05E', c2:'#8EF8B8', glow:'rgba(16,208,94,.6)'  },
  { c1:'#FFB800', c2:'#FFF2A8', glow:'rgba(255,184,0,.6)'  },
  { c1:'#A845F5', c2:'#E4B4FF', glow:'rgba(168,69,245,.6)' },
  { c1:'#FF6E14', c2:'#FFBE8F', glow:'rgba(255,110,20,.6)' },
  { c1:'#FF3D8B', c2:'#FFA8CE', glow:'rgba(255,61,139,.6)' },
  { c1:'#00C8D6', c2:'#8AFAFF', glow:'rgba(0,200,214,.6)'  },
];

// ─── Background floating 3D bubbles ────────────────────────────────────────
function FloatingBubbles({ count = 30 }) {
  const bubbles = React.useMemo(() => Array.from({ length: count }, (_, i) => {
    const pal = ORB_PALETTE[i % ORB_PALETTE.length];
    const size = 20 + (i * 19 + 7) % 65;
    return {
      i, ...pal, size,
      left:  (i * 67 + 13) % 100,
      delay: (i * 0.9) % 8,
      dur:   10 + (i * 1.3) % 12,
      dx:    ((i % 7) - 3) * 55,
      dy:    -(180 + (i * 31) % 350),
      ds:    0.3 + (i % 5) * 0.15,
      op:    0.35 + (i % 3) * 0.15,
    };
  }), [count]);

  return (
    <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
      {bubbles.map(b => (
        <div key={b.i} style={{
          position:'absolute', bottom:'-80px', left:`${b.left}%`,
          width:b.size, height:b.size, borderRadius:'50%',
          background:`radial-gradient(circle at 32% 28%, ${b.c2}, ${b.c1} 55%, rgba(0,0,0,.5))`,
          boxShadow:`0 0 ${b.size*.45}px ${b.glow}, inset 0 0 ${b.size*.2}px rgba(255,255,255,.3)`,
          '--dx':`${b.dx}px`, '--dy':`${b.dy}px`, '--ds':b.ds, '--op':b.op,
          animation:`lp-float-up ${b.dur}s ${b.delay}s infinite ease-in`,
          opacity:0,
        }}>
          {/* specular highlight */}
          <div style={{
            position:'absolute', top:'12%', left:'18%', width:'36%', height:'28%',
            borderRadius:'50%', background:'rgba(255,255,255,.5)', filter:'blur(2px)',
          }} />
        </div>
      ))}
    </div>
  );
}

// ─── 3D Bubble icon for feature cards ────────────────────────────────────────
function BubbleIcon({ c1, c2, glow, children, size = 52 }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0,
      background:`radial-gradient(circle at 33% 28%, ${c2} 0%, ${c1} 50%, rgba(0,0,0,.45) 100%)`,
      boxShadow:`0 5px 18px ${glow}, inset 0 -3px 8px rgba(0,0,0,.35), inset 0 3px 6px rgba(255,255,255,.3)`,
      display:'flex', alignItems:'center', justifyContent:'center',
      position:'relative',
    }}>
      <div style={{
        position:'absolute', top:'12%', left:'16%', width:'34%', height:'26%',
        borderRadius:'50%', background:'rgba(255,255,255,.48)', filter:'blur(2px)',
      }} />
      <span style={{ position:'relative', zIndex:1 }}>{children}</span>
    </div>
  );
}

// ─── Orbiting mini-bubbles around hero ──────────────────────────────────────
function OrbitingBubbles() {
  const orbs = [
    { c:'#FF2A4D', s:18, dur:12, off:0 },
    { c:'#1A8CFF', s:14, dur:15, off:90 },
    { c:'#10D05E', s:20, dur:18, off:180 },
    { c:'#FFB800', s:12, dur:14, off:270 },
    { c:'#A845F5', s:16, dur:16, off:45 },
    { c:'#FF3D8B', s:10, dur:20, off:135 },
  ];
  return (
    <div style={{ position:'absolute', top:'50%', left:'50%', width:0, height:0, zIndex:0 }}>
      {orbs.map((o, i) => (
        <div key={i} style={{
          position:'absolute', top:0, left:0,
          animation:`lp-orbiting ${o.dur}s linear infinite`,
          animationDelay:`${-o.off / 360 * o.dur}s`,
        }}>
          <div style={{
            width:o.s, height:o.s, borderRadius:'50%',
            background:`radial-gradient(circle at 35% 28%, rgba(255,255,255,.5), ${o.c})`,
            boxShadow:`0 0 ${o.s}px ${o.c}88`,
          }}>
            <div style={{
              position:'absolute', top:'15%', left:'20%', width:'30%', height:'25%',
              borderRadius:'50%', background:'rgba(255,255,255,.5)', filter:'blur(1px)',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  useEffect(() => { injectCSS(); }, []);

  return (
    <div style={{ position:'relative', minHeight:'100vh' }}>

      {/* Full-screen floating bubbles background */}
      <FloatingBubbles count={32} />

      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'2rem 1rem', position:'relative', zIndex:1 }}>

        {/* ═══════════ HERO SECTION ═══════════ */}
        <div style={{
          position:'relative', overflow:'hidden',
          padding:'3.5rem 2rem 3rem',
          textAlign:'center',
          marginBottom:'3rem',
          borderRadius:'1.6rem',
          border:'1px solid rgba(139,92,246,.35)',
          background:'linear-gradient(145deg, rgba(15,23,42,.93) 0%, rgba(30,12,60,.88) 40%, rgba(10,20,45,.93) 100%)',
          backdropFilter:'blur(24px)',
          boxShadow:'0 24px 60px rgba(0,0,0,.55), 0 0 0 1px rgba(139,92,246,.2), inset 0 1px 0 rgba(255,255,255,.07)',
          animation:'lp-slide-up .5s both, lp-pulse-glow 4s 1s infinite',
        }}>

          {/* Orbiting mini-bubbles */}
          <OrbitingBubbles />

          {/* Top rainbow shimmer bar */}
          <div style={{
            position:'absolute', top:0, left:0, right:0, height:'2px',
            background:'linear-gradient(90deg, transparent, #ec4899, #8b5cf6, #06b6d4, #10b981, transparent)',
            backgroundSize:'250% auto',
            animation:'lp-hero-shimmer 4s linear infinite',
          }} />

          {/* Corner decorative bubbles */}
          {[
            { t:'8%',l:'5%',s:45,c1:'#FF2A4D',c2:'#FF8FA3',d:0 },
            { t:'12%',r:'7%',s:35,c1:'#1A8CFF',c2:'#7EC8FF',d:.8 },
            { b:'10%',l:'8%',s:30,c1:'#10D05E',c2:'#72FFB2',d:1.6 },
            { b:'15%',r:'5%',s:50,c1:'#FFB800',c2:'#FFE47A',d:2.2 },
            { t:'35%',l:'2%',s:22,c1:'#A845F5',c2:'#D695FF',d:1 },
            { t:'40%',r:'3%',s:28,c1:'#FF3D8B',c2:'#FFABD4',d:1.8 },
          ].map((b, i) => (
            <div key={i} style={{
              position:'absolute',
              top:b.t, left:b.l, right:b.r, bottom:b.b,
              width:b.s, height:b.s, borderRadius:'50%',
              background:`radial-gradient(circle at 33% 28%, ${b.c2}, ${b.c1} 55%, rgba(0,0,0,.4))`,
              boxShadow:`0 0 ${b.s*.5}px ${b.c1}55`,
              animation:`lp-sway ${3 + i*.4}s ${b.d}s ease-in-out infinite`,
              opacity:.55, zIndex:0,
            }}>
              <div style={{
                position:'absolute', top:'12%', left:'18%', width:'35%', height:'25%',
                borderRadius:'50%', background:'rgba(255,255,255,.45)', filter:'blur(2px)',
              }} />
            </div>
          ))}

          {/* Mascot with float animation */}
          <div style={{
            display:'flex', justifyContent:'center', marginBottom:'1rem',
            position:'relative', zIndex:2,
            animation:'lp-bounce-in .6s .2s both',
          }}>
            <Mascot mood="happy" message={`Welcome to ${GAME_NAME}! Are you ready to blast spheres?`} size={100} />
          </div>

          {/* Title */}
          <h1 style={{
            fontSize:'clamp(2.4rem, 6vw, 4rem)',
            fontWeight:'900',
            letterSpacing:'-0.03em',
            lineHeight:'1.08',
            marginBottom:'1.1rem',
            background:'linear-gradient(135deg, #38bdf8 0%, #c084fc 35%, #f43f5e 70%, #fbbf24 100%)',
            WebkitBackgroundClip:'text',
            WebkitTextFillColor:'transparent',
            position:'relative', zIndex:2,
            animation:'lp-title-glow 3s ease-in-out infinite',
          }}>
            {GAME_NAME}
          </h1>

          {/* Tagline */}
          <div style={{
            fontSize:'1.3rem', fontWeight:'800', letterSpacing:'.18em',
            textTransform:'uppercase', marginBottom:'1.8rem',
            display:'flex', justifyContent:'center', gap:'1.2rem', flexWrap:'wrap',
            position:'relative', zIndex:2,
          }}>
            {[
              { text:'Aim.',   color:'#38bdf8' },
              { text:'Match.', color:'#a855f7' },
              { text:'Pop.',   color:'#f43f5e' },
              { text:'Rescue.',color:'#10b981' },
            ].map(t => (
              <span key={t.text} style={{
                color:t.color,
                textShadow:`0 0 18px ${t.color}88`,
              }}>{t.text}</span>
            ))}
          </div>

          <p style={{
            maxWidth:'620px', margin:'0 auto 2.2rem', position:'relative', zIndex:2,
            color:'#94a3b8', fontSize:'1.05rem', lineHeight:'1.65',
          }}>
            Embark on an epic puzzle odyssey! Pop vibrant bubbles, unleash explosive bomb boosters, rescue trapped celestial critters, and climb the global leaderboards with certified anti-cheat validation.
          </p>

          {/* CTA Buttons */}
          <div style={{
            display:'flex', justifyContent:'center', gap:'1.1rem', flexWrap:'wrap',
            position:'relative', zIndex:2,
          }}>
            <Link
              to="/levels"
              className="lp-cta"
              style={{
                display:'inline-flex', alignItems:'center', gap:'.65rem',
                padding:'1.05rem 2.6rem', fontSize:'1.25rem', fontWeight:'800',
                fontFamily:"'Outfit',sans-serif",
                color:'#fff', textDecoration:'none',
                background:'linear-gradient(135deg, #ec4899, #8b5cf6)',
                borderRadius:'9999px',
                boxShadow:'0 6px 24px rgba(236,72,153,.5), 0 0 0 2px rgba(236,72,153,.3)',
                transition:'all .25s cubic-bezier(.34,1.56,.64,1)',
                border:'2px solid rgba(255,255,255,.15)',
              }}
              onClick={() => soundEngine.playButtonClick()}
            >
              <Play size={24} fill="#fff" /> PLAY NOW
            </Link>

            <Link
              to="/daily"
              className="lp-cta"
              style={{
                display:'inline-flex', alignItems:'center', gap:'.5rem',
                padding:'.95rem 1.9rem', fontSize:'1.08rem', fontWeight:'800',
                fontFamily:"'Outfit',sans-serif",
                color:'#fff', textDecoration:'none',
                background:'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
                border:'2px solid #7dd3fc',
                borderRadius:'.9rem',
                boxShadow:'0 4px 0 #0369a1, 0 8px 20px rgba(2,132,199,.45)',
                transition:'all .2s cubic-bezier(.34,1.56,.64,1)',
              }}
              onClick={() => soundEngine.playButtonClick()}
            >
              <Zap size={20} /> Daily Quest
            </Link>
          </div>

          {/* Bottom shimmer bar */}
          <div style={{
            position:'absolute', bottom:0, left:0, right:0, height:'2px',
            background:'linear-gradient(90deg, transparent, #06b6d4, #8b5cf6, #f43f5e, transparent)',
            backgroundSize:'250% auto',
            animation:'lp-hero-shimmer 4s 1s linear infinite',
          }} />
        </div>

        {/* ═══════════ FEATURE CARDS ═══════════ */}
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(290px, 1fr))',
          gap:'1.5rem',
          marginBottom:'3rem',
        }}>
          {[
            {
              Icon: Sparkles, iconColor:'#38bdf8',
              pal: ORB_PALETTE[1],
              title: '40+ Playable Stages',
              desc: 'Handcrafted data-driven levels spanning Tutorial to Expert difficulty, featuring Rescue, Drop, Combo Streak, and Color-Hunt objectives.',
              delay: .15,
            },
            {
              Icon: Trophy, iconColor:'#a855f7',
              pal: ORB_PALETTE[4],
              title: 'Global Leaderboard & Badges',
              desc: 'Compete worldwide! Track high scores, total stars, bubbles popped, and unlock over 10 career achievements.',
              delay: .25,
            },
            {
              Icon: ShieldCheck, iconColor:'#10b981',
              pal: ORB_PALETTE[2],
              title: 'Anti-Cheat & Offline Ready',
              desc: 'Server-side mathematical session verification prevents tampering. Full offline support enables puzzle play anywhere, anytime.',
              delay: .35,
            },
          ].map(({ Icon, iconColor, pal, title, desc, delay }, idx) => (
            <div
              key={idx}
              className="lp-feature-card"
              style={{
                padding:'1.8rem 1.6rem',
                borderRadius:'1.3rem',
                border:`1px solid ${pal.glow.replace('.6)', '.25)')}`,
                background:'linear-gradient(145deg, rgba(15,23,42,.9), rgba(25,35,60,.88))',
                backdropFilter:'blur(14px)',
                boxShadow:`0 12px 35px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.06)`,
                animation:`lp-slide-up .5s ${delay}s both`,
              }}
            >
              {/* Bubble icon */}
              <div style={{ marginBottom:'1.1rem' }}>
                <BubbleIcon c1={pal.c1} c2={pal.c2} glow={pal.glow}>
                  <Icon size={24} color="#fff" />
                </BubbleIcon>
              </div>

              <h3 style={{
                fontSize:'1.25rem', fontWeight:'800', marginBottom:'.55rem', color:'#fff',
                fontFamily:"'Outfit',sans-serif",
              }}>{title}</h3>

              <p style={{ color:'#7c8ba3', fontSize:'.925rem', lineHeight:'1.55' }}>{desc}</p>

              {/* bottom accent glow */}
              <div style={{
                position:'absolute', bottom:0, left:'20%', right:'20%', height:'2px',
                background:`linear-gradient(90deg, transparent, ${pal.c1}, transparent)`,
                borderRadius:'0 0 1rem 1rem', opacity:.5,
              }} />
            </div>
          ))}
        </div>

        {/* ═══════════ GAMEPLAY RULES ═══════════ */}
        <div style={{
          borderRadius:'1.3rem',
          border:'1px solid rgba(56,189,248,.2)',
          background:'linear-gradient(145deg, rgba(15,23,42,.92), rgba(18,28,52,.9))',
          backdropFilter:'blur(16px)',
          padding:'2.2rem 2rem',
          boxShadow:'0 16px 45px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.05)',
          animation:'lp-slide-up .5s .45s both',
          position:'relative', overflow:'hidden',
        }}>
          {/* top accent */}
          <div style={{
            position:'absolute', top:0, left:0, right:0, height:'2px',
            background:'linear-gradient(90deg, transparent, #38bdf8 30%, #a855f7 50%, #f43f5e 70%, transparent)',
          }} />

          <h2 style={{
            fontSize:'1.5rem', fontWeight:'900', marginBottom:'1.4rem', color:'#fff',
            fontFamily:"'Outfit',sans-serif",
            display:'flex', alignItems:'center', gap:'.7rem',
          }}>
            <BubbleIcon c1="#FF2A4D" c2="#FF8FA3" glow="rgba(255,42,77,.5)" size={36}>
              <span style={{ fontSize:'1rem' }}>🎯</span>
            </BubbleIcon>
            Core Gameplay Rules
          </h2>

          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))',
            gap:'.6rem',
          }}>
            {[
              { title:'Aim & Shoot',          desc:'Drag or move mouse to aim the trajectory laser. Tap or click to launch your bubble.',                     c:'#38bdf8' },
              { title:'Match 3 or More',       desc:'Connect three or more same-colored spheres to trigger satisfying popping reactions.',                     c:'#a855f7' },
              { title:'Drop Floating Bubbles', desc:'Sever ceiling connections to trigger massive cascading drops and bonus points!',                          c:'#10b981' },
              { title:'Bank Shots & Boosters', desc:'Bounce shots off side walls and trigger Bomb or Rainbow boosters to conquer challenging levels.', c:'#f59e0b' },
            ].map((rule, i) => (
              <div key={i} className="lp-rule-item" style={{ display:'flex', gap:'.8rem', alignItems:'flex-start' }}>
                {/* mini bubble checkmark */}
                <div style={{
                  width:24, height:24, borderRadius:'50%', flexShrink:0, marginTop:'2px',
                  background:`radial-gradient(circle at 33% 28%, ${rule.c}88, ${rule.c})`,
                  boxShadow:`0 0 10px ${rule.c}66`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <CheckCircle2 size={14} color="#fff" />
                </div>
                <div>
                  <strong style={{
                    color:'#f1f5f9', display:'block', fontWeight:'700',
                    fontSize:'.95rem', marginBottom:'.15rem',
                  }}>{rule.title}</strong>
                  <span style={{ color:'#6b7280', fontSize:'.86rem', lineHeight:'1.45' }}>{rule.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
