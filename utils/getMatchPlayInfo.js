const protobufjs = require("protobufjs");

function buildMatchPlayInfo(map, solution) {
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
    gameType: 3,
    stepInfoList,
  };

  return matchPlayInfo;
}

function matchPlayInfoToStr(map, solution) {
  return new Promise((resolve) => {
    protobufjs.load("yang.proto", (_, root) => {
      const MatchPlayInfo = root.lookupType("yang.MatchPlayInfo");
      const matchPlayInfo = buildMatchPlayInfo(map, solution);
      const buf = MatchPlayInfo.encode(matchPlayInfo).finish();
      const b64 = Buffer.from(buf).toString("base64");

      resolve(b64);
    });
  });
}

module.exports = { matchPlayInfoToStr };
