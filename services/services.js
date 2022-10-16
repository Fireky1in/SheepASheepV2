const axios = require("axios");
const { getRandom } = require("../utils/helpers");

const getNewMap = async (token) => {
  const config = {
    method: "get",
    url: "https://cat-match.easygame2021.com/sheep/v1/game/map_info_ex?matchType=3",
    headers: {
      Connection: "keep-alive",
      t: token,
      "content-type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d2c) NetType/WIFI Language/zh_CN",
      Referer:
        "https://servicewechat.com/wx141bfb9b73c970a9/34/page-frame.html",
    },
  };

  try {
    const response = await axios(config);

    return response.data.data;
  } catch (err) {
    console.log(err);
  }
};

async function sendMatchInfo(token, mapSeed2, matchPlayInfo) {
  // console.log("token", token);
  // console.log("map_seed2", mapSeed2);
  // console.log("matchPlayInfo", matchPlayInfo);

  var data = JSON.stringify({
    rank_score: 1,
    rank_state: 1,
    rank_time: getRandom(1000, 1500),
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
    data,
  };

  const response = await axios(config);

  return response.data;
}

module.exports = { sendMatchInfo, getNewMap };
