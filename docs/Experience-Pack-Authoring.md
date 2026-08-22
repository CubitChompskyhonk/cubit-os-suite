# Experience Pack Authoring Guide v1

## Format
```json
{
  "schema": 1,
  "id": "my-pack",
  "name": "Display name",
  "author": "name",
  "license": "license text",
  "packs": {
    "crt": true,
    "grade": false,
    "hud": true,
    "guide": false,
    "vig": true
  }
}
```

## Rules
- Packs are **visual/session only** — never include game binaries  
- Do not distribute commercial ROMs with packs  
- `id` must be unique within an install  

## Apply
Experience Layer → preset buttons or import JSON (future) → **Run experience**
