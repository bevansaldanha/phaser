import { BaseLevel } from "./BaseLevel.js";

class Level0 extends BaseLevel {
  constructor() {
    super("Level0", 4, 30, 100, "TestLevel");
    this.wordDelay = { min: 400, max: 500 };
  }
}

export {Level0}
