import { useState, useEffect, useRef, useCallback } from "react";
import { Dock } from "./component/Dock/Dock.jsx";
import NotesApp from "./component/NotesApp.jsx";
import CalendarApp from "./component/CalendarApp.jsx";
import MusicAppComponent from "./component/MusicApp.jsx";
import CalculatorApp from "./component/Calculator.jsx";

/* ─── GLOBAL CSS ──────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --sf:-apple-system,'SF Pro Text','Helvetica Neue',Inter,sans-serif;
    --sfd:-apple-system,'SF Pro Display','Helvetica Neue',Inter,sans-serif;
    --mono:'SF Mono','Fira Code','Menlo',monospace;
  }
  body{overflow:hidden;font-family:var(--sf);}
  .sb::-webkit-scrollbar{width:5px;}.sb::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.2);border-radius:3px;}.sb::-webkit-scrollbar-track{background:transparent;}

  @keyframes winOpen{
    0%  {opacity:0;transform:scale(0.82) translateY(20px);filter:blur(6px);}
    60% {opacity:1;filter:blur(0px);}
    100%{opacity:1;transform:scale(1) translateY(0);filter:blur(0px);}
  }
  @keyframes winClose{
    0%  {opacity:1;transform:scale(1) translateY(0);filter:blur(0px);}
    100%{opacity:0;transform:scale(0.82) translateY(16px);filter:blur(6px);}
  }
  @keyframes fadeUp{from{opacity:0;transform:scale(0.94) translateY(10px);}to{opacity:1;transform:scale(1) translateY(0);}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);}}
  @keyframes menuOpen{0%{opacity:0;transform:translateY(-6px) scale(0.95);}60%{opacity:1;transform:translateY(1px) scale(1.005);}100%{opacity:1;transform:translateY(0) scale(1);}}
  @keyframes menuClose{0%{opacity:1;transform:translateY(0) scale(1);}100%{opacity:0;transform:translateY(-6px) scale(0.95);}}
  @keyframes ccOpen{0%{opacity:0;transform:translateY(-10px) scale(0.94);}60%{opacity:1;transform:translateY(2px) scale(1.006);}100%{opacity:1;transform:translateY(0) scale(1);}}
  @keyframes ccClose{0%{opacity:1;transform:translateY(0) scale(1);}100%{opacity:0;transform:translateY(-10px) scale(0.94);}}
  @keyframes menuItemIn{from{opacity:0;transform:translateX(-4px);}to{opacity:1;transform:translateX(0);}}
  .menu-item{border-radius:6px;margin:0 5px;padding:4px 10px;display:flex;justify-content:space-between;align-items:center;cursor:default;color:#1c1c1e;font-size:13px;transition:background 0.08s ease,color 0.08s ease;gap:12px;}
  .menu-item:hover{background:rgba(9,93,255,0.88)!important;color:white!important;border-radius:6px;}
  .menu-item:hover .menu-key{color:rgba(255,255,255,0.65)!important;}
  .menu-item:hover .menu-arr{color:rgba(255,255,255,0.65)!important;}
  .menu-item:active{background:rgba(0,80,210,0.9)!important;}
  .menu-sep{height:0.5px;background:linear-gradient(90deg,transparent,rgba(0,0,0,0.12) 15%,rgba(0,0,0,0.12) 85%,transparent);margin:4px 0;}
  .menu-panel{
    position:relative;
    background:rgba(255,255,255,0.38);
    backdrop-filter:blur(60px) saturate(180%);
    -webkit-backdrop-filter:blur(60px) saturate(180%);
    border-radius:14px;
    padding:5px 0;
    border:0.5px solid rgba(255,255,255,0.55);
    box-shadow:
      0 0 0 0.5px rgba(0,0,0,0.08),
      0 4px 6px rgba(0,0,0,0.07),
      0 12px 28px rgba(0,0,0,0.22),
      0 24px 48px rgba(0,0,0,0.12),
      inset 0 1px 0 rgba(255,255,255,0.7);
    
    font-family:var(--sf);
    overflow:hidden;
  }
  .menu-panel::before{
    content:'';
    position:absolute;
    inset:0;
    background:linear-gradient(160deg,rgba(255,255,255,0.22) 0%,rgba(255,255,255,0.04) 60%,rgba(255,255,255,0.08) 100%);
    border-radius:14px;
    pointer-events:none;
    z-index:0;
  }
  .menu-panel>*{position:relative;z-index:1;}
  .menu-key{opacity:0.45;font-size:12px;letter-spacing:0.04em;white-space:nowrap;flex-shrink:0;transition:color 0.08s;}
  .menu-arr{opacity:0.4;font-size:13px;transition:color 0.08s;}
  @keyframes slideInRight{from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);}}
  @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
  @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
  @keyframes notifIn{from{opacity:0;transform:translateX(340px);}to{opacity:1;transform:translateX(0);}}

  .blink{animation:blink 1s step-end infinite;}
  .spin{animation:spin 3s linear infinite;}
  .tl-wrap:hover .tl-r{filter:brightness(0.82);}
  .tl-wrap:hover .tl-y{filter:brightness(0.82);}
  .tl-wrap:hover .tl-g{filter:brightness(0.82);}
  .tl-r,.tl-y,.tl-g{position:relative;transition:filter 0.12s;}
  .mbi{ border-radius:5px; position:relative; }
  .mbi-active{ background:rgba(255,255,255,0.18) !important; border-radius:5px; }
  .menubar-shadow{}
  .menubar-icon-shadow{}
  .dock-item{transition:transform 0.18s cubic-bezier(0.34,1.4,0.64,1);}
  .sb-item:hover{background:rgba(0,0,0,0.05)!important;}
  ::selection{background:rgba(0,122,255,0.28);}
`;

/* ─── macOS WALLPAPER ────────────────────────────────────────────────── */
function SonomaWallpaper({ src }) {
  return (
    <img
      src={src}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
        transition: "opacity 0.6s ease",
      }}
    />
  );
}

/* ─── APP ICONS ──────────────────────────────────────────────────────── */
function IconFinder({size=60}) {
  const r = size * 0.224;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <defs>
        <linearGradient id="fi-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6ec6fd"/><stop offset="100%" stopColor="#1877f2"/>
        </linearGradient>
        <linearGradient id="fi-face-l" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#cce8ff"/><stop offset="100%" stopColor="#84bfff"/>
        </linearGradient>
      </defs>
      <rect width="60" height="60" rx={r} fill="url(#fi-bg)"/>
      <rect x="6" y="12" width="48" height="38" rx="4" fill="white"/>
      <rect x="6" y="12" width="24" height="38" rx="4" fill="url(#fi-face-l)"/>
      <rect x="28" y="12" width="2" height="38" fill="url(#fi-face-l)"/>
      <circle cx="20" cy="27" r="6.5" fill="white"/>
      <circle cx="20" cy="27" r="3.8" fill="#1877f2"/>
      <circle cx="21.8" cy="25.2" r="1.4" fill="white" opacity="0.9"/>
      <circle cx="20" cy="27" r="1.2" fill="#0a50c0"/>
      <circle cx="40" cy="27" r="6.5" fill="white"/>
      <circle cx="40" cy="27" r="3.8" fill="#1a1a1e"/>
      <circle cx="41.8" cy="25.2" r="1.4" fill="white" opacity="0.9"/>
      <circle cx="40" cy="27" r="1.2" fill="#000"/>
      <path d="M13.5,36 Q20,42 26.5,36" stroke="#1877f2" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M33,35.5 Q40,41 47,35.5" stroke="#3a3a40" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <rect x="6" y="12" width="48" height="5" rx="4" fill="rgba(255,255,255,0.22)"/>
    </svg>
  );
}
function IconSafari({size=60}) {
  const r=size*0.224;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <defs><linearGradient id="saf-bg" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stopColor="#5ac8fa"/><stop offset="35%" stopColor="#0a7aff"/><stop offset="100%" stopColor="#0040e0"/></linearGradient></defs>
      <rect width="60" height="60" rx={r} fill="url(#saf-bg)"/>
      <circle cx="30" cy="30" r="21" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1"/>
      <line x1="30" y1="9" x2="30" y2="51" stroke="rgba(255,255,255,0.13)" strokeWidth="0.8"/>
      <line x1="9" y1="30" x2="51" y2="30" stroke="rgba(255,255,255,0.13)" strokeWidth="0.8"/>
      <polygon points="30,11 33,30 30,27.5 27,30" fill="#ff3b30"/>
      <polygon points="30,49 27,30 30,32.5 33,30" fill="rgba(255,255,255,0.92)"/>
      <circle cx="30" cy="30" r="2.8" fill="white" opacity="0.95"/>
      <text x="30" y="8" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="5" fontFamily="-apple-system,sans-serif" fontWeight="600">N</text>
      <text x="30" y="56" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="5" fontFamily="-apple-system,sans-serif" fontWeight="600">S</text>
      <text x="5" y="31.5" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="5" fontFamily="-apple-system,sans-serif" fontWeight="600">W</text>
      <text x="55" y="31.5" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="5" fontFamily="-apple-system,sans-serif" fontWeight="600">E</text>
      <rect x="5" y="5" width="50" height="7" rx={r} fill="rgba(255,255,255,0.14)"/>
    </svg>
  );
}
function IconMessages({size=60}) {
  const r=size*0.224;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <defs><linearGradient id="msg-bg" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stopColor="#62e878"/><stop offset="100%" stopColor="#28c840"/></linearGradient></defs>
      <rect width="60" height="60" rx={r} fill="url(#msg-bg)"/>
      <path d="M8,20 C8,14 13,10 19,10 L41,10 C47,10 52,14 52,20 L52,36 C52,42 47,46 41,46 L32,46 L20,54 L20,46 L19,46 C13,46 8,42 8,36 Z" fill="white"/>
      <rect x="18" y="24" width="24" height="3" rx="1.5" fill="#28c840"/>
      <rect x="18" y="31" width="16" height="3" rx="1.5" fill="#28c840"/>
      <rect x="5" y="5" width="50" height="6" rx={r} fill="rgba(255,255,255,0.22)"/>
    </svg>
  );
}
function IconCalculator({size=60}) {
  const r = size * 0.224;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" style={{display:"block",flexShrink:0}}>
      <defs>
        <linearGradient id="calc-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d1d1d6"/>
          <stop offset="100%" stopColor="#aeaeb2"/>
        </linearGradient>
        <linearGradient id="calc-body-g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3a3a3c"/>
          <stop offset="100%" stopColor="#2c2c2e"/>
        </linearGradient>
        <linearGradient id="calc-screen-g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#48484a"/>
          <stop offset="100%" stopColor="#2c2c2e"/>
        </linearGradient>
        <filter id="calc-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.35)"/>
        </filter>
      </defs>

      {/* App background — light silver like real macOS Calculator */}
      <rect width="60" height="60" rx={r} fill="url(#calc-bg)"/>
      {/* Subtle inner highlight at top */}
      <rect x="0" y="0" width="60" height="18" rx={r} fill="rgba(255,255,255,0.28)"/>

      {/* Calculator body — dark rounded rect, slightly inset */}
      <rect x="9" y="7" width="42" height="48" rx="7" fill="url(#calc-body-g)" filter="url(#calc-shadow)"/>

      {/* Screen */}
      <rect x="13" y="10.5" width="34" height="13" rx="3.5" fill="url(#calc-screen-g)"/>
      {/* Screen shine */}
      <rect x="13" y="10.5" width="34" height="5" rx="3.5" fill="rgba(255,255,255,0.06)"/>

      {/* Row 1 — 3 buttons: grey grey orange */}
      <circle cx="20"  cy="32" r="5" fill="#636366"/>
      <circle cx="30"  cy="32" r="5" fill="#636366"/>
      <circle cx="40"  cy="32" r="5" fill="#ff9f0a"/>

      {/* Row 2 — white white orange */}
      <circle cx="20"  cy="42" r="5" fill="#e5e5ea"/>
      <circle cx="30"  cy="42" r="5" fill="#e5e5ea"/>
      <circle cx="40"  cy="42" r="5" fill="#ff9f0a"/>

      {/* Row 3 — wide white bar + orange */}
      <rect x="13.5" y="49.5" width="13" height="8" rx="4" fill="#e5e5ea"/>
      <circle cx="40"  cy="53.5" r="5" fill="#ff9f0a"/>

      {/* Subtle button 3D highlights */}
      <circle cx="20" cy="31.5" r="4.6" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8"/>
      <circle cx="30" cy="31.5" r="4.6" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8"/>
    </svg>
  );
}
function IconNotes({size=60}) {
  const r=size*0.224;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <defs><linearGradient id="notes-bg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#ffe44a"/><stop offset="100%" stopColor="#f5a623"/></linearGradient></defs>
      <rect width="60" height="60" rx={r} fill="url(#notes-bg)"/>
      <rect x="9" y="9" width="42" height="48" rx="3.5" fill="#fffce8"/>
      <rect x="9" y="9" width="42" height="19" rx="3.5" fill="url(#notes-bg)"/>
      <rect x="15" y="29" width="30" height="2.5" rx="1.25" fill="rgba(180,140,0,0.4)"/>
      <rect x="15" y="35" width="24" height="2.5" rx="1.25" fill="rgba(180,140,0,0.4)"/>
      <rect x="15" y="41" width="27" height="2.5" rx="1.25" fill="rgba(180,140,0,0.4)"/>
      <rect x="15" y="47" width="18" height="2.5" rx="1.25" fill="rgba(180,140,0,0.4)"/>
    </svg>
  );
}
function IconMusic({size=60}) {
  const r=size*0.224;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <defs><linearGradient id="music-bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fc5c7d"/><stop offset="100%" stopColor="#fc2254"/></linearGradient></defs>
      <rect width="60" height="60" rx={r} fill="url(#music-bg)"/>
      <ellipse cx="21" cy="41" rx="7.5" ry="5.5" transform="rotate(-12 21 41)" fill="white"/>
      <ellipse cx="38" cy="38" rx="7.5" ry="5.5" transform="rotate(-12 38 38)" fill="white"/>
      <rect x="27.5" y="16" width="3" height="26" rx="1.5" fill="white"/>
      <rect x="44.5" y="14" width="3" height="24" rx="1.5" fill="white"/>
      <path d="M28 16 L46 13.5 L46 18.5 L28 21 Z" fill="white"/>
    </svg>
  );
}
function IconPhotos({size=60}) {
  const r=size*0.224;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <rect width="60" height="60" rx={r} fill="white"/>
      {[["#ff3b30",30,10,0],["#ff9500",44,18,45],["#ffcc00",50,32,90],["#34c759",44,46,135],["#5ac8fa",30,52,180],["#007aff",16,46,225],["#5856d6",10,32,270],["#ff2d55",16,18,315]].map(([color,cx,cy,angle],i)=>(
        <ellipse key={i} cx={cx} cy={cy} rx="10" ry="4.2" transform={`rotate(${angle} ${cx} ${cy})`} fill={color}/>
      ))}
      <circle cx="30" cy="30" r="10" fill="white"/>
    </svg>
  );
}
function IconCalendar({size=60}) {
  const r=size*0.224;
  const d=new Date().getDate();
  const day=new Date().toLocaleString("en",{weekday:"short"}).toUpperCase();
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <rect width="60" height="60" rx={r} fill="white"/>
      <rect x="0" y="0" width="60" height="22" rx={r} fill="#ff3b30"/>
      <rect x="0" y="13" width="60" height="9" fill="#ff3b30"/>
      <text x="30" y="15.5" textAnchor="middle" fontFamily="-apple-system,sans-serif" fontSize="8.5" fill="white" fontWeight="700" letterSpacing="1.2">{day}</text>
      <text x="30" y="47" textAnchor="middle" fontFamily="-apple-system,sans-serif" fontSize="28" fill="#1c1c1e" fontWeight="100" letterSpacing="-1.5">{d}</text>
    </svg>
  );
}
function IconTerminal({size=60}) {
  const r=size*0.224;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <defs><linearGradient id="term-bg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#2a2a2e"/><stop offset="100%" stopColor="#0a0a0e"/></linearGradient></defs>
      <rect width="60" height="60" rx={r} fill="url(#term-bg)"/>
      <rect x="5" y="5" width="50" height="50" rx={r} fill="#0d1117"/>
      <text x="11" y="30" fontFamily="'SF Mono','Fira Code',Menlo,monospace" fontSize="12" fill="#3fb950" fontWeight="700">&#x25BA;_</text>
      <text x="11" y="43" fontFamily="'SF Mono','Fira Code',Menlo,monospace" fontSize="7.5" fill="#3fb950" opacity="0.5">~/Desktop</text>
    </svg>
  );
}
function IconSettings({size=60}) {
  const r=size*0.224;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <defs><linearGradient id="set-bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#b0b0b8"/><stop offset="100%" stopColor="#727278"/></linearGradient></defs>
      <rect width="60" height="60" rx={r} fill="url(#set-bg)"/>
      {Array.from({length:8}).map((_,i)=>{
        const a=(i*45)*Math.PI/180;
        return <line key={i} x1={30+13*Math.cos(a)} y1={30+13*Math.sin(a)} x2={30+21*Math.cos(a)} y2={30+21*Math.sin(a)} stroke="white" strokeWidth="5" strokeLinecap="round"/>;
      })}
      <circle cx="30" cy="30" r="13" fill="none" stroke="white" strokeWidth="3.5"/>
      <circle cx="30" cy="30" r="6" fill="url(#set-bg)"/>
    </svg>
  );
}
function IconFaceTime({size=60}) {
  const r=size*0.224;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <defs><linearGradient id="ft-bg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#5ac8fa"/><stop offset="100%" stopColor="#32ade6"/></linearGradient></defs>
      <rect width="60" height="60" rx={r} fill="url(#ft-bg)"/>
      <rect x="7" y="16" width="34" height="28" rx="5" fill="white"/>
      <circle cx="24" cy="30" r="8.5" fill="#1a1a1e"/>
      <circle cx="24" cy="30" r="6" fill="#2a2a2e"/>
      <circle cx="21.5" cy="27.5" r="2" fill="rgba(255,255,255,0.35)"/>
      <path d="M41,22 L53,17 L53,43 L41,38 Z" fill="white"/>
    </svg>
  );
}
function IconMaps({size=60}) {
  const r=size*0.224;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <defs><linearGradient id="maps-bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#5ac8fa"/><stop offset="100%" stopColor="#34aadc"/></linearGradient></defs>
      <rect width="60" height="60" rx={r} fill="url(#maps-bg)"/>
      <rect x="5" y="5" width="50" height="50" rx={r-2} fill="#e8f4e8"/>
      <path d="M5,32 L25,28 L35,32 L55,30" stroke="white" strokeWidth="4" fill="none"/>
      <path d="M28,5 L30,25 L28,35 L29,55" stroke="white" strokeWidth="4" fill="none"/>
      <path d="M30,8 C26,8 22,12 22,16 C22,22 30,32 30,32 C30,32 38,22 38,16 C38,12 34,8 30,8Z" fill="#ff3b30"/>
      <circle cx="30" cy="16" r="4" fill="white"/>
    </svg>
  );
}
function IconTrash({size=60}) {
  const r=size*0.224;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <defs><linearGradient id="trash-bg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="rgba(255,255,255,0.28)"/><stop offset="100%" stopColor="rgba(220,220,232,0.22)"/></linearGradient></defs>
      <rect width="60" height="60" rx={r} fill="url(#trash-bg)"/>
      <rect width="60" height="60" rx={r} fill="rgba(60,60,70,0.15)"/>
      <line x1="10" y1="15" x2="50" y2="15" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.92"/>
      <rect x="24" y="9" width="12" height="7" rx="3" fill="none" stroke="white" strokeWidth="2.2" strokeOpacity="0.9"/>
      <path d="M14,15 L16,50 Q16.5,54 21,54 L39,54 Q43.5,54 44,50 L46,15Z" fill="none" stroke="white" strokeWidth="2.3" strokeLinejoin="round" strokeOpacity="0.9"/>
      <line x1="23" y1="23" x2="23" y2="45" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.72"/>
      <line x1="30" y1="23" x2="30" y2="45" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.72"/>
      <line x1="37" y1="23" x2="37" y2="45" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.72"/>
    </svg>
  );
}
function IconLaunchpad({size=60}) {
  const r=size*0.224;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <defs>
        <linearGradient id="lp-bg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#1a1a2e"/><stop offset="100%" stopColor="#0a0a1a"/></linearGradient>
        <radialGradient id="lp-planet" cx="50%" cy="35%" r="55%"><stop offset="0%" stopColor="#6e90d8"/><stop offset="100%" stopColor="#2a4a9a"/></radialGradient>
      </defs>
      <rect width="60" height="60" rx={r} fill="url(#lp-bg)"/>
      <circle cx="30" cy="30" r="17" fill="url(#lp-planet)"/>
      <ellipse cx="30" cy="30" rx="23" ry="7" fill="none" stroke="rgba(160,180,255,0.55)" strokeWidth="2.5"/>
      <path d="M30,14 C30,14 26,20 26,28 L34,28 C34,20 30,14 30,14Z" fill="white" opacity="0.9"/>
      <rect x="27.5" y="28" width="5" height="5" fill="white" opacity="0.7"/>
    </svg>
  );
}

/* ─── MENU BAR STATUS ICONS ──────────────────────────────────────────── */
const MenuBarBattery = () => (
  <svg width="28" height="13" viewBox="0 0 28 13" fill="none">
    <rect x="0.75" y="0.75" width="23" height="11.5" rx="3.4" stroke="white" strokeOpacity="0.88" strokeWidth="1.15"/>
    <rect x="24.2" y="4.0" width="2.8" height="5.0" rx="1.6" fill="white" fillOpacity="0.5"/>
    <rect x="1.9" y="1.9" width="18.5" height="9.2" rx="2.2" fill="white"/>
  </svg>
);
const MenuBarWifi = () => (
  <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
    <circle cx="8" cy="11.0" r="1.35" fill="white"/>
    <path d="M 5.0,7.5 Q 8,5.0 11.0,7.5" stroke="white" strokeWidth="1.55" strokeLinecap="round" fill="none"/>
    <path d="M 2.0,4.5 Q 8,0.2 14.0,4.5" stroke="white" strokeWidth="1.55" strokeLinecap="round" fill="none" strokeOpacity="0.65"/>
  </svg>
);
const MenuBarSpotlight = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <circle cx="6.0" cy="6.0" r="4.3" stroke="white" strokeOpacity="0.92" strokeWidth="1.6"/>
    <line x1="9.2" y1="9.2" x2="14.0" y2="14.0" stroke="white" strokeOpacity="0.92" strokeWidth="1.75" strokeLinecap="round"/>
  </svg>
);
const MenuBarCC = () => (
  <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
    <rect x="0.5" y="0.5" width="14" height="5.5" rx="2.75" fill="white" fillOpacity="0.9"/>
    <circle cx="11.75" cy="3.25" r="2.0" fill="rgba(60,60,60,0.55)"/>
    <rect x="0.5" y="8.0" width="14" height="5.5" rx="2.75" fill="none" stroke="white" strokeOpacity="0.85" strokeWidth="1.1"/>
    <circle cx="3.25" cy="10.75" r="2.0" fill="white" fillOpacity="0.9"/>
  </svg>
);
const MenuBarSiri = () => (
  <img src="/Speech.png" style={{width:16, height:16, objectFit:"contain"}} alt="Siri"/>
);
const AppleLogo = () => (
  <svg width="12" height="15" viewBox="0 0 16 16" fill="white">
    <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516.024.034 1.52.087 2.475-1.258.955-1.345.762-2.391.728-2.43zm3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422.212-2.189 1.675-2.789 1.698-2.854.023-.065-.597-.79-1.254-1.157a3.692 3.692 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56.244.729.625 1.924 1.273 2.796.576.984 1.34 1.667 1.659 1.899.319.232 1.219.386 1.843.067.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758.347-.79.505-1.217.473-1.282z"/>
  </svg>
);

/* ─── GLOBAL TRACKS & MUSIC STATE ───────────────────────────────────── */
const TRACKS = [
  {title:"Blinding Lights",      artist:"The Weeknd",             dur:200, src:"/The Weeknd - Blinding Lights (Official Audio).mp3",   art:"/21e8d6022d8d8740eebdf4f83253a5c6.jpg"},
  {title:"Runaway",              artist:"Kanye West ft. Pusha T", dur:549, src:"/09 Runaway [Ft. Pusha T].mp3",                        art:"/ab67616d0000b273baf2a68126739ff553f2930a.jpeg"},
  {title:"Aria (Extended Mix)",  artist:"Argy & Omnya",           dur:432, src:"/Argy & Omnya - Aria (Extended Mix).mp3",               art:"/0x1900-000000-80-0-0.jpg"},
  {title:"Flight's Booked",      artist:"Drake",                  dur:198, src:"/Drake_-_Flight_s_Booked_(mp3.pm).mp3",                 art:"/Honestly,_Nevermind_-_Drake.png"},
  {title:"Closing Night",        artist:"The Weeknd",             dur:224, src:"/The_Weeknd_-_Closing_Night_Bonus_tg_theweekndru_(mp3.pm).mp3", art:"/https___images.genius.com_742812e81e5a305a3439707184d2294b.750x750x1 - Copy.png"},
  {title:"Is There Someone Else",artist:"The Weeknd",             dur:213, src:"/The_Weeknd_-_Is_there_someone_else_2023_(mp3.pm).mp3",  art:"/5934683e8944b8304e9c2920f914e846.1000x1000x1.png"},
  {title:"I Feel It Coming",     artist:"The Weeknd",             dur:269, src:"/TheWeeknd_-_I_Feel_It_Coming_(mp3.pm).mp3",             art:"/ASSET_MMS_102788079.jpeg"},
];

const musicState = {
  trackIdx: 0,
  playing: false,
  progress: 0,
  vol: 0.68,
  liked: false,
};

/* ─── MODULE-LEVEL AUDIO ENGINE ─────────────────────────────────────── */
const audioEl = new Audio();
audioEl.volume = musicState.vol;

function audioLoad(idx) {
  const track = TRACKS[idx];
  if (track.src) { audioEl.src = track.src; audioEl.load(); }
  else { audioEl.pause(); audioEl.src = ""; }
}
audioLoad(0);

audioEl.addEventListener("timeupdate", () => {
  if (audioEl.duration) musicState.progress = audioEl.currentTime / audioEl.duration;
});
audioEl.addEventListener("ended", () => {
  const next = (musicState.trackIdx + 1) % TRACKS.length;
  musicState.trackIdx = next;
  musicState.progress = 0;
  audioLoad(next);
  if (musicState.playing && TRACKS[next].src) audioEl.play().catch(()=>{});
});

const audioControls = {
  togglePlay() {
    musicState.playing = !musicState.playing;
    if (TRACKS[musicState.trackIdx].src) {
      if (musicState.playing) audioEl.play().catch(()=>{});
      else audioEl.pause();
    }
  },
  prevTrack() {
    musicState.trackIdx = Math.max(0, musicState.trackIdx - 1);
    musicState.progress = 0;
    audioLoad(musicState.trackIdx);
    if (musicState.playing && TRACKS[musicState.trackIdx].src) audioEl.play().catch(()=>{});
  },
  nextTrack() {
    musicState.trackIdx = Math.min(TRACKS.length - 1, musicState.trackIdx + 1);
    musicState.progress = 0;
    audioLoad(musicState.trackIdx);
    if (musicState.playing && TRACKS[musicState.trackIdx].src) audioEl.play().catch(()=>{});
  },
  seek(v) {
    musicState.progress = v;
    if (audioEl.duration) audioEl.currentTime = v * audioEl.duration;
  },
  setVol(v) {
    musicState.vol = v;
    audioEl.volume = v;
  },
};

/* ─── CONTROL CENTER ─────────────────────────────────────────────────── */
function ControlCenterPanel({ onClose, closingCC=false, brightness, setBrightness }) {
  const [, forceUpdate] = useState(0);
  const [volume, setVolume] = useState(musicState.vol);
  const [wifi, setWifi]     = useState(true);
  const [bt, setBt]         = useState(true);
  const [pomMode, setPomMode]   = useState('work');
  const [pomSecs, setPomSecs]   = useState(25*60);
  const [pomRunning, setPomRunning] = useState(false);
  useEffect(() => {
    const t = setInterval(() => forceUpdate(n => n + 1), 250);
    return () => clearInterval(t);
  }, []);

  useEffect(()=>{
    if(!pomRunning) return;
    const t=setInterval(()=>{
      setPomSecs(s=>{
        if(s<=1){
          setPomRunning(false);
          setPomMode(m=>{ const nm=m==="work"?"break":"work"; setPomSecs(nm==="work"?25*60:5*60); return nm; });
          return 0;
        }
        return s-1;
      });
    },1000);
    return ()=>clearInterval(t);
  },[pomRunning]);

  const track = TRACKS[musicState.trackIdx];
  const dur   = audioEl.duration || track.dur;
  const cur   = Math.floor(musicState.progress * dur);
  const fmt   = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`;

  // tile style — always glass, active just brightens
  const tile = (active) => ({
    background: active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.15)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "0.5px solid " + (active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.22)"),
    boxShadow: active
      ? "inset 0 1px 0 rgba(255,255,255,1), 0 2px 8px rgba(0,0,0,0.15)"
      : "inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.12)",
    borderRadius: 14,
    cursor: "default",
    transition: "all 0.15s ease",
  });
  // pomodoro tile always stays glass regardless of running state
  const pomTile = {
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "0.5px solid rgba(255,255,255,0.22)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.12)",
    borderRadius: 14,
    cursor: "default",
    transition: "all 0.15s ease",
  };

  const CCSlider = ({ value, onChange, icon, label, color="#ffffff" }) => {
    const ref = useRef(null);
    const drag = useRef(false);
    const update = (clientX) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      onChange(Math.max(0, Math.min(1, (clientX - r.left) / r.width)));
    };
    return (
      <div style={{ background:"rgba(255,255,255,0.15)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
        border:"0.5px solid rgba(255,255,255,0.22)", borderRadius:16,
        boxShadow:"inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.12)",
        padding:"8px 12px" }}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            {icon}
            <span style={{fontSize:12,fontWeight:600,color:"white"}}>{label}</span>
          </div>
          <span style={{fontSize:11,color:"rgba(255,255,255,0.55)",fontVariantNumeric:"tabular-nums"}}>{Math.round(value*100)}%</span>
        </div>
        <div ref={ref}
          onPointerDown={e=>{e.preventDefault();drag.current=true;ref.current.setPointerCapture(e.pointerId);update(e.clientX);}}
          onPointerMove={e=>{if(!drag.current)return;update(e.clientX);}}
          onPointerUp={()=>{drag.current=false;}}
          style={{position:"relative",height:14,display:"flex",alignItems:"center",cursor:"pointer",userSelect:"none",touchAction:"none"}}>
          <div style={{width:"100%",height:5,background:"rgba(255,255,255,0.18)",borderRadius:3,overflow:"hidden"}}>
            <div style={{width:`${value*100}%`,height:"100%",background:"white",borderRadius:3,transition:"width 0.04s"}}/>
          </div>
          <div style={{position:"absolute",left:`calc(${value*100}% - 8px)`,width:16,height:16,borderRadius:"50%",
            background:"white",boxShadow:"0 1px 6px rgba(0,0,0,0.35)",pointerEvents:"none",
            transition:"left 0.04s"}}/>
        </div>
      </div>
    );
  };

  const CCProgressBar = ({ value, onChange }) => {
    const ref = useRef(null);
    const drag = useRef(false);
    const update = (clientX) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      onChange(Math.max(0, Math.min(1, (clientX - r.left) / r.width)));
    };
    return (
      <div ref={ref}
        onPointerDown={e=>{e.preventDefault();drag.current=true;ref.current.setPointerCapture(e.pointerId);update(e.clientX);}}
        onPointerMove={e=>{if(!drag.current)return;update(e.clientX);}}
        onPointerUp={()=>{drag.current=false;}}
        style={{position:"relative",height:14,display:"flex",alignItems:"center",cursor:"pointer",userSelect:"none",touchAction:"none"}}>
        <div style={{width:"100%",height:3,background:"rgba(255,255,255,0.2)",borderRadius:2,overflow:"hidden"}}>
          <div style={{width:`${value*100}%`,height:"100%",background:"rgba(255,255,255,0.75)",borderRadius:2}}/>
        </div>
        <div style={{position:"absolute",left:`calc(${value*100}% - 5px)`,width:10,height:10,borderRadius:"50%",
          background:"white",boxShadow:"0 1px 4px rgba(0,0,0,0.4)",pointerEvents:"none"}}/>
      </div>
    );
  };

  return (
    <>
      <div style={{position:"fixed",inset:0,zIndex:99994}} onClick={onClose}/>
      <div onClick={e=>e.stopPropagation()} style={{
        position:"fixed", top:30, right:8, width:260, zIndex:99995,
        display:"flex", flexDirection:"column", gap:6,
        fontFamily:"var(--sf)", animation:closingCC?"ccClose 0.18s cubic-bezier(0.4,0,1,1) forwards":"ccOpen 0.24s cubic-bezier(0.34,1.15,0.64,1) forwards",
      }}>

        {/* ── Row 1: Network tiles + Pomodoro ── */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>

          {/* WiFi */}
          <div onClick={()=>setWifi(v=>!v)} style={{...tile(wifi),padding:"7px 10px"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={wifi?"#1c7ef5":"rgba(255,255,255,0.6)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:2}}>
              <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill={wifi?"#1c7ef5":"rgba(255,255,255,0.6)"}/>
            </svg>
            <div style={{fontSize:11.5,fontWeight:600,color:wifi?"#1c1c1e":"white"}}>Wi-Fi</div>
            <div style={{fontSize:10.5,color:wifi?"rgba(0,0,0,0.45)":"rgba(255,255,255,0.45)",marginTop:0}}>{wifi?"Home Network":"Off"}</div>
          </div>

          {/* Bluetooth */}
          <div onClick={()=>setBt(v=>!v)} style={{...tile(bt),padding:"7px 10px"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={bt?"#1c7ef5":"rgba(255,255,255,0.6)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:2}}>
              <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/>
            </svg>
            <div style={{fontSize:11.5,fontWeight:600,color:bt?"#1c1c1e":"white"}}>Bluetooth</div>
            <div style={{fontSize:10.5,color:bt?"rgba(0,0,0,0.45)":"rgba(255,255,255,0.45)",marginTop:0}}>{bt?"On":"Off"}</div>
          </div>

          {/* Pomodoro — spans full width */}
          <div style={{gridColumn:"1/-1",...pomTile,padding:"10px 12px",display:"flex",flexDirection:"column",gap:7}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={pomRunning?"rgba(255,120,100,0.9)":"rgba(255,255,255,0.55)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.6)",textTransform:"uppercase",letterSpacing:"0.06em"}}>
                  {pomMode==="work"?"Focus":"Break"}
                </span>
              </div>
              <div style={{display:"flex",gap:3}}>
                {[0,1,2,3].map(i=>(
                  <div key={i} style={{width:5,height:5,borderRadius:"50%",
                    background:pomRunning&&pomMode==="work"?"rgba(255,100,80,0.8)":"rgba(255,255,255,0.18)",
                    transition:"background 0.3s"}}/>
                ))}
              </div>
              <span style={{fontSize:20,fontWeight:700,fontVariantNumeric:"tabular-nums",letterSpacing:"-0.04em",color:"white",
                textShadow:pomRunning?"0 0 16px rgba(255,80,60,0.7)":"none",transition:"text-shadow 0.3s"}}>
                {String(Math.floor(pomSecs/60)).padStart(2,"0")}:{String(pomSecs%60).padStart(2,"0")}
              </span>
            </div>
            {/* progress bar */}
            <div style={{width:"100%",height:3.5,background:"rgba(255,255,255,0.12)",borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",borderRadius:2,
                background:pomRunning
                  ?"linear-gradient(90deg,rgba(255,80,60,0.9),rgba(255,120,80,0.8))"
                  :"rgba(255,255,255,0.35)",
                width:`${((pomMode==="work"?25*60:5*60)-pomSecs)/(pomMode==="work"?25*60:5*60)*100}%`,
                transition:"width 1s linear",
                boxShadow:pomRunning?"0 0 8px rgba(255,80,60,0.6)":"none"}}/>
            </div>
            <div style={{display:"flex",gap:5}}>
              <button onClick={()=>setPomRunning(r=>!r)}
                style={{flex:1,padding:"5px 0",borderRadius:7,cursor:"default",fontFamily:"inherit",
                  fontSize:11.5,fontWeight:600,
                  background:pomRunning?"rgba(255,59,48,0.75)":"rgba(255,255,255,0.22)",
                  color:"white",transition:"all 0.15s",
                  boxShadow:pomRunning?"0 0 12px rgba(255,59,48,0.4)":"none",
                  border:"0.5px solid "+(pomRunning?"rgba(255,100,80,0.5)":"rgba(255,255,255,0.2)")}}
                onMouseEnter={e=>{e.currentTarget.style.background=pomRunning?"rgba(255,59,48,0.9)":"rgba(255,255,255,0.3)";}}
                onMouseLeave={e=>{e.currentTarget.style.background=pomRunning?"rgba(255,59,48,0.75)":"rgba(255,255,255,0.22)";}}>
                {pomRunning?"Pause":"Start"}
              </button>
              <button onClick={()=>{setPomRunning(false);setPomSecs(pomMode==="work"?25*60:5*60);}}
                style={{padding:"4px 10px",border:"none",borderRadius:7,cursor:"default",fontFamily:"inherit",
                  fontSize:11.5,fontWeight:600,background:"rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.7)",transition:"background 0.12s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.2)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.12)"}>
                Reset
              </button>
              <button onClick={()=>{const m=pomMode==="work"?"break":"work";setPomMode(m);setPomRunning(false);setPomSecs(m==="work"?25*60:5*60);}}
                style={{padding:"4px 10px",border:"none",borderRadius:7,cursor:"default",fontFamily:"inherit",
                  fontSize:11.5,fontWeight:600,background:"rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.7)",transition:"background 0.12s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.2)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.12)"}>
                {pomMode==="work"?"Break":"Focus"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Brightness slider ── */}
        <CCSlider value={brightness} onChange={setBrightness} label="Brightness"
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/></svg>}
        />

        {/* ── Volume slider ── */}
        <CCSlider value={volume} onChange={v=>{setVolume(v);audioControls.setVol(v);}} label="Sound"
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>}
        />

        {/* ── Now Playing ── */}
        <div style={{background:"rgba(255,255,255,0.15)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
          border:"0.5px solid rgba(255,255,255,0.22)",borderRadius:16,padding:"9px 12px",
          boxShadow:"inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.12)"}}>
          <div style={{fontSize:10.5,fontWeight:600,color:"rgba(255,255,255,0.45)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Now Playing</div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{width:38,height:38,borderRadius:7,overflow:"hidden",flexShrink:0,boxShadow:"0 3px 10px rgba(0,0,0,0.4)"}}>
              <img src={track.art} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12.5,fontWeight:600,color:"white",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{track.title}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{track.artist}</div>
            </div>
          </div>
          <CCProgressBar value={musicState.progress} onChange={v=>{audioControls.seek(v);forceUpdate(n=>n+1);}}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:2,marginBottom:6}}>
            <span style={{fontSize:10,color:"rgba(255,255,255,0.4)",fontVariantNumeric:"tabular-nums"}}>{fmt(cur)}</span>
            <span style={{fontSize:10,color:"rgba(255,255,255,0.4)",fontVariantNumeric:"tabular-nums"}}>-{fmt(dur-cur)}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 2px"}}>
            <button onClick={()=>{audioControls.prevTrack();forceUpdate(n=>n+1);}}
              style={{background:"none",border:"none",padding:6,cursor:"pointer",borderRadius:8,transition:"background 0.1s",color:"white"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.12)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="19 20 9 12 19 4 19 20"/><rect x="5" y="4" width="2" height="16" rx="1" fill="white"/></svg>
            </button>
            <button onClick={()=>{audioControls.togglePlay();forceUpdate(n=>n+1);}}
              style={{width:34,height:34,borderRadius:"50%",background:"rgba(255,255,255,0.22)",border:"0.5px solid rgba(255,255,255,0.3)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.1s, transform 0.1s",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.3)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.22)"}
              onMouseDown={e=>e.currentTarget.style.transform="scale(0.93)"}
              onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
              {musicState.playing
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1.5"/><rect x="14" y="4" width="4" height="16" rx="1.5"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{marginLeft:2}}><polygon points="5 3 19 12 5 21 5 3"/></svg>}
            </button>
            <button onClick={()=>{audioControls.nextTrack();forceUpdate(n=>n+1);}}
              style={{background:"none",border:"none",padding:6,cursor:"pointer",borderRadius:8,transition:"background 0.1s",color:"white"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.12)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5 4 15 12 5 20 5 4"/><rect x="17" y="4" width="2" height="16" rx="1" fill="white"/></svg>
            </button>
          </div>
        </div>

      </div>
    </>
  );
}

/* ─── APP DATA ────────────────────────────────────────────────────────── */
const DOCK_APPS = [
  {id:"finder",name:"Finder"},{id:"safari",name:"Safari"},{id:"messages",name:"Messages"},
  {id:"calculator",name:"Calculator"},{id:"notes",name:"Notes"},{id:"music",name:"Music"},
  {id:"facetime",name:"FaceTime"},{id:"photos",name:"Photos"},{id:"maps",name:"Maps"},
  {id:"calendar",name:"Calendar"},{id:"settings",name:"System Settings"},{id:"games",name:"Sudoku"},{id:"github",name:"GitHub"},
];

const APP_ICON_URLS = {
  finder:   "/Finder Beta 10.png",
  safari:   "/Safari.png",
  messages: "/Messages.png",
  mail:     "/Mail.png",
  notes:    "/Notes.png",
  music:    "/Music Beta 3.png",
  facetime: "/FaceTime Beta 7.png",
  photos:   "/Photos.png",
  maps:     "/Maps.png",
  calendar: "/Calendar.png",
  settings: "/System Preferences.png",
  launchpad: null,
  trash:    null,
  games:    null,
};

const WIN_SIZES = {
  finder:{w:840,h:500},safari:{w:900,h:580},terminal:{w:700,h:440},
  notes:{w:720,h:480},music:{w:780,h:520},calendar:{w:760,h:510},
  messages:{w:380,h:480},mail:{w:780,h:520},photos:{w:760,h:520},
  settings:{w:700,h:500},maps:{w:760,h:500},facetime:{w:520,h:520},
  games:{w:420,h:510},calculator:{w:320,h:500},
};

function getAppIcon(id,size=60){
  const S=size;
  const GamesIcon=()=>(
    <svg width={S} height={S} viewBox="0 0 60 60">
      <rect width="60" height="60" rx="13" fill="#1c1c2e"/>
      <rect x="8" y="8" width="44" height="44" rx="4" fill="none" stroke="rgba(100,180,255,0.3)" strokeWidth="1"/>
      {[0,1,2].map(row=>[0,1,2].map(col=>(
        <rect key={`${row}-${col}`} x={10+col*14} y={10+row*14} width="12" height="12" rx="2"
          fill={((row*3+col)%4===0)?"rgba(100,180,255,0.7)":((row*3+col)%3===0)?"rgba(100,180,255,0.4)":"rgba(100,180,255,0.15)"}/>
      )))}
    </svg>
  );
  const map={
    finder:<IconFinder size={size}/>,safari:<IconSafari size={size}/>,messages:<IconMessages size={size}/>,
    calculator:<IconCalculator size={size}/>,notes:<IconNotes size={size}/>,music:<IconMusic size={size}/>,
    photos:<IconPhotos size={size}/>,calendar:<IconCalendar size={size}/>,terminal:<IconTerminal size={size}/>,
    settings:<IconSettings size={size}/>,facetime:<IconFaceTime size={size}/>,maps:<IconMaps size={size}/>,
    launchpad:<IconLaunchpad size={size}/>,trash:<IconTrash size={size}/>,
    games:<GamesIcon/>,
  };
  return map[id]||<svg width={size} height={size} viewBox="0 0 60 60"><rect width="60" height="60" rx="13" fill="#2c2c2e"/></svg>;
}

/* ─── APP CONTENT ────────────────────────────────────────────────────── */
function FinderApp() {
  const [sel,setSel]=useState("Applications");
  const sidebar=[
    {h:"Favorites",items:[{n:"Recents",i:"🕐"},{n:"AirDrop",i:"📡"},{n:"Applications",i:"📁"},{n:"Desktop",i:"🖥"},{n:"Documents",i:"📄"},{n:"Downloads",i:"⬇️"}]},
    {h:"iCloud",items:[{n:"iCloud Drive",i:"☁️"},{n:"Shared",i:"👥"}]},
    {h:"Locations",items:[{n:"MacBook Pro",i:"💻"},{n:"Network",i:"🌐"}]},
    {h:"Tags",items:[{n:"Red",i:"🔴"},{n:"Blue",i:"🔵"},{n:"Green",i:"🟢"}]},
  ];
  const files=[{n:"Xcode",e:"🔨"},{n:"Safari",e:"🧭"},{n:"Final Cut Pro",e:"🎬"},{n:"Logic Pro",e:"🎹"},{n:"Sketch",e:"💎"},{n:"VS Code",e:"🔵"},{n:"Figma",e:"🎨"},{n:"Notion",e:"⬛"},{n:"Arc",e:"🌈"},{n:"Warp",e:"⚡"},{n:"Raycast",e:"🔎"},{n:"Obsidian",e:"🔮"},{n:"Slack",e:"💜"},{n:"Zoom",e:"📹"},{n:"1Password",e:"🔑"},{n:"Cursor",e:"🤖"},{n:"Spotify",e:"💚"},{n:"Framer",e:"⬜"}].map(f=>({...f,n:f.n+".app"}));
  return (
    <div style={{display:"flex",height:"100%",fontFamily:"var(--sf)",fontSize:13}}>
      <div style={{width:196,background:"rgba(246,246,248,0.85)",backdropFilter:"blur(40px)",borderRight:"0.5px solid rgba(0,0,0,0.1)",overflowY:"auto",padding:"6px 0",flexShrink:0}} className="sb">
        {sidebar.map(s=>(
          <div key={s.h}>
            <div style={{padding:"10px 14px 3px",fontSize:10.5,fontWeight:700,color:"#8e8e93",letterSpacing:"0.055em",textTransform:"uppercase"}}>{s.h}</div>
            {s.items.map(item=>(
              <div key={item.n} onClick={()=>setSel(item.n)} className="sb-item"
                style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px 5px 16px",borderRadius:7,margin:"0.5px 5px",cursor:"default",
                  background:sel===item.n?"rgba(0,122,255,0.14)":"transparent",
                  color:sel===item.n?"#007aff":"#1c1c1e",fontWeight:sel===item.n?500:400}}>
                <span style={{fontSize:14}}>{item.i}</span>
                <span style={{fontSize:12.5}}>{item.n}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{flex:1,background:"rgba(255,255,255,0.92)",display:"flex",flexDirection:"column"}}>
        <div style={{height:38,borderBottom:"0.5px solid rgba(0,0,0,0.08)",display:"flex",alignItems:"center",padding:"0 8px",gap:4,background:"rgba(248,248,250,0.95)",flexShrink:0}}>
          {["‹","›"].map((a,i)=>(
            <button key={i} style={{all:"unset",width:28,height:24,borderRadius:6,background:"rgba(0,0,0,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,color:i?"#c0c0c5":"#444",cursor:"default",opacity:i?0.4:1}}>{a}</button>
          ))}
          <div style={{flex:1,textAlign:"center",fontWeight:600,fontSize:13,color:"#1c1c1e"}}>{sel}</div>
          <div style={{width:168,height:24,background:"rgba(0,0,0,0.06)",borderRadius:7,display:"flex",alignItems:"center",padding:"0 9px",gap:5,color:"#8e8e93",fontSize:12}}>🔍<span>Search</span></div>
        </div>
        <div style={{flex:1,padding:"10px 12px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(88px,1fr))",gap:2,overflowY:"auto",alignContent:"start"}} className="sb">
          {files.map(f=>(
            <div key={f.n} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"8px 4px",borderRadius:8,cursor:"default"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(0,0,0,0.05)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <span style={{fontSize:36}}>{f.e}</span>
              <span style={{fontSize:11,textAlign:"center",color:"#1c1c1e",maxWidth:82,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.n}</span>
            </div>
          ))}
        </div>
        <div style={{height:22,borderTop:"0.5px solid rgba(0,0,0,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#8e8e93",background:"rgba(248,248,250,0.95)"}}>
          {files.length} items — 186.4 GB available
        </div>
      </div>
    </div>
  );
}

function SafariApp() {
  const [url,setUrl]=useState("apple.com");
  const [editing,setEditing]=useState(false);
  const tabs=["apple.com","New Tab","iCloud"];
  const [activeTab,setActiveTab]=useState(0);
  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",fontFamily:"var(--sf)"}}>
      <div style={{height:36,background:"rgba(236,236,240,0.96)",display:"flex",alignItems:"center",padding:"0 8px",gap:1,borderBottom:"0.5px solid rgba(0,0,0,0.1)",flexShrink:0}}>
        {tabs.map((t,i)=>(
          <div key={i} onClick={()=>setActiveTab(i)}
            style={{height:28,padding:"0 12px",borderRadius:7,display:"flex",alignItems:"center",gap:5,fontSize:12.5,cursor:"default",maxWidth:160,
              background:i===activeTab?"white":"transparent",boxShadow:i===activeTab?"0 1px 3px rgba(0,0,0,0.1)":"none",
              color:i===activeTab?"#1c1c1e":"#666"}}>
            {i===0&&<span style={{fontSize:10}}>🔒</span>}
            <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t}</span>
          </div>
        ))}
        <button style={{all:"unset",width:24,height:24,borderRadius:5,background:"rgba(0,0,0,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#666",cursor:"default",marginLeft:4}}>+</button>
      </div>
      <div style={{height:38,background:"rgba(236,236,240,0.94)",borderBottom:"0.5px solid rgba(0,0,0,0.1)",display:"flex",alignItems:"center",padding:"0 10px",gap:5,flexShrink:0}}>
        {["‹","›"].map((a,i)=>(
          <button key={i} style={{all:"unset",width:28,height:26,borderRadius:6,background:"rgba(0,0,0,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,cursor:"default",color:i?"#c0c0c5":"#444",opacity:i?0.45:1}}>{a}</button>
        ))}
        <div style={{flex:1,height:28,background:editing?"white":"rgba(0,0,0,0.06)",borderRadius:9,display:"flex",alignItems:"center",padding:"0 10px",gap:6,border:editing?"2px solid #007aff":"none",cursor:"text"}}
          onClick={()=>setEditing(true)}>
          <span style={{fontSize:11,color:"#32d74b"}}>🔒</span>
          <input value={url} onChange={e=>setUrl(e.target.value)} onFocus={()=>setEditing(true)} onBlur={()=>setEditing(false)}
            style={{flex:1,border:"none",background:"transparent",fontSize:13,textAlign:"center",outline:"none",fontFamily:"var(--sf)",color:"#1c1c1e"}}/>
        </div>
      </div>
      <div style={{flex:1,background:"white",overflowY:"auto"}} className="sb">
        <div style={{maxWidth:760,margin:"0 auto",padding:"36px 24px"}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{fontSize:52,fontWeight:600,color:"#1d1d1f",letterSpacing:"-0.04em",fontFamily:"var(--sfd)",marginBottom:4}}>apple</div>
            <div style={{fontSize:17,color:"#6e6e73"}}>Think Different.</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:24}}>
            {[["📱","iPhone","15 Pro"],["💻","Mac","MacBook Pro"],["⌚","Watch","Series 9"],["🎧","AirPods","Pro 2nd gen"],["📲","iPad","Pro M4"],["📺","Apple TV","4K"],["🎵","Music","Try free"],["🕹","Arcade","From $6.99"]].map(([e,l,s])=>(
              <div key={l} style={{background:"#f5f5f7",borderRadius:14,padding:"16px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:5,cursor:"default"}}
                onMouseEnter={e=>e.currentTarget.style.background="#ebebee"} onMouseLeave={e=>e.currentTarget.style.background="#f5f5f7"}>
                <span style={{fontSize:28}}>{e}</span>
                <span style={{fontSize:12.5,color:"#1d1d1f",fontWeight:600}}>{l}</span>
                <span style={{fontSize:11,color:"#6e6e73",textAlign:"center"}}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{background:"linear-gradient(135deg,#1d1d1f 0%,#2a2a3e 100%)",borderRadius:18,padding:"28px 32px",color:"white",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.6)",letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:6}}>New</div>
              <div style={{fontSize:26,fontWeight:700,letterSpacing:"-0.02em",fontFamily:"var(--sfd)"}}>MacBook Pro</div>
              <div style={{fontSize:14,color:"rgba(255,255,255,0.65)",marginTop:4}}>Mind-blowing. Head-turning.</div>
              <div style={{marginTop:16,display:"flex",gap:10}}>
                <button style={{all:"unset",background:"#f5f5f7",color:"#1d1d1f",borderRadius:980,padding:"8px 20px",fontSize:13,fontWeight:500,cursor:"default"}}>Learn more</button>
                <button style={{all:"unset",color:"#6ec6ff",fontSize:13,fontWeight:500,cursor:"default",padding:"8px 0"}}>Buy →</button>
              </div>
            </div>
            <div style={{fontSize:64}}>💻</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TerminalApp() {
  const [input,setInput]=useState("");
  const [lines,setLines]=useState([{t:"sys",v:`Last login: ${new Date().toDateString()} on ttys003`},{t:"ps"}]);
  const endRef=useRef(),inputRef=useRef();
  useEffect(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),[lines]);
  const CMD={ls:"Applications  Desktop  Documents  Downloads  Library  Movies  Music  Pictures  Public","ls -la":"total 0\ndrwxr-xr-x  10 visitor  staff   320",whoami:"visitor",pwd:"/Users/visitor",date:new Date().toString(),"uname -a":"Darwin MacBook-Pro.local 23.2.0 Darwin Kernel arm64","sw_vers":"ProductName:\t\tmacOS\nProductVersion:\t\t14.2.1\nBuildVersion:\t\t23C71","echo hello":"hello",neofetch:`                    'c.          visitor@MacBook-Pro\n                 ,xNMM.          ------------------\n               .OMMMMo           OS: macOS Sonoma 14.2.1\n               OMMM0,            Host: MacBook Pro (M3 Pro)\n     .;loddo:' loolloodooo      Kernel: 23.2.0\n   cKMMMMMMMMMMNWMMMMMMMMMM0:   Shell: zsh 5.9\n .KMMMMMMMMMMMMMMMMMMMMMMMWd.   Terminal: Apple Terminal\n XMMMMMMMMMMMMMMMMMMMMMMMX.     CPU: Apple M3 Pro (11)\n;MMMMMMMMMMMMMMMMMMMMMMMM:      GPU: Apple M3 Pro\n:MMMMMMMMMMMMMMMMMMMMMMMM:      Memory: 18432MiB / 36864MiB`};
  const submit=cmd=>{
    if(!cmd){setLines(p=>[...p,{t:"ps"}]);return;}
    if(cmd==="clear"){setLines([{t:"ps"}]);return;}
    const nl=[...lines,{t:"in",v:cmd}];
    const out=CMD[cmd];
    if(out!==undefined)nl.push({t:"out",v:out});
    else nl.push({t:"err",v:`zsh: command not found: ${cmd.split(" ")[0]}`});
    nl.push({t:"ps"});
    setLines(nl);
  };
  const PS=()=>(<span><span style={{color:"#cba6f7"}}>visitor</span><span style={{color:"rgba(255,255,255,0.3)"}}>@</span><span style={{color:"#89b4fa"}}>MacBook-Pro</span><span style={{color:"rgba(255,255,255,0.3)"}}> ~ </span><span style={{color:"#f38ba8"}}>% </span></span>);
  return (
    <div style={{background:"#1e1e2e",height:"100%",display:"flex",flexDirection:"column",fontFamily:"var(--mono)",fontSize:13,lineHeight:1.7,padding:"12px 16px",overflowY:"auto",cursor:"text"}} className="sb"
      onClick={()=>inputRef.current?.focus()}>
      {lines.map((l,i)=>(
        <div key={i}>
          {l.t==="ps"?(
            <div style={{display:"flex",alignItems:"center",flexWrap:"wrap"}}>
              <PS/>
              {i===lines.length-1&&<><span style={{color:"#cdd6f4"}}>{input}</span><span className="blink" style={{display:"inline-block",width:7,height:14,background:"#cdd6f4",marginLeft:1,verticalAlign:"text-bottom"}}/></>}
            </div>
          ):(
            <div style={{whiteSpace:"pre-wrap",wordBreak:"break-all",color:l.t==="sys"?"#585b70":l.t==="err"?"#f38ba8":"#cdd6f4"}}>
              {l.t==="in"?<><PS/><span style={{color:"#cdd6f4"}}>{l.v}</span></>:l.v}
            </div>
          )}
        </div>
      ))}
      <div ref={endRef}/>
      <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
        onKeyDown={e=>{
          if(e.key==="Enter"){submit(input.trim());setInput("");}
          if(e.key==="l"&&e.ctrlKey){setLines([{t:"ps"}]);setInput("");}
        }}
        style={{position:"absolute",opacity:0,width:1,height:1,pointerEvents:"none"}} autoFocus/>
    </div>
  );
}

/* ─── NOTES APP — imported from NotesApp.jsx ─────────────────────────── */

/* ─── MUSIC APP ──────────────────────────────────────────────────────── */
function MusicApp() {
  return <MusicAppComponent TRACKS={TRACKS} musicState={musicState} audioEl={audioEl} audioControls={audioControls}/>;
}

/* ─── CALENDAR APP — imported from CalendarApp.jsx ──────────────────────── */

// Preload all wallpapers on app load
if (typeof window !== "undefined") {
  const toPreload = [
    "/macos-tahoe-26-5120x2880-22675.jpg",
    "/macos-catalina-mountains-island-night-stock-5k-6016x6016-189.jpg",
    "/macos-mojave-sand-dunes-mojave-desert-california-night-dark-5120x2880-4051.jpg",
    "/apple-macbook-pro-stock-2021-apple-event-2021-dark-mode-6016x5468-6759.jpg",
    "/macos-big-sur-apple-layers-fluidic-colorful-wwdc-stock-4096x2304-1455.jpg",
    "/macbook-pro-colorful-apple-stock-2560x1600-1391.png",
    "/Mac-OS-Wallpaper-4K-HD-Free-download.png",
  ];
  toPreload.forEach(src => { const i = new Image(); i.src = src; });
}

const WALLPAPERS = [
  { name:"Tahoe",   src:"/macos-tahoe-26-5120x2880-22675.jpg" },
  { name:"Catalina",src:"/macos-catalina-mountains-island-night-stock-5k-6016x6016-189.jpg" },
  { name:"Mojave",  src:"/macos-mojave-sand-dunes-mojave-desert-california-night-dark-5120x2880-4051.jpg" },
  { name:"Pro",   src:"/apple-macbook-pro-stock-2021-apple-event-2021-dark-mode-6016x5468-6759.jpg" },
  { name:"Big Sur",       src:"/macos-big-sur-apple-layers-fluidic-colorful-wwdc-stock-4096x2304-1455.jpg" },
  { name:"Initial",      src:"/macbook-pro-colorful-apple-stock-2560x1600-1391.png" },
  { name:"OS-4K",      src:"/Mac-OS-Wallpaper-4K-HD-Free-download.png" },
];

function SettingsApp({ setWallpaper, wallpaper }) {
  const [sel,setSel]=useState("Wallpaper");
  const [wifiOn,setWifiOn]=useState(true);
  const items=[
    {n:"Wallpaper",e:"🖼️"},
  ];
  return (
    <div style={{display:"flex",height:"100%",fontFamily:"var(--sf)",fontSize:13}}>
      <div style={{width:248,background:"rgba(246,246,248,0.97)",borderRight:"0.5px solid rgba(0,0,0,0.09)",overflowY:"auto",padding:"8px 0"}} className="sb">
        {items.map((item,i)=>item===null
          ?<div key={i} style={{height:1,background:"rgba(0,0,0,0.07)",margin:"4px 10px"}}/>
          :(
          <div key={i} onClick={()=>setSel(item.n)}
            style={{display:"flex",alignItems:"center",gap:9,padding:"6px 10px 6px 16px",margin:"1px 7px",borderRadius:8,cursor:"default",
              background:sel===item.n?"rgba(0,122,255,0.14)":"transparent"}}>
            <span style={{fontSize:18,width:22,textAlign:"center"}}>{item.e}</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:sel===item.n?500:400,color:sel===item.n?"#007aff":"#1c1c1e"}}>{item.n}</div>
              {item.sub&&<div style={{fontSize:11.5,color:"#8e8e93",marginTop:0.5}}>{item.sub}</div>}
            </div>
            <span style={{color:"#c7c7cc",fontSize:12}}>›</span>
          </div>
        ))}
      </div>
      <div style={{flex:1,background:"rgba(252,252,254,0.98)",padding:28,overflowY:"auto"}} className="sb">
        <div style={{fontSize:24,fontWeight:700,marginBottom:22,letterSpacing:"-0.02em",fontFamily:"var(--sfd)",color:"#1c1c1e"}}>{sel}</div>
        {sel==="Wi-Fi"&&(
          <div style={{background:"white",borderRadius:14,border:"0.5px solid rgba(0,0,0,0.1)",overflow:"hidden",maxWidth:460,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
            <div style={{padding:"14px 18px",borderBottom:"0.5px solid rgba(0,0,0,0.07)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:14,fontWeight:500}}>Wi-Fi</span>
              <div onClick={()=>setWifiOn(w=>!w)} style={{width:44,height:26,borderRadius:13,background:wifiOn?"#34c759":"#ddd",display:"flex",alignItems:"center",padding:"2px 3px",cursor:"default",transition:"background 0.2s"}}>
                <div style={{width:20,height:20,borderRadius:"50%",background:"white",marginLeft:wifiOn?"auto":"0",transition:"margin 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.25)"}}/>
              </div>
            </div>
            {wifiOn&&["Home Network ✓","Office 5GHz","iPhone Hotspot"].map((n,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 18px",borderBottom:i<2?"0.5px solid rgba(0,0,0,0.06)":"none",fontSize:13.5}}>
                <span>{n}</span><span style={{color:"#8e8e93",fontSize:12}}>📶</span>
              </div>
            ))}
          </div>
        )}
        {sel==="Battery"&&(
          <div style={{background:"white",borderRadius:14,border:"0.5px solid rgba(0,0,0,0.1)",overflow:"hidden",maxWidth:460,padding:"18px"}}>
            <div style={{fontSize:14,fontWeight:600,marginBottom:12}}>Battery — 94%</div>
            <div style={{height:10,background:"rgba(0,0,0,0.07)",borderRadius:5,overflow:"hidden",marginBottom:10}}>
              <div style={{width:"94%",height:"100%",background:"#34c759",borderRadius:5}}/>
            </div>
            <div style={{fontSize:13,color:"#34c759",fontWeight:600,marginBottom:6}}>Charging ⚡</div>
          </div>
        )}
        {sel==="Wallpaper"&&(
          <div style={{maxWidth:520}}>
            <div style={{background:"white",borderRadius:14,border:"0.5px solid rgba(0,0,0,0.1)",padding:"20px",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
              <div style={{fontSize:14,fontWeight:600,color:"#1c1c1e",marginBottom:4}}>Wallpaper</div>
              <div style={{fontSize:12,color:"#8e8e93",marginBottom:16}}>Click a wallpaper to apply it to your desktop.</div>
              {/* Current preview */}
              <div style={{width:"100%",height:120,borderRadius:10,overflow:"hidden",marginBottom:16,border:"0.5px solid rgba(0,0,0,0.1)",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
                <img src={wallpaper} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="current"/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {WALLPAPERS.map((w,i)=>{
                  const isActive = wallpaper===w.src;
                  return (
                    <div key={i} onClick={()=>setWallpaper(w.src)}
                      style={{cursor:"default",borderRadius:10,overflow:"hidden",
                        border: isActive?"2px solid #007aff":"2px solid transparent",
                        boxShadow: isActive?"0 0 0 2px rgba(0,122,255,0.3)":"0 1px 4px rgba(0,0,0,0.12)",
                        transition:"all 0.15s ease",position:"relative"}}
                      onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.border="2px solid rgba(0,122,255,0.4)"; }}
                      onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.border="2px solid transparent"; }}>
                      <img src={w.src} style={{width:"100%",height:70,objectFit:"cover",display:"block"}} alt={w.name}/>
                      {isActive&&(
                        <div style={{position:"absolute",top:4,right:4,width:16,height:16,borderRadius:"50%",
                          background:"#007aff",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      )}
                      <div style={{padding:"5px 6px",fontSize:10.5,color:"#1c1c1e",fontWeight:isActive?600:400,
                        background:"white",textOverflow:"ellipsis",overflow:"hidden",whiteSpace:"nowrap"}}>{w.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {!["Wi-Fi","Battery","Wallpaper"].includes(sel)&&(
          <div style={{background:"white",borderRadius:14,border:"0.5px solid rgba(0,0,0,0.1)",padding:"22px 20px",maxWidth:460,textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:12}}>{items.find(i=>i&&i.n===sel)?.e||"⚙️"}</div>
            <div style={{fontSize:15,fontWeight:500,color:"#1c1c1e",marginBottom:6}}>{sel}</div>
            <div style={{fontSize:13,color:"#8e8e93"}}>Configure {sel} preferences here.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function FaceTimeApp() {
  return (
    <div style={{height:"100%",background:"#1a1a1e",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"var(--sf)",gap:24}}>
      <div style={{width:120,height:120,borderRadius:"50%",background:"linear-gradient(135deg,#5ac8fa,#007aff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:52,boxShadow:"0 8px 32px rgba(0,122,255,0.4)"}}>👤</div>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:22,fontWeight:600,color:"white",letterSpacing:"-0.02em"}}>Sarah Johnson</div>
        <div style={{fontSize:13.5,color:"rgba(255,255,255,0.5)",marginTop:4}}>FaceTime</div>
      </div>
      <div style={{display:"flex",gap:20}}>
        {[["📹","Video","#34c759"],["📞","Audio","#34c759"],["💬","Message","#007aff"]].map(([e,l,c])=>(
          <div key={l} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,cursor:"default"}}>
            <div style={{width:62,height:62,borderRadius:"50%",background:c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,boxShadow:`0 4px 16px ${c}66`}}>{e}</div>
            <span style={{fontSize:12,color:"rgba(255,255,255,0.6)",fontWeight:500}}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapsApp() {
  return (
    <div style={{height:"100%",background:"#e8f4e8",position:"relative",overflow:"hidden",fontFamily:"var(--sf)"}}>
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}} viewBox="0 0 760 500" preserveAspectRatio="xMidYMid slice">
        <rect width="760" height="500" fill="#e8ead4"/>
        <rect x="0" y="180" width="760" height="18" fill="white" opacity="0.9"/>
        <rect x="0" y="330" width="760" height="12" fill="white" opacity="0.85"/>
        <rect x="240" y="0" width="18" height="500" fill="white" opacity="0.9"/>
        <rect x="520" y="0" width="12" height="500" fill="white" opacity="0.85"/>
        {[[30,50,50,50],[100,60,40,40],[290,30,60,60],[400,30,50,40],[430,100,60,50],[600,200,80,60],[50,370,70,50],[620,380,60,40]].map(([x,y,w,h],i)=>(
          <rect key={i} x={x} y={y} width={w} height={h} rx="3" fill={i%2===0?"#d4c8b0":"#c8bca0"} opacity="0.8"/>
        ))}
      </svg>
      <div style={{position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",width:320,height:38,background:"white",borderRadius:12,display:"flex",alignItems:"center",padding:"0 12px",gap:8,boxShadow:"0 4px 16px rgba(0,0,0,0.18)",zIndex:10}}>
        <span style={{fontSize:14}}>🔍</span><span style={{fontSize:13,color:"#8e8e93"}}>Search Maps</span>
      </div>
      <div style={{position:"absolute",top:"38%",left:"42%",zIndex:10}}>
        <div style={{width:28,height:28,background:"#ff3b30",borderRadius:"50% 50% 50% 0",transform:"rotate(-45deg)",boxShadow:"0 3px 8px rgba(255,59,48,0.5)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:10,height:10,background:"white",borderRadius:"50%",transform:"rotate(45deg)"}}/>
        </div>
      </div>
    </div>
  );
}

/* ─── SUDOKU ─────────────────────────────────────────────────────────── */
function computeConflicts(grid) {
  const bad = new Set();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = grid[r][c];
      if (v === 0) continue;
      for (let cc = 0; cc < 9; cc++) {
        if (cc !== c && grid[r][cc] === v) { bad.add(`${r}-${c}`); bad.add(`${r}-${cc}`); }
      }
      for (let rr = 0; rr < 9; rr++) {
        if (rr !== r && grid[rr][c] === v) { bad.add(`${r}-${c}`); bad.add(`${rr}-${c}`); }
      }
      const br = Math.floor(r/3)*3, bc = Math.floor(c/3)*3;
      for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) {
        const rr = br+dr, cc = bc+dc;
        if ((rr !== r || cc !== c) && grid[rr][cc] === v) { bad.add(`${r}-${c}`); bad.add(`${rr}-${cc}`); }
      }
    }
  }
  return bad;
}

function SudokuBoard({ grid, fixed, selected, onSelect }) {
  const conflicts = computeConflicts(grid);
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(9,1fr)",border:"2.5px solid #1d1d1f",borderRadius:6,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.15)",width:"100%",aspectRatio:"1/1"}}>
      {grid.map((row, r) => row.map((val, c) => {
        const isSel = selected && selected[0]===r && selected[1]===c;
        const isSameRow = selected && selected[0]===r && !isSel;
        const isSameCol = selected && selected[1]===c && !isSel;
        const isSameBox = selected && Math.floor(selected[0]/3)===Math.floor(r/3) && Math.floor(selected[1]/3)===Math.floor(c/3) && !isSel;
        const isConflict = conflicts.has(`${r}-${c}`);
        const isFixed = fixed[r][c];
        let bg = "#fff";
        if (isSel) bg = "#bbdefb";
        else if (isConflict) bg = "#ffe0e0";
        else if (isSameRow||isSameCol||isSameBox) bg = "#e8f4fd";
        const borderR = (c+1)%3===0 && c!==8 ? "2px solid #555" : "1px solid #ccc";
        const borderB = (r+1)%3===0 && r!==8 ? "2px solid #555" : "1px solid #ccc";
        return (
          <div key={`${r}-${c}`} onMouseDown={e=>{e.preventDefault();onSelect(r,c);}}
            style={{background:bg,borderRight:borderR,borderBottom:borderB,display:"flex",alignItems:"center",justifyContent:"center",cursor:isFixed?"default":"pointer",fontSize:"clamp(11px,1.8vw,17px)",fontWeight:isFixed?800:500,color:isConflict?"#d00":isFixed?"#1d1d1f":"#0a84ff",userSelect:"none",transition:"background 0.07s"}}>
            {val !== 0 ? val : ""}
          </div>
        );
      }))}
    </div>
  );
}

function sudokuIsValid(grid, row, col, num) {
  for (let i=0; i<9; i++) {
    if (grid[row][i]===num) return false;
    if (grid[i][col]===num) return false;
    const br=3*Math.floor(row/3)+Math.floor(i/3);
    const bc=3*Math.floor(col/3)+(i%3);
    if (grid[br][bc]===num) return false;
  }
  return true;
}
function sudokuSolve(grid) {
  for (let r=0;r<9;r++) for (let c=0;c<9;c++) {
    if (grid[r][c]===0) {
      for (const n of [1,2,3,4,5,6,7,8,9].sort(()=>Math.random()-0.5)) {
        if (sudokuIsValid(grid,r,c,n)) {
          grid[r][c]=n;
          if (sudokuSolve(grid)) return true;
          grid[r][c]=0;
        }
      }
      return false;
    }
  }
  return true;
}
function generateSudoku() {
  const full = Array(9).fill(null).map(()=>Array(9).fill(0));
  sudokuSolve(full);
  const puzzle = full.map(r=>[...r]);
  let rem = 45;
  while (rem>0) {
    const r=Math.floor(Math.random()*9), c=Math.floor(Math.random()*9);
    if (puzzle[r][c]!==0) { puzzle[r][c]=0; rem--; }
  }
  const fixed = puzzle.map(row => row.map(v => v!==0));
  return { puzzle, solution: full, fixed };
}

function GamesApp() {
  const [gs, setGs] = useState(() => {
    const { puzzle, solution, fixed } = generateSudoku();
    return { grid: puzzle.map(r=>[...r]), solution, fixed, selected:[4,4], won:false };
  });

  const newGame = useCallback(() => {
    const { puzzle, solution, fixed } = generateSudoku();
    setGs({ grid: puzzle.map(r=>[...r]), solution, fixed, selected:[4,4], won:false });
  }, []);

  const inputNum = useCallback((n) => {
    setGs(prev => {
      if (prev.won || !prev.selected) return prev;
      const [r, c] = prev.selected;
      if (prev.fixed[r][c]) return prev;
      const newGrid = prev.grid.map(row=>[...row]);
      newGrid[r][c] = n;
      const allFilled = newGrid.every(row => row.every(v => v !== 0));
      const noConflicts = allFilled && computeConflicts(newGrid).size === 0;
      return { ...prev, grid: newGrid, won: noConflicts };
    });
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag==="INPUT" || tag==="TEXTAREA") return;
      const num = parseInt(e.key);
      if (num>=1 && num<=9) { e.preventDefault(); inputNum(num); return; }
      if (e.key==="Backspace"||e.key==="Delete"||e.key==="0") { e.preventDefault(); inputNum(0); return; }
      const DIRS = {ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]};
      if (DIRS[e.key]) {
        e.preventDefault();
        const [dr,dc] = DIRS[e.key];
        setGs(prev => {
          if (!prev.selected) return prev;
          const [r,c] = prev.selected;
          return {...prev, selected:[Math.max(0,Math.min(8,r+dr)), Math.max(0,Math.min(8,c+dc))]};
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inputNum]);

  const { grid, fixed, selected, won } = gs;
  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",background:"#f5f5f7",fontFamily:"var(--sf)"}}>
      <div style={{padding:"10px 16px 8px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(0,0,0,0.08)",background:"rgba(255,255,255,0.95)",flexShrink:0}}>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:"#1d1d1f"}}>Sudoku</div>
          <div style={{fontSize:11,color:"#888",marginTop:1}}>{won?"🎉 Puzzle complete!":"Select a cell · type a number · or tap the pad"}</div>
        </div>
        <button onClick={newGame} style={{background:"#0a84ff",color:"white",border:"none",borderRadius:7,padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer"}}>New Game</button>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"10px 14px",minHeight:0}}>
        {won ? (
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:56,marginBottom:12}}>🎉</div>
            <div style={{fontSize:22,fontWeight:700,color:"#1d1d1f",marginBottom:8}}>Puzzle Solved!</div>
            <button onClick={newGame} style={{background:"#0a84ff",color:"white",border:"none",borderRadius:9,padding:"10px 24px",fontSize:14,fontWeight:600,cursor:"pointer"}}>Play Again</button>
          </div>
        ) : (
          <div style={{width:"100%",maxWidth:360,aspectRatio:"1/1"}}>
            <SudokuBoard grid={grid} fixed={fixed} selected={selected} onSelect={(r,c)=>setGs(p=>({...p,selected:[r,c]}))}/>
          </div>
        )}
      </div>
      {!won && (
        <div style={{padding:"8px 12px 12px",borderTop:"1px solid rgba(0,0,0,0.08)",background:"rgba(255,255,255,0.95)",display:"flex",gap:4,flexShrink:0}}>
          {[1,2,3,4,5,6,7,8,9].map(n=>(
            <button key={n} onMouseDown={e=>{e.preventDefault();inputNum(n);}}
              style={{flex:1,height:38,background:"#fff",border:"1px solid #ddd",borderRadius:7,fontSize:16,fontWeight:700,cursor:"pointer",color:"#1d1d1f",boxShadow:"0 1px 2px rgba(0,0,0,0.07)"}}
              onMouseEnter={e=>e.currentTarget.style.background="#e5e5ea"}
              onMouseLeave={e=>e.currentTarget.style.background="#fff"}>{n}</button>
          ))}
          <button onMouseDown={e=>{e.preventDefault();inputNum(0);}}
            style={{width:36,height:38,flexShrink:0,background:"#fff",border:"1px solid #ddd",borderRadius:7,fontSize:15,cursor:"pointer",color:"#666",boxShadow:"0 1px 2px rgba(0,0,0,0.07)"}}
            onMouseEnter={e=>e.currentTarget.style.background="#e5e5ea"}
            onMouseLeave={e=>e.currentTarget.style.background="#fff"}>⌫</button>
        </div>
      )}
    </div>
  );
}

/* ─── WINDOW ─────────────────────────────────────────────────────────── */
function MacWindow({win, onClose, onMin, onFocus, zIndex, musicRef, dockIconRefsMap, dockRef, setWallpaper, wallpaper}) {
  const [pos, setPos] = useState(win.pos);
  const [closing, setClosing] = useState(false);
  const windowRef = useRef(null);
  const sz = WIN_SIZES[win.id] || {w:640,h:440};
  const dragging=useRef(false), off=useRef({x:0,y:0});
  const dark = ["terminal","music","facetime","calculator"].includes(win.id);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => onClose(), 200);
  }, [onClose]);

  const onTitleDown = useCallback(e=>{
    if(e.button!==0) return; e.preventDefault();
    dragging.current=true;
    off.current={x:e.clientX-pos.x, y:e.clientY-pos.y};
    onFocus();
    const mv=e=>{if(dragging.current)setPos({x:e.clientX-off.current.x, y:e.clientY-off.current.y});};
    const up=()=>{dragging.current=false;document.removeEventListener("mousemove",mv);document.removeEventListener("mouseup",up);};
    document.addEventListener("mousemove",mv);
    document.addEventListener("mouseup",up);
  },[pos,onFocus]);

  const handleMin = useCallback(()=>{
    const winEl = windowRef.current;
    if (!winEl) { onMin(); return; }

    const winRect = winEl.getBoundingClientRect();

    // Target: right end of dock (where minimized icon will appear, just before trash)
    let targetX, targetY;
    if (dockRef && dockRef.current) {
      const dockRect = dockRef.current.getBoundingClientRect();
      targetX = dockRect.right - ICON_BASE - 20;
      targetY = dockRect.top + dockRect.height / 2;
    } else {
      targetX = window.innerWidth / 2;
      targetY = window.innerHeight - 50;
    }

    // dx/dy = how far to translate from window's top-left to the target point
    const dx = targetX - winRect.left - winRect.width / 2;
    const dy = targetY - winRect.top - winRect.height / 2;

    // Clone the window
    const clone = winEl.cloneNode(true);
    clone.style.cssText = `
      position: fixed;
      left: ${winRect.left}px;
      top: ${winRect.top}px;
      width: ${winRect.width}px;
      height: ${winRect.height}px;
      margin: 0;
      z-index: 99999;
      pointer-events: none;
      transform-origin: center center;
      border-radius: 12px;
      overflow: hidden;
      transform: translate(0,0) scale(1);
      opacity: 1;
      transition: transform 0.55s cubic-bezier(.22,1,.36,1), opacity 0.45s ease-in;
    `;
    document.body.appendChild(clone);

    // Hide the real window immediately
    winEl.style.visibility = "hidden";

    // Trigger animation on next paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        clone.style.transform = `translate(${dx}px, ${dy}px) scale(0.05)`;
        clone.style.opacity = "0";
      });
    });

    const onDone = () => {
      clone.remove();
      onMin();
    };
    clone.addEventListener("transitionend", onDone, { once: true });
    // Fallback in case transitionend doesn't fire
    setTimeout(onDone, 650);
  }, [onMin, dockRef]);

  // Build app content
  const getContent = () => {
    if (win.id === "music")      return <MusicApp/>;
    if (win.id === "calculator") return <CalculatorApp/>;
    if (win.id === "messages")  return (
      <div style={{height:"100%",background:"#f5f5f7",display:"flex",flexDirection:"column",fontFamily:"var(--sf)"}}>
        {/* Messages header */}
        <div style={{height:52,background:"rgba(246,246,248,0.97)",borderBottom:"0.5px solid rgba(0,0,0,0.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
            <div style={{fontSize:13,fontWeight:600,color:"#1c1c1e"}}>Aryan</div>
            <div style={{fontSize:11,color:"#8e8e93",marginTop:1}}>iMessage</div>
          </div>
        </div>
        {/* Chat area */}
        <div style={{flex:1,padding:"24px 20px",display:"flex",flexDirection:"column",justifyContent:"flex-end",gap:8}}>
          {/* Incoming bubble */}
          <div style={{display:"flex",alignItems:"flex-end",gap:8}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#62e878,#28c840)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"white"}}>A</div>
            <div style={{maxWidth:"72%"}}>
              <div style={{background:"white",borderRadius:"18px 18px 18px 4px",padding:"10px 14px",fontSize:14,color:"#1c1c1e",boxShadow:"0 1px 2px rgba(0,0,0,0.1)",lineHeight:1.4}}>
                Hi Aryan 👋 this side created this frontend clone just for fun 😄
              </div>
              <div style={{fontSize:11,color:"#8e8e93",marginTop:4,marginLeft:4}}>{new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}</div>
            </div>
          </div>
        </div>
        {/* Input bar */}
        <div style={{padding:"10px 14px",borderTop:"0.5px solid rgba(0,0,0,0.1)",background:"rgba(246,246,248,0.97)",display:"flex",alignItems:"center",gap:8}}>
          <div style={{flex:1,height:34,background:"white",borderRadius:17,border:"1px solid rgba(0,0,0,0.12)",display:"flex",alignItems:"center",padding:"0 14px"}}>
            <span style={{fontSize:13,color:"#8e8e93"}}>iMessage</span>
          </div>
          <div style={{width:30,height:30,borderRadius:"50%",background:"#28c840",display:"flex",alignItems:"center",justifyContent:"center",cursor:"default"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z" fill="white" stroke="none"/></svg>
          </div>
        </div>
      </div>
    );
    if (win.id === "finder")   return null;
    if (win.id === "safari")   return (
      <div style={{height:"100%",background:"rgba(246,246,248,0.98)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
        {getAppIcon(win.id,64)}
        <div style={{fontSize:17,fontWeight:600,color:"#1c1c1e",fontFamily:"var(--sfd)",marginTop:8}}>{win.name}</div>
        <div style={{fontSize:13,color:"#8e8e93"}}>Nothing to show here, coming soon.</div>
      </div>
    );
    if (win.id === "terminal") return <TerminalApp/>;
    if (win.id === "notes")    return <NotesApp/>;
    if (win.id === "calendar") return <CalendarApp/>;
    if (win.id === "settings") return <SettingsApp setWallpaper={setWallpaper} wallpaper={wallpaper}/>;
    if (win.id === "facetime") return (
      <div style={{height:"100%",background:"rgba(246,246,248,0.98)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
        {getAppIcon(win.id,64)}
        <div style={{fontSize:17,fontWeight:600,color:"#1c1c1e",fontFamily:"var(--sfd)",marginTop:8}}>{win.name}</div>
        <div style={{fontSize:13,color:"#8e8e93"}}>Nothing to show here, coming soon.</div>
      </div>
    );
    if (win.id === "maps")     return (
      <div style={{height:"100%",background:"rgba(246,246,248,0.98)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
        {getAppIcon(win.id,64)}
        <div style={{fontSize:17,fontWeight:600,color:"#1c1c1e",fontFamily:"var(--sfd)",marginTop:8}}>{win.name}</div>
        <div style={{fontSize:13,color:"#8e8e93"}}>Nothing to show here, coming soon.</div>
      </div>
    );
    if (win.id === "games")    return <GamesApp/>;
    return (
      <div style={{height:"100%",background:dark?"#1a1a1e":"rgba(246,246,248,0.98)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
        {getAppIcon(win.id,72)}
        <div style={{fontSize:21,fontWeight:600,color:dark?"white":"#1c1c1e",fontFamily:"var(--sfd)",marginTop:4}}>{win.name}</div>
        <div style={{fontSize:13.5,color:"#8e8e93"}}>Coming soon</div>
      </div>
    );
  };

  return (
    <div ref={windowRef} onMouseDown={onFocus}
      style={{
        position:"absolute",left:pos.x,top:pos.y,width:sz.w,height:sz.h,zIndex,
        borderRadius:12,overflow:"hidden",display:"flex",flexDirection:"column",
        boxShadow:"0 0 0 0.5px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.1), 0 16px 48px rgba(0,0,0,0.26)",
        animation:closing
          ? "winClose 0.2s cubic-bezier(0.4,0,1,1) forwards"
          : "winOpen 0.28s cubic-bezier(0.34,1.18,0.64,1) forwards",
        userSelect:"none",
        transformOrigin:"center center",
      }}>
      <div onMouseDown={onTitleDown}
        style={{height:38,background:dark?"rgba(24,24,28,0.97)":"rgba(234,234,238,0.97)",
          backdropFilter:"blur(60px) saturate(180%)",
          borderBottom:`0.5px solid ${dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.12)"}`,
          display:"flex",alignItems:"center",padding:"0 14px",cursor:"default",flexShrink:0,position:"relative"}}>
        <div className="tl-wrap" style={{display:"flex",gap:8,zIndex:1}}>
          {[["tl-r","#ff5f57",handleClose],["tl-y","#febc2e",handleMin],["tl-g","#28c840",null]].map(([cls,bg,fn])=>(
            <button key={cls} onClick={e=>{e.stopPropagation();fn?.();}}
              style={{all:"unset",width:12,height:12,borderRadius:"50%",background:bg,
                boxShadow:"0 0 0 0.5px rgba(0,0,0,0.18)",cursor:"default",flexShrink:0,transition:"filter 0.12s"}}
              className={cls}/>
          ))}
        </div>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",
          fontSize:13,fontWeight:500,color:dark?"rgba(255,255,255,0.72)":"rgba(0,0,0,0.75)"}}>
          {win.name}
        </div>
      </div>
      <div style={{flex:1,overflow:"hidden"}}>
        {getContent()}
      </div>
    </div>
  );
}

/* ─── SPOTLIGHT ──────────────────────────────────────────────────────── */
function Spotlight({onClose, onOpen}) {
  const [q,setQ]=useState(""), [si,setSi]=useState(0);
  const res=q ? DOCK_APPS.filter(a=>a.name.toLowerCase().includes(q.toLowerCase())).slice(0,6) : [];
  useEffect(()=>setSi(0),[q]);
  return (
    <div style={{position:"fixed",inset:0,zIndex:99996,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:"13vh",background:"rgba(0,0,0,0.3)",backdropFilter:"blur(4px)"}}
      onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
        style={{width:700,background:"rgba(18,18,22,0.9)",backdropFilter:"blur(120px) saturate(200%)",borderRadius:16,overflow:"hidden",
          boxShadow:"0 28px 96px rgba(0,0,0,0.72), 0 0 0 0.5px rgba(255,255,255,0.16)",animation:"fadeUp 0.2s cubic-bezier(0.34,1.2,0.64,1)"}}>
        <div style={{display:"flex",alignItems:"center",padding:"14px 18px",gap:12}}>
          <MenuBarSpotlight/>
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)}
            onKeyDown={e=>{
              if(e.key==="Escape")onClose();
              if(e.key==="ArrowDown")setSi(i=>Math.min(i+1,res.length-1));
              if(e.key==="ArrowUp")setSi(i=>Math.max(i-1,0));
              if(e.key==="Enter"&&res[si]){onOpen(res[si]);onClose();}
            }}
            placeholder="Spotlight Search"
            style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:24,color:"rgba(255,255,255,0.95)",fontFamily:"var(--sfd)",fontWeight:300}}/>
        </div>
        {res.length>0&&(
          <div style={{borderTop:"0.5px solid rgba(255,255,255,0.1)"}}>
            <div style={{padding:"6px 16px 3px",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.3)",letterSpacing:"0.09em",textTransform:"uppercase"}}>Applications</div>
            {res.map((app,i)=>(
              <div key={app.id} onClick={()=>{onOpen(app);onClose();}}
                style={{display:"flex",alignItems:"center",gap:13,padding:"9px 12px",margin:"1px 7px",borderRadius:10,cursor:"default",
                  background:i===si?"rgba(0,122,255,0.46)":"transparent"}}
                onMouseEnter={()=>setSi(i)}>
                <div style={{flexShrink:0}}>{getAppIcon(app.id,36)}</div>
                <div>
                  <div style={{fontSize:14.5,fontWeight:500,color:"white"}}>{app.name}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.38)"}}>Application</div>
                </div>
              </div>
            ))}
            <div style={{height:8}}/>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── NOTIFICATION ───────────────────────────────────────────────────── */
function Notification({n, onDismiss}) {
  useEffect(()=>{const t=setTimeout(onDismiss,5500);return()=>clearTimeout(t);},[]);
  return (
    <div onClick={onDismiss}
      style={{width:340,background:"rgba(34,34,38,0.92)",backdropFilter:"blur(80px) saturate(200%)",
        borderRadius:15,padding:"13px 14px",display:"flex",gap:12,cursor:"default",
        boxShadow:"0 8px 32px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(255,255,255,0.12)",
        animation:"notifIn 0.26s cubic-bezier(0.34,1.2,0.64,1)",fontFamily:"var(--sf)"}}>
      <div style={{flexShrink:0}}>{getAppIcon(n.app,40)}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
          <span style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.45)",textTransform:"capitalize"}}>{n.app}</span>
          <span style={{fontSize:11,color:"rgba(255,255,255,0.25)"}}>now</span>
        </div>
        <div style={{fontSize:13.5,fontWeight:700,color:"white",marginTop:1.5}}>{n.title}</div>
        <div style={{fontSize:12.5,color:"rgba(255,255,255,0.55)",marginTop:1.5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.body}</div>
      </div>
    </div>
  );
}

/* ─── CONTEXT MENU ───────────────────────────────────────────────────── */
function CtxMenu({pos, onClose}) {
  const items=[{l:"New Folder",k:"⇧⌘N"},{l:"New Folder with Selection",k:"⌃⌘N"},null,{l:"Get Info",k:"⌘I"},{l:"Change Desktop Background…"},null,{l:"Show View Options",k:"⌘J"},{l:"Use Stacks"},null,{l:"Sort By",arr:true},{l:"Clean Up By",arr:true},null,{l:"Import from iPhone",arr:true}];
  return (
    <div style={{position:"fixed",left:pos.x,top:pos.y,zIndex:99997,background:"rgba(234,234,238,0.9)",backdropFilter:"blur(90px) saturate(220%)",borderRadius:11,padding:"5px 0",minWidth:248,boxShadow:"0 10px 42px rgba(0,0,0,0.38), 0 0 0 0.5px rgba(0,0,0,0.16)",fontSize:13.5,animation:"fadeUp 0.13s ease",fontFamily:"var(--sf)"}}>
      {items.map((item,i)=>item===null
        ?<div key={i} style={{height:1,background:"rgba(0,0,0,0.09)",margin:"4px 0"}}/>
        :(
          <div key={i} onClick={onClose}
            style={{padding:"5px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"default",margin:"0 4px",borderRadius:7,color:"#1c1c1e"}}
            onMouseEnter={e=>{e.currentTarget.style.background="#2f6ef5";e.currentTarget.style.color="white";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#1c1c1e";}}>
            <span>{item.l}</span>
            {item.k&&<span style={{opacity:0.45,fontSize:12}}>{item.k}</span>}
            {item.arr&&<span style={{opacity:0.4,marginLeft:4}}>›</span>}
          </div>
        )
      )}
    </div>
  );
}

/* ─── FINDER MENU DROPDOWNS ──────────────────────────────────────────── */
const FINDER_MENUS = {
  File: [
    {l:"New Finder Window",k:"⌘N"},{l:"New Folder",k:"⇧⌘N"},{l:"New Folder with Selection",k:"⌃⌘N"},
    {l:"New Smart Folder"},null,{l:"Open",k:"⌘O"},{l:"Open With",arr:true},null,
    {l:"Close Window",k:"⌘W"},null,{l:"Get Info",k:"⌘I"},{l:"Rename"},{l:"Compress"},null,
    {l:"Duplicate",k:"⌘D"},{l:"Make Alias",k:"⌃⌘A"},null,{l:"Move to Trash",k:"⌘⌫"},{l:"Eject"},null,{l:"Find…",k:"⌘F"},
  ],
  Edit: [
    {l:"Undo",k:"⌘Z"},{l:"Redo",k:"⇧⌘Z"},null,{l:"Cut",k:"⌘X"},{l:"Copy",k:"⌘C"},{l:"Paste",k:"⌘V"},{l:"Select All",k:"⌘A"},null,
    {l:"Show Clipboard"},{l:"AutoFill",arr:true},null,{l:"Start Dictation…"},{l:"Emoji & Symbols",k:"⌃⌘Space"},
  ],
  View: [
    {l:"as Icons",k:"⌘1"},{l:"as List",k:"⌘2"},{l:"as Columns",k:"⌘3"},{l:"as Gallery",k:"⌘4"},null,
    {l:"Sort By",arr:true},{l:"Clean Up"},{l:"Clean Up By",arr:true},null,
    {l:"Show Tab Bar"},{l:"Show All Tabs"},{l:"Show Path Bar"},{l:"Show Status Bar"},{l:"Show Sidebar",k:"⌥⌘S"},{l:"Show Preview",k:"⇧⌘P"},null,
    {l:"Hide Toolbar",k:"⌥⌘T"},{l:"Enter Full Screen",k:"⌃⌘F"},
  ],
  Go: [
    {l:"Back",k:"⌘["},{l:"Forward",k:"⌘]"},{l:"Enclosing Folder",k:"⌘↑"},null,
    {l:"Recents",k:"⇧⌘F"},{l:"Documents",k:"⇧⌘O"},{l:"Desktop",k:"⇧⌘D"},
    {l:"Downloads",k:"⌥⌘L"},{l:"Home",k:"⇧⌘H"},{l:"Library"},{l:"Computer",k:"⇧⌘C"},
    {l:"AirDrop",k:"⇧⌘R"},{l:"Network",k:"⇧⌘K"},{l:"iCloud Drive",k:"⇧⌘I"},null,
    {l:"Applications",k:"⇧⌘A"},{l:"Utilities",k:"⇧⌘U"},null,{l:"Go to Folder…",k:"⇧⌘G"},{l:"Connect to Server…",k:"⌘K"},
  ],
  Window: [
    {l:"Minimize",k:"⌘M"},{l:"Zoom"},{l:"Tile Window to Left of Screen"},{l:"Tile Window to Right of Screen"},null,
    {l:"Remove Window from Set"},{l:"Move Window to iPad Display"},null,{l:"Bring All to Front"},{l:"Arrange in Front"},null,{l:"Finder",k:"⌘1"},
  ],
  Help: [
    {l:"Search",isSearch:true},null,{l:"macOS Help"},{l:"New Features in macOS Sequoia"},null,{l:"Keyboard Shortcuts"},{l:"Tips for Your Mac"},
  ],
};

function MenuPanel({ children, minWidth=248, closing=false }) {
  return (
    <div className="menu-panel" style={{
      minWidth,
      animation: closing
        ? "menuClose 0.15s cubic-bezier(0.4,0,1,1) forwards"
        : "menuOpen 0.2s cubic-bezier(0.34,1.15,0.64,1) forwards"
    }}>
      {children}
    </div>
  );
}

function MenuItem({ item, onClick }) {
  if (item === null) return <div className="menu-sep"/>;
  if (item.isSearch) return (
    <div className="menu-item" style={{cursor:"default",userSelect:"none"}}>
      <div style={{flex:1,height:22,background:"rgba(0,0,0,0.07)",borderRadius:6,display:"flex",alignItems:"center",padding:"0 8px",gap:5,fontSize:12,color:"#8e8e93"}}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        Search
      </div>
    </div>
  );
  return (
    <div className="menu-item" onClick={onClick} style={{opacity:item.disabled?0.38:1}}>
      <span style={{flex:1}}>{item.l}</span>
      {item.k && <span className="menu-key">{item.k}</span>}
      {item.arr && <span className="menu-arr">›</span>}
    </div>
  );
}

function FinderMenuDropdown({label, items, closing=false, onClose}) {
  return (
    <MenuPanel closing={closing}>
      {items.map((item,i) => (
        <MenuItem key={i} item={item} onClick={()=>{ if(item?.fn) item.fn(); onClose(); }}/>
      ))}
    </MenuPanel>
  );
}


/* ─── BOOT SCREEN ─────────────────────────────────────────────────────── */
const BOOT_CSS = `
  @keyframes boot-fade-in  { from{opacity:0} to{opacity:1} }
  @keyframes boot-fade-out { from{opacity:1} to{opacity:0} }
  @keyframes logo-pop { 0%{transform:scale(0.7);opacity:0} 60%{transform:scale(1.08);opacity:1} 100%{transform:scale(1);opacity:1} }
  @keyframes bar-fill { from{width:0%} to{width:100%} }
  @keyframes apple-pulse { 0%,100%{filter:drop-shadow(0 0 8px rgba(255,255,255,0.2))} 50%{filter:drop-shadow(0 0 24px rgba(255,255,255,0.55))} }
  .boot-screen { animation: boot-fade-in 0.6s ease forwards; }
  .boot-screen.leaving { animation: boot-fade-out 0.8s ease forwards; }
  .boot-logo { animation: logo-pop 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.4s both; }
  .boot-bar-fill { animation: bar-fill 2.8s cubic-bezier(0.4,0,0.2,1) 1.2s both; }
  .apple-btn {
    background: none; border: none; cursor: pointer; padding: 0;
    outline: none; display: flex; align-items: center; justify-content: center;
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), filter 0.25s ease;
    filter: drop-shadow(0 0 0px rgba(255,255,255,0));
    animation: apple-pulse 3s ease-in-out infinite;
  }
  .apple-btn:hover {
    transform: scale(1.15);
    filter: drop-shadow(0 0 28px rgba(255,255,255,0.7)) brightness(1.1);
    animation: none;
  }
  .apple-btn:active {
    transform: scale(0.95);
    filter: drop-shadow(0 0 12px rgba(255,255,255,0.4));
  }
  .boot-hint {
    margin-top: 18px;
    font-size: 11px;
    color: rgba(255,255,255,0.28);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-family: -apple-system, sans-serif;
    transition: opacity 0.3s ease;
  }
`;

function BootScreen({ onDone }) {
  const [started, setStarted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const startBoot = () => {
    if (started) return;
    setStarted(true);

    // Preload wallpaper so it's ready when desktop appears
    const img = new Image();
    img.src = "/macos-tahoe-26-5120x2880-22675.jpg";

    // Play music — works because triggered by user click
    const bootAudio = new Audio("/love-online_Hg3rA8YU.mp3");
    bootAudio.volume = 1.0;
    bootAudio.play().catch(()=>{});



    setTimeout(() => setLeaving(true), 4000);
    setTimeout(() => {
      bootAudio.pause(); bootAudio.currentTime = 0;
      doneRef.current();
    }, 4800);
  };

  return (
    <div className={`boot-screen${leaving ? " leaving" : ""}`}
      style={{ position:"fixed", inset:0, zIndex:999999,
        background:"#000", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center" }}>
      <style>{BOOT_CSS}</style>

      {!started ? (
        /* Click-to-start: Apple logo as button */
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
          <button className="apple-btn" onClick={startBoot}>
            <svg width="90" height="110" viewBox="0 0 56 68" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M44.97 36.29c-.07-7.19 5.87-10.66 6.14-10.83-3.35-4.9-8.55-5.57-10.4-5.65-4.42-.45-8.64 2.62-10.88 2.62-2.24 0-5.69-2.56-9.37-2.49-4.81.07-9.25 2.81-11.72 7.12-5.01 8.69-1.29 21.6 3.59 28.67 2.38 3.46 5.2 7.35 8.91 7.21 3.59-.14 4.94-2.32 9.28-2.32 4.34 0 5.55 2.32 9.33 2.24 3.84-.07 6.28-3.51 8.64-6.98 2.73-4.01 3.86-7.9 3.92-8.1-.09-.04-7.51-2.89-7.44-11.48zM37.82 13.37c1.98-2.4 3.32-5.73 2.96-9.07-2.86.12-6.32 1.91-8.37 4.31-1.84 2.13-3.45 5.55-3.01 8.82 3.19.25 6.44-1.63 8.42-4.06z"/>
            </svg>
          </button>
        </div>
      ) : (
        /* Boot in progress: logo + progress bar */
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
          <div className="boot-logo" style={{ marginBottom:56 }}>
            <svg width="78" height="96" viewBox="0 0 56 68" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M44.97 36.29c-.07-7.19 5.87-10.66 6.14-10.83-3.35-4.9-8.55-5.57-10.4-5.65-4.42-.45-8.64 2.62-10.88 2.62-2.24 0-5.69-2.56-9.37-2.49-4.81.07-9.25 2.81-11.72 7.12-5.01 8.69-1.29 21.6 3.59 28.67 2.38 3.46 5.2 7.35 8.91 7.21 3.59-.14 4.94-2.32 9.28-2.32 4.34 0 5.55 2.32 9.33 2.24 3.84-.07 6.28-3.51 8.64-6.98 2.73-4.01 3.86-7.9 3.92-8.1-.09-.04-7.51-2.89-7.44-11.48zM37.82 13.37c1.98-2.4 3.32-5.73 2.96-9.07-2.86.12-6.32 1.91-8.37 4.31-1.84 2.13-3.45 5.55-3.01 8.82 3.19.25 6.44-1.63 8.42-4.06z"/>
            </svg>
          </div>
          <div style={{ width:186, height:4, background:"rgba(255,255,255,0.12)", borderRadius:2, overflow:"hidden" }}>
            <div className="boot-bar-fill" style={{ height:"100%", background:"rgba(255,255,255,0.8)", borderRadius:2, width:0 }}/>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── MAIN DESKTOP ───────────────────────────────────────────────────── */
export default function MacOSSonoma() {
  const [booted,setBooted]=useState(false);
  const [time,setTime]=useState(new Date());
  const [wallpaper,setWallpaper]=useState("/apple-macbook-pro-stock-2021-apple-event-2021-dark-mode-6016x5468-6759.jpg");
  const [wins,setWins]=useState([]);
  const [zt,setZt]=useState(200);
  const [spotlight,setSpotlight]=useState(false);
  const [appleMenu,setAppleMenu]=useState(false);
  const [closingApple,setClosingApple]=useState(false);
  const [activeMenu,setActiveMenu]=useState(null);
  const [closingMenu,setClosingMenu]=useState(null);
  const [menuX,setMenuX]=useState(0);
  const [notifs,setNotifs]=useState([]);
  const [ctxMenu,setCtxMenu]=useState(null);
  const [controlCenter,setControlCenter]=useState(false);
  const [closingCC,setClosingCC]=useState(false);
  const [brightness,setBrightness]=useState(0.85);
  const nid=useRef(0);
  const musicRef = useRef(null);
  const dockIconRefsMap = useRef({});
  const dockRef = useRef(null);

  useEffect(()=>{const t=setInterval(()=>setTime(new Date()),1000);return()=>clearInterval(t);},[]);

  useEffect(()=>{
    const timers=[
      setTimeout(()=>addNotif({app:"messages",title:"Sarah Johnson",body:"Hey! Are you joining the 3pm call? 👋"}),3000),
      setTimeout(()=>addNotif({app:"calculator",title:"Calculator",body:"Ready to use"}),9000),
      setTimeout(()=>addNotif({app:"calendar",title:"Design Review in 15 min",body:"Conference Room A · 3:00 PM"}),17000),
      setTimeout(()=>addNotif({app:"music",title:"Now Playing",body:"Blinding Lights — The Weeknd"}),24000),
    ];
    return()=>timers.forEach(clearTimeout);
  },[]);

  useEffect(()=>{
    const h=e=>{
      if((e.metaKey||e.ctrlKey)&&e.key===" "){e.preventDefault();setSpotlight(s=>!s);}
      if(e.key==="Escape"){setSpotlight(false);setAppleMenu(false);setCtxMenu(null);setActiveMenu(null);}
    };
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[]);

  const addNotif=n=>{const id=++nid.current;setNotifs(p=>[...p,{...n,id}]);};

  const openApp=useCallback(app=>{
    if(app.id==="github"){ window.open("https://github.com/Aryan457dwivedi","_blank"); return; }
    if(["finder","safari","photos","facetime","maps"].includes(app.id)){ return; }
    setWins(prev=>{
      const ex=prev.find(w=>w.id===app.id);
      if(ex){const z=zt+1;setZt(z);return prev.map(w=>w.id===app.id?{...w,z,min:false}:w);}
      const vis=prev.filter(w=>!w.min).length;
      const z=zt+1;setZt(z);
      return [...prev,{...app,pos:{x:52+vis*28,y:44+vis*20},z,min:false}];
    });
  },[zt]);

  const closeMenu = (which) => {
    if(which==="apple"&&appleMenu){ setClosingApple(true); setTimeout(()=>{setAppleMenu(false);setClosingApple(false);},150); }
    else if(which==="active"&&activeMenu){ setClosingMenu(activeMenu); setTimeout(()=>{setActiveMenu(null);setClosingMenu(null);},150); }
  };
  const closeAllMenus=()=>{
    if(appleMenu){setClosingApple(true);setTimeout(()=>{setAppleMenu(false);setClosingApple(false);},150);}
    if(activeMenu){setClosingMenu(activeMenu);setTimeout(()=>{setActiveMenu(null);setClosingMenu(null);},150);}
    setCtxMenu(null);
  };

  const fmt=d=>d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:true});
  const fmtDate=d=>d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});

  const finderMenuLabels=["Finder","File","Edit","View","Go","Window","Help"];

  const handleMenuClick=(label,e)=>{
    e.stopPropagation();
    if(activeMenu===label){setActiveMenu(null);return;}
    const rect=e.currentTarget.getBoundingClientRect();
    setMenuX(rect.left);
    setAppleMenu(false);
    setControlCenter(false);
    setActiveMenu(label);
  };

  if (!booted) return <BootScreen onDone={() => setBooted(true)} />;

  return (
    <>
      <style>{CSS}</style>
      <div style={{width:"100%",height:"100vh",position:"relative",overflow:"hidden",fontFamily:"var(--sf)"}}
        onClick={closeAllMenus}
        onContextMenu={e=>{
          e.preventDefault();
          setCtxMenu({x:Math.min(e.clientX,window.innerWidth-260),y:Math.min(e.clientY,window.innerHeight-340)});
        }}>

        <SonomaWallpaper src={wallpaper}/>

        {/* Brightness overlay */}
        <div style={{position:"absolute",inset:0,zIndex:1,background:`rgba(0,0,0,${(1-brightness)*0.92})`,pointerEvents:"none",transition:"background 0.1s"}}/>

        {/* Desktop folder icon */}
        <div style={{position:"absolute",top:36,right:20,zIndex:10,display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"default",userSelect:"none"}}
          onDoubleClick={()=>openApp({id:"games",name:"Sudoku"})}>
          <svg width="60" height="52" viewBox="0 0 120 100" fill="none">
            <defs>
              <linearGradient id="tabGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3a9fd5"/><stop offset="100%" stopColor="#2e8bbf"/></linearGradient>
              <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#82ccee"/><stop offset="60%" stopColor="#6bbde6"/><stop offset="100%" stopColor="#55a8d8"/></linearGradient>
              <linearGradient id="shineGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(255,255,255,0.45)"/><stop offset="100%" stopColor="rgba(255,255,255,0)"/></linearGradient>
            </defs>
            <path d="M6 22 Q6 14 14 14 L38 14 Q43 14 46 19 L52 28 L6 28 Z" fill="url(#tabGrad)"/>
            <rect x="6" y="24" width="108" height="64" rx="10" fill="url(#bodyGrad)"/>
            <rect x="6" y="24" width="108" height="28" rx="10" fill="url(#shineGrad)"/>
          </svg>
          <span style={{fontSize:11,color:"white",textShadow:"0 1px 3px rgba(0,0,0,0.8)",textAlign:"center",lineHeight:1.2,fontFamily:"var(--sf)",fontWeight:500}}>Sudoku</span>
        </div>

        {/* ═══ MENU BAR ═══ */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:26,zIndex:99990,borderBottom:"0.5px solid rgba(255,255,255,0.08)",
          background:"rgba(0,0,0,0.15)",backdropFilter:"blur(30px)",WebkitBackdropFilter:"blur(30px)",display:"flex",alignItems:"center",justifyContent:"space-between",userSelect:"none"}}>
          <div style={{display:"flex",alignItems:"center",height:"100%",paddingLeft:4}}>
            <div onClick={e=>{e.stopPropagation();if(appleMenu){closeMenu('apple');}else{setAppleMenu(true);}setClosingMenu(activeMenu);setTimeout(()=>{setActiveMenu(null);setClosingMenu(null);},activeMenu?150:0);if(controlCenter){setClosingCC(true);setTimeout(()=>{setControlCenter(false);setClosingCC(false);},150);}else{setControlCenter(false);}}}
              className={`mbi menubar-icon-shadow${appleMenu?" mbi-active":""}`}
              style={{padding:"0 8px",height:"100%",display:"flex",alignItems:"center",cursor:"default"}}>
              <AppleLogo/>
            </div>
            {finderMenuLabels.map(label=>(
              <div key={label} onClick={e=>handleMenuClick(label,e)}
                className={`mbi menubar-shadow${activeMenu===label?" mbi-active":""}`}
                style={{padding:"0 7px",height:"100%",display:"flex",alignItems:"center",fontSize:12,
                  fontWeight:label==="Finder"?600:400,color:"white",cursor:"default",
                  letterSpacing:label==="Finder"?"-0.018em":"-0.01em",whiteSpace:"nowrap"}}>
                {label}
              </div>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",height:"100%",paddingRight:6,gap:0}}>
            <div className="mbi menubar-icon-shadow" style={{padding:"0 5px",height:"100%",display:"flex",alignItems:"center",cursor:"default"}}><MenuBarBattery/></div>
            <div className="mbi menubar-icon-shadow" style={{padding:"0 5px",height:"100%",display:"flex",alignItems:"center",cursor:"default"}}><MenuBarWifi/></div>
            <div className="mbi menubar-icon-shadow" onClick={e=>{e.stopPropagation();setSpotlight(true);}}
              style={{padding:"0 5px",height:"100%",display:"flex",alignItems:"center",cursor:"default"}}><MenuBarSpotlight/></div>
            <div className={`mbi menubar-icon-shadow${controlCenter?" mbi-active":""}`}
              onClick={e=>{e.stopPropagation();if(controlCenter){setClosingCC(true);setTimeout(()=>{setControlCenter(false);setClosingCC(false);},180);}else{setControlCenter(true);}if(appleMenu){setClosingApple(true);setTimeout(()=>{setAppleMenu(false);setClosingApple(false);},150);}if(activeMenu){setClosingMenu(activeMenu);setTimeout(()=>{setActiveMenu(null);setClosingMenu(null);},150);}}}
              style={{padding:"0 5px",height:"100%",display:"flex",alignItems:"center",cursor:"default"}}><MenuBarCC/></div>
            <div className="mbi menubar-icon-shadow" style={{padding:"0 5px",height:"100%",display:"flex",alignItems:"center",cursor:"default"}}><MenuBarSiri/></div>
            <div className="mbi menubar-shadow"
              style={{padding:"0 8px",height:"100%",display:"flex",alignItems:"center",gap:4,cursor:"default"}}>
              <span style={{fontSize:11.5,color:"white",fontWeight:400,letterSpacing:"0.01em"}}>{fmtDate(time)}</span>
              <span style={{fontSize:11.5,color:"white",fontWeight:500,fontVariantNumeric:"tabular-nums",letterSpacing:"-0.01em"}}>{fmt(time)}</span>
            </div>
          </div>
        </div>

        {/* Apple Menu */}
        {appleMenu&&(
          <div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:28,left:4,zIndex:99995}}>
            <MenuPanel minWidth={240} closing={closingApple}>
              {[
                {l:"About This Mac"},null,
                {l:"System Settings…",fn:()=>openApp({id:"settings",name:"System Settings"})},
                {l:"App Store…"},null,{l:"Recent Items",arr:true},null,
                {l:"Force Quit…",k:"⌥⌘⎋"},null,
                {l:"Sleep"},{l:"Restart…"},{l:"Shut Down…"},null,
                {l:"Lock Screen",k:"⌃⌘Q"},{l:"Log Out visitor…",k:"⇧⌘Q"},
              ].map((item,i)=>(
                <MenuItem key={i} item={item} onClick={()=>{item?.fn?.();setAppleMenu(false);}}/>
              ))}
            </MenuPanel>
          </div>
        )}

        {/* Finder menu dropdowns */}
        {activeMenu && FINDER_MENUS[activeMenu] && (
          <div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:28,left:menuX,zIndex:99995}}>
            <FinderMenuDropdown label={activeMenu||closingMenu} items={FINDER_MENUS[activeMenu||closingMenu]||[]} closing={!!closingMenu} onClose={()=>{setClosingMenu(activeMenu);setTimeout(()=>{setActiveMenu(null);setClosingMenu(null);},150);}}/>
          </div>
        )}
        {activeMenu === "Finder" && (
          <div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:28,left:menuX,zIndex:99995}}>
            <MenuPanel minWidth={210} closing={closingMenu==="Finder"}>
              {[{l:"About Finder"},null,{l:"Settings…",k:"⌘,"},{l:"Empty Trash…",k:"⇧⌘⌫"},null,{l:"Services",arr:true},null,{l:"Hide Finder",k:"⌘H"},{l:"Hide Others",k:"⌥⌘H"},{l:"Show All"}].map((item,i)=>(
                <MenuItem key={i} item={item} onClick={()=>setActiveMenu(null)}/>
              ))}
            </MenuPanel>
          </div>
        )}

        {/* Windows */}
        {wins.filter(w=>!w.min).map(w=>(
          <MacWindow key={w.id} win={w} zIndex={w.z} musicRef={musicRef}
            dockIconRefsMap={dockIconRefsMap} dockRef={dockRef}
            setWallpaper={setWallpaper} wallpaper={wallpaper}
            onClose={()=>{
              delete dockIconRefsMap.current[w.id];
              setWins(p=>p.filter(x=>x.id!==w.id));
            }}
            onMin={()=>setWins(p=>p.map(x=>x.id===w.id?{...x,min:true}:x))}
            onFocus={()=>{const z=zt+1;setZt(z);setWins(p=>p.map(x=>x.id===w.id?{...x,z}:x));}}/>
        ))}

        {spotlight&&<Spotlight onClose={()=>setSpotlight(false)} onOpen={app=>openApp(app)}/>}
        {(controlCenter||closingCC)&&<ControlCenterPanel onClose={()=>{setClosingCC(true);setTimeout(()=>{setControlCenter(false);setClosingCC(false);},180);}} closingCC={closingCC} brightness={brightness} setBrightness={setBrightness}/>}

        <div style={{position:"absolute",top:32,right:14,display:"flex",flexDirection:"column",gap:10,zIndex:99993,pointerEvents:"none"}}>
          {notifs.map(n=>(
            <div key={n.id} style={{pointerEvents:"all"}}>
              <Notification n={n} onDismiss={()=>setNotifs(p=>p.filter(x=>x.id!==n.id))}/>
            </div>
          ))}
        </div>

        {ctxMenu&&<CtxMenu pos={ctxMenu} onClose={()=>setCtxMenu(null)}/>}

        <Dock apps={DOCK_APPS} openApp={openApp}
          openWins={wins.filter(w=>!w.min)}
          minWins={wins.filter(w=>w.min)}
          dockIconRefsMap={dockIconRefsMap}
          dockRef={dockRef}
          getAppIcon={getAppIcon}
          IconTrash={IconTrash}
          appIconUrls={APP_ICON_URLS}
          themeColor="Dark"
          onRestore={(id) => {
            const winData = wins.find(w => w.id === id);
            const sz = WIN_SIZES[id] || {w:640,h:440};
            const winPos = winData?.pos || {x:80,y:60};
            const iconEl = dockIconRefsMap.current[id];

            // Animate clone from dock icon → window position, then reveal real window
            if (iconEl) {
              const iconRect = iconEl.getBoundingClientRect();
              const startX = iconRect.left + iconRect.width/2 - sz.w/2;
              const startY = iconRect.top + iconRect.height/2 - sz.h/2;
              const dx = winPos.x - startX;
              const dy = winPos.y - startY;

              const clone = document.createElement("div");
              clone.style.cssText = `
                position: fixed;
                left: ${startX}px;
                top: ${startY}px;
                width: ${sz.w}px;
                height: ${sz.h}px;
                background: rgba(30,30,36,0.9);
                border-radius: 12px;
                z-index: 99999;
                pointer-events: none;
                transform-origin: center center;
                transform: scale(0.05);
                opacity: 0;
                overflow: hidden;
                transition: transform 0.52s cubic-bezier(.22,1,.36,1), opacity 0.4s ease-out;
              `;
              document.body.appendChild(clone);

              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  clone.style.transform = `translate(${dx}px, ${dy}px) scale(1)`;
                  clone.style.opacity = "1";
                });
              });

              const onDone = () => {
                clone.remove();
                const z=zt+1; setZt(z);
                setWins(p=>p.map(w=>w.id===id?{...w,min:false,z}:w));
              };
              clone.addEventListener("transitionend", onDone, { once: true });
              setTimeout(onDone, 650); // fallback
            } else {
              const z=zt+1; setZt(z);
              setWins(p=>p.map(w=>w.id===id?{...w,min:false,z}:w));
            }
          }}/>
      </div>
    </>
  );
}
