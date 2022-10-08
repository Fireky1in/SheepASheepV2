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

module.exports = { delay, getRandom };
