import  {BaseLevel}  from "./BaseLevel100";

class Level1 extends BaseLevel {
  constructor() {
    super("Level1", 5, 5, 50, "Level2");
  }
}
export {Level1} 