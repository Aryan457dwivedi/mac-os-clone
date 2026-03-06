import { useState, useEffect, useRef, useCallback } from "react";

const CSS = `
  .ma * { box-sizing: border-box; margin: 0; padding: 0; }
  .ma { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif; }

  .ma-sb::-webkit-scrollbar { width: 5px; }
  .ma-sb::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.14); border-radius: 3px; }
  .ma-sb::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.28); }
  .ma-sb::-webkit-scrollbar-track { background: transparent; }

  .ma-nav { display:flex; align-items:center; gap:8px; padding:5px 10px; border-radius:7px;
    cursor:default; font-size:13px; color:rgba(255,255,255,0.45);
    transition:background 0.1s, color 0.1s; user-select:none; }
  .ma-nav:hover { background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.75); }
  .ma-nav.active { background:rgba(255,255,255,0.1); color:white; font-weight:500; }

  .ma-track { display:grid; grid-template-columns:28px 1fr 1fr auto;
    gap:0 12px; align-items:center; padding:5px 10px; border-radius:8px;
    cursor:default; transition:background 0.1s; }
  .ma-track:hover { background:rgba(255,255,255,0.06); }
  .ma-track:hover .ma-row-act { opacity:1 !important; }
  .ma-row-act { opacity:0; transition:opacity 0.1s; }
  .ma-track.active { background:rgba(252,49,88,0.1); }

  .ma-prog { position:relative; height:4px; border-radius:2px;
    background:rgba(255,255,255,0.12); cursor:pointer; transition:height 0.15s; }
  .ma-prog:hover { height:6px; }
  .ma-prog:hover .ma-thumb { opacity:1 !important; transform:translateY(-50%) scale(1) !important; }
  .ma-thumb { position:absolute; top:50%; width:14px; height:14px; border-radius:50%;
    background:white; transform:translateY(-50%) scale(0); opacity:0;
    transition:opacity 0.15s, transform 0.15s cubic-bezier(.34,1.5,.64,1);
    pointer-events:none; box-shadow:0 1px 5px rgba(0,0,0,0.4); margin-left:-7px; }

  .ma-vol { position:relative; height:3px; border-radius:2px;
    background:rgba(255,255,255,0.12); cursor:pointer; transition:height 0.15s; }
  .ma-vol:hover { height:5px; }
  .ma-vol:hover .ma-vol-thumb { opacity:1 !important; transform:translateY(-50%) scale(1) !important; }
  .ma-vol-thumb { position:absolute; top:50%; width:12px; height:12px; border-radius:50%;
    background:white; transform:translateY(-50%) scale(0); opacity:0;
    transition:opacity 0.15s, transform 0.15s cubic-bezier(.34,1.5,.64,1);
    pointer-events:none; box-shadow:0 1px 4px rgba(0,0,0,0.4); margin-left:-6px; }

  .ma-ctrl { background:none; border:none; cursor:default; display:flex; align-items:center;
    justify-content:center; padding:4px;
    transition:transform 0.14s cubic-bezier(.34,1.4,.64,1); }
  .ma-ctrl:hover { transform:scale(1.12); }
  .ma-ctrl:active { transform:scale(0.88) !important; }

  .ma-play { width:48px; height:48px; border-radius:50%; background:white; border:none;
    cursor:default; display:flex; align-items:center; justify-content:center;
    box-shadow:0 3px 16px rgba(0,0,0,0.55);
    transition:transform 0.14s cubic-bezier(.34,1.4,.64,1), box-shadow 0.14s; }
  .ma-play:hover { transform:scale(1.08); box-shadow:0 5px 22px rgba(0,0,0,0.65); }
  .ma-play:active { transform:scale(0.92) !important; }

  .ma-heart { background:none; border:none; cursor:default; padding:4px;
    transition:transform 0.18s cubic-bezier(.34,1.6,.64,1); }
  .ma-heart:hover { transform:scale(1.28); }
  .ma-heart:active { transform:scale(0.82) !important; }

  .ma-art { border-radius:12px; overflow:hidden;
    transition:transform 0.4s cubic-bezier(.34,1.1,.64,1), box-shadow 0.4s; }
  .ma-art.playing { transform:scale(1.04); }

  @keyframes eq1{0%,100%{height:3px}50%{height:11px}}
  @keyframes eq2{0%,100%{height:7px}50%{height:3px}}
  @keyframes eq3{0%,100%{height:11px}50%{height:6px}}
  .eq1{animation:eq1 0.8s ease-in-out infinite;}
  .eq2{animation:eq2 0.7s ease-in-out infinite 0.1s;}
  .eq3{animation:eq3 0.9s ease-in-out infinite 0.2s;}
`;

const PINK = "#fc3158";

function Icon({ d, s = 16, c = "currentColor", sw = 1.8, fill = "none" }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={fill}
      stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {[].concat(d).map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

function EqBars({ color = PINK, size = 12 }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:size }}>
      {["eq1","eq2","eq3"].map(cls => (
        <div key={cls} className={cls}
          style={{ width: Math.max(2, Math.round(size*0.25)), background:color, borderRadius:1 }} />
      ))}
    </div>
  );
}

function DragBar({ value, onChange, wrapCls, thumbCls, fill }) {
  const ref = useRef(null);
  const down = useRef(false);
  const upd = useCallback(cx => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    onChange(Math.max(0, Math.min(1, (cx - r.left) / r.width)));
  }, [onChange]);
  return (
    <div ref={ref} className={wrapCls}
      onPointerDown={e => { e.preventDefault(); down.current=true; ref.current.setPointerCapture(e.pointerId); upd(e.clientX); }}
      onPointerMove={e => { if (down.current) upd(e.clientX); }}
      onPointerUp={() => { down.current=false; }}>
      <div style={{ width:`${value*100}%`, height:"100%", background:fill, borderRadius:"inherit" }} />
      <div className={thumbCls} style={{ left:`${value*100}%` }} />
    </div>
  );
}

const NAV = [
  { section: null, items: [
    { id:"listen",    label:"Listen Now",  icon:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
    { id:"browse",    label:"Browse",      icon:"M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" },
    { id:"radio",     label:"Radio",       icon:"M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" },
  ]},
  { section: "Library", items: [
    { id:"library",   label:"Library",     icon:"M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" },
    { id:"playlists", label:"Playlists",   icon:"M9 18V5l12-2v13M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
    { id:"artists",   label:"Artists",     icon:"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
    { id:"albums",    label:"Albums",      icon:"M9 18V5l12-2v13M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
    { id:"songs",     label:"Songs",       icon:"M4 6h16M4 12h16M4 18h16" },
    { id:"downloaded",label:"Downloaded",  icon:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" },
  ]},
];

export default function MusicApp({ TRACKS, musicState, audioEl, audioControls }) {
  const [, setTick]   = useState(0);
  const [nav,     setNav]     = useState("listen");
  const [vol,     setVol]     = useState(musicState.vol);
  const [liked,   setLiked]   = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat,  setRepeat]  = useState(0);
  const [hovRow,  setHovRow]  = useState(null);
  const refresh = useCallback(() => setTick(n => n + 1), []);

  useEffect(() => {
    ["timeupdate","play","pause","ended"].forEach(ev => audioEl.addEventListener(ev, refresh));
    return () => ["timeupdate","play","pause","ended"].forEach(ev => audioEl.removeEventListener(ev, refresh));
  }, [audioEl, refresh]);

  const track   = TRACKS[musicState.trackIdx];
  const playing = musicState.playing;
  const dur     = audioEl.duration || track.dur || 1;
  const cur     = musicState.progress * dur;
  const fmt     = s => `${Math.floor(s/60)}:${String(Math.floor(Math.max(0,s)%60)).padStart(2,"0")}`;

  const jump = useCallback(idx => {
    musicState.trackIdx = idx;
    musicState.progress = 0;
    const t = TRACKS[idx];
    if (t.src) { audioEl.src = t.src; audioEl.load(); if (playing) audioEl.play().catch(()=>{}); }
    else { audioEl.pause(); audioEl.src = ""; }
    refresh();
  }, [playing, TRACKS, musicState, audioEl, refresh]);

  const setVolume = useCallback(v => { setVol(v); audioControls.setVol(v); }, [audioControls]);

  return (
    <div className="ma" style={{ display:"flex", height:"100%", background:"#111", overflow:"hidden" }}>
      <style>{CSS}</style>

      {/* ── SIDEBAR ── */}
      <div style={{ width:196, flexShrink:0, display:"flex", flexDirection:"column",
        background:"#191919", borderRight:"0.5px solid rgba(255,255,255,0.06)" }}>

        <div style={{ padding:"10px 10px 6px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, height:26,
            background:"rgba(255,255,255,0.07)", borderRadius:7, padding:"0 9px",
            border:"0.5px solid rgba(255,255,255,0.08)" }}>
            <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" s={12} c="rgba(255,255,255,0.3)" sw={2}/>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.28)" }}>Search</span>
          </div>
        </div>

        <div className="ma-sb" style={{ flex:1, overflowY:"auto", padding:"2px 6px 8px" }}>
          {NAV.map((sec, si) => (
            <div key={si}>
              {sec.section && (
                <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.22)",
                  textTransform:"uppercase", letterSpacing:"0.08em", padding:"10px 10px 4px" }}>
                  {sec.section}
                </div>
              )}
              {sec.items.map(item => (
                <div key={item.id} className={`ma-nav${nav===item.id?" active":""}`}
                  onClick={() => setNav(item.id)}>
                  <Icon d={item.icon} s={14} c={nav===item.id ? PINK : "rgba(255,255,255,0.38)"} sw={1.8}/>
                  {item.label}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* mini strip */}
        <div style={{ padding:"8px 10px 10px", borderTop:"0.5px solid rgba(255,255,255,0.06)",
          display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:32, height:32, borderRadius:5, overflow:"hidden", flexShrink:0,
            boxShadow:"0 2px 8px rgba(0,0,0,0.5)" }}>
            <img src={track.art} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt=""/>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:11.5, fontWeight:600, color:"white", whiteSpace:"nowrap",
              overflow:"hidden", textOverflow:"ellipsis" }}>{track.title}</div>
            <div style={{ fontSize:10.5, color:"rgba(255,255,255,0.38)", marginTop:1 }}>{track.artist}</div>
          </div>
          {playing && <EqBars size={12}/>}
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, minHeight:0,
        background:"linear-gradient(170deg,#1f0a1a 0%,#130a12 40%,#0d0d12 100%)" }}>

        {/* Now playing panel — fixed height */}
        <div style={{ flexShrink:0, padding:"18px 26px 14px", display:"flex", gap:20 }}>

          {/* Album art */}
          <div className={`ma-art${playing?" playing":""}`}
            style={{ width:126, height:126, flexShrink:0,
              boxShadow: playing
                ? "0 20px 60px rgba(252,49,88,0.42), 0 6px 20px rgba(0,0,0,0.65)"
                : "0 10px 36px rgba(0,0,0,0.75)" }}>
            <img src={track.art} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} alt=""/>
          </div>

          {/* Controls */}
          <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>

            {/* Title + heart */}
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:18, fontWeight:700, color:"white", letterSpacing:"-0.03em",
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                  fontFamily:"-apple-system,'SF Pro Display',sans-serif" }}>
                  {track.title}
                </div>
                <div style={{ fontSize:13, color:PINK, marginTop:3, fontWeight:500 }}>{track.artist}</div>
              </div>
              <button className="ma-heart" onClick={() => { setLiked(l=>!l); musicState.liked=!liked; }}
                style={{ color:liked?PINK:"rgba(255,255,255,0.2)", flexShrink:0, marginTop:2 }}>
                <Icon d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  s={21} c={liked?PINK:"rgba(255,255,255,0.2)"} fill={liked?PINK:"none"} sw={1.6}/>
              </button>
            </div>

            {/* Progress */}
            <div>
              <DragBar value={musicState.progress}
                onChange={v => { audioControls.seek(v); refresh(); }}
                wrapCls="ma-prog" thumbCls="ma-thumb"
                fill={`linear-gradient(90deg,${PINK},#ff6b9d)`}/>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:5,
                fontSize:10.5, color:"rgba(255,255,255,0.28)", fontVariantNumeric:"tabular-nums" }}>
                <span>{fmt(cur)}</span>
                <span>-{fmt(Math.max(0,dur-cur))}</span>
              </div>
            </div>

            {/* Transport */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <button className="ma-ctrl" onClick={()=>setShuffle(s=>!s)}
                style={{ color:shuffle?PINK:"rgba(255,255,255,0.3)" }}>
                <Icon d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" s={15} c="currentColor" sw={2}/>
              </button>
              <button className="ma-ctrl" onClick={()=>{audioControls.prevTrack();refresh();}} style={{color:"white",opacity:0.82}}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="white">
                  <polygon points="19 20 9 12 19 4 19 20"/><rect x="5" y="4" width="2.5" height="16" rx="1.2"/>
                </svg>
              </button>
              <button className="ma-play" onClick={()=>{audioControls.togglePlay();refresh();}}>
                {playing
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="#111"><rect x="6" y="4" width="4" height="16" rx="1.5"/><rect x="14" y="4" width="4" height="16" rx="1.5"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="#111" style={{marginLeft:2}}><polygon points="5 3 19 12 5 21 5 3"/></svg>}
              </button>
              <button className="ma-ctrl" onClick={()=>{audioControls.nextTrack();refresh();}} style={{color:"white",opacity:0.82}}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="white">
                  <polygon points="5 4 15 12 5 20 5 4"/><rect x="16.5" y="4" width="2.5" height="16" rx="1.2"/>
                </svg>
              </button>
              <button className="ma-ctrl" onClick={()=>setRepeat(r=>(r+1)%3)}
                style={{ color:repeat>0?PINK:"rgba(255,255,255,0.3)", position:"relative" }}>
                <Icon d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"
                  s={15} c="currentColor" sw={2}/>
                {repeat===2 && (
                  <div style={{ position:"absolute", top:0, right:0, width:9, height:9,
                    borderRadius:"50%", background:PINK, fontSize:6, display:"flex",
                    alignItems:"center", justifyContent:"center", color:"white", fontWeight:800 }}>1</div>
                )}
              </button>
            </div>

            {/* Volume */}
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Icon d="M11 5L6 9H2v6h4l5 4V5z" s={12} c="rgba(255,255,255,0.3)" sw={1.8}/>
              <div style={{ flex:1 }}>
                <DragBar value={vol} onChange={setVolume}
                  wrapCls="ma-vol" thumbCls="ma-vol-thumb"
                  fill="rgba(255,255,255,0.5)"/>
              </div>
              <Icon d={["M11 5L6 9H2v6h4l5 4V5z","M19.07 4.93a10 10 0 0 1 0 14.14","M15.54 8.46a5 5 0 0 1 0 7.07"]}
                s={12} c="rgba(255,255,255,0.3)" sw={1.8}/>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height:"0.5px", background:"rgba(255,255,255,0.07)", margin:"0 26px", flexShrink:0 }}/>

        {/* ── Scrollable track list ── */}
        <div className="ma-sb" style={{ flex:1, overflowY:"auto", padding:"0 16px 12px", minHeight:0 }}>

          {/* Column headers */}
          <div style={{ display:"grid", gridTemplateColumns:"28px 1fr 1fr auto", gap:"0 12px",
            padding:"8px 10px 6px", borderBottom:"0.5px solid rgba(255,255,255,0.07)", marginBottom:4,
            position:"sticky", top:0, background:"rgba(13,9,14,0.95)", backdropFilter:"blur(8px)", zIndex:1 }}>
            {["#","Title","Artist",""].map((h,i) => (
              <div key={i} style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.22)",
                textTransform:"uppercase", letterSpacing:"0.07em",
                textAlign: i===0||i===3 ? "center" : "left" }}>{h}</div>
            ))}
          </div>

          {TRACKS.map((t, i) => {
            const isActive = i === musicState.trackIdx;
            const isHov    = hovRow === i;
            return (
              <div key={i} className={`ma-track${isActive?" active":""}`}
                onDoubleClick={() => jump(i)}
                onMouseEnter={() => setHovRow(i)}
                onMouseLeave={() => setHovRow(null)}>

                {/* Index / eq / play */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {isActive && playing
                    ? <EqBars color={PINK} size={13}/>
                    : isActive
                      ? <Icon d="M9 18V5l12-2v13M6 21a3 3 0 1 0 0-6" s={13} c={PINK} sw={2}/>
                      : isHov
                        ? <button className="ma-ctrl" onClick={() => jump(i)} style={{color:"white",padding:0}}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          </button>
                        : <span style={{fontSize:12,color:"rgba(255,255,255,0.28)",fontVariantNumeric:"tabular-nums"}}>{i+1}</span>}
                </div>

                {/* Art + title */}
                <div style={{ display:"flex", alignItems:"center", gap:9, minWidth:0 }}>
                  <div style={{ width:36, height:36, borderRadius:5, overflow:"hidden",
                    flexShrink:0, boxShadow:"0 1px 6px rgba(0,0,0,0.5)", position:"relative" }}>
                    <img src={t.art} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} alt=""/>
                    {isActive && playing && (
                      <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",
                        display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <EqBars color="white" size={11}/>
                      </div>
                    )}
                  </div>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:13, fontWeight:isActive?600:400,
                      color:isActive?PINK:"white",
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}</div>
                  </div>
                </div>

                {/* Artist */}
                <div style={{fontSize:12.5,color:"rgba(255,255,255,0.42)",
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.artist}</div>

                {/* Duration + actions */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6}}>
                  <div className="ma-row-act" style={{display:"flex",gap:2}}>
                    <button className="ma-ctrl" style={{color:"rgba(255,255,255,0.4)",padding:3}}>
                      <Icon d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        s={13} c="rgba(255,255,255,0.45)" sw={1.6}/>
                    </button>
                    <button className="ma-ctrl" style={{color:"rgba(255,255,255,0.4)",padding:3}}>
                      <Icon d="M12 5v14M5 12l7 7 7-7" s={13} c="rgba(255,255,255,0.45)" sw={2}/>
                    </button>
                  </div>
                  <span style={{fontSize:11.5,color:"rgba(255,255,255,0.28)",
                    fontVariantNumeric:"tabular-nums",minWidth:32,textAlign:"right"}}>
                    {fmt(t.dur)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}