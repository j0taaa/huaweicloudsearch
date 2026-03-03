# Huawei Cloud Quick Search (Chrome Extension)

A Chrome extension that adds a Raycast-style command bar to Huawei Cloud pages.

## Features

- Press **Ctrl+K** (or **⌘+K** on macOS) anywhere on `*.huaweicloud.com`.
- Opens a centered **light-mode** search palette with keyboard navigation.
- Search by full service name (for example, `Elastic Cloud Server`) or short name (`ECS`).
- Shows Huawei Cloud official product icons in search results.
- Hit **Enter** to navigate directly to the selected Huawei Cloud service page.

## Install locally

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this repository folder (`huaweicloudsearch`).

## Usage

1. Open a Huawei Cloud website page.
2. Press `Ctrl+K`.
3. Type a service name or short code (for example: `ecs`, `rds`, `obs`).
4. Use arrow keys to choose an item and press `Enter`.

## Files

- `manifest.json`: extension definition and content script wiring.
- `src/services.js`: list of Huawei Cloud products, aliases, and target URLs.
- `src/content.js`: keyboard shortcut, filtering, and redirect behavior.
- `src/content.css`: Raycast-like centered modal styles.
