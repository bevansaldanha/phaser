import { powerUps } from "../powers/basePowers.js";
import Phaser from "phaser";


class PowerUp extends Phaser.Scene {
  constructor() {
    super("PowerUp");
  }

  init(data) {
    // Store the key of the next scene
    this.nextSceneKey = data.nextSceneKey;
  }

  preload() {
    this.load.image("powerbg", "assets/images/Summer3.png");
  }

  create() {
    this.add.image(0, 0, "powerbg").setOrigin(0, 0);

    // Get the active power-ups from the registry
    const activePowerUps = this.registry.get("activePowerUps") || [];

    // Filter out the active power-ups
    const availablePowerUps = powerUps.filter(
      (powerUp) => !activePowerUps.includes(powerUp)
    );

    // Select three random power-ups
    const selectedPowerUps = Phaser.Utils.Array.Shuffle(
      availablePowerUps
    ).slice(0, 3);

    // Create cards for the power-ups
    const powerUpCards = selectedPowerUps.map((powerUp, index) => {
      const card = this.add
        .rectangle(
          (this.scale.width / 4) * (index + 1),
          this.scale.height / 2,
          200,
          300,
          0xf5f5dc
        )
        .setAlpha(0.5);

      // Create power-up text
      const nameText = this.add.text(card.x - 50, card.y - 100, powerUp.name, {
        fontSize: "24px",
        fill: "#000",
        align: "center",
      });

      const descriptionText = this.add.text(
        card.x,
        card.y - 50,
        powerUp.description,
        {
          fontSize: "16px",
          fill: "#000",
          wordWrap: { width: card.width - 20 }, // Subtract a small amount to add some padding
          align: "center",
        }
      );

      // Center (or at least attempt to) the origin of the text
      descriptionText.setOrigin(0.5, 0);

      // Make the card interactive
      card.setInteractive();
      card.on("pointerdown", () => {
        // Activate the selected power-up and start the next scene
        this.activatePowerUp(powerUp);
        this.scene.start(this.nextSceneKey);
      });

      return { card, nameText, descriptionText };
    });
  }

  activatePowerUp(powerUp) {
    // Get the active power-ups from the registry so that it translates across the session
    let activePowerUps = this.registry.get("activePowerUps");

    // If there are no active power-ups, initialize the array (useless check, but just in case)
    if (!activePowerUps) {
      activePowerUps = [];
    }

    // Add the power-up to the active power-ups
    activePowerUps.push(powerUp);

    // Store the active power-ups in the registry
    this.registry.set("activePowerUps", activePowerUps);
  }
}

export {PowerUp}
