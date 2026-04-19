/**
 * Home Assistant Media Dashboard — Custom Panel
 * Sleek modern media control with floor plan room management.
 */

const CARD_VERSION = "1.1.0";

// ── Helpers ───────────────────────────────────────────────────────────────────

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function formatTime(s) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

// ── Design tokens ─────────────────────────────────────────────────────────────

const STYLES = `
  :host {
    --bg:        #09090f;
    --panel:     #0e0e1a;
    --surface:   #161624;
    --surface2:  #1e1e30;
    --surface3:  #262638;
    --border:    rgba(255,255,255,0.07);
    --border2:   rgba(255,255,255,0.12);
    --accent:    #8b5cf6;
    --accent-lo: rgba(139,92,246,0.18);
    --accent-hi: #a78bfa;
    --green:     #34d399;
    --red:       #f87171;
    --text:      #f0f0f8;
    --text2:     #8888aa;
    --text3:     #50506a;
    --radius:    14px;
    --radius-sm: 8px;

    display: flex;
    height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
    background: var(--bg);
    color: var(--text);
    overflow: hidden;
    font-size: 14px;
  }

  * { box-sizing: border-box; }

  /* ═══════════════════════════════════════════════
     LEFT PANEL
  ═══════════════════════════════════════════════ */

  .left-panel {
    width: 380px;
    min-width: 320px;
    background: var(--panel);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    flex-shrink: 0;
  }

  /* Header */
  .lp-header {
    display: flex;
    align-items: center;
    padding: 18px 20px 14px;
    gap: 10px;
    flex-shrink: 0;
  }

  .lp-brand {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text3);
    flex: 1;
  }

  .lp-brand svg { width: 14px; height: 14px; fill: var(--accent); }

  .lp-group-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    background: var(--surface2);
    border: 1px solid var(--border2);
    border-radius: 20px;
    color: var(--text2);
    font-family: inherit;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 6px 12px;
    cursor: pointer;
    transition: all 0.15s;
    letter-spacing: 0.02em;
  }

  .lp-group-btn svg { width: 14px; height: 14px; fill: currentColor; }

  .lp-group-btn:hover,
  .lp-group-btn.active {
    background: var(--accent-lo);
    border-color: var(--accent);
    color: var(--accent-hi);
  }

  /* ── Scrollable body ── */
  .lp-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    scrollbar-width: thin;
    scrollbar-color: var(--surface3) transparent;
  }

  .lp-body::-webkit-scrollbar { width: 4px; }
  .lp-body::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 2px; }

  /* ── Album Art ── */
  .np-art-wrap {
    position: relative;
    margin: 0 16px;
    border-radius: var(--radius);
    overflow: hidden;
    aspect-ratio: 1;
    background: var(--surface);
    flex-shrink: 0;
  }

  .np-art {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
  }

  .np-art-placeholder {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #1a1030 0%, #0d0820 100%);
  }

  .np-art-placeholder svg { width: 64px; height: 64px; fill: var(--surface3); }

  .np-art-gradient {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, transparent 45%, rgba(9,9,15,0.85) 100%);
    pointer-events: none;
  }

  .np-state-badge {
    position: absolute;
    top: 12px; left: 12px;
    font-size: 0.6rem;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 20px;
    padding: 3px 9px;
    color: var(--text);
  }

  .np-state-badge.playing { color: var(--green); border-color: rgba(52,211,153,0.35); }
  .np-state-badge.paused  { color: var(--text2); }

  /* ── Track info ── */
  .np-track-info {
    padding: 14px 20px 4px;
    flex-shrink: 0;
  }

  .np-title {
    font-size: 1.05rem;
    font-weight: 700;
    line-height: 1.3;
    color: var(--text);
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .np-artist {
    font-size: 0.82rem;
    color: var(--text2);
    margin-top: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .np-album {
    font-size: 0.75rem;
    color: var(--text3);
    margin-top: 1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── Progress ── */
  .np-progress {
    padding: 12px 20px 0;
    flex-shrink: 0;
  }

  .progress-track {
    height: 3px;
    background: var(--surface3);
    border-radius: 2px;
    overflow: visible;
    position: relative;
    cursor: pointer;
  }

  .progress-fill {
    height: 100%;
    border-radius: 2px;
    background: var(--accent);
    transition: width 1s linear;
    position: relative;
  }

  .progress-fill::after {
    content: '';
    position: absolute; right: -5px; top: 50%;
    transform: translateY(-50%) scale(0);
    width: 11px; height: 11px;
    border-radius: 50%;
    background: var(--accent-hi);
    transition: transform 0.15s;
  }

  .progress-track:hover .progress-fill::after { transform: translateY(-50%) scale(1); }

  .progress-times {
    display: flex; justify-content: space-between;
    font-size: 0.68rem; color: var(--text3);
    margin-top: 5px;
    font-variant-numeric: tabular-nums;
  }

  /* ── Playback controls ── */
  .np-controls {
    display: flex; align-items: center; justify-content: center;
    gap: 6px;
    padding: 10px 20px 6px;
    flex-shrink: 0;
  }

  .ctrl {
    background: none; border: none;
    color: var(--text2); cursor: pointer;
    border-radius: 50%;
    width: 42px; height: 42px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .ctrl:hover { color: var(--text); background: var(--surface2); }
  .ctrl svg { width: 20px; height: 20px; fill: currentColor; }

  .ctrl.play-btn {
    width: 54px; height: 54px;
    background: var(--accent);
    color: #fff;
    box-shadow: 0 0 24px rgba(139,92,246,0.4);
  }

  .ctrl.play-btn:hover {
    background: var(--accent-hi);
    box-shadow: 0 0 32px rgba(167,139,250,0.5);
    transform: scale(1.04);
  }

  .ctrl.play-btn svg { width: 24px; height: 24px; }

  /* ── Player selector ── */
  .np-player-row {
    display: flex; align-items: center;
    padding: 6px 20px 6px;
    gap: 8px;
    flex-shrink: 0;
  }

  .np-player-label {
    font-size: 0.68rem; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--text3); flex-shrink: 0;
  }

  .player-sel-wrap { flex: 1; position: relative; }

  .player-sel-wrap select {
    width: 100%;
    padding: 7px 28px 7px 10px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text);
    font-family: inherit;
    font-size: 0.82rem;
    appearance: none; -webkit-appearance: none;
    cursor: pointer; outline: none;
    transition: border-color 0.15s;
  }

  .player-sel-wrap select:focus { border-color: var(--accent); }

  .player-sel-arrow {
    position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
    pointer-events: none; color: var(--text3);
  }

  .player-sel-arrow svg { width: 16px; height: 16px; fill: currentColor; display: block; }

  /* ── Volume ── */
  .np-volume {
    display: flex; align-items: center; gap: 10px;
    padding: 4px 20px 12px;
    flex-shrink: 0;
  }

  .mute-btn {
    background: none; border: none; cursor: pointer; padding: 0;
    color: var(--text3); display: flex; align-items: center;
    flex-shrink: 0; transition: color 0.15s;
  }

  .mute-btn:hover { color: var(--text); }
  .mute-btn svg { width: 16px; height: 16px; fill: currentColor; display: block; }
  .mute-btn.muted { color: var(--red); }

  input[type="range"] {
    -webkit-appearance: none; appearance: none;
    flex: 1; height: 3px; border-radius: 2px;
    background: var(--surface3); outline: none; cursor: pointer;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px; height: 14px; border-radius: 50%;
    background: var(--accent-hi); cursor: pointer;
    transition: transform 0.12s;
  }

  input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.3); }
  input[type="range"]::-moz-range-thumb {
    width: 14px; height: 14px; border-radius: 50%;
    background: var(--accent-hi); border: none; cursor: pointer;
  }

  .vol-value {
    font-size: 0.72rem; color: var(--text3);
    min-width: 30px; text-align: right; flex-shrink: 0;
    font-variant-numeric: tabular-nums;
  }

  /* ── Section divider ── */
  .lp-divider {
    height: 1px;
    background: var(--border);
    margin: 6px 20px;
    flex-shrink: 0;
  }

  /* ── Queue section ── */
  .queue-header {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 20px 8px;
    cursor: pointer; user-select: none;
    flex-shrink: 0;
  }

  .queue-header-label {
    font-size: 0.72rem; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--text3); flex: 1;
  }

  .queue-count-badge {
    font-size: 0.68rem;
    background: var(--surface2);
    border: 1px solid var(--border);
    color: var(--text3);
    padding: 2px 7px; border-radius: 10px;
  }

  .queue-chevron {
    color: var(--text3); transition: transform 0.2s;
  }

  .queue-chevron svg { width: 14px; height: 14px; fill: currentColor; display: block; }
  .queue-open .queue-chevron { transform: rotate(180deg); }

  .queue-list { display: flex; flex-direction: column; }

  .queue-item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 20px;
    transition: background 0.12s; cursor: default;
  }

  .queue-item:hover { background: var(--surface); }

  .queue-item.current {
    background: var(--accent-lo);
  }

  .queue-item-num {
    font-size: 0.7rem; color: var(--text3);
    min-width: 18px; text-align: center; flex-shrink: 0;
    font-variant-numeric: tabular-nums;
  }

  .queue-item.current .queue-item-num { color: var(--accent-hi); }

  .queue-item-thumb {
    width: 36px; height: 36px; border-radius: 6px;
    object-fit: cover; flex-shrink: 0;
    background: var(--surface2);
  }

  .queue-item-thumb-placeholder {
    width: 36px; height: 36px; border-radius: 6px;
    background: var(--surface2); flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }

  .queue-item-thumb-placeholder svg { width: 16px; height: 16px; fill: var(--surface3); }

  .queue-item-info { flex: 1; overflow: hidden; }

  .queue-item-title {
    font-size: 0.82rem; font-weight: 500;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    color: var(--text);
  }

  .queue-item.current .queue-item-title { color: var(--accent-hi); }

  .queue-item-artist {
    font-size: 0.72rem; color: var(--text3);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-top: 1px;
  }

  .queue-item-dur {
    font-size: 0.68rem; color: var(--text3);
    flex-shrink: 0; font-variant-numeric: tabular-nums;
  }

  .queue-load-hint {
    padding: 8px 20px 12px;
    font-size: 0.75rem; color: var(--text3); text-align: center;
  }

  /* ── Nothing Playing ── */
  .nothing-playing {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 40px 32px; text-align: center; gap: 0;
    min-height: 300px;
  }

  .np-icon-ring-wrap {
    position: relative; width: 100px; height: 100px;
    margin-bottom: 24px;
  }

  .np-icon-ring {
    position: absolute; inset: 0; border-radius: 50%;
    border: 1.5px solid rgba(139,92,246,0.18);
    animation: pulse-ring 3s ease-in-out infinite;
  }

  .np-icon-ring:nth-child(2) {
    inset: -14px; animation-delay: 1.2s;
    border-color: rgba(139,92,246,0.08);
  }

  .np-icon-ring svg {
    position: absolute; inset: 0; margin: auto;
    width: 44px; height: 44px; fill: rgba(139,92,246,0.25);
  }

  @keyframes pulse-ring {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.07); opacity: 0.5; }
  }

  .nothing-playing h3 {
    margin: 0 0 8px; font-size: 1rem; font-weight: 600;
    color: var(--text2);
  }

  .nothing-playing p {
    margin: 0; font-size: 0.8rem; color: var(--text3);
    line-height: 1.6; max-width: 220px;
  }

  /* ═══════════════════════════════════════════════
     GROUP SHEET (slide-up overlay on left panel)
  ═══════════════════════════════════════════════ */

  .group-sheet-overlay {
    position: absolute; inset: 0; z-index: 60;
    display: flex; flex-direction: column; justify-content: flex-end;
  }

  .group-sheet-backdrop {
    position: absolute; inset: 0;
    background: rgba(9,9,15,0.65);
    backdrop-filter: blur(4px);
    cursor: pointer;
  }

  .group-sheet {
    position: relative;
    background: var(--surface);
    border-radius: 20px 20px 0 0;
    border-top: 1px solid var(--border2);
    max-height: 88%;
    display: flex; flex-direction: column;
    overflow: hidden;
  }

  .group-sheet-handle {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px 12px; flex-shrink: 0;
    border-bottom: 1px solid var(--border);
  }

  .group-sheet-title {
    display: flex; align-items: center; gap: 8px;
    font-size: 0.9rem; font-weight: 700; color: var(--text);
  }

  .group-sheet-title svg { width: 16px; height: 16px; fill: var(--accent); }

  .group-sheet-close {
    background: var(--surface2); border: none;
    color: var(--text3); cursor: pointer;
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }

  .group-sheet-close:hover { color: var(--text); background: var(--surface3); }
  .group-sheet-close svg { width: 14px; height: 14px; fill: currentColor; }

  .group-sheet-scroll {
    flex: 1; overflow-y: auto; padding: 8px 0 120px;
    scrollbar-width: thin;
    scrollbar-color: var(--surface3) transparent;
  }

  .group-room-label {
    font-size: 0.65rem; font-weight: 700;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--text3); padding: 12px 20px 6px;
  }

  .group-speaker-card {
    margin: 0 12px 6px;
    background: var(--surface2);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    padding: 12px 14px;
    transition: all 0.15s;
  }

  .group-speaker-card.checked {
    border-color: rgba(139,92,246,0.4);
    background: var(--accent-lo);
  }

  .group-speaker-top {
    display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
  }

  .g-check {
    width: 18px; height: 18px; flex-shrink: 0;
    border-radius: 5px; border: 2px solid var(--surface3);
    background: var(--surface); cursor: pointer;
    -webkit-appearance: none; appearance: none;
    position: relative; transition: all 0.15s;
    accent-color: var(--accent);
  }

  .g-check:checked { background: var(--accent); border-color: var(--accent); }

  .g-check:checked::after {
    content: '';
    position: absolute; left: 3px; top: 1px;
    width: 5px; height: 9px;
    border: 2px solid #fff; border-left: none; border-top: none;
    transform: rotate(45deg);
  }

  .g-name { flex: 1; font-size: 0.85rem; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .g-state {
    font-size: 0.7rem; color: var(--text3); flex-shrink: 0;
    padding: 2px 7px; border-radius: 10px;
    background: var(--surface3);
  }

  .g-state.playing { color: var(--green); background: rgba(52,211,153,0.12); }
  .g-state.grouped { color: var(--accent-hi); background: var(--accent-lo); }

  .master-chip {
    font-size: 0.58rem; font-weight: 800;
    letter-spacing: 0.12em; text-transform: uppercase;
    background: var(--accent); color: #fff;
    padding: 2px 6px; border-radius: 4px;
    flex-shrink: 0;
  }

  .g-vol-row {
    display: flex; align-items: center; gap: 8px;
  }

  .g-vol-row .mute-btn svg { width: 14px; height: 14px; }

  /* ── Group action bar ── */
  .group-action-bar {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 10px 14px 16px;
    background: linear-gradient(to bottom, transparent, var(--surface) 35%);
    display: flex; flex-direction: column; gap: 8px;
    flex-shrink: 0;
  }

  .group-master-hint {
    font-size: 0.72rem; color: var(--text3); text-align: center;
  }

  .group-master-hint strong { color: var(--text2); }

  /* ── Start Playing section ── */
  .group-start-section {
    padding: 10px 14px 0;
    flex-shrink: 0;
    border-top: 1px solid var(--border);
    margin-top: 4px;
  }

  .group-start-label {
    font-size: 0.65rem; font-weight: 700;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--text3); margin-bottom: 8px;
  }

  .source-chips {
    display: flex; flex-wrap: wrap; gap: 6px; padding-bottom: 2px;
  }

  .source-chip {
    font-size: 0.75rem; color: var(--text2);
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 5px 12px;
    cursor: pointer; white-space: nowrap;
    transition: all 0.15s; font-family: inherit;
  }

  .source-chip:hover { border-color: var(--accent); color: var(--accent-hi); background: var(--accent-lo); }

  .group-empty-sources {
    font-size: 0.78rem; color: var(--text3); padding: 6px 0 10px;
  }

  /* ── Action buttons ── */
  .action-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 12px;
    border: none; border-radius: var(--radius-sm);
    font-family: inherit; font-size: 0.875rem; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
  }

  .action-btn svg { width: 17px; height: 17px; fill: currentColor; }
  .action-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .action-btn:not(:disabled):hover { opacity: 0.87; transform: translateY(-1px); }

  .action-btn.primary { background: var(--accent); color: #fff; box-shadow: 0 4px 20px rgba(139,92,246,0.3); }
  .action-btn.secondary { background: var(--surface2); color: var(--text2); border: 1px solid var(--border); }
  .action-btn.danger { background: rgba(248,113,113,0.15); color: var(--red); border: 1px solid rgba(248,113,113,0.3); }

  .group-no-rooms {
    padding: 32px 20px; text-align: center;
    font-size: 0.82rem; color: var(--text3); line-height: 1.6;
  }

  /* ═══════════════════════════════════════════════
     RIGHT PANEL
  ═══════════════════════════════════════════════ */

  .right-panel {
    flex: 1; display: flex; flex-direction: column;
    overflow: hidden; position: relative;
    background: var(--bg);
  }

  .fp-toolbar {
    display: flex; align-items: center; gap: 10px;
    padding: 13px 18px;
    background: var(--panel);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .fp-toolbar-title {
    font-size: 0.72rem; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--text3); flex: 1;
  }

  .fp-btn {
    display: flex; align-items: center; gap: 5px;
    background: var(--surface2); color: var(--text2);
    border: 1px solid var(--border); border-radius: var(--radius-sm);
    padding: 7px 13px;
    font-size: 0.78rem; font-weight: 600; font-family: inherit;
    cursor: pointer; transition: all 0.15s; letter-spacing: 0.02em;
  }

  .fp-btn svg { width: 14px; height: 14px; fill: currentColor; }
  .fp-btn:hover { border-color: var(--border2); color: var(--text); background: var(--surface3); }

  .fp-btn.primary {
    background: var(--accent-lo); border-color: var(--accent);
    color: var(--accent-hi);
  }

  .fp-btn.primary:hover { background: var(--accent); color: #fff; }

  /* Floor plan area */
  .fp-area {
    flex: 1; overflow: auto; position: relative;
    display: flex; align-items: center; justify-content: center;
  }

  .fp-area.placing { cursor: crosshair; }

  .fp-canvas {
    position: relative; display: inline-block;
    max-width: 100%; max-height: 100%;
  }

  .fp-canvas img,
  .fp-canvas svg.blueprint {
    max-width: 100%; max-height: calc(100vh - 70px);
    display: block; border-radius: var(--radius);
  }

  /* Empty state */
  .fp-empty {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 16px; color: var(--text3);
    text-align: center; padding: 60px 40px;
  }

  .fp-empty svg { width: 72px; height: 72px; fill: var(--surface3); }
  .fp-empty h3 { margin: 0; font-size: 1rem; color: var(--text2); font-weight: 600; }
  .fp-empty p { margin: 0; font-size: 0.82rem; line-height: 1.6; max-width: 280px; color: var(--text3); }

  /* Room overlays */
  .room-overlay {
    position: absolute; border-radius: 8px;
    border: 1.5px solid transparent;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
    box-sizing: border-box;
  }

  .room-overlay:hover,
  .room-overlay.active {
    background: rgba(139,92,246,0.12);
    border-color: rgba(139,92,246,0.5);
  }

  .room-label {
    font-size: 0.65rem; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase;
    background: rgba(9,9,15,0.72);
    backdrop-filter: blur(6px);
    border: 1px solid var(--border2);
    color: var(--text); padding: 3px 8px; border-radius: 6px;
    pointer-events: none; opacity: 0; transition: opacity 0.2s;
    white-space: nowrap;
  }

  .room-overlay:hover .room-label,
  .room-overlay.active .room-label { opacity: 1; }

  .room-speaker-badge {
    position: absolute; top: -7px; right: -7px;
    background: var(--accent); color: #fff;
    border-radius: 50%; width: 18px; height: 18px;
    font-size: 0.6rem; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.2s; pointer-events: none;
  }

  .room-overlay.has-speakers .room-speaker-badge { opacity: 1; }

  .room-playing-pulse {
    position: absolute; top: -7px; left: -7px;
    width: 10px; height: 10px;
  }

  .room-playing-pulse-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 6px var(--green);
    animation: playing-pulse 2s ease-in-out infinite;
  }

  @keyframes playing-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.4); opacity: 0.6; }
  }

  /* Room popup */
  .room-popup {
    position: absolute; z-index: 40;
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: var(--radius);
    padding: 16px;
    min-width: 260px; max-width: 320px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.6);
  }

  .popup-header {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 14px;
  }

  .popup-title { font-size: 0.88rem; font-weight: 700; flex: 1; color: var(--text); }

  .popup-icon-btn {
    background: var(--surface2); border: none;
    color: var(--text3); cursor: pointer;
    width: 26px; height: 26px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.12s;
  }

  .popup-icon-btn:hover { color: var(--text); background: var(--surface3); }
  .popup-icon-btn svg { width: 13px; height: 13px; fill: currentColor; }

  .popup-empty {
    font-size: 0.78rem; color: var(--text3); text-align: center;
    padding: 8px 0 4px; line-height: 1.5;
  }

  .speaker-entry {
    padding: 10px 12px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    margin-bottom: 6px;
  }

  .speaker-entry:last-child { margin-bottom: 0; }

  .speaker-entry-top {
    display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
  }

  .s-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--text3); flex-shrink: 0;
  }

  .s-dot.playing { background: var(--green); box-shadow: 0 0 5px var(--green); }

  .speaker-name {
    flex: 1; font-size: 0.82rem; font-weight: 500;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .speaker-state {
    font-size: 0.68rem; color: var(--text3); flex-shrink: 0;
    padding: 2px 6px; border-radius: 6px; background: var(--surface3);
  }

  .speaker-state.playing { color: var(--green); background: rgba(52,211,153,0.1); }

  .speaker-vol-row {
    display: flex; align-items: center; gap: 8px;
  }

  .speaker-vol-row .mute-btn svg { width: 14px; height: 14px; }

  /* Room modal */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(9,9,15,0.75); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
  }

  .modal {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: 18px;
    padding: 24px;
    width: 100%; max-width: 480px; max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,0.7);
  }

  .modal h3 {
    margin: 0 0 20px;
    font-size: 1rem; font-weight: 700;
  }

  .form-group { margin-bottom: 16px; }

  .form-group label {
    display: block; font-size: 0.72rem; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--text3); margin-bottom: 7px;
  }

  .form-group input[type="text"],
  .form-group select {
    width: 100%; padding: 9px 12px;
    background: var(--surface2);
    border: 1px solid var(--border); border-radius: var(--radius-sm);
    color: var(--text); font-size: 0.88rem; font-family: inherit;
    outline: none; transition: border-color 0.15s;
  }

  .form-group input[type="text"]:focus,
  .form-group select:focus { border-color: var(--accent); }

  .entity-checkbox-list {
    display: flex; flex-direction: column; gap: 6px;
    max-height: 220px; overflow-y: auto; padding: 2px 0;
  }

  .entity-checkbox-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    cursor: pointer; user-select: none;
    transition: border-color 0.12s;
  }

  .entity-checkbox-item:hover { border-color: var(--border2); }

  .entity-checkbox-item input[type="checkbox"] {
    accent-color: var(--accent);
    width: 15px; height: 15px; cursor: pointer; flex-shrink: 0;
  }

  .entity-checkbox-item label {
    font-size: 0.85rem; cursor: pointer; flex: 1;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .modal-actions {
    display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px;
  }

  .btn {
    padding: 9px 18px; border-radius: var(--radius-sm);
    border: none; font-size: 0.85rem; font-family: inherit;
    font-weight: 600; cursor: pointer; transition: opacity 0.15s;
  }

  .btn:hover { opacity: 0.82; }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-secondary { background: var(--surface2); color: var(--text2); border: 1px solid var(--border); }
  .btn-danger { background: rgba(248,113,113,0.15); color: var(--red); border: 1px solid rgba(248,113,113,0.3); }

  /* Misc */
  .instructions-hint {
    position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: var(--surface); border: 1px solid var(--border2);
    border-radius: 20px; padding: 8px 18px;
    font-size: 0.78rem; color: var(--text2);
    white-space: nowrap; z-index: 20;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  }
`;

// ── Icons ─────────────────────────────────────────────────────────────────────

const ICON = {
  play:   `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`,
  pause:  `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
  prev:   `<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>`,
  next:   `<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zm2.5-6l5.5 3.9V8.1L8.5 12zM16 6h2v12h-2z"/></svg>`,
  volHi:  `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
  volMid: `<svg viewBox="0 0 24 24"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>`,
  volOff: `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`,
  music:  `<svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`,
  group:  `<svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`,
  link:   `<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`,
  unlink: `<svg viewBox="0 0 24 24"><path d="M17 7h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-6 8H7c-1.71 0-3.1-1.39-3.1-3.1S5.29 8.9 7 8.9h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9zm-1-4h4v-2h-4v2z"/></svg>`,
  home:   `<svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
  upload: `<svg viewBox="0 0 24 24"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>`,
  add:    `<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`,
  edit:   `<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`,
  close:  `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
  queue:  `<svg viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>`,
  chevronDown: `<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>`,
  delete: `<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ── Panel Element ─────────────────────────────────────────────────────────────

class MediaDashboardPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this._hass = null;
    this._hassConnected = false;

    // Player state
    this._players = [];
    this._selectedPlayer = null;
    this._pendingPlayState = null;  // optimistic play/pause state, cleared on next hass update
    this._queueItems = [];
    this._queueOpen = true;
    this._queueFetching = false;
    this._lastQueuePlayer = null;

    // Floor plan state
    this._floorPlanSrc = null;
    this._floorPlanType = null;
    this._rooms = [];
    this._activeRoom = null;
    this._roomPopupPos = { x: 0, y: 0 };
    this._editingRoom = null;
    this._placingRoom = false;

    // Group state
    this._groupSheetOpen = false;
    this._groupSelection = new Set();

    this._loadPersisted();
    this._render();
    this._bindFileInput();
  }

  // ── HA ────────────────────────────────────────────────────────────────────────

  set hass(hass) {
    this._hass = hass;
    if (!this._hassConnected) {
      this._hassConnected = true;
    }
    this._pendingPlayState = null; // HA confirmed new state — stop overriding
    this._syncPlayers();

    const active = this._activePlayers();
    const findBest = (list) => {
      const master = list.find((id) => {
        const m = hass.states[id]?.attributes?.group_members;
        return Array.isArray(m) && m.length > 1 && m[0] === id;
      });
      return master || list.find((p) => hass.states[p]?.state === "playing") || list[0];
    };

    if (!this._selectedPlayer && active.length) {
      this._selectedPlayer = findBest(active);
    } else if (this._selectedPlayer && !active.includes(this._selectedPlayer) && active.length) {
      this._selectedPlayer = findBest(active);
    } else if (!active.length) {
      this._selectedPlayer = null;
    } else if (this._selectedPlayer) {
      const m = hass.states[this._selectedPlayer]?.attributes?.group_members;
      const isSlave = Array.isArray(m) && m.length > 1 && m[0] !== this._selectedPlayer;
      if (isSlave) this._selectedPlayer = findBest(active);
    }

    // Fetch MA queue when player changes or position changes
    const pos = hass.states[this._selectedPlayer]?.attributes?.queue_position;
    if (this._selectedPlayer && (this._lastQueuePlayer !== this._selectedPlayer || this._lastQueuePos !== pos)) {
      this._lastQueuePlayer = this._selectedPlayer;
      this._lastQueuePos = pos;
      this._fetchQueue(this._selectedPlayer);
    }

    this._updateAll();
  }

  _syncPlayers() {
    if (!this._hass) return;
    this._players = Object.keys(this._hass.states).filter(
      (id) => id.startsWith("media_player.") &&
              this._hass.states[id].attributes.supported_features !== undefined
    );
  }

  _activePlayers() {
    if (!this._hass) return [];
    return this._players.filter((id) => {
      const s = this._hass.states[id]?.state;
      return s === "playing" || s === "paused";
    });
  }

  _roomAssignedPlayers() {
    const ids = new Set();
    this._rooms.forEach((r) => (r.entities || []).forEach((id) => ids.add(id)));
    return [...ids];
  }

  _isGrouped(id) {
    const m = this._hass?.states[id]?.attributes?.group_members;
    return Array.isArray(m) && m.length > 1;
  }

  // ── Queue fetching ────────────────────────────────────────────────────────────

  async _fetchQueue(entityId) {
    if (!this._hass || this._queueFetching) return;
    const state = this._hass.states[entityId];
    if (!state) return;

    // MA exposes queue items via websocket. Try known message formats in order.
    const massPlayerId = state.attributes.mass_player_id;
    const queueId = state.attributes.mass_queue_id || massPlayerId || entityId;

    this._queueFetching = true;
    let items = [];

    const attempts = [
      // MA 2.x integration format
      { type: "music_assistant/queue_items", queue_id: queueId },
      // Alternative format with entity_id
      { type: "music_assistant/queue_items", entity_id: entityId },
      // Older MA format
      { type: "mass/queue_items", queue_id: queueId },
    ];

    for (const msg of attempts) {
      try {
        const result = await this._hass.callWS(msg);
        const raw = result?.items || result?.queue_items || result;
        if (Array.isArray(raw) && raw.length > 0) {
          items = raw;
          break;
        }
      } catch (_) {
        // try next format
      }
    }

    this._queueItems = items;
    this._queueFetching = false;
    this._renderLeft();
  }

  // ── Persistence ───────────────────────────────────────────────────────────────

  _loadPersisted() {
    try {
      const d = JSON.parse(localStorage.getItem("hass_media_dashboard") || "{}");
      this._rooms = d.rooms || [];
      this._floorPlanSrc = d.floorPlanSrc || null;
      this._floorPlanType = d.floorPlanType || null;
    } catch (_) {}
  }

  _persist() {
    try {
      localStorage.setItem("hass_media_dashboard", JSON.stringify({
        rooms: this._rooms,
        floorPlanSrc: this._floorPlanSrc?.length < 2_000_000 ? this._floorPlanSrc : null,
        floorPlanType: this._floorPlanType,
      }));
    } catch (_) {}
  }

  // ── Root render ───────────────────────────────────────────────────────────────

  _render() {
    this.shadowRoot.innerHTML = `
      <style>${STYLES}</style>
      <div class="left-panel" id="leftPanel"></div>
      <div class="right-panel" id="rightPanel"></div>
      <input type="file" id="fileInput" accept=".svg,.png,.jpg,.jpeg,.webp,.bmp" style="display:none">
    `;
    this._renderLeft();
    this._renderRight();
    this._bindFileInput();
  }

  _updateAll() {
    this._renderLeft();
    if (this._editingRoom === null) this._renderRight();
  }

  // ═══════════════════════════════════════════════
  // LEFT PANEL
  // ═══════════════════════════════════════════════

  _renderLeft() {
    const panel = this.shadowRoot.getElementById("leftPanel");
    if (!panel) return;

    const active = this._activePlayers();
    const selId = this._selectedPlayer;
    const selState = selId && this._hass ? this._hass.states[selId] : null;
    const anyGrouped = this._roomAssignedPlayers().some((id) => this._isGrouped(id));

    panel.innerHTML = `
      <div class="lp-header">
        <div class="lp-brand">${ICON.music} Media Dashboard</div>
        <button class="lp-group-btn ${this._groupSheetOpen ? "active" : ""}" id="btnOpenGroup">
          ${ICON.group} Group
        </button>
      </div>

      <div class="lp-body">
        ${active.length === 0 ? this._renderNothingPlaying() : this._renderNowPlaying(selId, selState, active)}
      </div>

      ${this._groupSheetOpen ? this._renderGroupSheet() : ""}
    `;

    this._bindLeftEvents(panel);
  }

  _renderNothingPlaying() {
    return `
      <div class="nothing-playing">
        <div class="np-icon-ring-wrap">
          <div class="np-icon-ring"></div>
          <div class="np-icon-ring">${ICON.music}</div>
        </div>
        <h3>Nothing Playing</h3>
        <p>Start music on any player or use Group Audio to join speakers and start playback.</p>
      </div>
    `;
  }

  _renderNowPlaying(entityId, state, activePlayers) {
    if (!state) return this._renderNothingPlaying();

    const attr = state.attributes;
    // Use optimistic local state if we just clicked play/pause and HA hasn't confirmed yet
    const effectiveState = this._pendingPlayState ?? state.state;
    const isPlaying = effectiveState === "playing";
    const isPaused  = effectiveState === "paused";
    const title    = attr.media_title || attr.media_album_name || "Unknown";
    const artist   = attr.media_artist || attr.media_album_artist || "";
    const album    = attr.media_album_name && attr.media_title ? attr.media_album_name : "";
    const art      = attr.entity_picture || null;
    const duration = attr.media_duration || 0;
    const position = attr.media_position || 0;
    const volume   = attr.volume_level != null ? attr.volume_level : 0.5;
    const muted    = attr.is_volume_muted || false;
    const progress = duration > 0 ? clamp((position / duration) * 100, 0, 100) : 0;
    const qPos     = attr.queue_position != null ? attr.queue_position + 1 : null;
    const qSize    = attr.queue_size || this._queueItems.length || null;

    const artHtml = art
      ? `<img class="np-art" src="${this._esc(art)}" alt="">`
      : `<div class="np-art-placeholder">${ICON.music}</div>`;

    const badgeClass = isPlaying ? "playing" : "paused";
    const badgeLabel = isPlaying ? "Playing" : isPaused ? "Paused" : state.state;

    // Player dropdown (only active)
    const playerOptions = activePlayers.map((id) => {
      const s = this._hass.states[id];
      const name = s?.attributes?.friendly_name || id;
      const pre = s?.state === "playing" ? "▶ " : "⏸ ";
      return `<option value="${id}" ${id === entityId ? "selected" : ""}>${pre}${this._esc(name)}</option>`;
    }).join("");

    return `
      <div class="np-art-wrap">
        ${artHtml}
        ${art ? `<div class="np-art-gradient"></div>` : ""}
        <div class="np-state-badge ${badgeClass}">${badgeLabel}</div>
      </div>

      <div class="np-track-info">
        <div class="np-title">${this._esc(title)}</div>
        ${artist ? `<div class="np-artist">${this._esc(artist)}</div>` : ""}
        ${album  ? `<div class="np-album">${this._esc(album)}</div>`  : ""}
      </div>

      <div class="np-progress">
        <div class="progress-track">
          <div class="progress-fill" style="width:${progress}%"></div>
        </div>
        <div class="progress-times">
          <span>${formatTime(position)}</span>
          <span>${formatTime(duration)}</span>
        </div>
      </div>

      <div class="np-controls">
        <button class="ctrl" id="btnPrev" title="Previous">${ICON.prev}</button>
        <button class="ctrl play-btn" id="btnPlayPause">${isPlaying ? ICON.pause : ICON.play}</button>
        <button class="ctrl" id="btnNext" title="Next">${ICON.next}</button>
      </div>

      <div class="np-player-row">
        <span class="np-player-label">Player</span>
        <div class="player-sel-wrap">
          <select id="playerSelect">${playerOptions}</select>
          <span class="player-sel-arrow">${ICON.chevronDown}</span>
        </div>
      </div>

      <div class="np-volume">
        <button class="mute-btn ${muted ? "muted" : ""}" id="btnMute">
          ${muted || volume === 0 ? ICON.volOff : volume < 0.5 ? ICON.volMid : ICON.volHi}
        </button>
        <input type="range" id="volSlider" min="0" max="100" value="${Math.round(volume * 100)}">
        <span class="vol-value" id="volLabel">${Math.round(volume * 100)}%</span>
      </div>

      ${this._renderQueueSection(qPos, qSize)}
    `;
  }

  _renderQueueSection(qPos, qSize) {
    const items = this._queueItems;
    const hasItems = items.length > 0;
    const remaining = qSize && qPos ? qSize - qPos : null;
    const countLabel = qPos && qSize
      ? `${qPos} / ${qSize}`
      : qSize ? `${qSize} tracks` : hasItems ? `${items.length} tracks` : "";
    const openClass = this._queueOpen ? "queue-open" : "";

    let bodyHtml;
    if (this._queueFetching) {
      bodyHtml = `<div class="queue-load-hint">Loading queue…</div>`;
    } else if (hasItems) {
      bodyHtml = items.slice(0, 25).map((item, i) => this._renderQueueItem(item, i, qPos)).join("");
    } else if (qSize) {
      // WS data unavailable but attributes tell us there's a queue
      bodyHtml = `<div class="queue-load-hint">${qSize} track${qSize !== 1 ? "s" : ""} in queue${remaining ? ` · ${remaining} remaining` : ""}</div>`;
    } else {
      bodyHtml = `<div class="queue-load-hint" style="color:var(--text3)">No queue information available</div>`;
    }

    return `
      <div class="lp-divider"></div>
      <div class="queue-header ${openClass}" id="queueToggle">
        <span class="queue-header-label">${ICON.queue} Queue</span>
        ${countLabel ? `<span class="queue-count-badge">${countLabel}</span>` : ""}
        <span class="queue-chevron">${ICON.chevronDown}</span>
      </div>
      ${this._queueOpen ? `<div class="queue-list">${bodyHtml}</div>` : ""}
    `;
  }

  _renderQueueItem(item, index, currentPos) {
    const pos = item.queue_position ?? index;
    const isCurrent = currentPos != null && pos === currentPos - 1;
    const title = item.name || item.media_title || "Unknown";
    const artist = item.artists?.[0]?.name || item.media_artist || "";
    const thumb = item.image || item.media_image_url || null;
    const dur = item.duration ? formatTime(item.duration) : "";
    return `
      <div class="queue-item ${isCurrent ? "current" : ""}">
        <span class="queue-item-num">${isCurrent ? "▶" : pos + 1}</span>
        ${thumb
          ? `<img class="queue-item-thumb" src="${this._esc(thumb)}" alt="">`
          : `<div class="queue-item-thumb-placeholder">${ICON.music}</div>`
        }
        <div class="queue-item-info">
          <div class="queue-item-title">${this._esc(title)}</div>
          ${artist ? `<div class="queue-item-artist">${this._esc(artist)}</div>` : ""}
        </div>
        ${dur ? `<span class="queue-item-dur">${dur}</span>` : ""}
      </div>
    `;
  }

  // ── Group Sheet ───────────────────────────────────────────────────────────────

  _renderGroupSheet() {
    const assigned = this._roomAssignedPlayers();
    const roomsWithSpeakers = this._rooms.filter((r) => r.entities?.length > 0);
    const anyGrouped = assigned.some((id) => this._isGrouped(id));
    const selectedArr = [...this._groupSelection];
    const selCount = selectedArr.length;
    const masterEntityId = selectedArr[0];
    const masterName = masterEntityId
      ? (this._hass?.states[masterEntityId]?.attributes?.friendly_name || masterEntityId)
      : "";

    // "Start Playing" sources from master (or first active assigned player)
    const sourcePlayer = masterEntityId || assigned.find((id) => this._isGrouped(id)) || assigned[0];
    const sources = sourcePlayer
      ? (this._hass?.states[sourcePlayer]?.attributes?.source_list || [])
      : [];

    const speakerRows = roomsWithSpeakers.map(({ name, entities }) => `
      <div class="group-room-label">${this._esc(name)}</div>
      ${(entities || []).map((id) => this._renderGroupSpeakerCard(id, selectedArr)).join("")}
    `).join("");

    return `
      <div class="group-sheet-overlay" id="groupSheetOverlay">
        <div class="group-sheet-backdrop" id="groupSheetBackdrop"></div>
        <div class="group-sheet">
          <div class="group-sheet-handle">
            <div class="group-sheet-title">${ICON.group} Group Audio</div>
            <button class="group-sheet-close" id="btnCloseGroup">${ICON.close}</button>
          </div>

          <div class="group-sheet-scroll">
            ${roomsWithSpeakers.length === 0
              ? `<div class="group-no-rooms">Assign speakers to rooms on the floor plan first, then return here to group them.</div>`
              : speakerRows
            }

            ${anyGrouped || (selCount >= 2) ? `
              <div class="group-start-section">
                <div class="group-start-label">Start Playback</div>
                ${sources.length > 0
                  ? `<div class="source-chips">
                      ${sources.slice(0, 8).map((s) => `
                        <button class="source-chip" data-source="${this._esc(s)}"
                          data-source-entity="${this._esc(sourcePlayer)}">${this._esc(s)}</button>
                      `).join("")}
                    </div>`
                  : `<div class="group-empty-sources">No sources found — play music from the HA media browser to start.</div>`
                }
              </div>
            ` : ""}
          </div>

          <div class="group-action-bar">
            ${selCount >= 2 ? `<div class="group-master-hint">Master: <strong>${this._esc(masterName)}</strong></div>` : ""}
            <button class="action-btn primary" id="btnJoinGroup" ${selCount < 2 ? "disabled" : ""}>
              ${ICON.link} Join ${selCount >= 2 ? `${selCount} Speakers` : "— Select 2+"}
            </button>
            ${anyGrouped
              ? `<button class="action-btn secondary" id="btnUnjoinAll">${ICON.unlink} Unjoin All Groups</button>`
              : ""}
          </div>
        </div>
      </div>
    `;
  }

  _renderGroupSpeakerCard(entityId, selectedArr) {
    const state = this._hass?.states[entityId];
    const name = state?.attributes?.friendly_name || entityId;
    const st = state?.state || "unavailable";
    const vol = state?.attributes?.volume_level != null
      ? Math.round(state.attributes.volume_level * 100) : 50;
    const muted = state?.attributes?.is_volume_muted || false;
    const isGrouped = this._isGrouped(entityId);
    const isChecked = selectedArr.includes(entityId);
    const isMaster = isChecked && selectedArr[0] === entityId;

    let stateClass = st === "playing" ? "playing" : "";
    let stateLabel = st;
    if (isGrouped) { stateLabel = "grouped"; stateClass = "grouped"; }

    return `
      <div class="group-speaker-card ${isChecked ? "checked" : ""}">
        <div class="group-speaker-top">
          <input type="checkbox" class="g-check" data-gent="${entityId}" ${isChecked ? "checked" : ""}>
          <span class="g-name">${this._esc(name)}</span>
          ${isMaster ? `<span class="master-chip">master</span>` : ""}
          <span class="g-state ${stateClass}">${stateLabel}</span>
        </div>
        <div class="g-vol-row">
          <button class="mute-btn ${muted ? "muted" : ""}" data-gmute="${entityId}">
            ${muted || vol === 0 ? ICON.volOff : vol < 50 ? ICON.volMid : ICON.volHi}
          </button>
          <input type="range" min="0" max="100" value="${vol}" data-gvol="${entityId}" style="flex:1">
          <span class="vol-value" data-gvol-label="${entityId}">${vol}%</span>
        </div>
      </div>
    `;
  }

  // ── Left Panel Events ─────────────────────────────────────────────────────────

  _bindLeftEvents(panel) {
    // Group sheet toggle
    panel.querySelector("#btnOpenGroup")?.addEventListener("click", () => {
      this._groupSheetOpen = !this._groupSheetOpen;
      this._renderLeft();
    });

    panel.querySelector("#btnCloseGroup")?.addEventListener("click", () => {
      this._groupSheetOpen = false; this._renderLeft();
    });

    panel.querySelector("#groupSheetBackdrop")?.addEventListener("click", () => {
      this._groupSheetOpen = false; this._renderLeft();
    });

    // Player select
    panel.querySelector("#playerSelect")?.addEventListener("change", (e) => {
      this._selectedPlayer = e.target.value;
      this._queueItems = [];
      this._renderLeft();
    });

    // Playback controls
    panel.querySelector("#btnPlayPause")?.addEventListener("click", () => {
      const s = this._hass?.states[this._selectedPlayer];
      if (!s) return;
      // Use the pending state if set (optimistic), otherwise use real HA state
      const currentState = this._pendingPlayState ?? s.state;
      const willPlay = currentState !== "playing";
      this._pendingPlayState = willPlay ? "playing" : "paused";
      this._callService("media_player", willPlay ? "media_play" : "media_pause",
        { entity_id: this._selectedPlayer });
      this._renderLeft(); // immediate visual feedback
    });

    panel.querySelector("#btnPrev")?.addEventListener("click", () => {
      this._callService("media_player", "media_previous_track", { entity_id: this._selectedPlayer });
    });

    panel.querySelector("#btnNext")?.addEventListener("click", () => {
      this._callService("media_player", "media_next_track", { entity_id: this._selectedPlayer });
    });

    // Volume
    const volSlider = panel.querySelector("#volSlider");
    if (volSlider) {
      const sv = debounce((v) => this._callService("media_player", "volume_set",
        { entity_id: this._selectedPlayer, volume_level: v / 100 }), 300);
      volSlider.addEventListener("input", (e) => {
        const v = parseInt(e.target.value);
        const lbl = panel.querySelector("#volLabel");
        if (lbl) lbl.textContent = `${v}%`;
        sv(v);
      });
    }

    panel.querySelector("#btnMute")?.addEventListener("click", () => {
      const s = this._hass?.states[this._selectedPlayer];
      if (!s) return;
      this._callService("media_player", "volume_mute",
        { entity_id: this._selectedPlayer, is_volume_muted: !s.attributes.is_volume_muted });
    });

    // Queue toggle
    panel.querySelector("#queueToggle")?.addEventListener("click", () => {
      this._queueOpen = !this._queueOpen;
      this._renderLeft();
    });

    // ── Group sheet ──
    panel.querySelectorAll("[data-gent]").forEach((cb) => {
      cb.addEventListener("change", () => {
        const id = cb.dataset.gent;
        cb.checked ? this._groupSelection.add(id) : this._groupSelection.delete(id);
        this._renderLeft();
      });
    });

    const gVolDebounces = {};
    panel.querySelectorAll("[data-gvol]").forEach((sl) => {
      const id = sl.dataset.gvol;
      if (!gVolDebounces[id]) {
        gVolDebounces[id] = debounce((v) => this._callService("media_player", "volume_set",
          { entity_id: id, volume_level: v / 100 }), 300);
      }
      sl.addEventListener("input", (e) => {
        const v = parseInt(e.target.value);
        const lbl = panel.querySelector(`[data-gvol-label="${id}"]`);
        if (lbl) lbl.textContent = `${v}%`;
        gVolDebounces[id](v);
      });
    });

    panel.querySelectorAll("[data-gmute]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.gmute;
        const s = this._hass?.states[id];
        if (!s) return;
        this._callService("media_player", "volume_mute",
          { entity_id: id, is_volume_muted: !s.attributes.is_volume_muted });
      });
    });

    panel.querySelector("#btnJoinGroup")?.addEventListener("click", () => {
      const [master, ...rest] = [...this._groupSelection];
      if (!master || !rest.length) return;
      this._callService("media_player", "join", { entity_id: master, group_members: rest });
    });

    panel.querySelector("#btnUnjoinAll")?.addEventListener("click", () => {
      this._roomAssignedPlayers().forEach((id) => {
        if (this._isGrouped(id)) this._callService("media_player", "unjoin", { entity_id: id });
      });
      this._groupSelection.clear();
      this._renderLeft();
    });

    panel.querySelectorAll(".source-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const entityId = btn.dataset.sourceEntity;
        const source = btn.dataset.source;
        this._callService("media_player", "select_source",
          { entity_id: entityId, source });
      });
    });
  }

  // ═══════════════════════════════════════════════
  // RIGHT PANEL
  // ═══════════════════════════════════════════════

  _renderRight() {
    const panel = this.shadowRoot.getElementById("rightPanel");
    if (!panel) return;

    const hasPlan = !!this._floorPlanSrc;

    panel.innerHTML = `
      <div class="fp-toolbar">
        <span class="fp-toolbar-title">Floor Plan</span>
        ${hasPlan ? `<button class="fp-btn primary" id="btnAddRoom">${ICON.add} Add Room</button>` : ""}
        <button class="fp-btn" id="btnUpload">${ICON.upload} ${hasPlan ? "Replace" : "Upload Blueprint"}</button>
      </div>
      <div class="fp-area ${this._placingRoom ? "placing" : ""}" id="fpArea">
        ${hasPlan ? this._renderFloorPlan() : this._renderEmptyState()}
      </div>
      ${this._editingRoom !== null ? this._renderRoomModal() : ""}
    `;

    this._bindRightEvents(panel);
    this._bindRoomOverlays(panel);
  }

  _renderEmptyState() {
    return `
      <div class="fp-empty">
        ${ICON.home}
        <h3>No Blueprint Loaded</h3>
        <p>Upload an SVG or image of your floor plan, then add clickable room zones to control speakers.</p>
        <button class="fp-btn primary" id="btnUploadEmpty">${ICON.upload} Upload Blueprint</button>
      </div>
    `;
  }

  _renderFloorPlan() {
    const overlays = this._rooms.map((r) => this._renderRoomOverlay(r)).join("");
    const popup = this._activeRoom !== null
      ? this._renderRoomPopup(this._rooms.find((r) => r.id === this._activeRoom))
      : "";

    const inner = this._floorPlanType === "svg"
      ? `<div id="svgContainer">${this._floorPlanSrc}</div>`
      : `<img src="${this._floorPlanSrc}" id="floorImg" alt="Floor Plan">`;

    return `<div class="fp-canvas" id="floorCanvas">${inner}${overlays}${popup}</div>`;
  }

  _renderRoomOverlay(room) {
    const speakers = room.entities || [];
    const hasPlaying = speakers.some((id) => this._hass?.states[id]?.state === "playing");
    return `
      <div class="room-overlay ${this._activeRoom === room.id ? "active" : ""} ${speakers.length ? "has-speakers" : ""}"
           data-room-id="${room.id}"
           style="left:${room.x}%;top:${room.y}%;width:${room.w}%;height:${room.h}%">
        <span class="room-label">${this._esc(room.name)}</span>
        ${speakers.length ? `<span class="room-speaker-badge">${speakers.length}</span>` : ""}
        ${hasPlaying ? `<span class="room-playing-pulse"><div class="room-playing-pulse-dot"></div></span>` : ""}
      </div>
    `;
  }

  _renderRoomPopup(room) {
    if (!room) return "";
    const speakers = (room.entities || []).map((id) => {
      const s = this._hass?.states[id];
      return {
        id,
        name: s?.attributes?.friendly_name || id,
        state: s?.state || "unavailable",
        vol: s?.attributes?.volume_level != null ? Math.round(s.attributes.volume_level * 100) : 50,
        muted: s?.attributes?.is_volume_muted || false,
      };
    });

    return `
      <div class="room-popup" id="roomPopup"
           style="left:${this._roomPopupPos.x}px;top:${this._roomPopupPos.y}px">
        <div class="popup-header">
          <span class="popup-title">${this._esc(room.name)}</span>
          <button class="popup-icon-btn" id="btnEditRoom" title="Edit">${ICON.edit}</button>
          <button class="popup-icon-btn" id="btnClosePopup" title="Close">${ICON.close}</button>
        </div>
        ${speakers.length === 0
          ? `<div class="popup-empty">No speakers assigned.<br>Double-click the room or press edit to add.</div>`
          : speakers.map((sp) => this._renderSpeakerEntry(sp)).join("")
        }
      </div>
    `;
  }

  _renderSpeakerEntry(sp) {
    return `
      <div class="speaker-entry">
        <div class="speaker-entry-top">
          <span class="s-dot ${sp.state === "playing" ? "playing" : ""}"></span>
          <span class="speaker-name">${this._esc(sp.name)}</span>
          <span class="speaker-state ${sp.state === "playing" ? "playing" : ""}">${sp.state}</span>
        </div>
        <div class="speaker-vol-row">
          <button class="mute-btn ${sp.muted ? "muted" : ""}" data-mute-entity="${sp.id}">
            ${sp.muted || sp.vol === 0 ? ICON.volOff : sp.vol < 50 ? ICON.volMid : ICON.volHi}
          </button>
          <input type="range" min="0" max="100" value="${sp.vol}" data-vol-entity="${sp.id}" style="flex:1">
          <span class="vol-value" data-vol-label="${sp.id}">${sp.vol}%</span>
        </div>
      </div>
    `;
  }

  _renderRoomModal() {
    const isNew = this._editingRoom === "__new__";
    const room = isNew
      ? { name: "", entities: [] }
      : this._rooms.find((r) => r.id === this._editingRoom) || { name: "", entities: [] };

    return `
      <div class="modal-overlay" id="modalOverlay">
        <div class="modal">
          <h3>${isNew ? "New Room" : "Edit Room"}</h3>
          <div class="form-group">
            <label>Room Name</label>
            <input type="text" id="roomNameInput" value="${this._esc(room.name)}" placeholder="e.g. Living Room">
          </div>
          <div class="form-group">
            <label>Assign Speakers</label>
            <div class="entity-checkbox-list">
              ${this._players.length === 0
                ? `<div style="color:var(--text3);font-size:0.82rem;padding:8px 0">No media players found.</div>`
                : this._players.map((id) => {
                    const s = this._hass?.states[id];
                    const name = s?.attributes?.friendly_name || id;
                    const checked = (room.entities || []).includes(id);
                    return `
                      <div class="entity-checkbox-item">
                        <input type="checkbox" id="chk_${id}" value="${id}" ${checked ? "checked" : ""}>
                        <label for="chk_${id}">${this._esc(name)}</label>
                      </div>
                    `;
                  }).join("")
              }
            </div>
          </div>
          <div class="modal-actions">
            ${!isNew ? `<button class="btn btn-danger" id="btnDeleteRoom">${ICON.delete} Delete</button>` : ""}
            <button class="btn btn-secondary" id="btnCancelModal">Cancel</button>
            <button class="btn btn-primary" id="btnSaveRoom">Save</button>
          </div>
        </div>
      </div>
    `;
  }

  // ── Right Panel Events ────────────────────────────────────────────────────────

  _bindRightEvents(panel) {
    panel.querySelector("#btnUpload")?.addEventListener("click", () => this.shadowRoot.getElementById("fileInput").click());
    panel.querySelector("#btnUploadEmpty")?.addEventListener("click", () => this.shadowRoot.getElementById("fileInput").click());
    panel.querySelector("#btnAddRoom")?.addEventListener("click", () => this._startPlacingRoom());

    const fpArea = panel.querySelector("#fpArea");
    if (fpArea && this._placingRoom) {
      fpArea.addEventListener("click", (e) => {
        if (e.target === fpArea) { this._placingRoom = false; this._renderRight(); }
      });
    }

    this._bindModalEvents(panel);
    this._bindPopupEvents(panel);

    const canvas = panel.querySelector("#floorCanvas");
    if (canvas) canvas.addEventListener("click", (e) => this._onCanvasClick(e, canvas));
  }

  _bindRoomOverlays(panel) {
    panel.querySelectorAll(".room-overlay").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this._placingRoom) return;
        const id = el.dataset.roomId;
        if (this._activeRoom === id) {
          this._activeRoom = null;
        } else {
          this._activeRoom = id;
          const canvas = panel.querySelector("#floorCanvas");
          const cr = canvas?.getBoundingClientRect() ?? { left: 0, top: 0 };
          this._roomPopupPos = { x: e.clientX - cr.left + 10, y: e.clientY - cr.top + 10 };
        }
        this._renderRight();
      });

      el.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        this._editingRoom = el.dataset.roomId;
        this._activeRoom = null;
        this._renderRight();
      });
    });
  }

  _bindPopupEvents(panel) {
    panel.querySelector("#btnClosePopup")?.addEventListener("click", () => {
      this._activeRoom = null; this._renderRight();
    });

    panel.querySelector("#btnEditRoom")?.addEventListener("click", () => {
      this._editingRoom = this._activeRoom;
      this._activeRoom = null;
      this._renderRight();
    });

    panel.querySelectorAll("[data-vol-entity]").forEach((sl) => {
      const id = sl.dataset.volEntity;
      const sv = debounce((v) => this._callService("media_player", "volume_set",
        { entity_id: id, volume_level: v / 100 }), 300);
      sl.addEventListener("input", (e) => {
        const v = parseInt(e.target.value);
        const lbl = panel.querySelector(`[data-vol-label="${id}"]`);
        if (lbl) lbl.textContent = `${v}%`;
        sv(v);
      });
    });

    panel.querySelectorAll("[data-mute-entity]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.muteEntity;
        const s = this._hass?.states[id];
        if (!s) return;
        this._callService("media_player", "volume_mute",
          { entity_id: id, is_volume_muted: !s.attributes.is_volume_muted });
      });
    });
  }

  _bindModalEvents(panel) {
    const overlay = panel.querySelector("#modalOverlay");
    if (!overlay) return;
    overlay.addEventListener("click", (e) => { if (e.target === overlay) this._cancelModal(); });
    panel.querySelector("#btnCancelModal")?.addEventListener("click", () => this._cancelModal());
    panel.querySelector("#btnSaveRoom")?.addEventListener("click", () => this._saveRoom(panel));
    panel.querySelector("#btnDeleteRoom")?.addEventListener("click", () => this._deleteRoom(this._editingRoom));
  }

  _startPlacingRoom() {
    this._placingRoom = true;
    this._activeRoom = null;
    this._renderRight();
    const area = this.shadowRoot.querySelector("#fpArea");
    if (area) {
      const hint = document.createElement("div");
      hint.className = "instructions-hint";
      hint.textContent = "Click on the floor plan to place a new room";
      area.appendChild(hint);
    }
  }

  _onCanvasClick(e, canvas) {
    if (!this._placingRoom) return;
    e.stopPropagation();
    const rect = canvas.getBoundingClientRect();
    const newRoom = {
      id: `room_${Date.now()}`,
      name: "",
      entities: [],
      x: clamp(((e.clientX - rect.left) / rect.width) * 100 - 5, 0, 90),
      y: clamp(((e.clientY - rect.top) / rect.height) * 100 - 5, 0, 90),
      w: 15, h: 12,
    };
    this._rooms.push(newRoom);
    this._placingRoom = false;
    this._editingRoom = newRoom.id;
    this._persist();
    this._renderRight();
  }

  _cancelModal() {
    if (this._editingRoom) {
      const room = this._rooms.find((r) => r.id === this._editingRoom);
      if (room && !room.name) {
        this._rooms = this._rooms.filter((r) => r.id !== this._editingRoom);
        this._persist();
      }
    }
    this._editingRoom = null;
    this._renderRight();
  }

  _saveRoom(panel) {
    const name = panel.querySelector("#roomNameInput")?.value?.trim() || "Room";
    const entities = [...panel.querySelectorAll(".entity-checkbox-list input:checked")].map((c) => c.value);
    const room = this._rooms.find((r) => r.id === this._editingRoom);
    if (room) { room.name = name; room.entities = entities; }
    this._editingRoom = null;
    this._persist();
    this._renderRight();
  }

  _deleteRoom(id) {
    this._rooms = this._rooms.filter((r) => r.id !== id);
    this._editingRoom = null;
    this._activeRoom = null;
    this._persist();
    this._renderRight();
  }

  // ── File Input ────────────────────────────────────────────────────────────────

  _bindFileInput() {
    const fi = this.shadowRoot.getElementById("fileInput");
    if (!fi || fi._bound) return;
    fi._bound = true;
    fi.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const isSvg = file.name.endsWith(".svg") || file.type === "image/svg+xml";
      const reader = new FileReader();
      reader.onload = (ev) => {
        this._floorPlanSrc = ev.target.result;
        this._floorPlanType = isSvg ? "svg" : "img";
        this._persist();
        this._renderRight();
      };
      isSvg ? reader.readAsText(file) : reader.readAsDataURL(file);
      fi.value = "";
    });
  }

  // ── HA Service ────────────────────────────────────────────────────────────────

  _callService(domain, service, data) {
    this._hass?.callService(domain, service, data);
  }

  _esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
}

customElements.define("hass-media-dashboard", MediaDashboardPanel);
window.customPanelLoaded = true;
