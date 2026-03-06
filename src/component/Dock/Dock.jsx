import { useMotionValue } from "framer-motion";
import { DockContainer, DockSeparator } from "./Style.jsx";
import { AppIcon } from "./Appicon.jsx";

const ICON_SIZE = 58;

const ICON_URLS = {
  finder:     "/Finder Beta 10.png",
  safari:     "/Safari.png",
  messages:   "/Messages.png",
  calculator: "/Calculator_transparent.png",
  notes:      "/Notes.png",
  music:      "/Music Beta 3.png",
  facetime:   "/FaceTime Beta 7.png",
  photos:     "/Photos.png",
  maps:       "/Maps.png",
  calendar:   "/Calendar.png",
  settings:   "/System Preferences.png",
  trash:      "/Trash.png",
  games:      "/gnomesudoku_104207.png",
  github:     "/github_macos_bigsur_icon_190140.png",
};

export function Dock({
  apps,
  openApp,
  openWins,
  minWins,
  onRestore,
  dockRef,
  dockIconRefsMap,
  getAppIcon,
  IconTrash,
  themeColor = "Dark",
}) {
  const mouseX = useMotionValue(Infinity);

  const allItems = [
    ...apps.map(a  => ({ type: "app",   data: a, key: a.id })),
    ...(minWins.length > 0 ? [{ type: "sep", key: "sep" }] : []),
    ...minWins.map(w => ({ type: "min",   data: w, key: "min-" + w.id })),
    { type: "trash", key: "trash" },
  ];

  const rendered = allItems.map((item, index) => {
    if (item.type === "sep") return <DockSeparator key="sep" />;

    const label   = item.type === "trash" ? "Trash" : item.data.name;
    const showDot = item.type === "app" && openWins.some(w => w.id === item.data.id);
    const appId   = item.type === "trash" ? "trash" : item.data.id;
    const iconUrl = ICON_URLS[appId];

    const dockItem = {
      id:   appId,
      name: label,
      type: item.type,
      src:  iconUrl || undefined,
      icon: iconUrl ? null : (item.type === "trash" ? <IconTrash size={ICON_SIZE} /> : getAppIcon(appId, ICON_SIZE)),
    };

    return (
      <div
        key={item.key}
        ref={el => {
          if (item.type === "min" && el && dockIconRefsMap)
            dockIconRefsMap.current[item.data.id] = el;
        }}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <AppIcon
          key={index}
          mouseX={mouseX}
          item={dockItem}
          onAppClick={() => {
            if (item.type === "app") openApp(item.data);
            if (item.type === "min") onRestore(item.data.id);
          }}
        />

        {item.type === "min" && (
          <div style={{
            position: "absolute",
            bottom: 6, right: 4,
            width: 9, height: 9,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.85)",
            border: "1.5px solid rgba(0,0,0,0.2)",
            pointerEvents: "none",
          }} />
        )}

        <div style={{
          width: 4, height: 4,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.9)",
          marginTop: 1,
          opacity: showDot ? 1 : 0,
          transition: "opacity 0.2s",
          flexShrink: 0,
        }} />
      </div>
    );
  });

  return (
    <div style={{
      position: "absolute",
      bottom: 8,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 99980,
      userSelect: "none",
    }}>
      <DockContainer
        ref={dockRef}
        $themeColor={themeColor}
        onMouseMove={e => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        {rendered}
      </DockContainer>
    </div>
  );
}