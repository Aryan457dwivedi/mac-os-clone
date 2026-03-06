import { useState, useCallback } from "react";

const CSS = `
  .calc-btn {
    display: flex; align-items: center; justify-content: center;
    border-radius: 50%; cursor: default; user-select: none;
    font-family: -apple-system, 'SF Pro Display', sans-serif;
    letter-spacing: -0.02em; border: none; outline: none;
    transition: filter 0.06s ease;
    -webkit-font-smoothing: antialiased;
  }
  .calc-btn:active { filter: brightness(1.4) !important; }
  .calc-btn-dark   { background: #505050; color: white; }
  .calc-btn-light  { background: #d4d4d2; color: #1c1c1e; }
  .calc-btn-orange { background: #ff9f0a; color: white; }
  .calc-btn-dark:hover   { filter: brightness(1.25); }
  .calc-btn-light:hover  { filter: brightness(0.9); }
  .calc-btn-orange:hover { filter: brightness(1.18); }
  .calc-btn-orange.op-active { background: white; color: #ff9f0a; }
  .calc-zero {
    border-radius: 9999px !important;
    justify-content: flex-start !important;
    padding-left: 7% !important;
  }
`;

const fmt = (n) => {
  if (!isFinite(n) || isNaN(n)) return "Error";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= 1e10 || abs < 1e-6)) {
    return parseFloat(n.toPrecision(9)).toExponential();
  }
  const s = parseFloat(n.toPrecision(10)).toString();
  const [int, dec] = s.split(".");
  const intFmt = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec !== undefined ? `${intFmt}.${dec}` : intFmt;
};

export default function CalculatorApp() {
  const [display,   setDisplay]   = useState("0");
  const [prev,      setPrev]      = useState(null);
  const [op,        setOp]        = useState(null);
  const [waitNext,  setWaitNext]  = useState(false);
  const [opActive,  setOpActive]  = useState(null);

  const raw = display.replace(/,/g, "");
  const len = raw.replace("-","").replace(".","").length;
  const dispFontSize = len > 9 ? 38 : len > 7 ? 48 : len > 5 ? 58 : 70;

  const pressNum = useCallback((n) => {
    if (waitNext) {
      setDisplay(n === "." ? "0." : n);
      setWaitNext(false);
      return;
    }
    if (n === "." && display.includes(".")) return;
    if (display === "0" && n !== ".") setDisplay(n);
    else if (raw.replace("-","").length < 9) setDisplay(d => d + n);
  }, [display, raw, waitNext]);

  const doCalc = (a, b, o) => {
    if (o === "+") return a + b;
    if (o === "−") return a - b;
    if (o === "×") return a * b;
    if (o === "÷") return b === 0 ? Infinity : a / b;
    return b;
  };

  const pressOp = useCallback((o) => {
    const cur = parseFloat(raw);
    if (prev !== null && !waitNext) {
      const res = doCalc(prev, cur, op);
      setDisplay(fmt(res));
      setPrev(res);
    } else {
      setPrev(cur);
    }
    setOp(o); setOpActive(o); setWaitNext(true);
  }, [raw, prev, op, waitNext]);

  const pressEquals = useCallback(() => {
    if (op === null || prev === null) return;
    const res = doCalc(prev, parseFloat(raw), op);
    setDisplay(fmt(res));
    setPrev(null); setOp(null); setOpActive(null); setWaitNext(true);
  }, [raw, prev, op]);

  const pressClear = useCallback(() => {
    setDisplay("0"); setPrev(null); setOp(null); setOpActive(null); setWaitNext(false);
  }, []);

  const isClear = display === "0" && prev === null && op === null;

  const Btn = ({ label, type = "dark", wide = false, active = false, onPress }) => (
    <button
      className={`calc-btn calc-btn-${type}${active ? " op-active" : ""}${wide ? " calc-zero" : ""}`}
      style={{ width: wide ? "100%" : "100%", height: "100%", fontSize: "clamp(16px, 2.2vh, 28px)", fontWeight: 400 }}
      onMouseDown={e => { e.preventDefault(); onPress(); }}
    >
      {label}
    </button>
  );

  return (
    <div style={{
      width: "100%", height: "100%",
      background: "#1c1c1e",
      display: "flex", flexDirection: "column",
      fontFamily: "-apple-system,'SF Pro Display',sans-serif",
      overflow: "hidden",
      padding: "0 12px 12px",
      gap: 0,
    }}>
      <style>{CSS}</style>

      {/* Display */}
      <div style={{
        flex: "0 0 28%",
        display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
        paddingBottom: 8, paddingRight: 4,
      }}>
        <div style={{
          color: "white",
          fontSize: dispFontSize,
          fontWeight: 200,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          fontFamily: "-apple-system,'SF Pro Display',sans-serif",
          WebkitFontSmoothing: "antialiased",
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {display}
        </div>
      </div>

      {/* Button grid */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gridTemplateRows: "repeat(5, 1fr)",
        gap: 10,
      }}>
        {/* Row 1 */}
        <Btn label={isClear ? "AC" : "C"} type="light" onPress={pressClear} />
        <Btn label="+/−"  type="light"  onPress={() => setDisplay(d => fmt(parseFloat(d.replace(/,/g,"")) * -1))} />
        <Btn label="%"    type="light"  onPress={() => setDisplay(d => fmt(parseFloat(d.replace(/,/g,"")) / 100))} />
        <Btn label="÷"    type="orange" active={opActive === "÷"} onPress={() => pressOp("÷")} />

        {/* Row 2 */}
        <Btn label="7" onPress={() => pressNum("7")} />
        <Btn label="8" onPress={() => pressNum("8")} />
        <Btn label="9" onPress={() => pressNum("9")} />
        <Btn label="×" type="orange" active={opActive === "×"} onPress={() => pressOp("×")} />

        {/* Row 3 */}
        <Btn label="4" onPress={() => pressNum("4")} />
        <Btn label="5" onPress={() => pressNum("5")} />
        <Btn label="6" onPress={() => pressNum("6")} />
        <Btn label="−" type="orange" active={opActive === "−"} onPress={() => pressOp("−")} />

        {/* Row 4 */}
        <Btn label="1" onPress={() => pressNum("1")} />
        <Btn label="2" onPress={() => pressNum("2")} />
        <Btn label="3" onPress={() => pressNum("3")} />
        <Btn label="+" type="orange" active={opActive === "+"} onPress={() => pressOp("+")} />

        {/* Row 5 — 0 spans 2 cols, . , = */}
        <div style={{ gridColumn: "span 2", height: "100%" }}>
          <Btn label="0" wide onPress={() => pressNum("0")} />
        </div>
        <Btn label="." onPress={() => pressNum(".")} />
        <Btn label="=" type="orange" onPress={pressEquals} />
      </div>
    </div>
  );
}