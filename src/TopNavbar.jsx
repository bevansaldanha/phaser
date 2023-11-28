import React, { useState } from 'react';

import './TopNavbar.scss';
import lighthouse from './lighthouse.svg'



const TopNavbar = () => {
  return (
    <div className="top-nav-bar">
      <span>Typing Game</span>
      <img src={lighthouse} className="top-nav-bar__logo" alt="lighthouse" />
    </div>
  );
};

export default TopNavbar;