# Sound Files for Gamification

This directory contains audio files for gamification feedback.

## Required Sound Files

Add the following MP3 files to this directory:

### 1. `complete.mp3`
- **Purpose**: Habit completion sound
- **Character**: Light, satisfying "ding" or "pop"
- **Duration**: 0.5-1 second
- **Volume**: Moderate (default 40%)
- **Example**: Soft notification sound, bubble pop, light chime

### 2. `level-up.mp3`
- **Purpose**: Level up celebration
- **Character**: Triumphant, exciting fanfare
- **Duration**: 1-2 seconds
- **Volume**: Loud (default 60%)
- **Example**: Game level-up sound, achievement unlock, victory jingle

### 3. `streak.mp3`
- **Purpose**: Streak bonus milestone
- **Character**: Encouraging, energetic
- **Duration**: 1-1.5 seconds
- **Volume**: Medium-loud (default 50%)
- **Example**: Power-up sound, coin collect, success chime

### 4. `day-complete.mp3`
- **Purpose**: Perfect day (100% habits completed)
- **Character**: Celebratory, rewarding
- **Duration**: 1.5-2 seconds
- **Volume**: Loud (default 70%)
- **Example**: Applause, confetti burst, celebration melody

### 5. `unlock.mp3`
- **Purpose**: Item unlocked (icons, widgets, etc.)
- **Character**: Reward reveal, magical
- **Duration**: 1-1.5 seconds
- **Volume**: Medium-loud (default 50%)
- **Example**: Treasure chest open, item reveal, sparkle sound

## File Requirements

- **Format**: MP3 (best browser compatibility)
  - Alternative: OGG, WAV
- **Bitrate**: 128-192 kbps (balance quality vs file size)
- **Sample Rate**: 44.1 kHz
- **Channels**: Stereo or Mono
- **File Size**: < 50 KB per file (keep PWA lightweight)

## Where to Find Sounds

### Free Sound Libraries:
1. **Freesound.org** - https://freesound.org/
   - Search: "game complete", "level up", "success"
   - License: CC0 or CC-BY (check individual files)

2. **Zapsplat** - https://www.zapsplat.com/
   - Free sounds for personal/commercial use
   - Game UI sounds section

3. **Mixkit** - https://mixkit.co/free-sound-effects/
   - Free license for all uses
   - Game sounds and UI effects

4. **Pixabay** - https://pixabay.com/sound-effects/
   - Free for commercial use
   - Search "game" or "notification"

### Recommended Search Terms:
- "game complete"
- "level up"
- "achievement unlock"
- "success notification"
- "UI confirm"
- "power up"
- "coin collect"
- "celebration"

## Testing

After adding sound files, test them in the app:

```typescript
import { sounds } from '@/lib/sounds';

// Play each sound
sounds.complete();
sounds.levelUp();
sounds.streak();
sounds.dayComplete();
sounds.unlock();
```

## Volume Adjustment

Default volumes are set in `/src/lib/sounds.ts`:
- Modify `DEFAULT_VOLUMES` object to adjust individual sound volumes
- Use master volume control: `setVolume(0.5)` for 50% global volume

## Browser Support

- **Desktop**: All modern browsers support Web Audio API
- **Mobile**: iOS Safari, Android Chrome support MP3
- **Fallback**: Sound system fails silently if Audio not supported
