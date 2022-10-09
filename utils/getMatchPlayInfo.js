const protobufjs = require("protobufjs");

function buildMatchPlayInfo(ans, map) {
  let flattened = [];

  for (idx in map) {
    flattened = [...flattened, ...map[idx]];
  }

  const stepInfoList = ans.map((index) => {
    return { chessIndex: index - 1, timeTag: flattened[index - 1].type };
  });

  const matchPlayInfo = {
    gameType: 3,
    stepInfoList,
  };

  return matchPlayInfo;
}

function matchPlayInfoToStr(ans, map) {

  return new Promise((resolve) => {
    protobufjs.load("yang.proto", (_, root) => {
      const MatchPlayInfo = root.lookupType("yang.MatchPlayInfo");
      const matchPlayInfo = buildMatchPlayInfo(ans, map);
      const buf = MatchPlayInfo.encode(matchPlayInfo).finish();
      const b64 = Buffer.from(buf).toString("base64");

      resolve(b64);
    });
  });
}

module.exports = { matchPlayInfoToStr };
