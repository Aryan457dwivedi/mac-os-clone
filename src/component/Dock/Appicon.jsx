import { useRef } from "react";
import { useSpring, useTransform } from "framer-motion";
import { DockIcon, DockLink } from "./Style.jsx";

export function AppIcon({ mouseX, item, onAppClick }) {
  const ref = useRef(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [40, 58, 40]);
  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  if (item.type === "link" && item.link) {
    return (
      <DockLink href={item.link}>
        <DockIcon ref={ref} src={item.src} style={{ width }}>
          {item.icon}
        </DockIcon>
      </DockLink>
    );
  }

  return (
    <DockIcon ref={ref} src={item.src} style={{ width }} onClick={() => onAppClick && onAppClick(item)}>
      {item.icon}
    </DockIcon>
  );
}