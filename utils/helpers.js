const readline = require("readline");

function delay(sec) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, sec * 1000);
  });
}

function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function prompt(userPrompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(userPrompt, (token) => {
      resolve(token);
    });
  });
}

module.exports = { delay, getRandom, prompt };
