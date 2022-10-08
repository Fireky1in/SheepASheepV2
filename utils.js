function delay(sec) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, sec * 1000);
  });
}

module.exports = { delay }
