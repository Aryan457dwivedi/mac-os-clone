import { useState, useRef } from "react";

/* ── CSS injected once ─────────────────────────────────────────────────── */
const STYLE = `
  .cal-app * { box-sizing: border-box; }
  .cal-day-cell { transition: background 0.15s ease, color 0.15s ease; }
  .cal-day-cell:hover { background: rgba(0,0,0,0.055) !important; }
  .cal-folder-row { transition: background 0.15s ease; }
  .cal-folder-row:hover { background: rgba(0,0,0,0.05) !important; }
  .cal-hour-row { transition: background 0.15s ease; }
  .cal-hour-row:hover { background: rgba(0,122,255,0.035) !important; }
  .cal-hour-row:hover .cal-hour-label { color: #007aff !important; }
  .cal-event-chip { transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease; cursor: default; }
  .cal-event-chip:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 6px 20px rgba(0,0,0,0.2) !important; }
  .cal-event-chip:hover .chip-del { opacity: 1 !important; transform: scale(1) !important; }
  .chip-del { opacity: 0 !important; transform: scale(0.7) !important; transition: opacity 0.15s ease, transform 0.15s cubic-bezier(0.34,1.56,0.64,1); }
  .cal-icon-btn { transition: background 0.12s ease, transform 0.12s ease; }
  .cal-icon-btn:hover { background: rgba(0,0,0,0.08) !important; transform: scale(1.1); }
  .cal-icon-btn:active { transform: scale(0.92); }
  .cal-today-btn { transition: background 0.14s ease, transform 0.1s ease, box-shadow 0.14s ease; }
  .cal-today-btn:hover { background: #d93025 !important; box-shadow: 0 2px 10px rgba(255,59,48,0.4) !important; }
  .cal-today-btn:active { transform: scale(0.97); }
  .cal-new-btn { transition: background 0.14s ease, border-color 0.14s ease, box-shadow 0.14s ease; }
  .cal-new-btn:hover { background: rgba(0,122,255,0.09) !important; border-color: rgba(0,122,255,0.55) !important; box-shadow: 0 0 0 3px rgba(0,122,255,0.1); }
  .cal-add-btn { transition: background 0.12s ease, box-shadow 0.12s ease; }
  .cal-add-btn:hover { background: #0060c0 !important; box-shadow: 0 2px 8px rgba(0,100,200,0.35); }
  .cal-cancel-btn { transition: background 0.12s ease; }
  .cal-cancel-btn:hover { background: rgba(0,0,0,0.1) !important; }
  .cal-view-pill { transition: background 0.12s ease, color 0.12s ease; }
  .cal-view-pill:not(.active):hover { background: rgba(0,0,0,0.06) !important; color: #3c3c43 !important; }
  .cal-nav-arr:hover { background: rgba(0,0,0,0.07) !important; }
`;

const CALENDARS = [
  { name: "Home",      color: "#007aff" },
  { name: "Work",      color: "#34c759" },
  { name: "Personal",  color: "#ff9500" },
  { name: "Birthdays", color: "#ff2d55" },
  { name: "Holidays",  color: "#5856d6" },
];

const MONTH_NAMES = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const now = new Date();

function todayKey(d) { return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }
function fmt12(h) {
  if (h === 0)  return "12 AM";
  if (h < 12)   return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

const INITIAL_EVENTS = {
  [todayKey(now)]: [
    { id:1, t:"09:00", h:9,  title:"Morning Standup",  cal:"Work",     color:"#34c759" },
    { id:2, t:"11:00", h:11, title:"Design Review",    cal:"Work",     color:"#34c759" },
    { id:3, t:"13:00", h:13, title:"Lunch with Alex",  cal:"Personal", color:"#ff9500" },
    { id:4, t:"15:30", h:15, title:"1:1 with Manager", cal:"Work",     color:"#34c759" },
    { id:5, t:"17:00", h:17, title:"Sprint Planning",  cal:"Work",     color:"#34c759" },
  ],
};

function Svg({ d, size=14, color="currentColor", sw=1.7 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d={d}/>
    </svg>
  );
}

/* ── Main ────────────────────────────────────────────────────────────────── */
export default function CalendarApp() {
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [selDay,    setSelDay]    = useState({ d: now.getDate(), m: now.getMonth(), y: now.getFullYear() });
  const [events,    setEvents]    = useState(INITIAL_EVENTS);
  const [showForm,  setShowForm]  = useState(false);
  const [newTitle,  setNewTitle]  = useState("");
  const [newHour,   setNewHour]   = useState("9");
  const [newCal,    setNewCal]    = useState("Work");

  const isToday = (d,m,y) => d===now.getDate() && m===now.getMonth() && y===now.getFullYear();
  const isSel   = (d,m,y) => d===selDay.d && m===selDay.m && y===selDay.y;

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
  const cells = Array(42).fill(null).map((_, i) => {
    const d = i - firstDay + 1;
    return (d >= 1 && d <= daysInMonth) ? d : null;
  });

  const selKey    = `${selDay.y}-${selDay.m}-${selDay.d}`;
  const dayEvents = (events[selKey] || []).slice().sort((a,b) => a.t.localeCompare(b.t));

  const prevMonth = () => viewMonth===0 ? (setViewMonth(11), setViewYear(y=>y-1)) : setViewMonth(m=>m-1);
  const nextMonth = () => viewMonth===11 ? (setViewMonth(0), setViewYear(y=>y+1)) : setViewMonth(m=>m+1);
  const goToday   = () => {
    setViewMonth(now.getMonth()); setViewYear(now.getFullYear());
    setSelDay({ d:now.getDate(), m:now.getMonth(), y:now.getFullYear() });
  };

  const addEvent = () => {
    if (!newTitle.trim()) return;
    const cal = CALENDARS.find(c => c.name===newCal);
    const h = parseInt(newHour);
    const t = `${String(h).padStart(2,"0")}:00`;
    const ev = { id:Date.now(), t, h, title:newTitle.trim(), cal:newCal, color:cal?.color||"#007aff" };
    setEvents(prev => ({ ...prev, [selKey]: [...(prev[selKey]||[]), ev] }));
    setNewTitle(""); setShowForm(false);
  };

  const delEvent = id => setEvents(prev => ({ ...prev, [selKey]: (prev[selKey]||[]).filter(e=>e.id!==id) }));
  const hasEvents = (d,m,y) => !!(events[`${y}-${m}-${d}`]?.length);

  const selDateLabel = new Date(selDay.y, selDay.m, selDay.d)
    .toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });

  return (
    <div className="cal-app" style={{ display:"flex", height:"100%",
      fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif",
      overflow:"hidden", background:"#fff" }}>

      <style>{STYLE}</style>

      {/* ══ SIDEBAR ══ */}
      <div style={{ width:218, flexShrink:0, display:"flex", flexDirection:"column",
        background:"rgba(246,246,248,0.98)", borderRight:"0.5px solid rgba(0,0,0,0.1)" }}>

        {/* Today btn */}
        <div style={{ padding:"12px 14px 10px", borderBottom:"0.5px solid rgba(0,0,0,0.07)" }}>
          <button onClick={goToday} className="cal-today-btn"
            style={{ width:"100%", padding:"6px 0", borderRadius:8, fontSize:13, fontWeight:600,
              border:"none", background:"#ff3b30", color:"white", cursor:"default",
              fontFamily:"inherit", boxShadow:"0 1px 4px rgba(255,59,48,0.25)" }}>
            Today
          </button>
        </div>

        {/* Mini calendar */}
        <div style={{ padding:"10px 14px 6px" }}>
          <div style={{ display:"flex", alignItems:"center", marginBottom:8 }}>
            <span style={{ flex:1, fontSize:12.5, fontWeight:700, color:"#1c1c1e" }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button className="cal-nav-arr cal-icon-btn" onClick={prevMonth}
              style={{ width:22, height:22, border:"none", borderRadius:5, cursor:"default",
                background:"transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Svg d="M15 18l-6-6 6-6" size={12} color="#3c3c43" sw={2.2}/>
            </button>
            <button className="cal-nav-arr cal-icon-btn" onClick={nextMonth}
              style={{ width:22, height:22, border:"none", borderRadius:5, cursor:"default",
                background:"transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Svg d="M9 18l6-6-6-6" size={12} color="#3c3c43" sw={2.2}/>
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:3 }}>
            {["S","M","T","W","T","F","S"].map((d,i) => (
              <div key={i} style={{ textAlign:"center", fontSize:10, fontWeight:600,
                color: i===0||i===6 ? "#c7c7cc" : "#8e8e93" }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", rowGap:1 }}>
            {cells.map((d,i) => {
              if (!d) return <div key={i}/>;
              const today   = isToday(d, viewMonth, viewYear);
              const sel     = isSel(d, viewMonth, viewYear);
              const dot     = hasEvents(d, viewMonth, viewYear);
              const weekend = i%7===0 || i%7===6;
              return (
                <div key={i} className={today||sel ? "" : "cal-day-cell"}
                  onClick={() => setSelDay({ d, m:viewMonth, y:viewYear })}
                  style={{ textAlign:"center", lineHeight:"20px", height:20, borderRadius:5,
                    fontSize:11, fontWeight:today?700:400, cursor:"default",
                    position:"relative",
                    background: today ? "#ff3b30" : sel ? "rgba(0,122,255,0.15)" : "transparent",
                    color: today ? "white" : sel ? "#007aff" : weekend ? "#8e8e93" : "#1c1c1e" }}>
                  {d}
                  {dot && !today && (
                    <div style={{ position:"absolute", bottom:1, left:"50%", transform:"translateX(-50%)",
                      width:3, height:3, borderRadius:"50%",
                      background: sel ? "#007aff" : "#c7c7cc" }}/>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar list — no color boxes */}
        <div style={{ flex:1, overflowY:"auto", padding:"8px 14px 12px",
          borderTop:"0.5px solid rgba(0,0,0,0.07)" }}>
          <div style={{ fontSize:10.5, fontWeight:700, color:"#8e8e93",
            textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:7 }}>
            My Calendars
          </div>
          {CALENDARS.map(c => (
            <div key={c.name} className="cal-folder-row"
              style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 6px",
                borderRadius:6, cursor:"default" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:c.color, flexShrink:0 }}/>
              <span style={{ fontSize:12.5, color:"#1c1c1e" }}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ DAY VIEW ══ */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, background:"#fff" }}>

        {/* Header */}
        <div style={{ height:50, borderBottom:"0.5px solid rgba(0,0,0,0.09)", display:"flex",
          alignItems:"center", padding:"0 20px", gap:12, flexShrink:0,
          background:"rgba(252,252,254,0.97)" }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:600, color:"#1c1c1e", letterSpacing:"-0.01em" }}>
              {selDateLabel}
            </div>
            <div style={{ fontSize:11.5, color:"#8e8e93", marginTop:1 }}>
              {dayEvents.length===0 ? "No events" : `${dayEvents.length} event${dayEvents.length>1?"s":""}`}
            </div>
          </div>

          {/* View switcher */}
          <div style={{ display:"flex", background:"rgba(0,0,0,0.05)", borderRadius:8, padding:2, gap:1 }}>
            {["Day","Week","Month"].map(v => (
              <button key={v} className={`cal-view-pill${v==="Day"?" active":""}`}
                style={{ padding:"3px 10px", borderRadius:6, fontSize:12, fontWeight:500,
                  border:"none", cursor:"default", fontFamily:"inherit",
                  background: v==="Day" ? "white" : "transparent",
                  color: v==="Day" ? "#1c1c1e" : "#8e8e93",
                  boxShadow: v==="Day" ? "0 1px 3px rgba(0,0,0,0.12)" : "none" }}>
                {v}
              </button>
            ))}
          </div>

          <button onClick={() => { setShowForm(f=>!f); setNewTitle(""); }}
            className="cal-new-btn"
            style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px",
              borderRadius:8, border:"1px solid rgba(0,122,255,0.28)",
              background:"transparent", color:"#007aff", fontSize:13, fontWeight:600,
              cursor:"default", fontFamily:"inherit" }}>
            <Svg d="M12 4v16m8-8H4" size={13} color="#007aff" sw={2.5}/>
            New Event
          </button>
        </div>

        {/* New event form */}
        {showForm && (
          <div style={{ padding:"10px 20px", borderBottom:"0.5px solid rgba(0,0,0,0.08)",
            background:"rgba(246,246,248,0.98)", display:"flex", alignItems:"center",
            gap:8, flexShrink:0 }}>
            <input autoFocus value={newTitle} onChange={e=>setNewTitle(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter") addEvent(); if(e.key==="Escape") setShowForm(false); }}
              placeholder="Event title"
              style={{ flex:1, height:30, border:"1px solid rgba(0,122,255,0.4)", borderRadius:7,
                padding:"0 10px", fontSize:13, outline:"none", fontFamily:"inherit",
                background:"white", color:"#1c1c1e" }}/>
            <select value={newHour} onChange={e=>setNewHour(e.target.value)}
              style={{ height:30, border:"1px solid rgba(0,0,0,0.12)", borderRadius:7,
                padding:"0 6px", fontSize:12.5, outline:"none", background:"white",
                fontFamily:"inherit", color:"#1c1c1e", cursor:"default" }}>
              {HOURS.map(h=><option key={h} value={h}>{fmt12(h)}</option>)}
            </select>
            <select value={newCal} onChange={e=>setNewCal(e.target.value)}
              style={{ height:30, border:"1px solid rgba(0,0,0,0.12)", borderRadius:7,
                padding:"0 6px", fontSize:12.5, outline:"none", background:"white",
                fontFamily:"inherit", color:"#1c1c1e", cursor:"default" }}>
              {CALENDARS.map(c=><option key={c.name}>{c.name}</option>)}
            </select>
            <button onClick={addEvent} className="cal-add-btn"
              style={{ height:30, padding:"0 14px", borderRadius:7, border:"none",
                background:"#007aff", color:"white", fontSize:13, fontWeight:600,
                cursor:"default", fontFamily:"inherit" }}>
              Add
            </button>
            <button onClick={()=>setShowForm(false)} className="cal-cancel-btn"
              style={{ height:30, padding:"0 12px", borderRadius:7, border:"none",
                background:"rgba(0,0,0,0.05)", color:"#1c1c1e", fontSize:13,
                cursor:"default", fontFamily:"inherit" }}>
              Cancel
            </button>
          </div>
        )}

        {/* Hour grid */}
        <div style={{ flex:1, overflowY:"auto" }}>
          {HOURS.map(h => {
            const evs       = dayEvents.filter(e => e.h===h);
            const isNowHour = isToday(selDay.d, selDay.m, selDay.y) && now.getHours()===h;
            return (
              <div key={h} className="cal-hour-row"
                style={{ display:"flex", minHeight:56,
                  borderTop:`0.5px solid ${isNowHour?"rgba(255,59,48,0.3)":"rgba(0,0,0,0.06)"}`,
                  background: isNowHour ? "rgba(255,59,48,0.025)" : h%2===0 ? "white" : "rgba(0,0,0,0.005)" }}>
                <div className="cal-hour-label"
                  style={{ width:68, flexShrink:0, paddingTop:6, paddingRight:14,
                    textAlign:"right", fontSize:11, letterSpacing:"-0.01em",
                    color: isNowHour ? "#ff3b30" : "#8e8e93",
                    fontWeight: isNowHour ? 600 : 400,
                    transition:"color 0.15s ease" }}>
                  {fmt12(h)}
                </div>
                <div style={{ flex:1, padding:"5px 12px 5px 0", display:"flex",
                  flexWrap:"wrap", gap:5, alignContent:"flex-start" }}>
                  {evs.map(ev => <EventChip key={ev.id} ev={ev} onDel={()=>delEvent(ev.id)}/>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EventChip({ ev, onDel }) {
  return (
    <div className="cal-event-chip"
      style={{ display:"inline-flex", alignItems:"center", gap:6,
        background:ev.color, color:"white", borderRadius:8,
        padding:"4px 10px", fontSize:12.5, fontWeight:600,
        boxShadow:"0 1px 4px rgba(0,0,0,0.12)", userSelect:"none" }}>
      <div style={{ width:5, height:5, borderRadius:"50%",
        background:"rgba(255,255,255,0.45)", flexShrink:0 }}/>
      <span style={{ fontSize:11, opacity:0.82, fontWeight:400 }}>{ev.t}</span>
      <span>{ev.title}</span>
      <span style={{ fontSize:10.5, background:"rgba(0,0,0,0.15)", borderRadius:4,
        padding:"1px 5px", fontWeight:500 }}>{ev.cal}</span>
      <button onClick={e=>{ e.stopPropagation(); onDel(); }} className="chip-del"
        style={{ border:"none", background:"rgba(0,0,0,0.22)", color:"white",
          borderRadius:4, width:15, height:15, cursor:"default", fontSize:11,
          display:"flex", alignItems:"center", justifyContent:"center",
          padding:0, lineHeight:1, fontFamily:"inherit", flexShrink:0 }}>
        ×
      </button>
    </div>
  );
}