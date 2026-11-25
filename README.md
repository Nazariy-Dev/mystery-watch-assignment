# Mystery Watch

A React Native + TypeScript app for buying and opening mystery watch boxes. You browse a carousel of live 3D boxes, check each box's odds, spend virtual coins, open a box with a hold-to-open 3D reveal, and keep or sell what you win. The original brief is in [ASSIGNMENT.md](ASSIGNMENT.md).

## Running it

The app is a **development build**. It uses native modules (Unistyles, MMKV, expo-gl, gesture-handler and haptics), so it doesn't run in Expo Go.

You need:
- [Bun](https://bun.sh)
- Xcode 16.4+ for iOS
- Android Studio with an SDK and an emulator for Android

```bash
bun install
bun run ios        # builds and installs the dev client, starts Metro
bun run android
bun start          # Metro only, once a dev build is installed
```

Checks:

```bash
bun run test       # Jest: mock backend, API cache updates, box hinge/tier/motion maths
bunx tsc --noEmit
bunx expo lint
```

> **3D on simulators.** The iOS Simulator's software OpenGL crashes or hangs when it draws the box model. Check 3D on a **real iPhone** or an Android emulator. The emulator draws GL on the CPU (SwiftShader), so it renders correctly but its frame rate means nothing.

## What's in the app

- **Shop**: a snapping carousel of four boxes (Common → Legendary), each a live 3D model recolored for its tier and spinning while focused.
- **Box details**: a larger box you can drag to spin, a stacked odds bar, the possible contents with chances and coin values, and a **Buy & open** button. If you can't afford the box, the button is disabled and shows how many coins you're short.
- **Opening**: the centerpiece, built as one sequence of anticipation, then a hint, then the payoff.
  - **Arrival.** The box drops onto the stage and bounces, with a thud, while the camera eases in. Faint dust motes drift around it.
  - **Hold to open.** Hold the button for 1.2 s. As the hold builds:
    - the box shakes harder and its lid strains against the latch;
    - the seam heats toward white and a halo builds behind the box;
    - the motes are drawn into the box and the screen edges darken;
    - a rising hum plays and the vibration gets heavier.

    Let go early and nothing is bought.
  - **Rarity hint.** A full hold sends the purchase. Once the result arrives, the box turns to face you and its seam climbs the rarity ladder: common, then rare, then epic, then legendary, stopping at what you won. Each step comes with:
    - a pulse of light and color across the screen;
    - the rarity name;
    - a thump you can hear and feel.
  - **Burst.** After a short pause the lid blows open:
    - a flash, with light beams and sparks in the rarity color;
    - a camera kick, a boom and a fanfare.
  - **Bigger for rarer results.** The burst grows with rarity: more sparks and longer beams, harder flashes and haptics, slow motion for epic and legendary, confetti, and a stamped "LEGENDARY" badge.
  - **Result card.** It shows the watch, with **Keep it**, **Sell** and **Open again**.
  - **Skip.** Tap the box to hurry: the first tap skips the rest of the hint, the second goes straight to the card.
- **Vault**: your watches, rarest first, with their count and total value. Each opens a details page where you can sell it after confirming. **Reset demo** restores 100,000 coins and an empty vault.
- **Errors**: every request can fail (5% by default). Failures show a message with a retry, and the balance never changes on a failed request.
- **Accessibility**:
  - With the system's Reduce Motion setting on, the opening keeps its colors, light and sound but drops the movement:
    - the boxes don't spin, shake or drop in;
    - there are no camera kicks, sparks, motes, confetti or full-screen flashes;
    - the reveal glow doesn't pulse.
  - Screen readers announce page titles as headings and the 3D boxes as labelled images.
  - With a screen reader on, the normal double-tap opens the box, because holding is impractical.

## Architecture

### Stack

| Area | Choice |
| --- | --- |
| Platform | Expo SDK 58 (React Native 0.88, React 19), development build, Bun |
| Navigation | React Navigation 7: a native stack, plus bottom tabs with a custom tab bar |
| Styling | react-native-unistyles 3: one dark "neon vault" theme. Safe-area insets come from `rt.insets`. Fonts are Unbounded and Manrope, embedded at build time by the `expo-font` plugin. |
| State | Redux Toolkit with RTK Query, persisted to MMKV through redux-persist |
| 3D | three.js through `@react-three/fiber/native` on `expo-gl` |
| Motion & sound | Reanimated 4, react-native-gesture-handler 3, expo-haptics, react-native-audio-api |

### Folder layout (Feature-Sliced Design)

```
src/
  app/       providers, navigation (stack + tabs), Redux store, Unistyles setup
  pages/     catalogue, box-details, box-opening, collection, watch-details
  entities/  box (API, 3D stage, models for the hinge, tier colors, motion and the reveal timeline, plus the effects), player (wallet + inventory API, coin chip), watch (image)
  shared/    api (contract, RTK Query base, mock backend), ui kit, theme, config (env, route types), lib (storage, count-up)
```

Each slice exports through its own `index.ts`, and imports only point down the layers. Code lives in a page until a second page needs it. For example, `pages/box-opening` keeps the screen's own pieces:
- the hold-to-open button and the reveal card;
- the 2D overlays: hint callouts, flashes, confetti and the edge vignette;
- the sound effects.

### Data flow

- **Mock backend.** `shared/api/mock-backend` is a small in-app REST server that plugs into RTK Query's `fetchBaseQuery` as its `fetchFn`.
  - It routes `GET /boxes`, `GET /boxes/:id`, `GET /me`, `POST /boxes/:id/open`, `POST /inventory/:id/sell` and `POST /reset`.
  - It adds 300–900 ms of latency and a 5% failure rate; both are set in `mock-backend/config.ts`.
  - It keeps its own state in a separate MMKV store, so it behaves like a real server: buying a box checks the balance, picks the watch by the box's odds, then charges the coins and adds the watch together.
- **No backend URL needed.** The API base URL comes from `.env` through `shared/config/env.ts`. Requests never leave the device.
- **Client cache.** Each entity adds its own endpoints to the shared API with `injectEndpoints`. Opening and selling patch the cached `/me` response with the server's reply, so the coin chip animates immediately without a refetch. The cache is persisted to MMKV, so a cold start shows the last balance, collection and catalogue instantly and refreshes them in the background.
- **The server decides first.** The app learns what was won before the lid opens; the animation only presents a result that already exists. If the request fails, nothing has changed, so there's nothing to roll back.

### 3D

- **One model, four looks.** The GLB is loaded once and cloned for each view. The body and seam materials are cloned before they're recolored, so recoloring one box doesn't repaint the others.
- **Hinge.** The lid and wordmark are moved under a group placed at the hinge point given in `MODEL.md`, so opening the lid is a single rotation. A unit test checks that the closed pose is unchanged and that the open lid's corner matches the documented bounds.
- **Camera.** `FitCamera` fits the documented closed and open bounds to whatever shape the canvas is, so the box is framed the same in a tall card or a wide header.
- **Animation without re-renders.** Every moving part is a small plain class with unit tests:
  - `SpinController`: the spin, drag and fling;
  - `BoxMotion`: the lid spring, shake and rattle;
  - `Entrance`: the drop and bounce;
  - `MoteField`: the dust;
  - `SparkBurst`: the spark fountain.

  They're advanced every frame in R3F's `useFrame`, so React never re-renders during animation. Drag gestures run on the JS thread and write to the same objects.
- **The reveal is a timeline.** `RevealTimeline` stages the result the server already returned:
  - the rarity steps, the pause, the burst and the hand-over to the card;
  - the slow-motion clock;
  - skipping.

  Each moment fires once as a beat, and the page turns beats into haptics, sounds and overlays. How hard each rarity celebrates is one table, `CELEBRATION`.
- **Effects without extra libraries.** Glows, light beams and sparks are additive sprites, planes and points, using gradient textures generated in code. There's no post-processing, and no image assets for effects.
- **Performance.**
  - At most three 3D views are mounted in the carousel: the focused card and its neighbours.
  - Only the focused one renders continuously; the others render only when something changes.
  - Screens hidden under another screen unmount their 3D views to free GL memory.
  - There's no environment map (PMREM), which crashed expo-gl on the iOS Simulator. Three lights stand in for it, with the rim light in the tier color.

## Notes and trade-offs

- **`.env` is committed** only because its single value is a fake, non-secret origin served inside the app. A production app would gitignore `.env` and commit a `.env.example` instead.
- **The watches are 2D.** The supplied watch images are flat PNGs, so the reveal shows the watch as an animated card over the opened box rather than as an object inside the 3D scene.
- **Dev builds only:** the dev client's floating tools button can cover the coin chip.
- **Sounds are synthesized**, not downloaded: `scripts/synthesize-sounds.py` generates every WAV in `src/pages/box-opening/sounds`, so there is no third-party audio to license. They respect the iOS silent switch and mix with the user's music.
- **Not checked on a device:** the Reduce Motion behavior and the screen-reader double-tap. They're implemented, but they need the system settings turned on to try.
- **Brief message after a sale:** for one frame after selling, the watch details page can show "no longer in your vault" before it closes.
