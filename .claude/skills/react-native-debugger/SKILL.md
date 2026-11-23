---
name: react-native-debugger
description: Drive a React Native dev build on a physical Android device via adb + Metro to verify behavior end-to-end. Use when you need to (a) reload the JS bundle after editing code, (b) trigger user actions (taps / swipes / pull-to-refresh) and observe the result, (c) read console.log output from the JS runtime, (d) work around the React Native DevTools "Paused in debugger" overlay, or (e) iterate over multiple edit→reload→test cycles without manually touching the device. Triggers: "test this on device", "trigger refresh and check the logs", "what does the app log when X", "reload the bundle", "see if my fix worked on the phone".
---

# React Native debugger (Android dev build)

End-to-end driver for a React Native dev build over `adb` while Metro is running. Lets you iterate: edit code → reload bundle → drive UI → read logs → repeat, without touching the device.

## Prerequisites

- Device connected via USB with debugging enabled (`adb devices` shows `device`, not `unauthorized` / `offline`).
- Metro bundler running locally — by default on `http://localhost:8081`. Confirm with `curl -sf http://localhost:8081/status` (200 = up).
- App is the **debug** build (typically `*.debug` package id), since release builds don't talk to Metro.

If any of these is missing, surface it and stop — don't try to fix the device/Metro state by guessing.

## The core operations

### 1. Find the app package id

```bash
adb shell pm list packages | grep -i <product>
```

Multiple variants are common (e.g. `com.example.app`, `com.example.app.debug`, `com.example.app.beta`). Confirm which one is **resumed**:

```bash
adb shell "dumpsys activity activities | grep -E 'mResumedActivity|mFocusedApp'"
```

### 2. Reload the JS bundle after a code edit

Metro exposes a POST `/reload` endpoint that triggers a full bundle reload on all attached apps:

```bash
curl -s -X POST http://localhost:8081/reload
```

A successful reload returns 200 and the app re-runs from entry (auth gates re-appear if any). **Always wait ~5–8s after reload before driving the UI** — the bundle has to download and the JS bridge re-init.

If reload doesn't appear to apply (you still see old `console.log` output), the bundle may be cached or the websocket bridge wasn't connected — fall through to a full app restart (#3).

### 3. Force-restart the app (clean state)

When the JS context is stuck (paused at a breakpoint, leftover listener from a previous round, stale module state):

```bash
adb shell am force-stop <package>
sleep 1
adb shell monkey -p <package> -c android.intent.category.LAUNCHER 1
```

The `monkey` command is the simplest cross-launcher way to start the main activity. After it returns "Events injected: 1", give the app ~6–8s to boot to its first screen.

### 4. Take a screenshot of the device

The screenshot is the only way to verify visual state. `screencap` written through adb shell mangles binary data (CRLF in some adb modes); use `exec-out` for clean PNG bytes:

```bash
adb exec-out screencap -p > /tmp/rn-debug/screen.png
```

**Resize before viewing** — the Read tool rejects raw PNGs above ~1MB on high-DPI screens. Use ImageMagick `convert` to downscale:

```bash
convert /tmp/rn-debug/screen.png -resize 540x /tmp/rn-debug/screen-small.png
```

Then Read `/tmp/rn-debug/screen-small.png`. On Samsung-class devices the device resolution is 1080×2340; the resized 540-wide image fits the Claude image budget and is still readable.

### 5. Send taps and swipes

Coordinates are in the **device's** pixel space (e.g. 1080×2340), not the resized screenshot. If you tapped from the resized image, multiply both axes by the resize factor.

```bash
# Single tap
adb shell input tap <x> <y>

# Drag / swipe (pull-to-refresh, scroll, slide-to-confirm)
adb shell input swipe <x1> <y1> <x2> <y2> <durationMs>
```

For a **pull-to-refresh** on a SectionList/FlatList: swipe vertically *from inside the list area* — typically from `y≈1700` down to `y≈2300` over 400ms. Starting above the list (in the header / fixed buttons area) won't trigger `RefreshControl`'s `onRefresh`.

### 6. Read JS console.log output

`console.log` calls from the JS bundle show up in `adb logcat` under the tag `ReactNativeJS`:

```bash
adb logcat -c          # clear buffer first
# ... drive the UI ...
adb logcat -d 2>&1 | grep -E "ReactNativeJS.*<your tag>"
```

`logcat -d` dumps and exits (one-shot). For live tail use `logcat` without `-d`, but only in a background command + Monitor.

Note: in modern RN dev builds, console output **also** lands in the standalone "React Native DevTools" Chromium app. If the DevTools window is open with the "Pause on caught exceptions" setting enabled, the JS thread can stop with a yellow "Paused in debugger" pill on-screen. Either close that window, untick the pause option, or tap the play button in the pill (approx `(780, 175)` on 1080×2340) to resume.

### 7. Wait for asynchronous outcomes

Don't use long blocking `sleep` calls — they're rate-limited and the cache cools off. Use **Bash `run_in_background`** with an `until` loop that watches `logcat` for the terminal log line:

```bash
until adb logcat -d 2>&1 | grep -qE "<terminal pattern>"; do sleep 5; done
```

This single-shot exits when the condition holds and triggers one notification. Pick the pattern to match *both* success and failure terminal states so silence isn't ambiguous (e.g. for a long-poll: `finishedAt landed|longpoll: exhausted|4xx bail`).

For ongoing log streams (every line is a notification) use the Monitor tool with `tail -f` + `grep --line-buffered`.

## Common gotchas

- **`adb shell screencap -p` produces a corrupted PNG.** Use `adb exec-out screencap -p` instead.
- **Reload didn't take.** Force-stop the app and relaunch; sometimes the Metro websocket bridge is in a bad state.
- **Pull-to-refresh did nothing.** Swipe was probably outside the SectionList area, or the previous refresh is still in flight (dedup bail). Check the active refresh state in your hook's logs.
- **Stale listener delivers snapshots from a previous round.** Usually fixed by force-restart. A long-running BE refresh that never sends `finishedAt` will keep a listener attached past the grace timeout because snapshots are arriving.
- **Console.log not appearing in logcat.** A different RN debugger (Chromium DevTools) may be active and consuming logs. Close it.
- **Yellow "Paused in debugger" pill on-screen.** A breakpoint was hit. Tap the play button in the pill, or close the DevTools window. JS thread is frozen until you resume.
- **Tap coordinates don't seem to match the screenshot.** The screenshot is at the device's pixel resolution. If you resized for viewing, scale your tap coordinates back to the original size.

## Workflow recipe — "test my code change end-to-end"

1. Make the code edit.
2. `bunx tsc --noEmit` — if it fails, fix and re-check before reloading.
3. `curl -s -X POST http://localhost:8081/reload`
4. `sleep 6` to let the bundle reload.
5. `adb exec-out screencap -p > /tmp/rn-debug/before.png && convert /tmp/rn-debug/before.png -resize 540x /tmp/rn-debug/before-small.png` and Read it.
6. `adb logcat -c` to start with a clean buffer.
7. Drive the UI (`input tap` / `input swipe`).
8. Wait for the terminal log via Bash `run_in_background` `until`-loop.
9. `adb logcat -d 2>&1 | grep ...` to dump relevant lines; iterate.

## Working directory convention

Keep all artifacts in `/tmp/<task>/` (e.g. `/tmp/rn-debug/`) — they accumulate across iterations and shouldn't pollute the repo.
