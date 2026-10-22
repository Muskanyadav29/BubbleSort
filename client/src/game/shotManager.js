// Shots, current/next bubble management and ammunition queue

export class ShotManager {
  constructor(initialShots = 20, bubbleQueue = ['red', 'blue', 'green']) {
    this.initialShots = initialShots;
    this.shotsRemaining = initialShots;
    this.shotsUsed = 0;
    this.queue = [...bubbleQueue];
    this.currentBubble = this.queue.shift() || 'red';
    this.nextBubble = this.queue.shift() || 'blue';
  }

  reset(initialShots, bubbleQueue) {
    this.initialShots = initialShots;
    this.shotsRemaining = initialShots;
    this.shotsUsed = 0;
    this.queue = [...bubbleQueue];
    this.currentBubble = this.queue.shift() || 'red';
    this.nextBubble = this.queue.shift() || 'blue';
  }

  // Consume shot when bubble is launched
  consumeShot(availableColors = ['red', 'blue', 'green']) {
    if (this.shotsRemaining <= 0) return false;

    this.shotsRemaining--;
    this.shotsUsed++;

    // Advance queue
    this.currentBubble = this.nextBubble;
    if (this.queue.length > 0) {
      this.nextBubble = this.queue.shift();
    } else {
      // Intelligently generate next bubble from remaining available colors
      const pick = availableColors[Math.floor(Math.random() * availableColors.length)] || 'red';
      this.nextBubble = pick;
    }

    return true;
  }

  // Swap current and next bubble
  swapBubbles() {
    const temp = this.currentBubble;
    this.currentBubble = this.nextBubble;
    this.nextBubble = temp;
  }

  // Set current active bubble (Select Bubble)
  setCurrentBubble(color) {
    if (!color) return;
    this.currentBubble = color;
  }

  // Set next reserve bubble
  setNextBubble(color) {
    if (!color) return;
    this.nextBubble = color;
  }

  // Cycle current bubble through provided color choices
  cycleBubble(colors = []) {
    if (!colors || colors.length === 0) return;
    const idx = colors.indexOf(this.currentBubble);
    const nextIdx = (idx + 1) % colors.length;
    this.currentBubble = colors[nextIdx];
  }

  // Booster: Extra shots
  addExtraShots(count = 5) {
    this.shotsRemaining += count;
  }

  // Booster: Set current bubble to special type (Bomb / Rainbow)
  setSpecialCurrent(specialType) {
    this.currentBubble = specialType;
  }

  getState() {
    return {
      shotsRemaining: this.shotsRemaining,
      shotsUsed: this.shotsUsed,
      currentBubble: this.currentBubble,
      nextBubble: this.nextBubble,
      queueLength: this.queue.length
    };
  }
}
