
"use client";

import { useState, type ReactNode } from "react";
import { calculateRigidCoupling } from "../src/lib/rigid-coupling";


import Coupling3D from "./components/Coupling3D";



type CouplingType = "rigid" | "flexible";

type DesignResults = ReturnType<typeof calculateRigidCoupling>;

type FlexibleCheckStatus = "PASS" | "FAIL" | "REVIEW REQUIRED";

type FlexibleDesignResults = {
  transmittedTorqueNm: number;
  designTorqueNm: number;
  angularMisalignmentDeg: number;
  ratedTorqueNm: number | null;
  maximumSpeedRPM: number | null;
  allowableAngularMisalignmentDeg: number | null;
  torqueStatus: FlexibleCheckStatus;
  speedStatus: FlexibleCheckStatus;
  misalignmentStatus: FlexibleCheckStatus;
};

const initialInputs = {
  power: "5",
  rpm: "1440",
  allowableStress: "40",
  serviceFactor: "1.5",
  misalignment: "0.5",
  // Enter these values from the selected coupling manufacturer's catalogue.
  // They are intentionally blank so the app does not invent ratings.
  flexibleRatedTorque: "",
  flexibleMaxSpeed: "",
  flexibleAllowableMisalignment: "",
  shaftDiameter: "20",
  hubDiameter: "35",
  hubLength: "30",
  keyWidth: "6",
  keyHeight: "6",
  allowableKeyShear: "30",
  allowableKeyBearing: "80",
  boltCount: "4",
  boltPCD: "60",
  boltDiameter: "6",
  allowableBoltShear: "40",
};

function Icon({
  name,
  size = 18,
}: {
  name: string;
  size?: number;
}) {
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4L7.3 15a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 2Z" /></>,
    activity: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
    box: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8M12 13v9" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m7 14 4-4 4 3 6-7" /></>,
    bot: <><rect x="4" y="7" width="16" height="13" rx="3" /><path d="M12 3v4M8 12h.01M16 12h.01M8 16h8" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    rotate: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></>,
    bolt: <path d="m13 2-3 9h7l-6 11 2-9H6l7-11Z" />,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.box}
    </svg>
  );
}

function CouplingModel({ type }: { type: CouplingType }) {
  return (
    <div className="model-stage">
      <div className="model-grid" />
      <div className="model-axis axis-x" />
      <div className="model-axis axis-y" />

      <svg
        viewBox="0 0 620 300"
        className="coupling-svg"
        role="img"
        aria-label={`${type} shaft coupling conceptual visualization`}
      >
        <defs>
          <linearGradient id="shaftMetal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B8C7D8" />
            <stop offset="28%" stopColor="#64788F" />
            <stop offset="55%" stopColor="#27394F" />
            <stop offset="78%" stopColor="#8FA2B6" />
            <stop offset="100%" stopColor="#35475B" />
          </linearGradient>
          <linearGradient id="flangeMetal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3B5067" />
            <stop offset="35%" stopColor="#9FB2C7" />
            <stop offset="65%" stopColor="#52677E" />
            <stop offset="100%" stopColor="#26394F" />
          </linearGradient>
          <linearGradient id="cyanMetal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8CF3F0" />
            <stop offset="45%" stopColor="#21B8C8" />
            <stop offset="100%" stopColor="#11647C" />
          </linearGradient>
          <radialGradient id="faceMetal" cx="30%" cy="25%" r="80%">
            <stop offset="0%" stopColor="#D5E3EF" />
            <stop offset="50%" stopColor="#72879E" />
            <stop offset="100%" stopColor="#293A4D" />
          </radialGradient>
          <filter id="modelShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        <ellipse
          cx="310"
          cy="236"
          rx="212"
          ry="17"
          fill="#000"
          opacity=".4"
          filter="url(#modelShadow)"
        />

        {/* Shaft sections */}
        <path d="M40 124 L238 124 L238 174 L40 174 Z" fill="url(#shaftMetal)" stroke="#A8BDCF" strokeOpacity=".45" />
        <path d="M382 124 L580 124 L580 174 L382 174 Z" fill="url(#shaftMetal)" stroke="#A8BDCF" strokeOpacity=".45" />
        <path d="M40 124 L238 124 L250 115 L52 115 Z" fill="#B5C5D5" opacity=".7" />
        <path d="M382 124 L580 124 L568 115 L370 115 Z" fill="#B5C5D5" opacity=".7" />

        {type === "rigid" ? (
          <>
            {/* Left and right flange halves */}
            <path d="M205 83 L245 83 L266 100 L266 198 L245 215 L205 215 Z" fill="url(#flangeMetal)" stroke="#B4C6D7" strokeWidth="1.4" />
            <path d="M205 83 L220 91 L220 207 L205 215 Z" fill="#C2D1DF" opacity=".55" />
            <path d="M355 83 L395 83 L395 215 L355 215 L334 198 L334 100 Z" fill="url(#flangeMetal)" stroke="#B4C6D7" strokeWidth="1.4" />
            <path d="M380 91 L395 83 L395 215 L380 207 Z" fill="#182A3D" opacity=".6" />
            <rect x="266" y="100" width="68" height="98" fill="#24384C" stroke="#AFC4D6" strokeWidth="1.4" />
            <path d="M270 104H330V194H270Z" fill="#536B83" opacity=".45" />
            {[105, 195].map((y) => (
              <g key={y}>
                <circle cx="239" cy={y} r="7" fill="#D6E1EB" stroke="#33485F" strokeWidth="2" />
                <circle cx="361" cy={y} r="7" fill="#D6E1EB" stroke="#33485F" strokeWidth="2" />
              </g>
            ))}
            {[128, 172].map((y) => (
              <g key={y}>
                <circle cx="239" cy={y} r="7" fill="#D6E1EB" stroke="#33485F" strokeWidth="2" />
                <circle cx="361" cy={y} r="7" fill="#D6E1EB" stroke="#33485F" strokeWidth="2" />
              </g>
            ))}
            <path d="M266 101H334M266 197H334" stroke="#AFC4D6" strokeWidth="1" opacity=".6" />
          </>
        ) : (
          <>
            {/* Two hubs and a flexible central insert */}
            <path d="M207 98 L246 98 L264 112 L264 186 L246 200 L207 200 Z" fill="url(#flangeMetal)" stroke="#B4C6D7" strokeWidth="1.5" />
            <path d="M356 98 L395 98 L395 200 L356 200 L338 186 L338 112 Z" fill="url(#flangeMetal)" stroke="#B4C6D7" strokeWidth="1.5" />
            <path d="M264 112 L282 105 L338 105 L338 193 L282 193 L264 186 Z" fill="url(#cyanMetal)" stroke="#8CF3F0" strokeWidth="1.3" />
            <path d="M282 105V193M320 105V193" stroke="#B6FFF8" strokeWidth="2" opacity=".65" />
            <path d="M280 120H322M280 178H322" stroke="#07596C" strokeWidth="3" opacity=".7" />
            {[115, 183].map((y) => (
              <g key={y}>
                <circle cx="237" cy={y} r="6" fill="#D6E1EB" stroke="#33485F" strokeWidth="2" />
                <circle cx="365" cy={y} r="6" fill="#D6E1EB" stroke="#33485F" strokeWidth="2" />
              </g>
            ))}
          </>
        )}

        {/* Front faces */}
        <ellipse cx="205" cy="149" rx="13" ry="66" fill="url(#faceMetal)" stroke="#D0DEEA" strokeWidth="1.3" />
        <ellipse cx="395" cy="149" rx="13" ry="66" fill="url(#faceMetal)" stroke="#D0DEEA" strokeWidth="1.3" />
        <ellipse cx="205" cy="149" rx="5" ry="34" fill="#24364B" stroke="#8FA5BA" strokeWidth="1" />
        <ellipse cx="395" cy="149" rx="5" ry="34" fill="#24364B" stroke="#8FA5BA" strokeWidth="1" />

        {/* Technical callouts */}
        <g fill="#A9BACD" fontSize="10" fontFamily="monospace">
          <path d="M235 72V48H168" fill="none" stroke="#658198" strokeDasharray="3 3" />
          <text x="166" y="42" textAnchor="middle">HUB</text>
          <path d="M310 100V54H383" fill="none" stroke="#658198" strokeDasharray="3 3" />
          <text x="386" y="48">{type === "rigid" ? "FLANGE" : "FLEX ELEMENT"}</text>
          <path d="M450 151H512V189" fill="none" stroke="#658198" strokeDasharray="3 3" />
          <text x="512" y="202" textAnchor="middle">SHAFT</text>
        </g>
        <path d="M58 149H560" stroke="#2AD5D0" strokeWidth="1" strokeDasharray="5 7" opacity=".3" />
      </svg>

      <div className="viewport-tag"><span className="live-dot" /> CONCEPT MODEL</div>
      <div className="viewport-coordinates">X 000.00&nbsp; Y 000.00&nbsp; Z 000.00</div>
      <div className="viewport-controls">
        <span>◉ Orbit</span><span>＋ Zoom</span><span>⌗ Grid</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [type, setType] = useState<CouplingType>("rigid");
  const [inputs, setInputs] = useState(initialInputs);
  const [results, setResults] = useState<DesignResults | null>(null);
  const [flexibleResults, setFlexibleResults] = useState<FlexibleDesignResults | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");

  function updateInput(name: keyof typeof initialInputs, value: string) {
    setInputs((previous) => ({ ...previous, [name]: value }));
  }

  function calculate() {
    const power = Number(inputs.power);
    const rpm = Number(inputs.rpm);
    const serviceFactor = Number(inputs.serviceFactor);

    // Flexible coupling: calculate torque and compare it only with manufacturer
    // limits explicitly entered by the user. Missing catalogue values remain REVIEW REQUIRED.
    if (type === "flexible") {
      const misalignment = Number(inputs.misalignment);
      const ratedTorque = inputs.flexibleRatedTorque.trim() === "" ? null : Number(inputs.flexibleRatedTorque);
      const maximumSpeed = inputs.flexibleMaxSpeed.trim() === "" ? null : Number(inputs.flexibleMaxSpeed);
      const allowableMisalignment = inputs.flexibleAllowableMisalignment.trim() === "" ? null : Number(inputs.flexibleAllowableMisalignment);

      if (
        !Number.isFinite(power) || power <= 0 ||
        !Number.isFinite(rpm) || rpm <= 0 ||
        !Number.isFinite(serviceFactor) || serviceFactor < 1 ||
        !Number.isFinite(misalignment) || misalignment < 0 ||
        (ratedTorque !== null && (!Number.isFinite(ratedTorque) || ratedTorque <= 0)) ||
        (maximumSpeed !== null && (!Number.isFinite(maximumSpeed) || maximumSpeed <= 0)) ||
        (allowableMisalignment !== null && (!Number.isFinite(allowableMisalignment) || allowableMisalignment < 0))
      ) {
        setError("Enter positive power and speed, a service factor of at least 1, non-negative misalignment, and valid positive manufacturer ratings when provided.");
        setFlexibleResults(null);
        setResults(null);
        return;
      }

      const transmittedTorqueNm = (9550 * power) / rpm;
      const designTorqueNm = transmittedTorqueNm * serviceFactor;
      setFlexibleResults({
        transmittedTorqueNm,
        designTorqueNm,
        angularMisalignmentDeg: misalignment,
        ratedTorqueNm: ratedTorque,
        maximumSpeedRPM: maximumSpeed,
        allowableAngularMisalignmentDeg: allowableMisalignment,
        torqueStatus: ratedTorque === null ? "REVIEW REQUIRED" : designTorqueNm <= ratedTorque ? "PASS" : "FAIL",
        speedStatus: maximumSpeed === null ? "REVIEW REQUIRED" : rpm <= maximumSpeed ? "PASS" : "FAIL",
        misalignmentStatus: allowableMisalignment === null ? "REVIEW REQUIRED" : misalignment <= allowableMisalignment ? "PASS" : "FAIL",
      });
      setResults(null);
      setError("");
      return;
    }

    setFlexibleResults(null);

    const allowableStress = Number(inputs.allowableStress);
    const diameter = Number(inputs.shaftDiameter);
    const numericInputs = [
      power,
      rpm,
      allowableStress,
      serviceFactor,
      diameter,
      Number(inputs.hubDiameter),
      Number(inputs.hubLength),
      Number(inputs.keyWidth),
      Number(inputs.keyHeight),
      Number(inputs.allowableKeyShear),
      Number(inputs.allowableKeyBearing),
      Number(inputs.boltCount),
      Number(inputs.boltPCD),
      Number(inputs.boltDiameter),
      Number(inputs.allowableBoltShear),
    ];

    if (
      !numericInputs.every((value) => Number.isFinite(value) && value > 0) ||
      serviceFactor < 1 ||
      !Number.isInteger(Number(inputs.boltCount))
    ) {
      setError("Enter valid positive values for every dimension and stress. The service factor must be at least 1, and bolt count must be a positive whole number.");
      setResults(null);
      return;
    }

    try {
      const calculated = calculateRigidCoupling({
        powerKW: power,
        speedRPM: rpm,
        serviceFactor,
        allowableShaftShearMPa: allowableStress,
        shaftDiameterMM: diameter,
        hubDiameterMM: Number(inputs.hubDiameter),
        hubLengthMM: Number(inputs.hubLength),
        keyWidthMM: Number(inputs.keyWidth),
        keyHeightMM: Number(inputs.keyHeight),
        allowableKeyShearMPa: Number(inputs.allowableKeyShear),
        allowableKeyBearingMPa: Number(inputs.allowableKeyBearing),
        boltCount: Number(inputs.boltCount),
        boltPCDMM: Number(inputs.boltPCD),
        boltDiameterMM: Number(inputs.boltDiameter),
        allowableBoltShearMPa: Number(inputs.allowableBoltShear),
      });

      setError("");
      setResults(calculated);
    } catch (err) {
      setResults(null);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to calculate this design. Check all input values."
      );
    }
  }

  function reset() {
    setInputs(initialInputs);
    setResults(null);
    setFlexibleResults(null);
    setError("");
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Icon name="activity" size={25} /></div>
          <div className="brand-name">COUPLING<span>LAB</span><small>ENGINEERING STUDIO</small></div>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          <button className={`nav-item ${activeTab === "Overview" ? "active" : ""}`} onClick={() => { setActiveTab("Overview"); document.getElementById("overview")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}><Icon name="grid" /> Overview {activeTab === "Overview" && <span className="nav-indicator" />}</button>
          <button className={`nav-item ${activeTab === "Design Studio" ? "active" : ""}`} onClick={() => { setActiveTab("Design Studio"); document.getElementById("design-studio")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}><Icon name="settings" /> Design Studio {activeTab === "Design Studio" && <span className="nav-indicator" />}</button>
          <button className={`nav-item ${activeTab === "Analysis" ? "active" : ""}`} onClick={() => { setActiveTab("Analysis"); document.getElementById("analysis")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}><Icon name="chart" /> Analysis {activeTab === "Analysis" && <span className="nav-indicator" />}</button>
          <button className={`nav-item ${activeTab === "AI Assistant" ? "active" : ""}`} onClick={() => { setActiveTab("AI Assistant"); document.getElementById("ai-assistant")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}><Icon name="bot" /> AI Assistant <span className="soon-badge">AI</span>{activeTab === "AI Assistant" && <span className="nav-indicator" />}</button>
        </nav>

        <div className="sidebar-divider" />
        <div className="workspace-label">DESIGN LIBRARY</div>
        <button className="library-item" onClick={() => { setType("rigid"); setResults(null); setFlexibleResults(null); setError(""); }}><span className="library-icon">R</span><span>Rigid coupling<small>Flange assembly</small></span><span className="library-arrow">↗</span></button>
        <button className="library-item" onClick={() => { setType("flexible"); setResults(null); setFlexibleResults(null); setError(""); }}><span className="library-icon cyan">F</span><span>Flexible coupling<small>Elastomer insert</small></span><span className="library-arrow">↗</span></button>

        <div className="sidebar-bottom">
          <div className="system-status"><span className="live-dot" /> CALCULATION ENGINE <b>READY</b></div>
          <div className="profile-row"><div className="profile-avatar">ME</div><div>Engineering Workspace<small>Local design session</small></div><span className="profile-menu">•••</span></div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">Workspace <span>/</span> Coupling design <span>/</span> <b>{activeTab}</b></div>
          <div className="topbar-right"><span className="saved-indicator"><span className="live-dot" /> LOCAL SESSION</span><button className="icon-button" title="Reset design" onClick={reset}><Icon name="rotate" /></button><div className="top-avatar">ME</div></div>
        </header>

        <div className="page-content">
          <section id="overview" className="page-heading">
            <div><div className="eyebrow"><span className="eyebrow-line" /> MACHINE DESIGN / VIRTUAL LAB</div><h1>Coupling Design <span>Studio.</span></h1><p>Design, calculate and evaluate industrial shaft couplings in one engineering workspace.</p></div>
            <div className="revision-chip"><span className="revision-dot" /><div>DESIGN SESSION<small>REV 01 · PRELIMINARY</small></div></div>
          </section>

          <section className="metric-grid">
            <article className="metric-card"><div className="metric-top"><span>TRANSMITTED POWER</span><Icon name="bolt" /></div><div className="metric-value">{inputs.power}<small> kW</small></div><div className="metric-foot">Input parameter <span>↗</span></div></article>
            <article className="metric-card"><div className="metric-top"><span>SHAFT SPEED</span><Icon name="activity" /></div><div className="metric-value">{Number(inputs.rpm).toLocaleString("en-IN")}<small> rpm</small></div><div className="metric-foot">Rotational speed</div></article>
            <article className="metric-card"><div className="metric-top"><span>DESIGN TORQUE</span><Icon name="rotate" /></div><div className="metric-value">{type === "rigid" ? (results ? results.designTorqueNm.toFixed(2) : "—") : (flexibleResults ? flexibleResults.designTorqueNm.toFixed(2) : "—")}<small> N·m</small></div><div className="metric-foot">{(type === "rigid" ? results : flexibleResults) ? "Calculated result" : "Awaiting calculation"}</div></article>
            <article className="metric-card accent-card"><div className="metric-top"><span>REQUIRED SHAFT Ø</span><Icon name="check" /></div><div className="metric-value">{type === "rigid" && results ? results.requiredShaftDiameterMM.toFixed(2) : "—"}<small> mm</small></div><div className="metric-foot">{type === "flexible" ? "Not sized in flexible mode" : results ? "Preliminary sizing" : "Awaiting calculation"}</div></article>
          </section>

          <section className="workspace-grid">
            <div id="design-studio" className="panel design-panel">
              <div className="panel-heading"><div><div className="panel-kicker">01 / CONFIGURATION</div><h2>Design parameters</h2></div><span className="step-number">01</span></div>

              <div className="field-label">COUPLING ARCHITECTURE</div>
              <div className="coupling-selector">
                <button className={`coupling-option ${type === "rigid" ? "selected" : ""}`} onClick={() => { setType("rigid"); setResults(null); setFlexibleResults(null); setError(""); }}><span className="option-visual rigid-mini"><i /><i /></span><span>Rigid<small>Flange type</small></span><span className="radio-dot" /></button>
                <button className={`coupling-option ${type === "flexible" ? "selected" : ""}`} onClick={() => { setType("flexible"); setResults(null); setFlexibleResults(null); setError(""); }}><span className="option-visual flexible-mini"><i /><i /><i /></span><span>Flexible<small>Elastomeric type</small></span><span className="radio-dot" /></button>
              </div>

              <div className="section-rule"><span>OPERATING CONDITIONS</span><i /></div>
              <div className="input-grid">
                <label className="input-field"><span>Transmitted power <b>*</b></span><div className="input-wrap"><input type="number" min="0.01" step="0.1" value={inputs.power} onChange={(e) => updateInput("power", e.target.value)} /><em>kW</em></div></label>
                <label className="input-field"><span>Shaft speed <b>*</b></span><div className="input-wrap"><input type="number" min="1" step="10" value={inputs.rpm} onChange={(e) => updateInput("rpm", e.target.value)} /><em>rpm</em></div></label>
                <label className="input-field"><span>Service factor <b>*</b></span><div className="input-wrap"><input type="number" min="1" step="0.1" value={inputs.serviceFactor} onChange={(e) => updateInput("serviceFactor", e.target.value)} /><em>SF</em></div></label>

                {type === "rigid" ? (
                  <>
                    <label className="input-field"><span>Allowable shaft shear stress <b>*</b></span><div className="input-wrap"><input type="number" min="0.1" step="1" value={inputs.allowableStress} onChange={(e) => updateInput("allowableStress", e.target.value)} /><em>MPa</em></div></label>
                    <label className="input-field"><span>Selected shaft diameter <b>*</b></span><div className="input-wrap"><input type="number" min="1" step="1" value={inputs.shaftDiameter} onChange={(e) => updateInput("shaftDiameter", e.target.value)} /><em>mm</em></div></label>
                    <label className="input-field"><span>Hub outside diameter <b>*</b></span><div className="input-wrap"><input type="number" min="1" step="1" value={inputs.hubDiameter} onChange={(e) => updateInput("hubDiameter", e.target.value)} /><em>mm</em></div></label>
                    <label className="input-field"><span>Hub length <b>*</b></span><div className="input-wrap"><input type="number" min="1" step="1" value={inputs.hubLength} onChange={(e) => updateInput("hubLength", e.target.value)} /><em>mm</em></div></label>
                    <label className="input-field"><span>Key width <b>*</b></span><div className="input-wrap"><input type="number" min="1" step="1" value={inputs.keyWidth} onChange={(e) => updateInput("keyWidth", e.target.value)} /><em>mm</em></div></label>
                    <label className="input-field"><span>Key height <b>*</b></span><div className="input-wrap"><input type="number" min="1" step="1" value={inputs.keyHeight} onChange={(e) => updateInput("keyHeight", e.target.value)} /><em>mm</em></div></label>
                    <label className="input-field"><span>Allowable key shear stress <b>*</b></span><div className="input-wrap"><input type="number" min="1" step="1" value={inputs.allowableKeyShear} onChange={(e) => updateInput("allowableKeyShear", e.target.value)} /><em>MPa</em></div></label>
                    <label className="input-field"><span>Allowable key bearing stress <b>*</b></span><div className="input-wrap"><input type="number" min="1" step="1" value={inputs.allowableKeyBearing} onChange={(e) => updateInput("allowableKeyBearing", e.target.value)} /><em>MPa</em></div></label>
                    <label className="input-field"><span>Number of flange bolts <b>*</b></span><div className="input-wrap"><input type="number" min="1" step="1" value={inputs.boltCount} onChange={(e) => updateInput("boltCount", e.target.value)} /><em>qty</em></div></label>
                    <label className="input-field"><span>Bolt pitch-circle diameter (PCD) <b>*</b></span><div className="input-wrap"><input type="number" min="1" step="1" value={inputs.boltPCD} onChange={(e) => updateInput("boltPCD", e.target.value)} /><em>mm</em></div></label>
                    <label className="input-field"><span>Bolt diameter <b>*</b></span><div className="input-wrap"><input type="number" min="1" step="1" value={inputs.boltDiameter} onChange={(e) => updateInput("boltDiameter", e.target.value)} /><em>mm</em></div></label>
                    <label className="input-field"><span>Allowable bolt shear stress <b>*</b></span><div className="input-wrap"><input type="number" min="1" step="1" value={inputs.allowableBoltShear} onChange={(e) => updateInput("allowableBoltShear", e.target.value)} /><em>MPa</em></div></label>
                  </>
                ) : (
                  <>
                    <label className="input-field"><span>Angular misalignment <b>*</b></span><div className="input-wrap"><input type="number" min="0" step="0.1" value={inputs.misalignment} onChange={(e) => updateInput("misalignment", e.target.value)} /><em>deg</em></div></label>
                    <label className="input-field"><span>Manufacturer rated torque</span><div className="input-wrap"><input type="number" min="0.01" step="1" placeholder="From catalogue" value={inputs.flexibleRatedTorque} onChange={(e) => updateInput("flexibleRatedTorque", e.target.value)} /><em>N·m</em></div></label>
                    <label className="input-field"><span>Manufacturer maximum speed</span><div className="input-wrap"><input type="number" min="1" step="100" placeholder="From catalogue" value={inputs.flexibleMaxSpeed} onChange={(e) => updateInput("flexibleMaxSpeed", e.target.value)} /><em>rpm</em></div></label>
                    <label className="input-field"><span>Allowable angular misalignment</span><div className="input-wrap"><input type="number" min="0" step="0.1" placeholder="From catalogue" value={inputs.flexibleAllowableMisalignment} onChange={(e) => updateInput("flexibleAllowableMisalignment", e.target.value)} /><em>deg</em></div></label>
                  </>
                )}
              </div>

              <div className="input-note"><Icon name="activity" size={15} /><span>{type === "rigid" ? "Required fields are marked with an asterisk. Use consistent engineering units." : "Enter coupling ratings from the selected manufacturer's catalogue. Blank ratings will be marked REVIEW REQUIRED, not assumed."}</span></div>
              {error && <div className="error-message" role="alert">{error}</div>}
              <div className="form-actions"><button className="calculate-button" onClick={calculate}><Icon name="bolt" size={17} /> Calculate design <Icon name="arrow" size={16} /></button><button className="reset-button" onClick={reset} title="Reset all inputs"><Icon name="rotate" size={16} /> Reset</button></div>
              <p className="panel-disclaimer">{type === "rigid" ? "Preliminary torsion sizing only. Final coupling selection requires component-level checks and manufacturer ratings." : "Flexible-coupling checks are preliminary. Do not use assumed or blank catalogue ratings for final selection or safety approval."}</p>
            </div>

            <div className="right-column">
              <div className="panel viewport-panel">
                <div className="panel-heading viewport-heading"><div><div className="panel-kicker">02 / VISUALIZATION</div><h2>Assembly viewport</h2></div><span className="model-badge"><span className="live-dot" /> {type === "rigid" ? "RIGID FLANGE" : "FLEXIBLE JAW"}</span></div>
               


<Coupling3D
  

couplingType={type === "flexible" ? "flexible" : "rigid"}


  shaftDiameter={Number(inputs.shaftDiameter)}
  hubDiameter={Number(inputs.hubDiameter)}
  hubLength={Number(inputs.hubLength)}
  boltCount={Number(inputs.boltCount)}
/>



                <div className="viewport-footer"><span><i className="legend-metal" /> METALLIC COMPONENTS</span><span><i className="legend-cyan" /> {type === "rigid" ? "FLANGE ASSEMBLY" : "FLEXIBLE ELEMENT"}</span><span>SCHEMATIC / NOT TO SCALE</span></div>
              </div>
{type === "rigid" && (
              <div id="analysis" className="panel results-panel">
                <div className="panel-heading"><div><div className="panel-kicker">03 / ENGINEERING OUTPUT</div><h2>Calculation summary</h2></div><span className="result-state">{results ? "UPDATED" : "READY"}</span></div>
                {results ? (
                  <>
                    <div className="result-row"><span>Transmitted torque</span><b>{results.transmittedTorqueNm.toFixed(2)} <small>N·m</small></b></div>
                    <div className="result-row"><span>Design torque</span><b>{results.designTorqueNm.toFixed(2)} <small>N·m</small></b></div>
                    <div className="result-row"><span>Required shaft diameter</span><b>{results.requiredShaftDiameterMM.toFixed(2)} <small>mm</small></b></div>
                    <div className="result-row"><span>Stress at selected diameter</span><b>{results.shaftShearStressMPa.toFixed(2)} <small>MPa</small></b></div>
                    <div className="result-row"><span>Key shear stress</span><b>{results.keyShearStressMPa.toFixed(2)} <small>MPa</small></b></div>
                    <div className="result-row"><span>Key bearing stress</span><b>{results.keyBearingStressMPa.toFixed(2)} <small>MPa</small></b></div>
                    <div className="result-row"><span>Hub torsional stress</span><b>{results.hubTorsionalStressMPa.toFixed(2)} <small>MPa</small></b></div>
                    <div className="result-row"><span>Minimum calculated key length</span><b>{results.minimumKeyLengthMM.toFixed(2)} <small>mm</small></b></div>
                    <div className="result-row"><span>Estimated tangential force per bolt</span><b>{results.boltForceN.toFixed(2)} <small>N</small></b></div>
                    <div className="result-row"><span>Bolt shear stress</span><b>{results.boltShearStressMPa.toFixed(2)} <small>MPa</small></b></div>
                    <div className="result-row"><span>Bolt shear check</span><b>{results.boltStatus}</b></div>
                    <div className={`design-status ${results.overallStatus === "PASS" ? "status-pass" : "status-fail"}`}>
                      <Icon name={results.overallStatus === "PASS" ? "check" : "activity"} size={17} />
                      <div>
                        <b>{results.overallStatus === "PASS" ? "Implemented preliminary checks passed" : "One or more preliminary checks failed"}</b>
                        <small>Checks cover shaft torsion, key shear, key bearing, an idealized hub torsion model and an assumed single-shear bolt model. Flange stresses, bolt-hole bearing, fatigue, misalignment limits and manufacturer torque rating are not verified. This is not a complete coupling safety approval.</small>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="empty-results"><div className="empty-icon"><Icon name="chart" size={24} /></div><b>Awaiting calculation</b><p>Enter your operating conditions and calculate to populate the engineering results.</p></div>
                )}
                <div className="formula-strip"><span>CORE EQUATIONS</span><code>T = 9550P / N</code><code>d = ∛(16T / πτ)</code></div>
              </div>
              )}

              {type === "flexible" && (
                <div id="analysis" className="panel results-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="panel-kicker">03 / FLEXIBLE COUPLING OUTPUT</div>
                      <h2>Flexible coupling calculation summary</h2>
                    </div>
                    <span className="result-state">{flexibleResults ? "UPDATED" : "READY"}</span>
                  </div>

                  {flexibleResults ? (
                    <>
                      <div className="result-row"><span>Transmitted torque</span><b>{flexibleResults.transmittedTorqueNm.toFixed(2)} <small>N·m</small></b></div>
                      <div className="result-row"><span>Design torque (transmitted torque × service factor)</span><b>{flexibleResults.designTorqueNm.toFixed(2)} <small>N·m</small></b></div>
                      <div className="result-row"><span>Entered angular misalignment</span><b>{flexibleResults.angularMisalignmentDeg.toFixed(2)} <small>deg</small></b></div>
                      <div className="result-row"><span>Rated torque check</span><b>{flexibleResults.ratedTorqueNm === null ? "REVIEW REQUIRED" : `${flexibleResults.torqueStatus} · ${flexibleResults.ratedTorqueNm.toFixed(2)} N·m`}</b></div>
                      <div className="result-row"><span>Maximum speed check</span><b>{flexibleResults.maximumSpeedRPM === null ? "REVIEW REQUIRED" : `${flexibleResults.speedStatus} · ${flexibleResults.maximumSpeedRPM.toLocaleString("en-IN")} rpm`}</b></div>
                      <div className="result-row"><span>Angular misalignment limit check</span><b>{flexibleResults.allowableAngularMisalignmentDeg === null ? "REVIEW REQUIRED" : `${flexibleResults.misalignmentStatus} · ${flexibleResults.allowableAngularMisalignmentDeg.toFixed(2)} deg max`}</b></div>
                      <div className={`design-status ${[flexibleResults.torqueStatus, flexibleResults.speedStatus, flexibleResults.misalignmentStatus].includes("FAIL") ? "status-fail" : [flexibleResults.torqueStatus, flexibleResults.speedStatus, flexibleResults.misalignmentStatus].every((status) => status === "PASS") ? "status-pass" : "status-fail"}`}>
                        <Icon name={[flexibleResults.torqueStatus, flexibleResults.speedStatus, flexibleResults.misalignmentStatus].every((status) => status === "PASS") ? "check" : "activity"} size={17} />
                        <div>
                          <b>{[flexibleResults.torqueStatus, flexibleResults.speedStatus, flexibleResults.misalignmentStatus].every((status) => status === "PASS") ? "Entered manufacturer-limit checks passed" : [flexibleResults.torqueStatus, flexibleResults.speedStatus, flexibleResults.misalignmentStatus].includes("FAIL") ? "One or more entered limits failed" : "Manufacturer data required to complete checks"}</b>
                          <small>Checks compare design torque, operating speed and entered angular misalignment against the limits you supplied. They do not verify parallel or axial misalignment, heat, fatigue life, elastomer condition, shaft/hub attachment, or full manufacturer suitability. Confirm all applicable catalogue limits before use.</small>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="empty-results">
                      <div className="empty-icon"><Icon name="chart" size={24} /></div>
                      <b>Ready for flexible-coupling calculation</b>
                      <p>Enter power, speed, service factor and angular misalignment, then click Calculate design.</p>
                    </div>
                  )}
                  <div className="formula-strip">
                    <span>CORE EQUATIONS</span>
                    <code>T = 9550P / N</code>
                    <code>Tdesign = T × SF</code>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="bottom-grid">
            <div className="panel workflow-panel"><div className="panel-heading"><div><div className="panel-kicker">DESIGN WORKFLOW</div><h2>From input to validation</h2></div></div><div className="workflow-steps"><div className="workflow-step done"><span>01</span><div><b>Define inputs</b><small>Operating conditions</small></div><Icon name="check" size={16} /></div><div className={`workflow-step ${results ? "done" : "current"}`}><span>02</span><div><b>Calculate</b><small>{type === "rigid" ? "Torque & shaft sizing" : "Torque & rating checks"}</small></div>{(type === "rigid" ? Boolean(results) : Boolean(flexibleResults)) && <Icon name="check" size={16} />}</div><div className="workflow-step"><span>03</span><div><b>Verify components</b><small>Keys, hubs & ratings</small></div><span className="step-tag">NEXT</span></div></div></div>
            <div id="ai-assistant" className="panel assistant-panel"><div className="assistant-symbol"><Icon name="bot" size={24} /></div><div className="assistant-copy"><div className="panel-kicker">INTELLIGENCE LAYER</div><h2>Engineering AI assistant</h2><p>Formula explanations, design guidance and result interpretation.</p><span className="development-tag">PLANNED MODULE</span></div><span className="assistant-spark">✳</span></div>
          </section>

          <footer className="page-footer"><span>COUPLINGLAB <i>ENGINEERING STUDIO</i></span><span>PRELIMINARY DESIGN TOOL · VERIFY BEFORE MANUFACTURE</span><span>BUILD 0.1.0</span></footer>
        </div>
      </section>
    </main>
  );
}
