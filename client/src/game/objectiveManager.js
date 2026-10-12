// Level Objective verification and progress evaluator

export class ObjectiveManager {
  constructor(objectiveConfig = { type: 'clear_all' }) {
    this.config = objectiveConfig;
    this.progress = 0;
    this.target = objectiveConfig.count || 0;
    this.isCompleted = false;
  }

  reset(objectiveConfig) {
    this.config = objectiveConfig || { type: 'clear_all' };
    this.progress = 0;
    this.target = this.config.count || 0;
    this.isCompleted = false;
  }

  // Update progress after game events
  checkStatus({ board, poppedColors = {}, droppedCount = 0, rescuedCount = 0, score = 0, combo = 0 }) {
    if (this.isCompleted) return true;

    const type = this.config.type;

    if (type === 'clear_all') {
      // Complete if no bubbles remain on the board
      let bubblesLeft = 0;
      for (const row of board) {
        for (const cell of row) {
          if (cell) bubblesLeft++;
        }
      }
      this.progress = Math.max(0, bubblesLeft);
      if (bubblesLeft === 0) {
        this.isCompleted = true;
      }
    } else if (type === 'rescue') {
      this.progress = rescuedCount;
      if (rescuedCount >= this.target) {
        this.isCompleted = true;
      }
    } else if (type === 'drop_count') {
      this.progress = droppedCount;
      if (droppedCount >= this.target) {
        this.isCompleted = true;
      }
    } else if (type === 'color_hunt') {
      const color = this.config.color;
      const popped = poppedColors[color] || 0;
      this.progress = popped;
      if (popped >= this.target) {
        this.isCompleted = true;
      }
    } else if (type === 'combo') {
      this.progress = combo;
      if (combo >= this.target) {
        this.isCompleted = true;
      }
    } else if (type === 'score') {
      this.progress = score;
      if (score >= this.target) {
        this.isCompleted = true;
      }
    }

    return this.isCompleted;
  }

  getProgressDescription() {
    const type = this.config.type;
    if (type === 'clear_all') {
      return this.progress === 0 ? 'Clear all bubbles' : `${this.progress} bubbles left`;
    }
    if (type === 'rescue') {
      return `Rescued: ${this.progress} / ${this.target}`;
    }
    if (type === 'drop_count') {
      return `Dropped: ${this.progress} / ${this.target}`;
    }
    if (type === 'color_hunt') {
      return `${(this.config.color || '').toUpperCase()}: ${this.progress} / ${this.target}`;
    }
    if (type === 'combo') {
      return `Combo: x${this.progress} / x${this.target}`;
    }
    if (type === 'score') {
      return `Score: ${this.progress.toLocaleString()} / ${this.target.toLocaleString()}`;
    }
    return 'Complete Objective';
  }
}
