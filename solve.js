const protobufjs = require("protobufjs");
const fs = require("fs");
var axios = require("axios");

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

function matchPlayInfoToStr(matchPlayInfo, onComplete) {
  protobufjs.load("yang.proto", (_, root) => {
    const MatchPlayInfo = root.lookupType("yang.MatchPlayInfo");
    const buf = MatchPlayInfo.encode(matchPlayInfo).finish();
    const b64 = Buffer.from(buf).toString("base64");

    onComplete(b64);
  });
}

function generateOnlineData(map) {
  const result = {};

  for (layer in map_data["levelData"]) {
    result[layer] = map_data["levelData"][layer].map(
      ({ type, rolNum, rowNum }) => ({
        type,
        min_x: rolNum,
        min_y: rowNum,
        max_x: rolNum + 8,
        max_y: rowNum + 8,
      })
    );
  }

  return result;
}

function sendRequest(token, mapSeed2, matchPlayInfo) {
  console.log('token', token)
  console.log('map_seed2', mapSeed2)
  console.log('matchPlayInfo', matchPlayInfo)

  var data = JSON.stringify({
    rank_score: 1,
    rank_state: 1,
    rank_time: 1094,
    rank_role: 2,
    skin: 1,
    MatchPlayInfo: matchPlayInfo,
    MapSeed2: mapSeed2,
    Version: "0.0.1",
  });

  var config = {
    method: "post",
    url: "https://cat-match.easygame2021.com/sheep/v1/game/game_over_ex?",
    headers: {
      Connection: "keep-alive",
      t: token,
      "content-type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d2c) NetType/WIFI Language/zh_CN",
      Referer:
        "https://servicewechat.com/wx141bfb9b73c970a9/34/page-frame.html",
    },
    data: data,
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
}

fs.readFile("online_data.json", "utf8", (_, data) => {
  // 先 npm install protobufjs axios
  // online_data.json 放到同一个目录
  const map = JSON.parse(data);
  // answer 放这里
  const answer = [];
  // token 放这里
  const token = ''
  // map_seed2 放这里
  const mapSeed2 = ''

  matchPlayInfoToStr(buildMatchPlayInfo(answer, map), (str) => {
    sendRequest(token, mapSeed2, str);
  });
});
