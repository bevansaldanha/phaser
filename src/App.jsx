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



//define game canvas (what it does)
class MainScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
  }

  //preload assets, anything that needs to be loaded before the game starts (images, sprites, etc)
  preload() {
    this.load.image("bg", "assets/bg.jpg");
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

    //add background image
    this.add.image(0, 0, "bg").setOrigin(0, 0);;

    //this initializes what the player is currently typing

    this.currentWord = "";

    //this is required for the physics engine to work (words can not be added to physics engine without this)
    //it is essentially a group of sprites that can be added to the physics engine and the words follow those sprites
    this.words = this.physics.add.group();


    //get request to fetch a random word from the random word api (https://random-word-api.vercel.app/)
    fetch("https://random-word-api.vercel.app/api?words=1&length=9")
      .then((response) => response.json())
      .then((data) => {
        this.targetWord = data[0];

        //randomize the x position of the word (so it doesn't always start in the same place) relative to gameCanvas (to be done)
        const randomX = Phaser.Math.Between(0, 1025);

        //create the word sprite (invisibleSprite is just so the background is not covered by anything weird)
        //y 10 is so the word starts at the top of the screen, randomX is for the x position.
        this.targetWordSprite = this.words
          .create(randomX, 10, "invisibleSprite")
          .setScale(0.5);

        //this is so we disable gravity on the word sprite (so it doesn't accelerate)
        this.targetWordSprite.body.setAllowGravity(false);

        //this is the speed at which the word will fall down (it scales off speedDown for difficulty scaling purposes later)
        this.targetWordSprite.setVelocityY(speedDown - 90);

        //this is the text that will be displayed on the word sprite the initialization does not really matter, but the styling etc will be done here
        this.targetWordText = this.add.text(10, 10, this.targetWord, {
          fontSize: "32px",
          fill: "#fff",
        });
      });

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
      if (event.key === "Backspace") {
        this.currentWord = this.currentWord.slice(0, -1);
        this.currentWordText.setText(this.currentWord);
        return;
      }

      this.currentWord += event.key;

      this.currentWordText.setText(this.currentWord);

      if (this.currentWord === this.targetWord) {
        this.currentWord = "";
        this.currentWordText.setText(this.currentWord);

        this.targetWordText.destroy();
        this.targetWordSprite.destroy();
      }
    });


    this.player = this.add
      .sprite(sizes.width / 2, sizes.height - 100, "player")
      .setOrigin(0, 0);

    this.cursorKeys = this.input.keyboard.createCursorKeys();
  }

  //update assets, anything that needs to be updated every frame (images, sprites, etc), as well as game logic and physics
  update() {
    if (this.targetWordSprite && this.targetWordText) {
      this.targetWordText.x = this.targetWordSprite.x;
      this.targetWordText.y = this.targetWordSprite.y;
    }

    if (this.targetWordSprite && this.targetWordSprite.y > sizes.height) {
      this.targetWordSprite.setY(0);
      this.targetWordText.setY(0);
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

