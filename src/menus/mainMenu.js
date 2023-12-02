import Phaser from "phaser";
class MenuScene extends Phaser.Scene {
  constructor() {
    super("scene-menu");
  }

  preload() {
    this.load.image("bg", "assets/images/mainBackground.png");
  }

  create() {
    this.registry.set("points", 0);
    this.registry.set("speedDown", 150);
    this.registry.set("isColliding", false);
    this.registry.set("lives", 3);
    this.registry.set("activePowerUps", []);

    // Load background
    this.add.image(600, 300, "bg");

    const gameTitle = "Project RLT";
    let startX = 350; // X position needs to be mutable, the value gets redefined in the forEach method below

    // Container to hold all letters
    const fallingLetters = this.add.group();

    // Loop through each letter
    gameTitle.split("").forEach((letter, index) => {
      // Create a text object for each letter
      const letterText = this.add
        .text(startX, -50, letter, {
          fontSize: "96px",
          fontFamily: "Pixelify Sans",
          color: "#fff",
        })
        .setOrigin(0.5);

      // Add letter to the group
      fallingLetters.add(letterText);

      // Adjust startX for the next letter
      startX += letterText.width;

      // Animate each letter falling into place
      this.tweens.add({
        targets: letterText,
        y: 300,
        ease: "Bounce.easeOut",
        duration: 1000,
        delay: index * 100, // Stagger the start of each letter's animation
      });
      // Define colour array to cycle through
      const colors = [
        "#FF0000",
        "#800000",
        "#FFC0CB",
        "#DC143C",
        "#B22222",
        "#FFA500",
        "#FFD700",
        "#FFFF00",
        "#FF4500",
        "#DAA520",
        "#008000",
        "#00FF00",
        "#228B22",
        "#32CD32",
        "#90EE90",
        "#0000FF",
        "#000080",
        "#87CEEB",
        "#1E90FF",
        "#4169E1",
        "#800080",
        "#EE82EE",
        "#8A2BE2",
        "#9400D3",
        "#9932CC",
        "#FF69B4",
        "#C71585",
        "#FF00FF",
        "#DB7093",
        "#FF1493",
      ];
      let currentColor = 0;
      this.time.addEvent({
        delay: 1000,
        callback: () => {
          letterText.setFill(colors[currentColor]);
          currentColor = (currentColor + 1) % colors.length;
        },
        loop: true,
      });
    });

    // After all letters have fallen into place, resize and reposition
    this.time.delayedCall(gameTitle.length * 100 + 1000, () => {
      this.tweens.add({
        targets: fallingLetters.getChildren(),
        scaleX: 0.5,
        scaleY: 0.5,
        x: "+=0",
        y: 150,
        duration: 1000,
        ease: "Power1",
      });
    });

    // Create start button and set initial alpha to 0 for it to fade in later
    const startButton = this.add
      .text(600, 300, "Start Game", {
        fontSize: "32px",
        fontFamily: "Pixelify Sans",
        fill: "#fff",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive()
      .setAlpha(0) // Invisible setting
      .on("pointerdown", () => this.scene.start("Level1")); // Start GameScene when the start button is clicked
    // Simple animation for startButton, starts after gameTitle animation
    const startButtonTween = this.tweens.add({
      targets: startButton,
      scaleX: 1.3, // Grow on x axis
      scaleY: 1.3, // Grow on y axis
      ease: "Sine.easeInOut", // Use a sine wave for a smoother effect
      duration: 500, // Run animation for 1000 ms
      alpha: 0.5, // Fade in
      yoyo: true, // Reverses animation
      repeat: -1, // Repeat infinitely
      paused: true, // Start the animation paused
    });

    // Start the animation when the pointer is over the start button
    startButton.on("pointerover", () => {
      startButtonTween.resume();
    });

    // Stop the animation when the pointer is not over the start button
    startButton.on("pointerout", () => {
      startButtonTween.restart();
      startButtonTween.pause();
      startButton.setScale(1, 1);
      startButton.setAlpha(1);
    });

    // Menu title text with basic style and set initial alpha to 0 fades in at same time as startButton
    const menuHeader = this.add
      .text(600, 175, "Main menu", {
        fontSize: "32px",
        fontFamily: "Pixelify Sans",
        fill: "#fff",
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0); // Invisible setting

    // Options button takes user to options menu
    const optionsButton = this.add
      .text(600, 375, "Options", {
        fontSize: "32px",
        fontFamily: "Pixelify Sans",
        fill: "#fff",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive()
      .setAlpha(0) // Invisible setting
      .on("pointerdown", () => this.scene.start("scene-options"));

    // Same animation for optionsButton, starts after gameTitle animation
    const optionsButtonTween = this.tweens.add({
      targets: optionsButton,
      scaleX: 1.3,
      scaleY: 1.3,
      ease: "Sine.easeInOut",
      duration: 500,
      alpha: 0.5,
      yoyo: true,
      repeat: -1,
      paused: true,
    });

    // Start the animation when the pointer is over the options button
    optionsButton.on("pointerover", () => {
      optionsButtonTween.resume();
    });

    // Stop the animation when the pointer is not over the options button
    optionsButton.on("pointerout", () => {
      optionsButtonTween.restart();
      optionsButtonTween.pause();
      optionsButton.setScale(1, 1);
      optionsButton.setAlpha(1);
    });

    // Fade in menu buttons after falling letters animation
    this.time.delayedCall(gameTitle.length * 100 + 1000, () => {
      this.tweens.add({
        targets: [startButton, optionsButton],
        alpha: 1,
        duration: 1000,
        ease: "Power1",
      });
    });

    // For quick test/debug access to other menus
    // this.add.text(0,0,"test game over scene", {fontSize: "16px", fill: "#000000"})
    // .setInteractive()
    // .on("pointerdown", () => this.scene.start("LossScene"));
    // this.add.text(600,0,"test win scene", {fontSize:"16px",fill:"#000000"})
    // .setInteractive()
    // .on("pointerdown", () => this.scene.start("WinScene"));
  }
}
export { MenuScene };