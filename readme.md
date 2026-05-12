# MySyncCalendar

A fully private, cross-platform personal calendar tool.

> **🌐 中文版本**：[README.zh.md](README.zh.md)

## Core Goals

- Run independently on **Windows Desktop** and **Android**
- Zero cloud dependency — data syncs between devices via local files
- Fully extensible by personal preference (categories, reminders, countdowns, etc.)

## Project Status

> **Project temporarily shelved**, awaiting further development.

| Phase | Goal | Status |
|-------|------|--------|
| **Phase 1 — Desktop** | Electron shell + frontend UI + local JSON file I/O | ✅ Complete |
| **Phase 2 — Mobile** | Capacitor Android APK | 🚧 APK built, UI size adaptation pending |
| **Phase 3 — Sync Verification** | Cross-device Syncthing sync + conflict handling | ⏳ Not started |

- **Desktop**: Fully functional. Pre-built `dist/MySyncCalendar-1.0.0-portable.exe` available.
- **Android**: APK successfully built, but screen size adaptation is incomplete and features have not been individually tested on device.

## Quick Start

```bash
nvm use 24.11.0
ELECTRON_MIRROR=https://mirrors.huaweicloud.com/electron/ npm install
npm start
```

### Build Windows Desktop

```bash
npm run build
# Output: dist/MySyncCalendar-1.0.0-portable.exe (~91 MB)
```

### Build Android APK

```bash
npx cap sync android
cd android && ./gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk (~4 MB)
```

> If the build requires JDK 21, see the known issues section in [Setup & Run](docs/setup-and-run.md).

## Docs

| Document | Contents |
|----------|----------|
| [Roadmap](docs/roadmap.md) | Three-phase plan, status, dependencies |
| [Phase 1 Spec](docs/phase1-spec.md) | UI layout, date display rules, two-level highlight, interactions |
| [Architecture](docs/architecture.md) | Architecture diagram, sync conflict handling, atomic writes, permissions |
| [Project Structure](docs/project-structure.md) | Directory tree, app.js module breakdown |
| [Setup & Run](docs/setup-and-run.md) | Dependencies, install & start, build instructions, expected behavior |
