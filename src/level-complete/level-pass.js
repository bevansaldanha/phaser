import Phaser from "phaser";

class WinScene extends Phaser.Scene {
  constructor() {
    super("WinScene");
  }

  preload() {
    this.load.image("bg", "assets/images/mainBackground.png");
    this.load.spritesheet("fireworks", "assets/vfx/HolyExplosion_96x96.png", { frameWidth: 96 });
  }

  init(data) {
    // Store the next level's key
    this.nextSceneKey = data.nextSceneKey;
  }

  create() {
    // Load background
    this.add.image(600, 300, "bg");
    
    // Create a sprite for the fireworks
    const fireworks = this.add.sprite(
      Phaser.Math.Between(0, 1200), // Random x position
      Phaser.Math.Between(0, 600), // Random y position
      "fireworks"
    );

    // Create an animation for the fireworks sprite
    this.anims.create({
      key: "fireworkAnimation",
      frames: this.anims.generateFrameNumbers("fireworks", {
        start: 0,
        end: 27,
      }),
      frameRate: 28,
      repeat: -1,
    });

    // Play the fireworks animation on the sprite
    fireworks.play("fireworkAnimation");

    // Add continue button if player passes level
    if (this.nextSceneKey) {
      const continueButton = this.add
        .text(600, 300, "Continue", { fontSize: "32px", fontFamily: "Pixelify Sans", fill: "#fff" })
        .setOrigin(0.5, 0.5)
        .setInteractive()
        .on("pointerdown", () => this.scene.start(this.nextSceneKey)); // Start the next level when the continue button is clicked
      const continueButtonTween = this.tweens.add({
        targets: continueButton,
        scaleX: 1.3,
        scaleY: 1.3,
        ease: "Sine.easeInOut",
        duration: 500,
        alpha: 0.5,
        yoyo: true,
        repeat: -1,
        paused: true,
      });

      continueButton.on("pointerover", () => {
        continueButtonTween.resume();
      });

      continueButton.on("pointerout", () => {
        continueButtonTween.restart();
        continueButtonTween.pause();
        continueButton.setScale(1, 1);
        continueButton.setAlpha(1);
      });
    } else {
      // Else player won by passing all the levels
      const winText = this.add
        .text(600, 200, "Congratulations! You won the game!", {
          fontSize: "32px",
          fill: "#000000",
        })
        .setOrigin(0.5, 0.5);

      const menuButton = this.add
        .text(600, 300, "Back to Menu", { fontSize: "32px", fontFamily: "Pixelify Sans", fill: "#fff" })
        .setOrigin(0.5, 0.5)
        .setInteractive()
        .on("pointerdown", () => this.scene.start("scene-menu")); // Go back to MenuScene when the back button is clicked
      const menuButtonTween = this.tweens.add({
        targets: menuButton,
        scaleX: 1.3,
        scaleY: 1.3,
        ease: "Sine.easeInOut",
        duration: 500,
        alpha: 0.5,
        yoyo: true,
        repeat: -1,
        paused: true,
      });

      menuButton.on("pointerover", () => {
        menuButtonTween.resume();
      });

      menuButton.on("pointerout", () => {
        menuButtonTween.restart();
        menuButtonTween.pause();
        menuButton.setScale(1, 1);
        menuButton.setAlpha(1);
      });
    };
  };
};

export {WinScene} 