//define game canvas (what it does)
import Phaser from "phaser";
import {powerUps} from '../powers/basePowers.js'

class BaseLevel extends Phaser.Scene {
  constructor(key, wordLength, wordQuantity, fallSpeed, nextSceneKey) {
    super(key);
    this.levelNumber = this.sys.settings.key.replace("Level", "");
    this.wordLength = wordLength;
    this.wordQuantity = wordQuantity;
    this.fallSpeed = fallSpeed;
    this.nextSceneKey = nextSceneKey;
    // this.player;
    // this.emitter;
    // this.dingMusic;
    this.levelComplete;
    this.loseLife;
    this.activeWords = [];
    this.calledWords = [];
    this.activePowerUps = [];
    this.comboCounter = 0;
    this.wordDelay = { min: 500, max: 1000 };
    this.width = 1200;
    this.height = 600;
  }

  //preload assets, anything that needs to be loaded before the game starts (images, sprites, etc)
  preload() {
    this.load.image("bg", "assets/images/mainBackground.png");
    this.load.image("platform", "assets/images/platform.png");
    this.load.image("hearts", "assets/images/heart.png");
    this.load.image("star", "assets/vfx/starParticle.png");
    this.load.audio("ding", "assets/soundEffects/typewriterDing.wav");
    this.load.audio("levelComplete", "assets/soundEffects/levelComplete.wav");
    this.load.audio("loseLife", "assets/soundEffects/loseLife.wav");
    this.load.audio("type", "assets/soundEffects/typeSound.wav");
    this.load.image("invisibleSprite", "assets/images/invisibleSprite.png", {
      frameWidth: 32,
      frameHeight: 16,
    });
    this.load.spritesheet("player", "assets/images/player.png", {
      frameWidth: 50,
      frameHeight: 37,
    });

    this.registry.set("loaded", false);

    //batch call the api to get a bunch of words at once
    fetch(
      `https://random-word-api.vercel.app/api?words=${this.wordQuantity}&length=${this.wordLength}`
    )
      .then((response) => response.json())
      .then((data) => {
        this.calledWords = data;

        this.registry.set("loaded", true);

        //Load a word at random intervals of 1-3 seconds
        this.time.addEvent({
          delay: Phaser.Math.Between(this.wordDelay.min, this.wordDelay.max),
          callback: this.loadWord,
          callbackScope: this,
          loop: false,
          repeat: this.calledWords.length - 1,
        });
      });
  }

  //create assets, anything that needs to be added/loaded to the game world (images, sprites, etc), as well as initial game logic and physics
  create() {
    // Get the active power-ups from the registry
    this.activePowerUps = this.registry.get("activePowerUps");

    this.typeSound = this.sound.add("type");
    this.dingMusic = this.sound.add("ding");
    this.levelComplete = this.sound.add("levelComplete");
    this.loseLife = this.sound.add("loseLife");
    //this initializes what the player is currently typing
    this.currentWord = "";

    this.timedEvent = this.time.addEvent({
      delay: 6000000,
      callback: this.onClockEvent,
      callbackScope: this,
      repeat: 1,
    });

    //add background image
    this.add.image(600, 300, "bg"); //.setOrigin(0, 0);

    // Add level + score + lives info in the top center of game canvas
    this.playerStats = this.add
      .text(
        this.width / 2,
        10,
        `Level: ${this.levelNumber} | Score: ${this.registry.get(
          "points"
        )} | Lives: ${this.registry.get("lives")}`,
        {
          fontSize: "32px",
          fontFamily: "Pixelify Sans",
          fill: "#000000",
        }
      )
      .setOrigin(0.5, 0.1);
    // Add container for lives and place in the top left corner of page
    this.livesContainer = this.add.container(50, 25);
    // Grabs lives from registry and renders hearts based on remaining lives
    const livesRemaining = this.registry.get("lives");
    for (let i = 0; i < livesRemaining; i++) {
      const hearts = this.add.image(i * 30, 0, "hearts");
      this.livesContainer.add(hearts);
    }
    //this is required for the physics engine to work (words can not be added to physics engine without this)
    //it is essentially a group of sprites that can be added to the physics engine and the words follow those sprites
    this.words = this.physics.add.group();

    //same as last text thing but this time for what the player types
    this.currentWordText = this.add.text(
      this.width / 2 - 100,
      this.height - 150,
      this.currentWord,
      {
        fontSize: "32px",
        fontFamily: "Pixelify Sans",
        fill: "#000000",
      }
    );

    //this is the event listener for when the player types something and handles what will happen when they type something
    this.input.keyboard.on("keydown", (event) => {
      this.typeSound.play();
      if (event.key === "Backspace") {
        this.currentWord = this.currentWord.slice(0, -1);
      } else if (event.key.length === 1 && /^[a-z0-9]$/i.test(event.key)) {
        this.currentWord += event.key;
      }

      this.currentWordText.setText(this.currentWord);

      if (this.currentWord === this.targetWord) {
        this.currentWord = "";
        this.currentWordText.setText(this.currentWord);

        this.targetWordText.destroy();
        this.targetWordSprite.destroy();
      }
    });

    this.platform = this.physics.add.staticGroup();
    this.platform
      .create(600, 600, "platform")
      .setScale(3)
      .refreshBody()
      .setAlpha(0); // Set alpha to 0 to hide image, remove or set to 1 if platform image is needed
    this.physics.add.overlap(this.words, this.platform, (word) => {
      // Reduce the number of lives
      this.registry.set("lives", this.registry.get("lives") - 1);

      // Update text in game data
      this.playerStats.setText(
        `Level: ${this.levelNumber} | Score: ${this.registry.get(
          "points"
        )} | Lives: ${this.registry.get("lives")}`
      );

      this.loseLife.play();

      // Destroy the word sprite
      word.destroy();

      // Run player hurt animation
      this.player.anims.play("hurt");

      // After 1.5 seconds, switch back to the idle animation
      setTimeout(() => {
        this.player.anims.play("idle");
      }, 1500);

      // Remove the last heart from the container
      const lastHeart = this.livesContainer.list.pop();
      lastHeart.destroy();

      // Find and destroy the corresponding word text
      const wordIndex = this.activeWords.findIndex(
        (activeWord) => activeWord.sprite === word
      );
      if (wordIndex !== -1) {
        this.activeWords[wordIndex].text.destroy();
        this.activeWords.splice(wordIndex, 1);
      }
    });

    this.player = this.add
      .sprite(this.width / 2, this.height - 100, "player")
      .setScale(2)
      .setOrigin(0, 0);
    // Player idle animation set here, repeat -1 is infinite loops
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNames("player", { frames: [0, 1, 2, 3] }),
      frameRate: 8,
      repeat: -1,
    });
    // Load player idling animation
    this.player.play("idle");
    // Player getting hit animation set here
    this.anims.create({
      key: "hurt",
      frames: this.anims.generateFrameNumbers("player", {
        frames: [3, 65, 66, 67],
      }),
      frameRate: 8,
    });

    this.cursorKeys = this.input.keyboard.createCursorKeys();
  }
  // Function to load words from API call
  loadWord() {
    const word = this.calledWords.pop();

    let velocityY = Phaser.Math.FloatBetween(
      this.fallSpeed,
      1.5 * this.fallSpeed
    );

    const chunky = this.activePowerUps.find(
      (powerUp) => powerUp.name === "Chunky"
    );

    if (chunky) {
      velocityY /= 2;
    }

    const sprite = this.words
      .create(Phaser.Math.Between(0, this.width - 250), 10, "invisibleSprite")
      .setDisplaySize(this.width, 24)
      .setVelocityY(velocityY);
    sprite.body.setAllowGravity(false);

    const text = this.add.text(10, 10, word, {
      fontSize: chunky ? "64px" : "32px",
      fill: "#000000",
    });

    this.activeWords.push({ sprite, text, word, velocity: velocityY });
  }

  pauseWords() {
    // Pause the words
    this.activeWords.forEach((word) => word.sprite.body.setVelocity(0, 0));
  }

  resumeWords() {
    // Resume the words
    this.activeWords.forEach((word) =>
      word.sprite.body.setVelocity(0, word.velocity)
    );
  }

  handleCorrectWord(i) {
    const chunky = this.activePowerUps.find(
      (powerUp) => powerUp.name === "Chunky"
    );

    this.updateScore(
      chunky
        ? (10 * this.activeWords[i].word.length) / 2
        : 10 * this.activeWords[i].word.length
    );

    const emitStars = this.add.particles(0, 0, "star", {
      x: this.activeWords[i].sprite.x,
      y: this.activeWords[i].sprite.y,
      speed: 100,
      gravityY: 200,
      scale: 0.04,
      duration: 600,
      emitting: false,
    });

    emitStars.start();

    this.dingMusic.play();
    // Remove the word from the screen and the array
    this.activeWords[i].sprite.destroy();
    this.activeWords[i].text.destroy();
    this.activeWords.splice(i, 1);

    // Clear the current word
    this.currentWord = "";
    this.currentWordText.setText(this.currentWord);
    // Increase the correct words counter
    this.comboCounter++;

    // Check if the WordPop power-up should be activated
    if (this.comboCounter % 3 === 0) {
      // Find the WordPop power-up
      const wordPop = this.activePowerUps.find(
        (powerUp) => powerUp.name === "WordPop"
      );

      // If the WordPop power-up is active, call its effect function
      if (wordPop) {
        wordPop.effect(this);
      }
    }

    // Check if the WordFreeze power-up should be activated
    if (this.comboCounter % 5 === 0) {
      // Find the WordFreeze power-up
      const wordFreeze = this.activePowerUps.find(
        (powerUp) => powerUp.name === "WordFreeze"
      );

      // If the WordFreeze power-up is active, call its effect function
      if (wordFreeze) {
        wordFreeze.effect(this);
      }
    }
  }

  updateScore(amount) {
    // If a score update is already in progress, add the new score to the target score
    if (this.scoreAnimation) {
      this.targetScore += amount;
      return;
    }

    // Calculate the target score
    this.targetScore = this.registry.get("points") + amount;

    // Calculate the duration of the score animation
    const duration = 500; // 0.5 seconds

    // Calculate the increment per frame
    const increment = amount / (duration / 60);

    // Create a timer event
    this.scoreAnimation = this.time.addEvent({
      delay: 60, // 60 ms = 1 frame
      callback: () => {
        // Increase the score
        let newScore = this.registry.get("points") + increment;

        // Round the score to avoid floating point numbers
        newScore = Math.round(newScore);

        // Update the score in the registry
        this.registry.set("points", newScore);

        // Update the score text
        this.playerStats.setText(
          `Level: ${
            this.levelNumber
          } | Score: ${newScore} | Lives: ${this.registry.get("lives")}`
        );

        // If the score has reached the target, stop the timer event
        if (newScore >= this.targetScore) {
          this.registry.set("points", this.targetScore);
          this.playerStats.setText(
            `Level: ${this.levelNumber} | Score: ${
              this.targetScore
            } | Lives: ${this.registry.get("lives")}`
          );
          this.scoreAnimation.remove(false);
          this.scoreAnimation = null;
        }
      },
      loop: true,
    });
  }

  //update assets, anything that needs to be updated every frame (images, sprites, etc), as well as game logic and physics
  update() {
    if (!this.registry.get("loaded")) {
      return;
    }

    for (let i = 0; i < this.activeWords.length; i++) {
      this.activeWords[i].text.x = this.activeWords[i].sprite.x;
      this.activeWords[i].text.y = this.activeWords[i].sprite.y - 15;
    }

    // Check if the current word matches any active word
    for (let i = 0; i < this.activeWords.length; i++) {
      if (this.currentWord === this.activeWords[i].word) {
        this.handleCorrectWord(i);
      }
    }
    // Check for loss condition
    if (this.registry.get("lives") <= 0) {
      // Transition to loss scene
      this.scene.start("LossScene");
    }

    // Check for win condition
    if (
      this.calledWords.length === 0 &&
      this.activeWords.length === 0 &&
      this.registry.get("lives") > 0
    ) {
      // Uses timer to add a multiplier
      this.registry.set(
        "points",
        Math.floor(
          this.registry.get("points") *
            Math.floor((60 - this.timedEvent.getElapsedSeconds()) / 10)
        )
      );

      this.levelComplete.play();

      if (this.levelNumber % 1 === 0 && this.levelNumber < 7) {
        this.scene.start("PowerUp", { nextSceneKey: this.nextSceneKey });
      } else {
        // Transition to win scene
        this.scene.start("WinScene", { nextSceneKey: this.nextSceneKey });
      }
    }
  }
}

export {BaseLevel}
