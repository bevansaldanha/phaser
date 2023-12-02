import logo from './logo.svg';
import './App.scss';
import React, { useState, useEffect, useRef } from 'react';
import Phaser from 'phaser';
import TopNavbar from './TopNavbar';

import { IonPhaser } from '@ion-phaser/react';

import  {MenuScene}  from './menus/mainMenu'
import {OptionsScene} from './menus/optionsMenu';
import  {WinScene}  from "./level-complete/level-pass"
import  {LossScene}  from "./level-complete/level-fail"
import  {BaseLevel}  from "./levels/BaseLevel";
import  {Level1}  from "./levels/Level1";
import  {Level2}  from "./levels/Level2";
import  {Level3}  from "./levels/Level3";
import  {Level4}  from "./levels/Level4";
import { Level5 } from "./levels/Level5";
import { Level6 } from "./levels/Level6";
import { Level7 } from "./levels/Level7";
import { PowerUp } from "./levels/PowerUp.js";


const canvasConfiguration = {
  type: Phaser.WEBGL,
  width: 1200,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 50 },
      debug: true,
    },
  },
  scene: [
    MenuScene,
    OptionsScene,
    BaseLevel,
    PowerUp,
    Level1,
    Level2,
    Level3,
    Level4,
    Level5,
    Level6,
    Level7,
    WinScene,
    LossScene,
  ],
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
      setGame(Object.assign({}, canvasConfiguration));
    }
  }, [initialize]);

  return (
    <div className="App">
      <TopNavbar />
      <header className="App-header">
        {initialize ? (
          <>
            <IonPhaser ref={gameRef} game={game} initialize={initialize} className='game'/>
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

