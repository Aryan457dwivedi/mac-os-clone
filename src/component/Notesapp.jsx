import { useState, useRef, useCallback } from "react";

const INITIAL_NOTES = [
  {
    id: 1, title: "Start noting", folder: "Notes", pinned: false,
    date: new Date(), body: "Start noting",
  },
];

const FOLDERS = [
  { id: "All Notes",        label: "All Notes",        icon: "M3 7h18M3 12h18M3 17h12" },
  { id: "Notes",            label: "Notes",            icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { id: "Work",             label: "Work",             icon: "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" },
  { id: "Personal",         label: "Personal",         icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
  { id: "Reading",          label: "Reading",          icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.75 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { id: "Recently Deleted", label: "Recently Deleted", icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" },
];

function formatDate(date) {
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (days === 1) return "Yesterday";
  if (days < 7)  return date.toLocaleDateString("en-US", { weekday: "long" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Svg({ d, size = 14, color = "currentColor", sw = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default function NotesApp() {
  const [notes, setNotes]           = useState(INITIAL_NOTES);
  const [folder, setFolder]         = useState("All Notes");
  const [selId, setSelId]           = useState(1);
  const [search, setSearch]         = useState("");
  const [searchOn, setSearchOn]     = useState(false);
  const editorRef                   = useRef(null);
  const nextId                      = useRef(2);

  const filtered = notes
    .filter(n => folder === "All Notes" || n.folder === folder)
    .filter(n => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.pinned - a.pinned) || (b.date - a.date));

  const sel = notes.find(n => n.id === selId);

  const createNote = () => {
    const n = { id: nextId.current++, title: "New Note", folder: ["All Notes","Recently Deleted"].includes(folder) ? "Notes" : folder, pinned: false, date: new Date(), body: "" };
    setNotes(p => [n, ...p]);
    setSelId(n.id);
    setTimeout(() => editorRef.current?.focus(), 60);
  };

  const deleteNote = id => {
    setNotes(p => p.filter(n => n.id !== id));
    setSelId(filtered.find(n => n.id !== id)?.id ?? null);
  };

  const updateNote = useCallback((id, body) => {
    const title = body.split("\n")[0]?.trim() || "New Note";
    setNotes(p => p.map(n => n.id === id ? { ...n, body, title, date: new Date() } : n));
  }, []);

  const togglePin = id => setNotes(p => p.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));

  const pinned   = filtered.filter(n => n.pinned);
  const unpinned = filtered.filter(n => !n.pinned);

  return (
    <div style={{ display:"flex", height:"100%", fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif", overflow:"hidden" }}>

      {/* ═══ SIDEBAR ═══ */}
      <div style={{ width:180, flexShrink:0, display:"flex", flexDirection:"column",
        background:"rgba(237,230,195,0.98)", borderRight:"1px solid rgba(0,0,0,0.1)" }}>

        <div style={{ padding:"12px 12px 6px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#a08828", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>
            Folders
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"0 8px" }}>
          {FOLDERS.map(f => {
            const count = f.id === "All Notes" ? notes.length : notes.filter(n => n.folder === f.id).length;
            return <FolderRow key={f.id} f={f} active={folder===f.id} count={count} onClick={() => setFolder(f.id)} />;
          })}
        </div>

        <div style={{ padding:"10px 12px 12px", borderTop:"1px solid rgba(0,0,0,0.07)" }}>
          <AddBtn onClick={createNote} />
        </div>
      </div>

      {/* ═══ NOTE LIST ═══ */}
      <div style={{ width:220, flexShrink:0, display:"flex", flexDirection:"column",
        background:"rgba(248,241,210,0.99)", borderRight:"1px solid rgba(0,0,0,0.1)" }}>

        {/* search */}
        <div style={{ padding:"9px 10px 7px", borderBottom:"1px solid rgba(0,0,0,0.07)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, height:26,
            background: searchOn ? "rgba(0,0,0,0.09)" : "rgba(0,0,0,0.06)",
            borderRadius:7, padding:"0 8px",
            border: searchOn ? "1px solid rgba(180,140,0,0.4)" : "1px solid transparent",
            transition:"all 0.15s" }}>
            <Svg d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" size={12} color="#999" />
            <input value={search} onChange={e=>setSearch(e.target.value)}
              onFocus={()=>setSearchOn(true)} onBlur={()=>setSearchOn(false)}
              placeholder="Search" style={{ flex:1, border:"none", background:"transparent",
                outline:"none", fontSize:12.5, color:"#333", fontFamily:"inherit" }} />
            {search && <button onClick={()=>setSearch("")} style={{ border:"none", background:"none",
              cursor:"default", padding:0, fontSize:13, color:"#aaa", lineHeight:1 }}>×</button>}
          </div>
        </div>

        {/* list */}
        <div style={{ flex:1, overflowY:"auto" }}>
          {pinned.length > 0 && <>
            <GroupLabel label="Pinned" />
            {pinned.map(n => <NoteRow key={n.id} note={n} sel={selId===n.id} onSel={()=>setSelId(n.id)} onDel={()=>deleteNote(n.id)} onPin={()=>togglePin(n.id)} />)}
            {unpinned.length > 0 && <GroupLabel label="Notes" />}
          </>}
          {unpinned.map(n => <NoteRow key={n.id} note={n} sel={selId===n.id} onSel={()=>setSelId(n.id)} onDel={()=>deleteNote(n.id)} onPin={()=>togglePin(n.id)} />)}
          {filtered.length === 0 && <div style={{ padding:32, textAlign:"center", color:"#bba040", fontSize:13 }}>No notes</div>}
        </div>
      </div>

      {/* ═══ EDITOR ═══ */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, background:"#fdf7df" }}>
        {sel ? <>
          <Toolbar note={sel} onDel={()=>deleteNote(sel.id)} onPin={()=>togglePin(sel.id)} />
          <textarea
            ref={editorRef}
            value={sel.body}
            onChange={e => updateNote(sel.id, e.target.value)}
            style={{
              flex:1, width:"100%", border:"none", outline:"none",
              background:"#fdf7df", resize:"none",
              padding:"20px 48px", boxSizing:"border-box",
              fontFamily:"'Georgia','Times New Roman',serif",
              fontSize:15, lineHeight:1.85, color:"#1a1000",
              caretColor:"#b8900a",
            }}
          />
        </> : (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14 }}>
            <Svg d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" size={40} color="rgba(160,130,0,0.25)" sw={1.2} />
            <div style={{ fontSize:14, color:"rgba(120,90,0,0.35)", fontWeight:500 }}>No note selected</div>
            <AddBtn onClick={createNote} inline />
          </div>
        )}
      </div>
    </div>
  );
}

function FolderRow({ f, active, count, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 8px", borderRadius:7,
        marginBottom:1, cursor:"default", transition:"background 0.1s",
        background: active ? "rgba(180,140,0,0.18)" : hov ? "rgba(0,0,0,0.05)" : "transparent",
        fontWeight: active ? 600 : 400, fontSize:13,
        color: active ? "#7a5e00" : hov ? "#4a3800" : "#6b5200" }}>
      <Svg d={f.icon} size={14} color={active ? "#a07800" : "#9a8448"} sw={1.5} />
      <span style={{ flex:1 }}>{f.label}</span>
      <span style={{ fontSize:11, opacity:0.5 }}>{count}</span>
    </div>
  );
}

function GroupLabel({ label }) {
  return <div style={{ padding:"7px 14px 3px", fontSize:10.5, fontWeight:700, color:"#b8983a", textTransform:"uppercase", letterSpacing:"0.07em" }}>{label}</div>;
}

function NoteRow({ note, sel, onSel, onDel, onPin }) {
  const [hov, setHov] = useState(false);
  const lines = note.body.split("\n").filter(l => l.trim());
  const preview = lines.slice(1).join(" ") || "No additional text";
  return (
    <div onClick={onSel} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ padding:"9px 12px 8px", borderBottom:"0.5px solid rgba(0,0,0,0.07)", cursor:"default",
        background: sel ? "rgba(200,160,0,0.16)" : hov ? "rgba(0,0,0,0.04)" : "transparent",
        borderLeft: sel ? "3px solid #c8a000" : "3px solid transparent",
        transition:"background 0.1s" }}>
      <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:2 }}>
        {note.pinned && <Svg d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" size={10} color="#c8a000" sw={2} />}
        <span style={{ flex:1, fontSize:13, fontWeight:600, color: sel ? "#5a3e00" : "#2a1e00",
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{note.title}</span>
        {hov && <div style={{ display:"flex", gap:1 }}>
          <SmBtn icon="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" onClick={e=>{e.stopPropagation();onPin();}} />
          <SmBtn icon="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" onClick={e=>{e.stopPropagation();onDel();}} />
        </div>}
      </div>
      <div style={{ display:"flex", gap:6 }}>
        <span style={{ fontSize:11, color:"#b8983a", fontWeight:500, flexShrink:0 }}>{formatDate(note.date)}</span>
        <span style={{ fontSize:11.5, color:"#9a8448", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{preview}</span>
      </div>
    </div>
  );
}

function SmBtn({ icon, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ width:20, height:20, border:"none", borderRadius:4, cursor:"default",
        background: hov ? "rgba(0,0,0,0.12)" : "transparent",
        display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.1s" }}>
      <Svg d={icon} size={11} color="#7a6020" />
    </button>
  );
}

function Toolbar({ note, onDel, onPin }) {
  const btns = [
    { d:"M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z", title: note.pinned?"Unpin":"Pin", fn:onPin },
    { d:"M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z", title:"Share" },
    { d:"M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", title:"Lock" },
    { d:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", title:"Checklist" },
    { d:"M4 6h16M4 10h16M4 14h16M4 18h7", title:"Format" },
    { d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16", title:"Delete", fn:onDel },
  ];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:1, padding:"4px 10px",
      background:"rgba(245,235,185,0.97)", borderBottom:"1px solid rgba(0,0,0,0.09)", flexShrink:0 }}>
      {btns.map(b => <TBtn key={b.title} {...b} />)}
      <div style={{ flex:1 }} />
      <span style={{ fontSize:11, color:"rgba(100,75,0,0.45)", fontWeight:500 }}>{formatDate(note.date)}</span>
    </div>
  );
}

function TBtn({ d, title, fn }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={fn} title={title} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ width:30, height:27, border:"none", borderRadius:6, cursor:"default",
        background: hov && fn ? "rgba(0,0,0,0.08)" : "transparent",
        display:"flex", alignItems:"center", justifyContent:"center",
        opacity: fn ? 1 : 0.3, transition:"background 0.1s" }}>
      <Svg d={d} size={15} color="#6b5000" sw={1.6} />
    </button>
  );
}

function AddBtn({ onClick, inline }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ width: inline ? "auto" : "100%", padding: inline ? "7px 20px" : "6px 0",
        border:"1px solid rgba(180,140,0,0.3)", borderRadius:8,
        background: hov ? "rgba(180,140,0,0.18)" : "rgba(180,140,0,0.09)",
        color:"#7a5e00", fontSize:13, fontWeight:600, cursor:"default",
        display:"flex", alignItems:"center", justifyContent:"center", gap:5,
        transition:"all 0.12s" }}>
      <Svg d="M12 4v16m8-8H4" size={13} color="#7a5e00" sw={2.5} />
      New Note
    </button>
  );
}