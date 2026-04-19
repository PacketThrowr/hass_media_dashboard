/**
 * Home Assistant Media Dashboard - Custom Panel
 * Displays a floor plan with clickable rooms and Music Assistant speaker controls.
 */

const CARD_VERSION = "1.0.0";

// ── Helpers ──────────────────────────────────────────────────────────────────

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── Styles ───────────────────────────────────────────────────────────────────

const STYLES = `
  :host {
    display: flex;
    height: 100vh;
    font-family: var(--primary-font-family, sans-serif);
    background: var(--primary-background-color, #111);
    color: var(--primary-text-color, #eee);
    overflow: hidden;
  }

  /* ── Left Panel ── */
  .left-panel {
    display: flex;
    flex-direction: column;
    width: 360px;
    min-width: 320px;
    background: var(--card-background-color, #1c1c1c);
    border-right: 1px solid var(--divider-color, #2a2a2a);
    overflow: hidden;
    box-sizing: border-box;
  }

  /* ── Player dropdown ── */
  .player-dropdown-wrap {
    padding: 14px 16px 10px;
    border-bottom: 1px solid var(--divider-color, #2a2a2a);
    flex-shrink: 0;
  }

  .dropdown-label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--secondary-text-color, #666);
    margin-bottom: 8px;
  }

  .player-select-custom {
    position: relative;
  }

  .player-select-custom select {
    width: 100%;
    padding: 10px 36px 10px 14px;
    background: var(--secondary-background-color, #252525);
    border: 1px solid var(--divider-color, #383838);
    border-radius: 10px;
    color: var(--primary-text-color, #eee);
    font-size: 0.9rem;
    font-family: inherit;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
    outline: none;
    transition: border-color 0.15s;
  }

  .player-select-custom select:focus {
    border-color: var(--accent-color, #6200ea);
  }

  .player-select-arrow {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--secondary-text-color, #777);
  }

  .player-select-arrow svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
    display: block;
  }

  /* ── Now Playing card area ── */
  .now-playing-wrap {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  /* ── Media card ── */
  .media-card {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .media-art-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    overflow: hidden;
    flex-shrink: 0;
  }

  .media-art {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .media-art-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom,
      transparent 40%,
      rgba(0,0,0,0.7) 100%
    );
    pointer-events: none;
  }

  .media-art-overlay-text {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px 20px 0;
  }

  .media-art-title {
    font-size: 1.15rem;
    font-weight: 700;
    line-height: 1.25;
    color: #fff;
    text-shadow: 0 1px 4px rgba(0,0,0,0.6);
    margin-bottom: 3px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .media-art-artist {
    font-size: 0.85rem;
    color: rgba(255,255,255,0.75);
    text-shadow: 0 1px 3px rgba(0,0,0,0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .media-art-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  }

  .media-art-placeholder svg {
    width: 72px;
    height: 72px;
    fill: rgba(255,255,255,0.15);
  }

  /* Progress */
  .progress-section {
    padding: 16px 20px 0;
    flex-shrink: 0;
  }

  .progress-bar-wrap {
    position: relative;
    height: 3px;
    border-radius: 2px;
    background: var(--divider-color, #383838);
    cursor: pointer;
    overflow: visible;
  }

  .progress-bar-fill {
    height: 100%;
    border-radius: 2px;
    background: var(--accent-color, #6200ea);
    transition: width 1s linear;
    position: relative;
  }

  .progress-bar-fill::after {
    content: '';
    position: absolute;
    right: -5px;
    top: 50%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--accent-color, #6200ea);
    opacity: 0;
    transition: opacity 0.15s;
  }

  .progress-bar-wrap:hover .progress-bar-fill::after {
    opacity: 1;
  }

  .progress-times {
    display: flex;
    justify-content: space-between;
    font-size: 0.68rem;
    color: var(--secondary-text-color, #666);
    margin-top: 6px;
  }

  /* Controls */
  .controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 12px 20px 10px;
    flex-shrink: 0;
  }

  .ctrl-btn {
    background: none;
    border: none;
    color: var(--primary-text-color, #ccc);
    cursor: pointer;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;
  }

  .ctrl-btn:hover {
    background: rgba(255,255,255,0.07);
    color: #fff;
  }

  .ctrl-btn.primary {
    width: 56px;
    height: 56px;
    background: var(--accent-color, #6200ea);
    color: #fff;
    box-shadow: 0 4px 16px rgba(98,0,234,0.35);
  }

  .ctrl-btn.primary:hover {
    opacity: 0.88;
    box-shadow: 0 4px 20px rgba(98,0,234,0.5);
  }

  .ctrl-btn svg {
    width: 22px;
    height: 22px;
    fill: currentColor;
  }

  .ctrl-btn.primary svg {
    width: 26px;
    height: 26px;
  }

  /* Volume row */
  .active-volume {
    padding: 4px 20px 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .mute-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    color: var(--secondary-text-color, #777);
    flex-shrink: 0;
    transition: color 0.15s;
  }

  .mute-btn:hover { color: var(--primary-text-color, #eee); }

  .mute-btn svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }

  .mute-btn.muted { color: var(--error-color, #f44336); }

  /* ── Nothing Playing state ── */
  .nothing-playing {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 32px;
    text-align: center;
    gap: 0;
  }

  .nothing-playing-icon {
    width: 96px;
    height: 96px;
    margin-bottom: 24px;
    position: relative;
  }

  .nothing-playing-icon-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.06);
    animation: np-pulse 3s ease-in-out infinite;
  }

  .nothing-playing-icon-ring:nth-child(2) {
    inset: -12px;
    animation-delay: 1s;
    border-color: rgba(255,255,255,0.03);
  }

  .nothing-playing-icon svg {
    position: absolute;
    inset: 0;
    margin: auto;
    width: 48px;
    height: 48px;
    fill: rgba(255,255,255,0.12);
  }

  @keyframes np-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.08); opacity: 0.6; }
  }

  .nothing-playing h3 {
    margin: 0 0 8px;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--secondary-text-color, #777);
  }

  .nothing-playing p {
    margin: 0;
    font-size: 0.82rem;
    color: var(--disabled-text-color, #555);
    line-height: 1.6;
    max-width: 220px;
  }

  /* ── Player status dot (used in popup) ── */
  .player-status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--disabled-text-color, #555);
    flex-shrink: 0;
  }

  .player-status-dot.playing {
    background: #4caf50;
    box-shadow: 0 0 5px #4caf50;
  }

  /* ── Right Panel ── */
  .right-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }

  .floor-plan-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--card-background-color, #1c1c1c);
    border-bottom: 1px solid var(--divider-color, #333);
    flex-shrink: 0;
  }

  .floor-plan-toolbar h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    flex: 1;
  }

  .upload-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--accent-color, #6200ea);
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 0.85rem;
    cursor: pointer;
    font-family: inherit;
    transition: opacity 0.15s;
  }

  .upload-btn:hover { opacity: 0.85; }

  .upload-btn svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }

  .floor-plan-area {
    flex: 1;
    overflow: auto;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .floor-plan-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: var(--secondary-text-color, #777);
    text-align: center;
    padding: 40px;
  }

  .floor-plan-empty svg {
    width: 80px;
    height: 80px;
    fill: var(--disabled-text-color, #444);
  }

  .floor-plan-empty h3 {
    margin: 0;
    font-size: 1.1rem;
    color: var(--secondary-text-color, #999);
  }

  .floor-plan-empty p {
    margin: 0;
    font-size: 0.85rem;
    max-width: 280px;
    line-height: 1.5;
  }

  /* Floor plan SVG / image container */
  .floor-plan-canvas {
    position: relative;
    display: inline-block;
    max-width: 100%;
    max-height: 100%;
  }

  .floor-plan-canvas img {
    max-width: 100%;
    max-height: calc(100vh - 80px);
    display: block;
    border-radius: 8px;
  }

  .floor-plan-canvas svg.blueprint {
    max-width: 100%;
    max-height: calc(100vh - 80px);
  }

  /* Room overlays */
  .room-overlay {
    position: absolute;
    border-radius: 6px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: rgba(255,255,255,0.0);
    overflow: visible;
    box-sizing: border-box;
  }

  .room-overlay:hover,
  .room-overlay.active {
    background: rgba(98,0,234,0.15);
    border-color: rgba(98,0,234,0.6);
    color: rgba(255,255,255,0.9);
  }

  .room-overlay .room-label {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    background: rgba(0,0,0,0.6);
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .room-overlay:hover .room-label,
  .room-overlay.active .room-label {
    opacity: 1;
  }

  .room-speaker-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: var(--accent-color, #6200ea);
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6rem;
    font-weight: 700;
    color: #fff;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
  }

  .room-overlay.has-speakers .room-speaker-badge {
    opacity: 1;
  }

  /* Room popup panel */
  .room-popup {
    position: absolute;
    background: var(--card-background-color, #1c1c1c);
    border: 1px solid var(--divider-color, #444);
    border-radius: 12px;
    padding: 16px;
    min-width: 260px;
    max-width: 320px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    z-index: 100;
    box-sizing: border-box;
  }

  .room-popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .room-popup-title {
    font-size: 0.95rem;
    font-weight: 600;
  }

  .room-popup-close {
    background: none;
    border: none;
    color: var(--secondary-text-color, #888);
    cursor: pointer;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }

  .room-popup-close:hover { background: rgba(255,255,255,0.08); }

  .room-popup-close svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }

  .speaker-row {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .speaker-entry {
    padding: 10px 12px;
    background: var(--secondary-background-color, #252525);
    border-radius: 8px;
  }

  .speaker-entry-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .speaker-entry-name {
    flex: 1;
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .speaker-entry-state {
    font-size: 0.7rem;
    color: var(--secondary-text-color, #888);
    flex-shrink: 0;
  }

  .speaker-entry-state.playing {
    color: #4caf50;
  }

  /* Volume Slider */
  .volume-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .volume-row svg {
    width: 16px;
    height: 16px;
    fill: var(--secondary-text-color, #888);
    flex-shrink: 0;
  }

  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    flex: 1;
    height: 4px;
    border-radius: 2px;
    background: var(--divider-color, #444);
    outline: none;
    cursor: pointer;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--accent-color, #6200ea);
    cursor: pointer;
    transition: transform 0.1s;
  }

  input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  input[type="range"]::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--accent-color, #6200ea);
    border: none;
    cursor: pointer;
  }

  .volume-value {
    font-size: 0.75rem;
    color: var(--secondary-text-color, #888);
    min-width: 32px;
    text-align: right;
    flex-shrink: 0;
  }

  /* Mute toggle */
  .mute-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    color: var(--secondary-text-color, #888);
  }

  .mute-btn.muted {
    color: var(--error-color, #f44336);
  }

  /* Room editor modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    box-sizing: border-box;
  }

  .modal {
    background: var(--card-background-color, #1c1c1c);
    border-radius: 16px;
    padding: 24px;
    width: 100%;
    max-width: 480px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 16px 48px rgba(0,0,0,0.6);
  }

  .modal h3 {
    margin: 0 0 16px;
    font-size: 1.1rem;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }

  .btn {
    padding: 8px 18px;
    border-radius: 8px;
    border: none;
    font-size: 0.875rem;
    font-family: inherit;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .btn:hover { opacity: 0.85; }

  .btn-primary {
    background: var(--accent-color, #6200ea);
    color: #fff;
  }

  .btn-secondary {
    background: var(--secondary-background-color, #333);
    color: var(--primary-text-color, #eee);
  }

  .btn-danger {
    background: var(--error-color, #f44336);
    color: #fff;
  }

  .form-group {
    margin-bottom: 14px;
  }

  .form-group label {
    display: block;
    font-size: 0.8rem;
    color: var(--secondary-text-color, #999);
    margin-bottom: 6px;
    font-weight: 500;
  }

  .form-group input[type="text"],
  .form-group select {
    width: 100%;
    padding: 8px 12px;
    background: var(--secondary-background-color, #2a2a2a);
    border: 1px solid var(--divider-color, #444);
    border-radius: 8px;
    color: var(--primary-text-color, #eee);
    font-size: 0.875rem;
    font-family: inherit;
    box-sizing: border-box;
    outline: none;
  }

  .form-group input[type="text"]:focus,
  .form-group select:focus {
    border-color: var(--accent-color, #6200ea);
  }

  .entity-checkbox-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 200px;
    overflow-y: auto;
    padding: 2px 0;
  }

  .entity-checkbox-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 6px;
    background: var(--secondary-background-color, #252525);
    cursor: pointer;
    user-select: none;
  }

  .entity-checkbox-item input[type="checkbox"] {
    accent-color: var(--accent-color, #6200ea);
    width: 16px;
    height: 16px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .entity-checkbox-item label {
    font-size: 0.85rem;
    cursor: pointer;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Add room button on floor plan */
  .add-room-btn {
    position: absolute;
    bottom: 16px;
    right: 16px;
    background: var(--accent-color, #6200ea);
    color: #fff;
    border: none;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.15s;
    z-index: 10;
  }

  .add-room-btn:hover { opacity: 0.85; }

  .instructions-bar {
    background: rgba(98,0,234,0.12);
    border: 1px solid rgba(98,0,234,0.3);
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 0.8rem;
    color: var(--secondary-text-color, #aaa);
    text-align: center;
  }

  /* Placing mode crosshair */
  .floor-plan-area.placing {
    cursor: crosshair;
  }
`;

// ── SVG Icons ─────────────────────────────────────────────────────────────────

const ICON = {
  play: `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`,
  pause: `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
  prev: `<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>`,
  next: `<svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zm2.5-6l5.5 3.9V8.1L8.5 12zM16 6h2v12h-2z"/></svg>`,
  volUp: `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
  volOff: `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`,
  volLow: `<svg viewBox="0 0 24 24"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>`,
  upload: `<svg viewBox="0 0 24 24"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>`,
  close: `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
  home: `<svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
  music: `<svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`,
  edit: `<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`,
  delete: `<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
  add: `<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`,
};

// ── Room Overlay dragging utilities ──────────────────────────────────────────

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// ── Main Panel Element ────────────────────────────────────────────────────────

class MediaDashboardPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // HA binding
    this._hass = null;
    this._hassConnected = false;
    this._unsubscribe = null;

    // State
    this._players = [];           // Music Assistant media_player entities
    this._selectedPlayer = null;  // entity_id of focused player
    this._floorPlanSrc = null;    // data URL or img src
    this._floorPlanType = null;   // "svg" | "img"
    this._rooms = [];             // [{ id, name, entities, x, y, w, h }]
    this._activeRoom = null;      // room id of open popup
    this._roomPopupPos = { x: 0, y: 0 };
    this._editingRoom = null;     // room being edited in modal
    this._placingRoom = false;    // waiting for click on floor plan
    this._dragState = null;       // for dragging rooms
    this._progressTimer = null;

    this._loadPersisted();
    this._render();
    this._bindFileInput();
  }

  // ── HA Integration ──────────────────────────────────────────────────────────

  set hass(hass) {
    const prev = this._hass;
    this._hass = hass;
    if (!this._hassConnected) {
      this._hassConnected = true;
      this._subscribePlayers();
    }
    this._syncPlayers();
    // Auto-select: prefer a playing player; if current selection stopped, pick next active one
    const activePlayers = this._players.filter(
      (p) => hass.states[p]?.state === "playing" || hass.states[p]?.state === "paused"
    );
    if (!this._selectedPlayer && activePlayers.length) {
      this._selectedPlayer = activePlayers.find((p) => hass.states[p]?.state === "playing") || activePlayers[0];
    } else if (this._selectedPlayer && !activePlayers.includes(this._selectedPlayer) && activePlayers.length) {
      // Previously selected player is no longer active — switch to one that is
      this._selectedPlayer = activePlayers.find((p) => hass.states[p]?.state === "playing") || activePlayers[0];
    } else if (!activePlayers.length) {
      this._selectedPlayer = null;
    }
    this._updateAll();
  }

  _subscribePlayers() {
    // Nothing async needed — HA pushes hass updates reactively.
  }

  _syncPlayers() {
    if (!this._hass) return;
    this._players = Object.keys(this._hass.states).filter((id) => {
      const state = this._hass.states[id];
      return (
        id.startsWith("media_player.") &&
        state.attributes.supported_features !== undefined &&
        // Music Assistant entities have mass_ attributes or source_list hints
        (state.attributes.mass_player_id !== undefined ||
          (state.attributes.app_name || "").toLowerCase().includes("music") ||
          id.includes("mass") ||
          // Fallback: include all media_players if no MA detected
          true)
      );
    });
  }

  // ── Persistence ─────────────────────────────────────────────────────────────

  _loadPersisted() {
    try {
      const raw = localStorage.getItem("hass_media_dashboard");
      if (raw) {
        const data = JSON.parse(raw);
        this._rooms = data.rooms || [];
        this._floorPlanSrc = data.floorPlanSrc || null;
        this._floorPlanType = data.floorPlanType || null;
      }
    } catch (_) {}
  }

  _persist() {
    try {
      const data = {
        rooms: this._rooms,
        // Only persist small floor plans (avoid quota exceeded for large images)
        floorPlanSrc:
          this._floorPlanSrc && this._floorPlanSrc.length < 2_000_000
            ? this._floorPlanSrc
            : null,
        floorPlanType: this._floorPlanType,
      };
      localStorage.setItem("hass_media_dashboard", JSON.stringify(data));
    } catch (_) {}
  }

  // ── Rendering ────────────────────────────────────────────────────────────────

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
    this._renderRight();
  }

  // ── Left Panel ───────────────────────────────────────────────────────────────

  _activePlayers() {
    if (!this._hass) return [];
    return this._players.filter((id) => {
      const s = this._hass.states[id]?.state;
      return s === "playing" || s === "paused";
    });
  }

  _renderLeft() {
    const panel = this.shadowRoot.getElementById("leftPanel");
    if (!panel) return;

    const active = this._activePlayers();
    const selId = this._selectedPlayer;
    const selState = selId && this._hass ? this._hass.states[selId] : null;

    panel.innerHTML = `
      <div class="player-dropdown-wrap">
        <div class="dropdown-label">Now Playing</div>
        ${this._renderPlayerDropdown(active)}
      </div>
      <div class="now-playing-wrap">
        ${active.length === 0 ? this._renderNothingPlaying() : this._renderMediaCard(selId, selState)}
      </div>
    `;

    this._bindLeftEvents(panel);
  }

  _renderPlayerDropdown(activePlayers) {
    if (activePlayers.length === 0) {
      return `
        <div class="player-select-custom">
          <select disabled>
            <option>No active players</option>
          </select>
          <span class="player-select-arrow"><svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg></span>
        </div>
      `;
    }
    const options = activePlayers.map((id) => {
      const s = this._hass.states[id];
      const name = s?.attributes?.friendly_name || id;
      const isPlaying = s?.state === "playing";
      const indicator = isPlaying ? "▶ " : "⏸ ";
      return `<option value="${id}" ${id === this._selectedPlayer ? "selected" : ""}>${indicator}${this._esc(name)}</option>`;
    }).join("");
    return `
      <div class="player-select-custom">
        <select id="playerSelect">${options}</select>
        <span class="player-select-arrow"><svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg></span>
      </div>
    `;
  }

  _renderNothingPlaying() {
    return `
      <div class="nothing-playing">
        <div class="nothing-playing-icon">
          <div class="nothing-playing-icon-ring"></div>
          <div class="nothing-playing-icon-ring"></div>
          ${ICON.music}
        </div>
        <h3>Nothing Playing</h3>
        <p>Start playing music in any room and it will appear here.</p>
      </div>
    `;
  }

  _renderMediaCard(entityId, state) {
    if (!state) return this._renderNothingPlaying();

    const attr = state.attributes;
    const playing = state.state === "playing";
    const art = attr.entity_picture
      ? `<img class="media-art" src="${this._esc(attr.entity_picture)}" alt="">`
      : `<div class="media-art-placeholder">${ICON.music}</div>`;
    const title = attr.media_title || attr.media_album_name || "Unknown";
    const artist = attr.media_artist || attr.media_album_artist || "";
    const duration = attr.media_duration || 0;
    const position = attr.media_position || 0;
    const volume = attr.volume_level != null ? attr.volume_level : 1;
    const muted = attr.is_volume_muted || false;
    const progress = duration > 0 ? (position / duration) * 100 : 0;

    return `
      <div class="media-card">
        <div class="media-art-wrap">
          ${art}
          ${attr.entity_picture ? `<div class="media-art-gradient"></div>` : ""}
          <div class="media-art-overlay-text">
            <div class="media-art-title">${this._esc(title)}</div>
            ${artist ? `<div class="media-art-artist">${this._esc(artist)}</div>` : ""}
          </div>
        </div>
        <div class="progress-section">
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" style="width:${progress}%"></div>
          </div>
          <div class="progress-times">
            <span>${formatTime(position)}</span>
            <span>${formatTime(duration)}</span>
          </div>
        </div>
        <div class="controls">
          <button class="ctrl-btn" id="btnPrev" title="Previous">${ICON.prev}</button>
          <button class="ctrl-btn primary" id="btnPlayPause" title="${playing ? "Pause" : "Play"}">
            ${playing ? ICON.pause : ICON.play}
          </button>
          <button class="ctrl-btn" id="btnNext" title="Next">${ICON.next}</button>
        </div>
        <div class="active-volume">
          <button class="mute-btn ${muted ? "muted" : ""}" id="btnMute">
            ${muted || volume === 0 ? ICON.volOff : volume < 0.5 ? ICON.volLow : ICON.volUp}
          </button>
          <input type="range" id="volumeSlider" min="0" max="100" value="${Math.round(volume * 100)}" style="flex:1">
          <span class="volume-value">${Math.round(volume * 100)}%</span>
        </div>
      </div>
    `;
  }

  _bindLeftEvents(panel) {
    // Dropdown selection
    panel.querySelector("#playerSelect")?.addEventListener("change", (e) => {
      this._selectedPlayer = e.target.value;
      this._renderLeft();
    });

    // Play/pause
    const btnPP = panel.querySelector("#btnPlayPause");
    if (btnPP) {
      btnPP.addEventListener("click", () => {
        const state = this._hass?.states[this._selectedPlayer];
        if (!state) return;
        const svc = state.state === "playing" ? "media_pause" : "media_play";
        this._callService("media_player", svc, { entity_id: this._selectedPlayer });
      });
    }

    // Previous
    panel.querySelector("#btnPrev")?.addEventListener("click", () => {
      this._callService("media_player", "media_previous_track", { entity_id: this._selectedPlayer });
    });

    // Next
    panel.querySelector("#btnNext")?.addEventListener("click", () => {
      this._callService("media_player", "media_next_track", { entity_id: this._selectedPlayer });
    });

    // Volume slider
    const slider = panel.querySelector("#volumeSlider");
    if (slider) {
      const setVol = debounce((val) => {
        this._callService("media_player", "volume_set", {
          entity_id: this._selectedPlayer,
          volume_level: val / 100,
        });
      }, 300);
      slider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value);
        const label = panel.querySelector(".active-volume .volume-value");
        if (label) label.textContent = `${val}%`;
        setVol(val);
      });
    }

    // Mute
    panel.querySelector("#btnMute")?.addEventListener("click", () => {
      const state = this._hass?.states[this._selectedPlayer];
      if (!state) return;
      this._callService("media_player", "volume_mute", {
        entity_id: this._selectedPlayer,
        is_volume_muted: !state.attributes.is_volume_muted,
      });
    });
  }

  // ── Right Panel ──────────────────────────────────────────────────────────────

  _renderRight() {
    const panel = this.shadowRoot.getElementById("rightPanel");
    if (!panel) return;

    const hasPlan = !!this._floorPlanSrc;

    panel.innerHTML = `
      <div class="floor-plan-toolbar">
        <h2>Floor Plan</h2>
        ${
          hasPlan
            ? `<button class="upload-btn" id="btnAddRoom">${ICON.add} Add Room</button>`
            : ""
        }
        <button class="upload-btn" id="btnUpload">${ICON.upload} ${hasPlan ? "Replace" : "Upload Floor Plan"}</button>
      </div>
      <div class="floor-plan-area ${this._placingRoom ? "placing" : ""}" id="floorPlanArea">
        ${hasPlan ? this._renderFloorPlan() : this._renderEmptyState()}
      </div>
      ${this._editingRoom !== null ? this._renderRoomModal() : ""}
    `;

    this._bindRightEvents(panel);
    this._bindRoomOverlays(panel);
  }

  _renderEmptyState() {
    return `
      <div class="floor-plan-empty">
        ${ICON.home}
        <h3>No Floor Plan Loaded</h3>
        <p>Upload an SVG or image of your home's blueprint to get started. You can then add rooms and assign speakers to them.</p>
        <button class="upload-btn" id="btnUploadEmpty">${ICON.upload} Upload Floor Plan</button>
      </div>
    `;
  }

  _renderFloorPlan() {
    const roomOverlays = this._rooms.map((r) => this._renderRoomOverlay(r)).join("");
    const roomPopup =
      this._activeRoom !== null
        ? this._renderRoomPopup(this._rooms.find((r) => r.id === this._activeRoom))
        : "";

    if (this._floorPlanType === "svg") {
      return `
        <div class="floor-plan-canvas" id="floorCanvas">
          <div id="svgContainer">${this._floorPlanSrc}</div>
          ${roomOverlays}
          ${roomPopup}
          <button class="add-room-btn" id="btnAddRoomFab" title="Add Room">${ICON.add}</button>
        </div>
      `;
    } else {
      return `
        <div class="floor-plan-canvas" id="floorCanvas">
          <img src="${this._floorPlanSrc}" id="floorImg" alt="Floor Plan">
          ${roomOverlays}
          ${roomPopup}
          <button class="add-room-btn" id="btnAddRoomFab" title="Add Room">${ICON.add}</button>
        </div>
      `;
    }
  }

  _renderRoomOverlay(room) {
    const speakers = room.entities || [];
    const hasPlaying =
      this._hass &&
      speakers.some((id) => this._hass.states[id]?.state === "playing");
    const hasSpeakers = speakers.length > 0;

    return `
      <div class="room-overlay ${this._activeRoom === room.id ? "active" : ""} ${hasSpeakers ? "has-speakers" : ""}"
           data-room-id="${room.id}"
           style="left:${room.x}%;top:${room.y}%;width:${room.w}%;height:${room.h}%">
        <span class="room-label">${this._esc(room.name)}</span>
        <span class="room-speaker-badge">${speakers.length}</span>
      </div>
    `;
  }

  _renderRoomPopup(room) {
    if (!room) return "";
    const entities = room.entities || [];
    const speakers = entities.map((id) => {
      const state = this._hass?.states[id];
      const name = state?.attributes?.friendly_name || id;
      const st = state?.state || "unavailable";
      const vol =
        state?.attributes?.volume_level != null
          ? Math.round(state.attributes.volume_level * 100)
          : 50;
      const muted = state?.attributes?.is_volume_muted || false;
      return { id, name, state: st, vol, muted };
    });

    return `
      <div class="room-popup" id="roomPopup"
           style="left:${this._roomPopupPos.x}px;top:${this._roomPopupPos.y}px">
        <div class="room-popup-header">
          <span class="room-popup-title">${this._esc(room.name)}</span>
          <div style="display:flex;gap:4px">
            <button class="room-popup-close" id="btnEditRoom" title="Edit room">${ICON.edit}</button>
            <button class="room-popup-close" id="btnClosePopup" title="Close">${ICON.close}</button>
          </div>
        </div>
        ${
          speakers.length === 0
            ? `<div style="color:var(--secondary-text-color,#888);font-size:0.85rem">No speakers assigned. Click edit to add speakers.</div>`
            : `<div class="speaker-row">${speakers.map((sp) => this._renderSpeakerEntry(sp)).join("")}</div>`
        }
      </div>
    `;
  }

  _renderSpeakerEntry(sp) {
    return `
      <div class="speaker-entry">
        <div class="speaker-entry-header">
          <span class="player-status-dot ${sp.state === "playing" ? "playing" : ""}"></span>
          <span class="speaker-entry-name">${this._esc(sp.name)}</span>
          <span class="speaker-entry-state ${sp.state === "playing" ? "playing" : ""}">${sp.state}</span>
        </div>
        <div class="volume-row">
          <button class="mute-btn ${sp.muted ? "muted" : ""}" data-mute-entity="${sp.id}">
            ${sp.muted || sp.vol === 0 ? ICON.volOff : sp.vol < 50 ? ICON.volLow : ICON.volUp}
          </button>
          <input type="range" min="0" max="100" value="${sp.vol}"
                 data-vol-entity="${sp.id}" style="flex:1">
          <span class="volume-value" data-vol-label="${sp.id}">${sp.vol}%</span>
        </div>
      </div>
    `;
  }

  _renderRoomModal() {
    const isNew = this._editingRoom === "__new__";
    const room = isNew
      ? { name: "", entities: [] }
      : this._rooms.find((r) => r.id === this._editingRoom) || { name: "", entities: [] };

    const allPlayers = this._hass ? this._players : [];

    return `
      <div class="modal-overlay" id="modalOverlay">
        <div class="modal">
          <h3>${isNew ? "Add Room" : "Edit Room"}</h3>
          <div class="form-group">
            <label>Room Name</label>
            <input type="text" id="roomNameInput" value="${this._esc(room.name)}" placeholder="e.g. Living Room">
          </div>
          <div class="form-group">
            <label>Speakers / Media Players</label>
            <div class="entity-checkbox-list">
              ${
                allPlayers.length === 0
                  ? `<div style="color:var(--secondary-text-color,#888);font-size:0.85rem;padding:4px">No media players found</div>`
                  : allPlayers
                      .map((id) => {
                        const state = this._hass?.states[id];
                        const name = state?.attributes?.friendly_name || id;
                        const checked = (room.entities || []).includes(id);
                        return `
                          <div class="entity-checkbox-item">
                            <input type="checkbox" id="chk_${id}" value="${id}" ${checked ? "checked" : ""}>
                            <label for="chk_${id}">${this._esc(name)}</label>
                          </div>
                        `;
                      })
                      .join("")
              }
            </div>
          </div>
          <div class="modal-actions">
            ${!isNew ? `<button class="btn btn-danger" id="btnDeleteRoom">Delete</button>` : ""}
            <button class="btn btn-secondary" id="btnCancelModal">Cancel</button>
            <button class="btn btn-primary" id="btnSaveRoom">Save</button>
          </div>
        </div>
      </div>
    `;
  }

  // ── Right Panel Events ────────────────────────────────────────────────────────

  _bindRightEvents(panel) {
    // Upload button(s)
    panel.querySelector("#btnUpload")?.addEventListener("click", () => {
      this.shadowRoot.getElementById("fileInput").click();
    });
    panel.querySelector("#btnUploadEmpty")?.addEventListener("click", () => {
      this.shadowRoot.getElementById("fileInput").click();
    });

    // Add room (toolbar)
    panel.querySelector("#btnAddRoom")?.addEventListener("click", () => {
      this._startPlacingRoom();
    });

    // Add room FAB
    panel.querySelector("#btnAddRoomFab")?.addEventListener("click", () => {
      this._startPlacingRoom();
    });

    // Floor plan click (for placing new room)
    const area = panel.querySelector("#floorCanvas");
    if (area) {
      area.addEventListener("click", (e) => this._onCanvasClick(e, area));
    }

    // Instructions shown in placing mode
    const fpArea = panel.querySelector("#floorPlanArea");
    if (fpArea && this._placingRoom) {
      fpArea.addEventListener("click", (e) => {
        if (e.target === fpArea) {
          // Clicked outside canvas — cancel
          this._placingRoom = false;
          this._renderRight();
        }
      });
    }

    this._bindModalEvents(panel);
    this._bindPopupEvents(panel);
  }

  _bindRoomOverlays(panel) {
    panel.querySelectorAll(".room-overlay").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = el.dataset.roomId;
        if (this._placingRoom) return;
        if (this._activeRoom === id) {
          this._activeRoom = null;
        } else {
          this._activeRoom = id;
          // Position popup near click
          const canvas = panel.querySelector("#floorCanvas");
          const cr = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0 };
          this._roomPopupPos = {
            x: e.clientX - cr.left + 8,
            y: e.clientY - cr.top + 8,
          };
        }
        this._renderRight();
      });

      // Double-click to edit
      el.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        const id = el.dataset.roomId;
        this._editingRoom = id;
        this._activeRoom = null;
        this._renderRight();
      });
    });
  }

  _bindPopupEvents(panel) {
    // Close popup
    panel.querySelector("#btnClosePopup")?.addEventListener("click", () => {
      this._activeRoom = null;
      this._renderRight();
    });

    // Edit room from popup
    panel.querySelector("#btnEditRoom")?.addEventListener("click", () => {
      this._editingRoom = this._activeRoom;
      this._activeRoom = null;
      this._renderRight();
    });

    // Volume sliders in popup
    panel.querySelectorAll("[data-vol-entity]").forEach((slider) => {
      const entityId = slider.dataset.volEntity;
      const setVol = debounce((val) => {
        this._callService("media_player", "volume_set", {
          entity_id: entityId,
          volume_level: val / 100,
        });
      }, 300);
      slider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value);
        const label = panel.querySelector(`[data-vol-label="${entityId}"]`);
        if (label) label.textContent = `${val}%`;
        setVol(val);
      });
    });

    // Mute buttons in popup
    panel.querySelectorAll("[data-mute-entity]").forEach((btn) => {
      const entityId = btn.dataset.muteEntity;
      btn.addEventListener("click", () => {
        const state = this._hass?.states[entityId];
        if (!state) return;
        this._callService("media_player", "volume_mute", {
          entity_id: entityId,
          is_volume_muted: !state.attributes.is_volume_muted,
        });
      });
    });
  }

  _bindModalEvents(panel) {
    const overlay = panel.querySelector("#modalOverlay");
    if (!overlay) return;

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this._cancelModal();
    });

    panel.querySelector("#btnCancelModal")?.addEventListener("click", () => {
      this._cancelModal();
    });

    panel.querySelector("#btnSaveRoom")?.addEventListener("click", () => {
      this._saveRoom(panel);
    });

    panel.querySelector("#btnDeleteRoom")?.addEventListener("click", () => {
      this._deleteRoom(this._editingRoom);
    });
  }

  _startPlacingRoom() {
    this._placingRoom = true;
    this._activeRoom = null;
    this._renderRight();

    // Show instructions
    const area = this.shadowRoot.querySelector("#floorPlanArea");
    if (area) {
      const bar = document.createElement("div");
      bar.className = "instructions-bar";
      bar.style.cssText =
        "position:absolute;bottom:72px;left:50%;transform:translateX(-50%);z-index:20;white-space:nowrap";
      bar.textContent = "Click on the floor plan to place a new room";
      area.appendChild(bar);
    }
  }

  _onCanvasClick(e, canvas) {
    if (!this._placingRoom) return;
    e.stopPropagation();

    const rect = canvas.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    const newRoom = {
      id: `room_${Date.now()}`,
      name: "New Room",
      entities: [],
      x: clamp(xPct - 5, 0, 90),
      y: clamp(yPct - 5, 0, 90),
      w: 15,
      h: 12,
    };

    this._rooms.push(newRoom);
    this._placingRoom = false;
    this._editingRoom = newRoom.id;
    this._persist();
    this._renderRight();
  }

  _cancelModal() {
    // If it was a newly placed room with no save, remove it
    if (this._editingRoom && this._editingRoom !== "__new__") {
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
    const nameInput = panel.querySelector("#roomNameInput");
    const name = nameInput?.value?.trim() || "Room";
    const checked = Array.from(
      panel.querySelectorAll(".entity-checkbox-list input[type=checkbox]:checked")
    ).map((cb) => cb.value);

    if (this._editingRoom === "__new__") {
      // Shouldn't happen — rooms are created on click
    } else {
      const room = this._rooms.find((r) => r.id === this._editingRoom);
      if (room) {
        room.name = name;
        room.entities = checked;
      }
    }

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

  // ── File Input ───────────────────────────────────────────────────────────────

  _bindFileInput() {
    const fi = this.shadowRoot.getElementById("fileInput");
    if (!fi || fi._bound) return;
    fi._bound = true;
    fi.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (file.name.endsWith(".svg") || file.type === "image/svg+xml") {
          this._floorPlanSrc = evt.target.result;
          this._floorPlanType = "svg";
        } else {
          this._floorPlanSrc = evt.target.result;
          this._floorPlanType = "img";
        }
        this._persist();
        this._renderRight();
      };
      if (file.name.endsWith(".svg") || file.type === "image/svg+xml") {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
      fi.value = "";
    });
  }

  // ── HA Service Call ──────────────────────────────────────────────────────────

  _callService(domain, service, data) {
    if (!this._hass) return;
    this._hass.callService(domain, service, data);
  }

  // ── Utilities ────────────────────────────────────────────────────────────────

  _esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}

customElements.define("hass-media-dashboard", MediaDashboardPanel);

// Register as a custom panel
window.customPanelLoaded = true;
