 import Phaser from "phaser";
 class MenuScene extends Phaser.Scene {
  constructor() {
    super("scene-menu");
  }

  create() {
    this.registry.set("points", 0);
    this.registry.set("speedDown", 150);
    this.registry.set("isColliding", false);
    this.registry.set("lives", 3);

    // Create rounded rectangle
    const graphics = this.add.graphics();
    graphics.fillStyle(0x000000, 1);
    graphics.fillRoundedRect(550, 275, 200, 50, 16);

    // Create start button
    const startButton = this.add
      .text(600, 300, "Start Game", { fontSize: "32px", fill: "#0f0" })
      .setOrigin(0.5, 0.5) // Center align text
      .setInteractive()
      .on("pointerdown", () => this.scene.start("Level1")); // Start GameScene when the start button is clicked
  }
};

export {MenuScene}