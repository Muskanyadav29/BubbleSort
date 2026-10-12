// Score calculation and 3-star rating management

export class ScoreManager {
  constructor(starThresholds = [500, 1000, 1500]) {
    this.score = 0;
    this.starThresholds = starThresholds;
    this.combo = 0;
    this.maxCombo = 0;
    this.bubblesPoppedCount = 0;
    this.floatingDroppedCount = 0;
    this.rescuedCount = 0;
  }

  reset(starThresholds = [500, 1000, 1500]) {
    this.score = 0;
    this.starThresholds = starThresholds;
    this.combo = 0;
    this.maxCombo = 0;
    this.bubblesPoppedCount = 0;
    this.floatingDroppedCount = 0;
    this.rescuedCount = 0;
  }

  registerMatch(matchCount, isSpecial = false) {
    this.combo += 1;
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    this.bubblesPoppedCount += matchCount;

    // Base bubble pop score
    let matchBonus = 30;
    if (matchCount === 4) matchBonus = 50;
    else if (matchCount === 5) matchBonus = 80;
    else if (matchCount > 5) matchBonus = 120 + (matchCount - 5) * 30;

    const basePopScore = matchCount * 10;
    const comboBonus = (this.combo - 1) * 40;
    const specialBonus = isSpecial ? 150 : 0;

    const gained = basePopScore + matchBonus + comboBonus + specialBonus;
    this.score += gained;
    return { gained, combo: this.combo };
  }

  registerFloatingDrops(count) {
    if (count <= 0) return 0;
    this.floatingDroppedCount += count;
    // Escalating drop score: 20 pts per bubble + cascade bonus
    const gained = count * 20 + Math.floor(count * count * 2);
    this.score += gained;
    return gained;
  }

  registerRescue(count = 1) {
    this.rescuedCount += count;
    const gained = count * 150;
    this.score += gained;
    return gained;
  }

  resetCombo() {
    this.combo = 0;
  }

  getStars() {
    if (this.score >= this.starThresholds[2]) return 3;
    if (this.score >= this.starThresholds[1]) return 2;
    if (this.score >= this.starThresholds[0]) return 1;
    return 1; // At completion, minimum 1 star
  }

  getState() {
    return {
      score: this.score,
      stars: this.getStars(),
      combo: this.combo,
      maxCombo: this.maxCombo,
      bubblesPoppedCount: this.bubblesPoppedCount,
      floatingDroppedCount: this.floatingDroppedCount,
      rescuedCount: this.rescuedCount
    };
  }
}
