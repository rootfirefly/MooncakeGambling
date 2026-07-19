# MooncakeGambling (博饼)

A 3D implementation of **Bo Bing (博饼)**, the traditional Mid-Autumn Festival dice game from Fujian/Xiamen, China. Players pick up six dice, aim, and throw them into a ceramic bowl; the resulting combination of pips is matched against the classical Bo Bing prize table (状元插金花, 状元, 对堂, 三红, 四进, 二举, 一秀, etc.) to determine the outcome.

Built with [Cocos Creator](https://www.cocos.com/) 3.8.8.

## Project info

- **Name:** MooncakeGambling
- **Engine:** Cocos Creator 3.8.8 (project format version 3.6.0)
- **Language:** TypeScript

## Gameplay

- Touch and hold the dice to pick them up, drag to aim, and release to throw — a progress bar fills while holding, controlling the throw's linear/angular force.
- Dice are simulated with the built-in physics system (`RigidBody`, `Collider`) and must land and come to rest inside the bowl.
- If any die bounces out of the bowl, the round is lost.
- Once all dice stop moving, the pip combination is evaluated against the Bo Bing rule table and the corresponding result image/sound is shown.

## Project structure

```
assets/
  scripts/
    gamblingPanel.ts   # Core game loop: touch input, throwing physics, bowl collision, round resolution
    rule.ts            # Bo Bing scoring rules (状元插金花, 状元, 对堂, 三红, 四进, 二举, 一秀, ...)
    audioManager.ts     # Singleton audio manager for music/sound effects
    resourceUtil.ts     # Async helpers for loading resources, prefabs, sprites, and remote images
  scene/                # Scenes (main.scene, art.scene, artWx.scene) and HDR environment maps
  resources/, res/      # Runtime-loaded textures and audio
  models/, shader/      # 3D models and shaders (dice, bowl, table)
build/                  # Build output (git-ignored)
library/, temp/, local/ # Cocos Creator generated caches (git-ignored)
```

## Getting started

1. Install [Cocos Creator 3.8.8](https://www.cocos.com/creator/download).
2. Open this folder as a project in Cocos Creator.
3. Open `assets/scene/main.scene` and press **Play** to run in the editor, or use **Project → Build** to export a platform build (e.g. Web Desktop, WeChat Mini Game).

## Rule table

| Result | Condition |
|---|---|
| 状元插金花 | Four dice showing 4, plus two dice showing 1 |
| 状元 (满堂红/遍地锦/六杯黑/五红/五子登科/四点红) | Six dice showing all 4s, all 1s, or five/six of one matching value |
| 对堂 | Dice show one complete run of 1–6 |
| 三红 | Three dice showing 4 |
| 四进 | Four dice showing the same value (1, 2, 3, 5, or 6) |
| 二举 | Two dice showing 4 |
| 一秀 | One die showing 4 |
| (none of the above) | Try again |
