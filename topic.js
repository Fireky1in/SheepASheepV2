const fs = require("fs");
const { exit } = require("process");
const { performance } = require("perf_hooks");
const { matchPlayInfoToStr } = require("./utils/getMatchPlayInfo");
const {
  sendTopicMatchInfo,
  getTopicInfo,
  getTopicMapInfo,
  topicJoinSide,
} = require("./services/services");
const { getMap } = require("./utils/mapUtils");
const { delay, prompt } = require("./utils/helpers");
const { findSolution } = require("./utils/solver");

let retry_count = 0;

const initialize = async (token) => {
  const { side } = await getTopicInfo(token);
  if (side === 0) {
    console.log("今日未选择队伍，自动选择左侧队伍");
    const { err_code: errorCode } = await topicJoinSide(token, 1);
    if (errorCode !== 0) {
      console.error("无法加入队伍");
      exit(1);
    }
    const { side } = await getTopicInfo(token);
    if (side !== 1) {
      console.error("无法加入队伍");
      exit(1);
    }
  } else {
    console.log("已加入队伍:", side === 1 ? "左侧" : "右侧");
  }

  console.log("获取地图信息");
  const mapInfo = await getTopicMapInfo(token);
  console.log("Map seed:", mapInfo.map_seed);
  console.log("获取地图数据");
  const mapData = await getMap(mapInfo.map_md5[1], mapInfo.map_seed);
  console.log("写入地图数据到 map_data.json");
  fs.writeFileSync(__dirname + "/map_data.json", JSON.stringify(mapData));

  return [mapInfo, mapData];
};

const startThreads = () => {
  const promises = [];
  promises.push(findSolution("reverse", 0.85, 60));
  promises.push(findSolution("reverse", 0, 60));
  promises.push(findSolution("", 0.85, 60));
  promises.push(findSolution("", 0, 60));

  return promises;
};

const filterSolutions = async (threads) => {
  const solutions = await Promise.all(threads);
  console.log("===================================");
  const validSolutions = solutions.filter((solution) => solution);
  if (validSolutions.length > 0) {
    console.log("找到", validSolutions.length, "个解. 使用第一个解");

    return validSolutions[0];
  }
  return undefined;
};

const waitForSomeTime = async (runningTime) => {
  console.log("求解线程运行时间:", runningTime, "秒");
  if (runningTime < 80) {
    const waitTime = 80 - runningTime;
    console.log("等待", waitTime, "秒");
    console.log("===================================");
    await delay(waitTime);
  }
};

(async () => {
  if (process.argv.slice(2)[0]) {
    token = process.argv.slice(2)[0];
  } else {
    token = await prompt("请输入token: ");
  }

  while (1) {
    console.clear();
    retry_count += 1;
    try {
      console.log(">>> 第", retry_count, "次尝试 <<<");
      console.log("===================================");
      await delay(3);
      console.log(">> 初始化地图信息 <<");
      const [mapInfo, mapData] = await initialize(token);
      console.log("===================================");
      console.log(">> 求解 <<");
      const startTime = performance.now();
      const threads = startThreads();
      console.log("===================================");

      const solution = await filterSolutions(threads);
      if (!solution) {
        console.log("无解, 开始下一轮尝试");
        await delay(3);
        continue;
      }
      const endTime = performance.now();

      const runningTime = Math.ceil((endTime - startTime) / 1000);
      await waitForSomeTime(runningTime);

      console.log(">> 发送MatchPlayInfo到服务器 <<");
      const matchPlayInfo = await matchPlayInfoToStr(mapData, solution);
      // console.log(matchPlayInfo);
      const result = await sendTopicMatchInfo(
        token,
        mapInfo.map_seed_2,
        matchPlayInfo
      );
      console.log("服务器返回数据:", result);
      const { err_code: errorCode, data } = result;
      if (errorCode !== 0) {
        console.error("服务器返回数据出错, 可能今日已通关或者解不正确");
        exit(1);
      }
      console.log(">> 完成  <<");
      console.log("获得皮肤id为", data.skin_id, "的皮肤");
      exit(0);
    } catch (e) {
      console.error(e);
      console.log("出现异常");
      exit(1);
    }
  }
})();
