import { forwardRef } from "react";
import { motion } from "framer-motion";

const lightBg     = "rgba(255,255,255,0.25)";
const lightBorder = "rgba(0,0,0,0.12)";

export const DockContainer = forwardRef(function DockContainer(
  { $themeColor, onMouseMove, onMouseLeave, children },
  ref
) {
  const isDark = $themeColor === "Dark";
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        margin: "0 auto",
        display: "flex",
        height: "3.2rem",
        alignItems: "flex-end",
        gap: 6,
        padding: "2px 10px 2px 10px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 20,
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        backgroundColor: isDark ? "rgba(0,0,0,0.25)" : lightBg,
        border: isDark
          ? "1px solid rgba(255,255,255,0.1)"
          : "1px solid " + lightBorder,
        transition: "background-color 0.2s ease, border 0.2s ease",
      }}
    >
      {children}
    </motion.div>
  );
});

export const DockIcon = forwardRef(function DockIcon(
  { src, style, onClick, children },
  ref
) {
  if (src) {
    return (
      <motion.img
        ref={ref}
        src={src}
        onClick={onClick}
        draggable={false}
        style={{ cursor: "pointer", display: "block", ...style }}
      />
    );
  }
  const { width, ...rest } = style || {};
  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      style={{
        cursor: "pointer",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: width,
        height: width,
        flexShrink: 0,
        ...rest,
      }}
    >
      {children}
    </motion.div>
  );
});

export function DockLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ marginBottom: -5, display: "flex" }}>
      {children}
    </a>
  );
}

export function DockSeparator() {
  return (
    <div style={{
      width: 1,
      height: 44,
      background: "rgba(255,255,255,0.3)",
      margin: "0 6px",
      alignSelf: "center",
      flexShrink: 0,
    }} />
  );
}