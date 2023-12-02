import { BaseLevel } from "./BaseLevel";

class Level2 extends BaseLevel {
  constructor() {
    super("Level2", 3, 15, 75, "Level3");
  }
  preload() {
    super.preload();
  }
}

export {Level2}