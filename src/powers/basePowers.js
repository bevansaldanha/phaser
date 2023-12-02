export const powerUps = [
  {
    name: "WordPop",
    description: "Pops the next word after 3 correct words in a row",
    effect: function (scene) {
      if (scene.activeWords.length > 2) {
        scene.handleCorrectWord(scene.activeWords.length - 1);
      }
    },
  },
  {
    name: "WordFreeze",
    description:
      "Freezes the words in place for 1 second after 5 correct words in a row",
    effect: function (scene) {
      // Freeze the words in place for 1 second
      scene.time.delayedCall(1000, () => {
        // After 1 second, resume the words
        scene.resumeWords();
      });

      // Pause the words
      scene.pauseWords();
    },
  },
  {
    name: "Chunky",
    description:
      "Increases the font-size of the words and slows their fall speed by 50% until the end of the game session, but you only gain half the points",
  },
];