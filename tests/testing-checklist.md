# Testing Checklist

## Game States

- [ ] Game shows start screen on initial load
- [ ] Pressing Space transitions from Start to Running
- [ ] Tapping on mobile transitions from Start to Running
- [ ] Pressing Escape during Running shows Pause overlay
- [ ] Pressing Escape during Paused resumes Running
- [ ] Collision transitions to Game Over
- [ ] Pressing Space on Game Over restarts the game
- [ ] Clicking Restart button on Game Over restarts the game
- [ ] Game fully resets on restart (score, obstacles, speed)

## Player Controls

- [ ] Space bar triggers jump
- [ ] Up arrow triggers jump
- [ ] Down arrow triggers duck
- [ ] Player cannot jump while already airborne (without Double Jump power-up)
- [ ] Player lands correctly after jump (gravity)
- [ ] Ducking reduces player height visually
- [ ] Ducking hitbox is shorter than standing hitbox
- [ ] Releasing down arrow restores standing pose
- [ ] Jump feels responsive (< 1 frame delay)

## Mobile Controls

- [ ] Tap on canvas triggers jump
- [ ] Swipe down on canvas triggers duck
- [ ] No page scrolling while playing
- [ ] No page zooming while playing
- [ ] Touch controls work on iOS Safari
- [ ] Touch controls work on Android Chrome
- [ ] Canvas scales correctly on phone screens
- [ ] Canvas scales correctly on tablet screens
- [ ] UI buttons are large enough for touch (≥ 44px)

## Obstacles

- [ ] Small cactus spawns correctly
- [ ] Large cactus spawns correctly
- [ ] Cactus groups spawn correctly
- [ ] Birds spawn after score reaches 300
- [ ] Bird wing animation alternates
- [ ] Obstacles move at game speed
- [ ] Obstacles despawn after passing off-screen left
- [ ] No two obstacles overlap or spawn too close together
- [ ] Obstacle variety increases with difficulty

## Collision

- [ ] Collision with cactus triggers Game Over
- [ ] Collision with bird triggers Game Over
- [ ] Jumping fully over a cactus does NOT trigger collision
- [ ] Ducking under a high bird does NOT trigger collision
- [ ] Hitboxes feel fair (not too punishing)
- [ ] Shield power-up absorbs collision (no Game Over)
- [ ] Invincibility power-up prevents Game Over

## Scoring

- [ ] Score starts at 0
- [ ] Score increments during Running state
- [ ] Score does NOT increment during Paused state
- [ ] Score display updates smoothly
- [ ] Score ding plays every 100 points
- [ ] High score is saved after Game Over
- [ ] High score persists across page reloads
- [ ] High score displays on HUD
- [ ] High score displays on Game Over screen
- [ ] New high score is highlighted on Game Over

## Difficulty

- [ ] Game speed increases over time
- [ ] Game speed does not exceed maximum cap
- [ ] Obstacle frequency increases with score
- [ ] Birds appear more often at higher scores
- [ ] Score multiplier increases at thresholds
- [ ] Easy difficulty preset works
- [ ] Normal difficulty preset works
- [ ] Hard difficulty preset works
- [ ] Insane difficulty preset works

## Day/Night Cycle

- [ ] Game starts in daytime
- [ ] Sky transitions to dusk/night around score 700
- [ ] Night mode shows stars
- [ ] Night mode shows moon
- [ ] Stars twinkle (subtle animation)
- [ ] Transition back to day occurs after night
- [ ] Color transitions are smooth (no abrupt changes)

## Power-Ups

- [ ] Shield power-up spawns on field
- [ ] Slow Motion power-up spawns on field
- [ ] Double Jump power-up spawns on field
- [ ] Invincibility power-up spawns on field
- [ ] Collecting shield shows bubble visual
- [ ] Shield breaks on collision (one-hit absorb)
- [ ] Slow Motion reduces game speed visually
- [ ] Double Jump allows second jump in air
- [ ] Invincibility shows flash effect
- [ ] Power-up duration indicator shows on HUD
- [ ] Power-up effect expires after duration
- [ ] Only one power-up active at a time on-screen
- [ ] Power-up pickup sound plays

## Sound

- [ ] Jump sound plays on jump
- [ ] Collision sound plays on hit
- [ ] Score ding plays at 100-point milestones
- [ ] Power-up pickup sound plays
- [ ] Mute button mutes all sounds
- [ ] Unmute button restores sound
- [ ] Volume slider adjusts sound level
- [ ] Sound settings persist across reloads
- [ ] No audio errors in console
- [ ] Sound works after first user interaction (autoplay policy)

## UI

- [ ] Start screen displays correctly
- [ ] Start screen shows game title
- [ ] Start screen shows control instructions
- [ ] Game Over screen displays final score
- [ ] Game Over screen displays high score
- [ ] Game Over screen has restart button
- [ ] Pause overlay displays correctly
- [ ] Settings panel opens and closes
- [ ] Settings panel does not interfere with gameplay
- [ ] HUD score is readable against all backgrounds (day & night)
- [ ] Skin selector displays all skins
- [ ] Locked skins show lock indicator and unlock requirement
- [ ] Selecting an unlocked skin changes dino appearance
- [ ] Selected skin persists across reloads

## Accessibility

- [ ] All buttons are keyboard-focusable
- [ ] Reduced motion: CSS animations disabled when preference is set
- [ ] Fonts scale on smaller screens
- [ ] High contrast: score text is readable on all backgrounds
- [ ] No text is cut off or overlapping on any screen size

## Performance

- [ ] 60fps on desktop Chrome
- [ ] 60fps on desktop Firefox
- [ ] No frame drops during normal gameplay
- [ ] No memory leaks during extended play (check DevTools Memory tab)
- [ ] No console errors during gameplay
- [ ] No console warnings during gameplay
- [ ] Game loads in under 500ms
- [ ] Object pool prevents garbage collection pauses

## Cross-Browser

- [ ] Chrome (latest) — works
- [ ] Firefox (latest) — works
- [ ] Safari (latest) — works
- [ ] Edge (latest) — works
- [ ] iOS Safari — works
- [ ] Android Chrome — works

## Edge Cases

- [ ] Rapidly pressing jump does not break animation
- [ ] Holding down duck while jumping transitions correctly
- [ ] Switching tabs and returning does not break game state
- [ ] Resizing browser window scales canvas correctly
- [ ] Very high scores (10000+) display correctly without overflow
- [ ] localStorage being full does not crash the game
- [ ] Private/incognito mode (no localStorage) does not crash the game
