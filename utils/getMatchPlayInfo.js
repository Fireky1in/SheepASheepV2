const protobufjs = require("protobufjs");

function buildMatchPlayInfo(map, solution, gameType = 3) {
  let flattened = [];

  for (idx in map.levelData) {
    flattened = [...flattened, ...map.levelData[idx]];
  }

  const idIndexMap = {};
  flattened.forEach((value, index) => {
    idIndexMap[value.id] = { ...value, index };
  });

  const stepInfoList = solution.map((id) => {
    return { chessIndex: idIndexMap[id].index, timeTag: idIndexMap[id].type };
  });

  const matchPlayInfo = {
    gameType,
    stepInfoList,
  };

  return matchPlayInfo;
}

function matchPlayInfoToStr(map, solution) {
  return new Promise((resolve) => {
    protobufjs.load("yang.proto", (_, root) => {
      const MatchPlayInfo = root.lookupType("yang.MatchPlayInfo");
      const matchPlayInfo = buildMatchPlayInfo(map, solution, 3);
      const buf = MatchPlayInfo.encode(matchPlayInfo).finish();
      const b64 = Buffer.from(buf).toString("base64");

      resolve(b64);
    });
  });
}

function topicMatchPlayInfoToStr(map, solution) {
  return new Promise((resolve) => {
    protobufjs.load("yang.proto", (_, root) => {
      const MatchPlayInfo = root.lookupType("yang.MatchPlayInfo");
      const matchPlayInfo = buildMatchPlayInfo(map, solution, 4);
      const buf = MatchPlayInfo.encode(matchPlayInfo).finish();
      const b64 = Buffer.from(buf).toString("base64");

      resolve(b64);
    });
  });
}

module.exports = { matchPlayInfoToStr };
