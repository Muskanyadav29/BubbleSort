import React, { useState, useEffect } from 'react';
import { GAME_NAME } from '../config/gameConfig';
import { gameService } from '../services/gameService';
import { User, History } from 'lucide-react';

// ─── Keyframe CSS injected once ──────────────────────────────────────────────
const DASHBOARD_CSS = `
@keyframes db-drift {
  0%   { transform: translate(0,0) scale(1); opacity: 0; }
  10%  { opacity: 0.65; }
  90%  { opacity: 0.45; }
  100% { transform: translate(var(--dx), var(--dy)) scale(var(--ds)); opacity: 0; }
}
@keyframes db-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes db-pulse-ring {
  0%   { box-shadow: 0 0 0 0   rgba(139,92,246,.55), 0 0 0 0   rgba(6,182,212,.35); }
  70%  { box-shadow: 0 0 0 14px rgba(139,92,246,0),  0 0 0 26px rgba(6,182,212,0);  }
  100% { box-shadow: 0 0 0 0   rgba(139,92,246,0),  0 0 0 0   rgba(6,182,212,0);  }
}
@keyframes db-slide-in {
  from { opacity:0; transform: translateY(24px) scale(.96); }
  to   { opacity:1; transform: translateY(0)    scale(1);   }
}
@keyframes db-spin-slow {
  from { transform: rotate(0deg);   }
  to   { transform: rotate(360deg); }
}
.db-stat-card {
  position: relative; overflow: hidden; cursor: default;
  transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s ease;
}
.db-stat-card:hover { transform: translateY(-6px) scale(1.05); }
.db-stat-card::before {
  content:''; position:absolute; inset:0; pointer-events:none; border-radius:inherit;
  background: linear-gradient(135deg, rgba(255,255,255,.12) 0%, transparent 60%);
}
.db-history-row { transition: background .2s, transform .15s; cursor: default; }
.db-history-row:hover { background: rgba(56,189,248,.08) !important; transform: translateX(4px); }
.db-level-badge { transition: transform .2s cubic-bezier(.34,1.56,.64,1); }
.db-level-badge:hover { transform: scale(1.08); }
`;

function injectCSS(css) {
  if (document.getElementById('dashboard-styles')) return;
  const el = document.createElement('style');
  el.id = 'dashboard-styles';
  el.textContent = css;
  document.head.appendChild(el);
}

// ─── Ambient floating bubbles ─────────────────────────────────────────────────
const BUBBLE_COLORS = [
  ['#FF2A4D','#FF8FA3'],['#1A8CFF','#7EC8FF'],['#10D05E','#72FFB2'],
  ['#FFB800','#FFE47A'],['#A845F5','#D695FF'],['#FF6E14','#FFB480'],
  ['#FF3D8B','#FFABD4'],['#00C8D6','#80FFFF'],
];

function AmbientBubbles() {
  const bubbles = React.useMemo(() => Array.from({ length: 18 }, (_, i) => {
    const [c1, c2] = BUBBLE_COLORS[i % BUBBLE_COLORS.length];
    return {
      i, c1, c2,
      size:  28 + (i * 17 + 11) % 52,
      left:  (i * 73 + 7)  % 100,
      delay: (i * 1.3)     % 6,
      dur:   8 + (i * 1.7) % 10,
      dx:    ((i % 5) - 2) * 70,
      dy:    -(120 + (i * 23) % 200),
      ds:    0.45 + (i % 4) * 0.15,
    };
  }), []);

  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
      {bubbles.map(({ i, c1, c2, size, left, delay, dur, dx, dy, ds }) => (
        <div
          key={i}
          style={{
            position:'absolute', bottom:'-60px', left:`${left}%`,
            width:size, height:size, borderRadius:'50%',
            background:`radial-gradient(circle at 35% 30%, ${c2}, ${c1} 60%, rgba(0,0,0,.4))`,
            boxShadow:`0 0 ${size*.4}px ${c1}66, inset 0 0 ${size*.25}px rgba(255,255,255,.22)`,
            '--dx':`${dx}px`, '--dy':`${dy}px`, '--ds':ds,
            animation:`db-drift ${dur}s ${delay}s infinite ease-in`,
            opacity:0,
          }}
        />
      ))}
    </div>
  );
}

// ─── 3-D Bubble Orb ───────────────────────────────────────────────────────────
function BubbleOrb({ c1, c2, rim, glow, size = 48 }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0, position:'relative',
      background:`radial-gradient(circle at 35% 28%, ${c2} 0%, ${c1} 48%, ${rim} 80%, rgba(0,0,0,.55) 100%)`,
      boxShadow:`0 6px 18px ${glow}88, inset 0 -4px 8px rgba(0,0,0,.4), inset 0 4px 8px rgba(255,255,255,.22)`,
    }}>
      <div style={{
        position:'absolute', top:'14%', left:'20%', width:'34%', height:'28%',
        borderRadius:'50%', background:'rgba(255,255,255,.52)', filter:'blur(3px)',
      }} />
    </div>
  );
}

// ─── Stat themes ──────────────────────────────────────────────────────────────
const STAT_THEMES = [
  { c1:'#FFB800', c2:'#FFF3A0', rim:'#B37800', glow:'#FFB800', border:'rgba(255,184,0,.35)',  label:'#FFD54F' },
  { c1:'#1A8CFF', c2:'#8ECFFF', rim:'#0052B3', glow:'#1A8CFF', border:'rgba(26,140,255,.35)', label:'#7DD3FC' },
  { c1:'#FF3D8B', c2:'#FFA8D0', rim:'#B30D56', glow:'#FF3D8B', border:'rgba(255,61,139,.35)', label:'#F9A8D4' },
  { c1:'#FF6E14', c2:'#FFBF80', rim:'#B34500', glow:'#FF6E14', border:'rgba(255,110,20,.35)', label:'#FDB97D' },
  { c1:'#10D05E', c2:'#80FFB8', rim:'#088037', glow:'#10D05E', border:'rgba(16,208,94,.35)',  label:'#6EE7B7' },
  { c1:'#eab308', c2:'#FEF08A', rim:'#854D0E', glow:'#eab308', border:'rgba(234,179,8,.35)',  label:'#FDE047' },
  { c1:'#A845F5', c2:'#E4B4FF', rim:'#6B16B3', glow:'#A845F5', border:'rgba(168,69,245,.35)', label:'#C084FC' },
  { c1:'#00C8D6', c2:'#8AFFFF', rim:'#007A82', glow:'#00C8D6', border:'rgba(0,200,214,.35)',  label:'#67E8F9' },
];

function StatCard({ value, label, themeIdx, delay = 0 }) {
  const t = STAT_THEMES[themeIdx % STAT_THEMES.length];
  return (
    <div
      className="db-stat-card"
      style={{
        background:'linear-gradient(145deg, rgba(15,23,42,.88), rgba(30,41,59,.92))',
        border:`1px solid ${t.border}`,
        borderRadius:'1.1rem',
        padding:'1.3rem 1rem',
        textAlign:'center',
        backdropFilter:'blur(14px)',
        boxShadow:`0 8px 24px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.07)`,
        animation:`db-slide-in .5s ${delay}s both`,
      }}
    >
      <div style={{ display:'flex', justifyContent:'center', marginBottom:'.65rem' }}>
        <BubbleOrb c1={t.c1} c2={t.c2} rim={t.rim} glow={t.glow} size={48} />
      </div>
      <div style={{
        fontSize:'1.55rem', fontWeight:'900', color:'#fff', lineHeight:1,
        fontFamily:"'Outfit',sans-serif",
        textShadow:`0 0 12px ${t.glow}88`,
        marginBottom:'.3rem',
      }}>{value}</div>
      <span style={{
        fontSize:'.7rem', fontWeight:'700', letterSpacing:'.08em',
        textTransform:'uppercase', color:t.label, opacity:.85,
      }}>{label}</span>
      <div style={{
        position:'absolute', bottom:0, left:'15%', right:'15%', height:'2px',
        background:`linear-gradient(90deg, transparent, ${t.glow}, transparent)`,
        borderRadius:'0 0 1rem 1rem',
      }} />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardPage({ user }) {
  const [history, setHistory] = useState([]);

  useEffect(() => { injectCSS(DASHBOARD_CSS); }, []);

  useEffect(() => {
    async function loadHistory() {
      const hist = await gameService.fetchGameHistory();
      setHistory(hist);
    }
    loadHistory();
  }, []);

  const completedCount = user?.completedLevels ? Object.keys(user.completedLevels).length : 0;

  return (
    <div style={{ maxWidth:'960px', margin:'0 auto', padding:'1.5rem 1rem', position:'relative' }}>

      {/* ── Player Header ── */}
      <div style={{
        position:'relative', overflow:'hidden', marginBottom:'2rem',
        borderRadius:'1.4rem', border:'1px solid rgba(139,92,246,.4)',
        background:'linear-gradient(135deg, rgba(15,23,42,.93) 0%, rgba(28,12,56,.9) 50%, rgba(15,23,42,.93) 100%)',
        backdropFilter:'blur(20px)',
        boxShadow:'0 20px 50px rgba(0,0,0,.5), 0 0 0 1px rgba(139,92,246,.2), inset 0 1px 0 rgba(255,255,255,.07)',
        padding:'2rem',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        flexWrap:'wrap', gap:'1.5rem',
        animation:'db-slide-in .4s both',
      }}>
        <AmbientBubbles />

        {/* rainbow shimmer top stripe */}
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:'2px',
          background:'linear-gradient(90deg, transparent, #8b5cf6, #06b6d4, #ec4899, transparent)',
          backgroundSize:'200% auto',
          animation:'db-shimmer 3s linear infinite',
        }} />

        {/* Avatar + info */}
        <div style={{ display:'flex', alignItems:'center', gap:'1.4rem', position:'relative', zIndex:1 }}>
          <div style={{ position:'relative' }}>
            {/* 3-D avatar bubble */}
            <div style={{
              width:80, height:80, borderRadius:'50%',
              background:'radial-gradient(circle at 35% 28%, #a78bfa 0%, #7c3aed 45%, #4c1d95 80%, #1e0a38 100%)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 0 0 3px rgba(139,92,246,.5), 0 0 28px rgba(139,92,246,.55), 0 8px 24px rgba(0,0,0,.5)',
              animation:'db-pulse-ring 2.5s infinite',
              position:'relative', zIndex:1,
            }}>
              <div style={{
                position:'absolute', top:'14%', left:'18%', width:'32%', height:'28%',
                borderRadius:'50%', background:'rgba(255,255,255,.42)', filter:'blur(3px)',
              }} />
              <User size={38} color="#fff" />
            </div>
            {/* dashed orbit ring */}
            <div style={{
              position:'absolute', inset:'-9px', borderRadius:'50%',
              border:'2px dashed rgba(139,92,246,.3)',
              animation:'db-spin-slow 8s linear infinite',
            }} />
          </div>

          <div>
            <h1 style={{
              fontSize:'1.9rem', fontWeight:'900', color:'#fff', marginBottom:'.2rem',
              fontFamily:"'Outfit',sans-serif",
              textShadow:'0 0 22px rgba(139,92,246,.6)',
            }}>{user?.name || 'Guest Adventurer'}</h1>
            <p style={{ color:'#94a3b8', fontSize:'.875rem', marginBottom:'.55rem' }}>
              {user?.email || `Playing ${GAME_NAME}`}
            </p>
            {/* XP bar */}
            <div style={{ width:220, height:6, borderRadius:9999, background:'rgba(255,255,255,.08)', overflow:'hidden' }}>
              <div style={{
                height:'100%',
                width:`${Math.max(8, Math.min(100, ((user?.totalScore || 0) % 10000) / 100))}%`,
                background:'linear-gradient(90deg,#8b5cf6,#06b6d4)',
                borderRadius:9999,
                boxShadow:'0 0 8px rgba(139,92,246,.7)',
                transition:'width 1s ease',
              }} />
            </div>
            <span style={{ fontSize:'.68rem', color:'#475569', marginTop:'.25rem', display:'block' }}>XP Progress</span>
          </div>
        </div>

        {/* Level badge */}
        <div className="db-level-badge" style={{
          position:'relative', zIndex:1,
          background:'radial-gradient(circle at 35% 30%, #67e8f9 0%, #0ea5e9 40%, #0369a1 80%, #082f49 100%)',
          padding:'.12rem', borderRadius:'1.05rem',
          boxShadow:'0 0 28px rgba(14,165,233,.5), 0 8px 20px rgba(0,0,0,.4)',
        }}>
          <div style={{
            background:'rgba(2,6,23,.72)', borderRadius:'.9rem',
            padding:'.9rem 1.6rem', textAlign:'center',
          }}>
            <span style={{ fontSize:'.62rem', color:'#7dd3fc', textTransform:'uppercase', letterSpacing:'.1em', display:'block', fontWeight:'700' }}>
              Current Frontier
            </span>
            <div style={{
              fontSize:'2rem', fontWeight:'900', color:'#fff',
              fontFamily:"'Outfit',sans-serif",
              textShadow:'0 0 18px rgba(56,189,248,.9)',
              lineHeight:1.1,
            }}>LVL {user?.currentLevel || 1}</div>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit, minmax(148px, 1fr))',
        gap:'1rem', marginBottom:'2rem',
      }}>
        <StatCard value={user?.totalStars || 0}                                           label="Total Stars"    themeIdx={0} delay={.05} />
        <StatCard value={(user?.totalScore || 0).toLocaleString()}                        label="Total Score"    themeIdx={1} delay={.10} />
        <StatCard value={user?.bubblesPopped || 0}                                        label="Bubbles Popped" themeIdx={2} delay={.15} />
        <StatCard value={`x${user?.bestCombo || 0}`}                                      label="Best Combo"     themeIdx={3} delay={.20} />
        <StatCard value={completedCount}                                                   label="Levels Cleared" themeIdx={4} delay={.25} />
        <StatCard value={(user?.bestScore || user?.totalScore || 0).toLocaleString()}     label="Best Score"     themeIdx={5} delay={.30} />
        <StatCard value={user?.rescuedObjects || 0}                                       label="Rescues"        themeIdx={6} delay={.35} />
        <StatCard value={user?.achievements ? `${user.achievements.length}/10` : '0/10'} label="Achievements"   themeIdx={7} delay={.40} />
      </div>

      {/* ── History Table ── */}
      <div style={{
        borderRadius:'1.3rem', border:'1px solid rgba(56,189,248,.22)',
        background:'linear-gradient(145deg, rgba(15,23,42,.92), rgba(18,28,52,.92))',
        backdropFilter:'blur(16px)', padding:'1.75rem',
        boxShadow:'0 16px 40px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.05)',
        animation:'db-slide-in .5s .45s both',
        position:'relative', overflow:'hidden',
      }}>
        {/* top accent bar */}
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:'2px',
          background:'linear-gradient(90deg, transparent, #38bdf8 40%, #8b5cf6 60%, transparent)',
        }} />

        <h2 style={{
          fontSize:'1.2rem', fontWeight:'800', color:'#fff',
          marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'.6rem',
          fontFamily:"'Outfit',sans-serif",
        }}>
          <div style={{
            width:28, height:28, borderRadius:'50%', flexShrink:0,
            background:'radial-gradient(circle at 35% 28%, #67e8f9, #0ea5e9 50%, #0369a1)',
            boxShadow:'0 0 10px rgba(14,165,233,.5)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <History size={14} color="#fff" />
          </div>
          Recent Game Sessions
        </h2>

        {history.length === 0 ? (
          <div style={{ textAlign:'center', padding:'2.5rem 0' }}>
            <div style={{
              width:64, height:64, borderRadius:'50%', margin:'0 auto 1rem',
              background:'radial-gradient(circle at 35% 28%, rgba(148,163,184,.35), rgba(100,116,139,.15))',
              border:'2px dashed rgba(148,163,184,.25)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <History size={28} color="rgba(148,163,184,.35)" />
            </div>
            <p style={{ color:'#4b5563', fontSize:'.9rem' }}>
              No sessions yet. Play levels in{' '}
              <strong style={{ color:'#6b7280' }}>{GAME_NAME}</strong> to record your history!
            </p>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.875rem', textAlign:'left' }}>
              <thead>
                <tr style={{
                  color:'#4b5563', fontSize:'.68rem', textTransform:'uppercase',
                  letterSpacing:'.08em', borderBottom:'1px solid rgba(56,189,248,.12)',
                }}>
                  {['Level','Score','Stars','Shots Used','Best Combo','Date'].map(h => (
                    <th key={h} style={{ padding:'.6rem .9rem', fontWeight:'700' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((sess, i) => (
                  <tr
                    key={i}
                    className="db-history-row"
                    style={{ borderBottom:'1px solid rgba(148,163,184,.05)' }}
                  >
                    <td style={{ padding:'.7rem .9rem' }}>
                      <span style={{
                        display:'inline-flex', alignItems:'center', gap:'.4rem',
                        background:'rgba(14,165,233,.11)', border:'1px solid rgba(56,189,248,.24)',
                        borderRadius:9999, padding:'.2rem .7rem',
                        fontSize:'.8rem', fontWeight:'800', color:'#38bdf8',
                      }}>
                        <span style={{
                          width:7, height:7, borderRadius:'50%', display:'inline-block',
                          background:'radial-gradient(circle at 35% 28%, #67e8f9, #0ea5e9)',
                          boxShadow:'0 0 6px rgba(56,189,248,.75)',
                        }} />
                        Lv {sess.levelId}
                      </span>
                    </td>
                    <td style={{ padding:'.7rem .9rem', fontWeight:'800', color:'#fff', fontSize:'.93rem' }}>
                      {sess.score.toLocaleString()}
                    </td>
                    <td style={{ padding:'.7rem .9rem' }}>
                      <span style={{ color:'#fbbf24', letterSpacing:'2px', fontSize:'.98rem' }}>
                        {'★'.repeat(sess.stars)}
                        <span style={{ color:'rgba(255,255,255,.1)' }}>{'★'.repeat(3 - sess.stars)}</span>
                      </span>
                    </td>
                    <td style={{ padding:'.7rem .9rem', color:'#94a3b8', fontWeight:'600' }}>
                      {sess.shotsUsed}
                    </td>
                    <td style={{ padding:'.7rem .9rem' }}>
                      <span style={{
                        display:'inline-block',
                        background:'rgba(249,115,22,.11)', border:'1px solid rgba(249,115,22,.28)',
                        borderRadius:9999, padding:'.15rem .6rem',
                        color:'#fb923c', fontWeight:'800', fontSize:'.82rem',
                      }}>
                        x{sess.bestCombo}
                      </span>
                    </td>
                    <td style={{ padding:'.7rem .9rem', color:'#475569', fontSize:'.8rem' }}>
                      {new Date(sess.completedAt || sess.startedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
