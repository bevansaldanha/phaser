import Phaser from "phaser";

class OptionsScene extends Phaser.Scene {
  constructor() {
    super("scene-options");
  }

  preload() {
    this.load.image("bg", "assets/images/mainBackground.png");
  }

  create() {
    // Load background
    this.add.image(600, 300, "bg");

    const backButton = this.add
      .text(600, 300, "Back to Menu", { fontSize: "32px", fontFamily: "Pixelify Sans", fill: "white" })
      .setOrigin(0.5, 0.5)
      .setInteractive()
      .on("pointerdown", () => this.scene.start("scene-menu"));
    this.tweens.add({
      targets: backButton,
      scaleX: 2, // Grow on x axis
      scaleY: 2, // Grow on y axis
      ease: 'Linear', // Ease linear direction
      alpha: 0.25, // Fades out in 250 ms
      yoyo: true, // Reverses animation
      repeat: -1, // Repeat infinitely
      duration: 500, // Run animation for 500 ms
    });
  }
};

export {OptionsScene}