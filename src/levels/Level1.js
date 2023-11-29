import  {BaseLevel}  from "./BaseLevel100";

class Level1 extends BaseLevel {
  constructor() {
    super("Level1", 3, 3, 50, "Level2");
  }
}
export {Level1} 