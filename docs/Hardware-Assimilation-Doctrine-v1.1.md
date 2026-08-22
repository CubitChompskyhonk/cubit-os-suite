# Hardware Assimilation Doctrine v1.1

## Updates from v1
- **Core host demo:** Chip-8 adapter proves user-media load + pack pipeline  
- **N64-class cores:** same Experience Layer contract; larger native adapters next  
- **Legal first-run card** required before Labs Experience  
- **Media metadata:** local name/size/hash only; default no upload of game images  
- **Packs:** JSON schema 1; atmosphere only  

## Chain of custody
On user file pick: store `{ name, size, sha256_prefix }` in session status.  
Game bytes remain in memory/on device — not written to Cubit HQ by default.

## Deferred
Layer D internal console hardware mods.
