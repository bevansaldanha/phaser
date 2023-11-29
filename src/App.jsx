import logo from './logo.svg';
import './App.scss';
import React, { useState, useEffect, useRef } from 'react';
import Phaser from 'phaser';
import TopNavbar from './TopNavbar';
import lighthouse from './lighthouse.svg';

import { IonPhaser, GameInstance } from '@ion-phaser/react';

//Size of game world
const sizes = {
  width: 1200,
  height: 600,
};

//universal Y gravity (change to change acceleration)
const speedDown = 150;
let isColliding = false;




//define game canvas (what it does)
class MainScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
    this.activeWords = [];
    this.calledWords = [];
  }

  //preload assets, anything that needs to be loaded before the game starts (images, sprites, etc)
  preload() {
    this.load.image("bg", "assets/bg.jpg");
    this.load.image('platform', 'assets/platform.png');
    this.load.spritesheet("player", "assets/player.png", {
      frameWidth: 62,
      frameHeight: 64,
      startFrame: 5,
    });
    this.load.spritesheet("invisibleSprite", "assets/invisibleSprite.png", {
      frameWidth: 32,
      frameHeight: 32,
      startFrame: 0,
      endFrame: 0,
    });
  }

  //create assets, anything that needs to be added/loaded to the game world (images, sprites, etc), as well as initial game logic and physics

  create() {
    //batch call the api to get a bunch of words at once
    fetch("https://random-word-api.vercel.app/api?words=5&length=5")
      .then((response) => response.json())
      .then((data) => {
        this.calledWords = data;

        //Load a word at random intervals of 1-3 seconds
        this.time.addEvent({
          delay: Phaser.Math.Between(1000, 3000),
          callback: this.loadWord,
          callbackScope: this,
          loop: false,
          repeat: this.calledWords.length - 1,
        });
      });

    //this initializes what the player is currently typing
    this.currentWord = "";

    //add background image
    this.add.image(0, 0, "bg").setOrigin(0, 0);

    //this is required for the physics engine to work (words can not be added to physics engine without this)
    //it is essentially a group of sprites that can be added to the physics engine and the words follow those sprites
    this.words = this.physics.add.group();

    //same as last text thing but this time for what the player types
    this.currentWordText = this.add.text(
      sizes.width / 2 - 100,
      sizes.height - 150,
      this.currentWord,
      {
        fontSize: "32px",
        fill: "#fff",
      }
    );

    //this is the event listener for when the player types something and handles what will happen when they type something
    this.input.keyboard.on("keydown", (event) => {
      event.preventDefault();
      if (event.code === 'Backspace' && this.currentWord.length > 0) {
        console.log(event.code.length);
        this.currentWord = this.currentWord.slice(0, this.currentWord.length - 1);
        this.currentWordText.setText(this.currentWord);
      }
      else if (event.code.length === 4) {

        this.currentWord += event.key;
        console.log(event.code);


        this.currentWordText.setText(this.currentWord);

        if (this.currentWord === this.targetWord) {
          this.currentWord = "";
          this.currentWordText.setText(this.currentWord);

          this.targetWordText.destroy();
          this.targetWordSprite.destroy();
        }
      }
    });


    this.player = this.add
      .sprite(sizes.width / 2, sizes.height - 100, "player")
      .setOrigin(0, 0);

    this.cursorKeys = this.input.keyboard.createCursorKeys();

    this.platform = this.physics.add.staticGroup();
    this.platform.create(600, 600, 'platform').setScale(3).refreshBody();
    this.words.addCollidesWith(this.platform);
    this.physics.add.overlap(this.words, this.platform,function () {
      isColliding = true;
    });


  }
  loadWord() {
    const word = this.calledWords.pop();

    const sprite = this.words
      .create(Phaser.Math.Between(0, 1025), 10, "invisibleSprite")
      .setScale(0.5)
      .setVelocityY(speedDown - 90);
    sprite.body.setAllowGravity(false);

    const text = this.add.text(10, 10, word, {
      fontSize: "32px",
      fill: "#fff",
    });

    this.activeWords.push({ sprite, text, word });
  }


  //update assets, anything that needs to be updated every frame (images, sprites, etc), as well as game logic and physics
  update() {

    for (let i = 0; i < this.activeWords.length; i++) {
      this.activeWords[i].text.x = this.activeWords[i].sprite.x;
      this.activeWords[i].text.y = this.activeWords[i].sprite.y;
    }

    // Check if the current word matches any active word
    for (let i = 0; i < this.activeWords.length; i++) {
      if (this.currentWord === this.activeWords[i].word) {
        // Remove the word from the screen and the array
        this.activeWords[i].sprite.destroy();
        this.activeWords[i].text.destroy();
        this.activeWords.splice(i, 1);

        // Clear the current word
        this.currentWord = "";
        this.currentWordText.setText(this.currentWord);

        break;
      }
      if(isColliding){
        this.activeWords[i].sprite.destroy();
        this.activeWords[i].text.destroy();
        this.activeWords.splice(i, 1);
        isColliding = false
      }
    }
  }
}



//define game config (how it looks and works this is what players would change in settings)
//for example if a player wants the game to be "easier" it could just be an option to use a lower gravity
const gameConfig = {
  type: Phaser.WEBGL,
  width: sizes.width,
  height: sizes.height,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: speedDown },
      debug: true,
    },
  },
  scene: [MainScene]
};

export default function App() {
  const gameRef = useRef(null);
  const [game, setGame] = useState(null);
  const [initialize, setInitialize] = useState(false);

  const destroy = () => {
    gameRef.current?.destroy();
    setInitialize(false);
    setGame(undefined);
  };

  useEffect(() => {
    if (initialize) {
      setGame(Object.assign({}, gameConfig));
    }
  }, [initialize]);

  return (
    <div className="App">
      <TopNavbar />
      <header className="App-header">
        {initialize ? (
          <>
            <IonPhaser ref={gameRef} game={game} initialize={initialize} className='game' />
            <div onClick={destroy} className="flex destroyButton">
              <a href="#1" className="bttn">Destroy</a>
            </div>
          </>
        ) : (
          <>
            <img src={logo} className="App-logo" alt="logo" />
            <div onClick={() => setInitialize(true)} className="flex">
              <a href="#1" className="bttn">Initialize</a>
            </div>
          </>
        )}
      </header>
    </div>
  );
}

