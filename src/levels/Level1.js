import { BaseLevel } from "./BaseLevel";

class Level1 extends BaseLevel {
  constructor() {
    super("Level1", 3, 10, 50, "Level2");
  }
}

export {Level1}