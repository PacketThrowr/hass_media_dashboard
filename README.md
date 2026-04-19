# hass_media_dashboard

A Home Assistant custom panel for controlling Music Assistant media players via an interactive floor plan.

## Features

- **Floor plan**: Upload an SVG blueprint or any image (PNG/JPG) of your home
- **Room zones**: Draw clickable room overlays on the floor plan
- **Speaker control**: Click a room to see its assigned speakers and adjust volume with sliders
- **Now Playing**: Left panel shows album art, track info, progress bar, and playback controls for the selected player
- **Persistent**: Rooms and floor plan survive page reloads (stored in localStorage)

## Installation via HACS (recommended)

### Prerequisites
- [HACS](https://hacs.xyz/) installed in Home Assistant

### 1. Add as a custom repository

1. Open HACS in Home Assistant
2. Go to **Frontend**
3. Click the three-dot menu (⋮) → **Custom repositories**
4. Enter your GitHub repository URL (e.g. `https://github.com/YOUR_USERNAME/hass_media_dashboard`)
5. Set category to **Frontend**
6. Click **Add**

### 2. Install it

The repository will now appear in HACS under Frontend. Click **Download** to install it.

### 3. Register the panel

Add this to your `configuration.yaml` (one-time only — HACS handles file updates):

```yaml
panel_custom:
  - name: hass-media-dashboard
    sidebar_title: Media Dashboard
    sidebar_icon: mdi:speaker-multiple
    url_path: media-dashboard
    module_url: /hacsfiles/hass_media_dashboard/hass-media-dashboard.js
```

### 4. Restart Home Assistant

"Media Dashboard" will appear in the sidebar. For future updates, just click **Update** in HACS — no need to touch `configuration.yaml` again.

---

## Manual Installation (alternative)

Copy `hass-media-dashboard.js` to `config/www/hass_media_dashboard/` and use this module URL instead:

```yaml
module_url: /local/hass_media_dashboard/hass-media-dashboard.js
```

---

## Usage

1. Click **Upload Floor Plan** and choose your blueprint image or SVG
2. Click **Add Room** (or the `+` button) then click on the floor plan to place a room zone
3. In the room editor, name the room and check which media players belong to it
4. Click a room zone to open its speaker popup — adjust volume sliders or mute/unmute
5. Select a player from the left panel list to see what it's playing and use global controls

## Music Assistant

The panel auto-discovers all `media_player.*` entities. Music Assistant players are detected by the presence of `mass_player_id` attributes. All standard HA media player services are used:

- `media_player.media_play` / `media_pause`
- `media_player.media_previous_track` / `media_next_track`
- `media_player.volume_set`
- `media_player.volume_mute`
