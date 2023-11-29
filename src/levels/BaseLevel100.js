//define game canvas (what it does)
import Phaser from "phaser";

class BaseLevel extends Phaser.Scene {
  constructor(key, wordLength, wordQuantity, fallSpeed, nextSceneKey) {
    super(key);
    this.wordLength = wordLength;
    this.wordQuantity = wordQuantity;
    this.fallSpeed = fallSpeed;
    this.nextSceneKey = nextSceneKey;
    this.activeWords = [];
    this.calledWords = [];
    this.wordDelay = { min: 500, max: 1500 };
    this.width = 1200;
    this.height = 600;
  }

  //preload assets, anything that needs to be loaded before the game starts (images, sprites, etc)
  preload() {
    this.load.image("bg", "assets/bg.jpg");
    this.load.image("platform", "assets/platform.png");
    this.load.image("hearts", "assets/heart.png");
    this.load.image("invisibleSprite", "assets/invisibleSprite.png", {
      frameWidth: 32,
      frameHeight: 16,
    });
    this.load.spritesheet("player", "assets/player.png", {
      frameWidth: 62,
      frameHeight: 64,
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
    //this initializes what the player is currently typing
    this.currentWord = "";

    this.timedEvent = this.time.addEvent({ delay: 6000000, callback: this.onClockEvent, callbackScope: this, repeat: 1 }); 

    //add background image
    this.add.image(0, 0, "bg").setOrigin(0, 0);
    // Add score and place in the top right of game canvas
    this.textScore = this.add.text(
      this.width - 200,
      10,
      `Score: ${this.registry.get("points")}`,
      {
        fontSize: "32px",
        fill: "#fff",
      }
    );
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
        fill: "#fff",
      }
    );

    //this is the event listener for when the player types something and handles what will happen when they type something
    this.input.keyboard.on("keydown", (event) => {
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
    this.platform.create(600, 600, "platform").setScale(3).refreshBody();
    this.words.addCollidesWith(this.platform);
    this.physics.add.overlap(this.words, this.platform, () => {
      this.registry.set("isColliding", true);
    });

    this.player = this.add
      .sprite(this.width / 2, this.height - 100, "player")
      .setOrigin(0, 0);
    // Player walking left animation set here, repeat -1 is infinite loops
    this.anims.create({
      key: "walk-left",
      frames: this.anims.generateFrameNames("player", { frames: [4, 5, 6, 7] }),
      frameRate: 4,
      repeat: -1,
    });
    // Player walking right animation set here
    this.anims.create({
      key: "walk-right",
      frames: this.anims.generateFrameNumbers("player", {
        frames: [8, 9, 10, 11],
      }),
      frameRate: 12,
      repeat: -1,
    });
    // Load player sprite run walk left animation
    this.player.play("walk-left");
    // Load player walk right after 8 seconds
    this.time.delayedCall(8000, () => {
      this.player.play("walk-right");
    });

    this.cursorKeys = this.input.keyboard.createCursorKeys();
  }
  // Function to load words from API call
  loadWord() {
    const word = this.calledWords.pop();

    const sprite = this.words
      // Make the max number dynamic if the player decides to expand the game canvas
      .create(Phaser.Math.Between(0, this.width - 250), 10, "invisibleSprite")
      // set display size instead of set scale, scale made the text collision boxes much larger than the words themselves
      .setDisplaySize(this.width, 24)
      .setVelocityY(this.fallSpeed);
    sprite.body.setAllowGravity(false);

    const text = this.add.text(10, 10, word, {
      fontSize: "32px",
      fill: "#fff",
    });

    this.activeWords.push({ sprite, text, word });
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
        this.registry.set(
          "points",
          this.registry.get("points") + 10 * this.currentWord.length
        );
        this.textScore.setText(`Score: ${this.registry.get("points")}`);
        // Remove the word from the screen and the array
        this.activeWords[i].sprite.destroy();
        this.activeWords[i].text.destroy();
        this.activeWords.splice(i, 1);

        // Clear the current word
        this.currentWord = "";
        this.currentWordText.setText(this.currentWord);

        break;
      }
      if (this.registry.get("isColliding")) {
        this.activeWords[i].sprite.destroy();
        this.activeWords[i].text.destroy();
        this.activeWords.splice(i, 1);
        this.registry.set("isColliding", false);
        this.registry.set("lives", this.registry.get("lives") - 1);
        // Also removes heart from container on collision detection
        this.livesContainer.remove(this.livesContainer.list[0]);
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
        Math.floor(this.registry.get("points") * Math.floor((60-this.timedEvent.getElapsedSeconds())/10))
        );

      // Transition to win scene
      this.scene.start("WinScene", { nextSceneKey: this.nextSceneKey });
    }
  }
}

export  {BaseLevel}