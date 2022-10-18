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
<<<<<<< HEAD
const { startThreads, filterSolutions } = require("./utils/solver");
const { delay, getRandom, prompt } = require("./utils/helpers");
const { getSkinName } = require("./utils/skins");
=======
const { delay, prompt, getRandom } = require("./utils/helpers");
const { findSolution } = require("./utils/solver");
const { getSkinName } = require("./utils/skins");

let retry_count = 0;
>>>>>>> 6e89391b9b2e7f25e82cbe946416e8fadf4588ce

const initialize = async (token) => {
  const { side } = await getTopicInfo(token);

  if (side === 0) {
    const randSide = getRandom(1, 3);
    console.log(
      "今日未选择队伍，随机选择",
      randSide === 1 ? "左侧" : "右侧",
      "队伍"
    );
    const { err_code: errorCode } = await topicJoinSide(token, randSide);
    if (errorCode !== 0) {
      console.error("无法加入队伍");
      exit(1);
    }
    const { side } = await getTopicInfo(token);
    if (side !== randSide) {
      console.error("无法加入队伍");
      exit(1);
    } else {
      console.log("已加入队伍:", side === 1 ? "左侧" : "右侧");
    }
  } else {
    console.log("已加入队伍:", side === 1 ? "左侧" : "右侧");
  }

  console.log("获取地图信息");
  const mapInfo = await getTopicMapInfo(token);
  console.log("map seed:", mapInfo.map_seed);
  console.log("获取地图数据");
  const mapData = await getMap(mapInfo.map_md5[1], mapInfo.map_seed);

  return [mapInfo, mapData];
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

const topic = async () => {
  let retryCount = 0;
  let token;
  let serverMode = false;

  if (process.argv.slice(2)[0] === "-t") {
    token = process.argv.slice(2)[0];
    serverMode = true;
    if (!token) {
      console.log("未提供token");
      exit(1);
    }
  } else {
    token = await prompt("请输入token: ");
  }

  while (1) {
    if (serverMode) {
      console.log(">>>CLEAR<<<");
    }
    retryCount += 1;
    try {
      console.log(">>> 第", retryCount, "次尝试 <<<");
      console.log("===================================");
      await delay(3);
      console.log(">> 初始化地图信息 <<");
      const [mapInfo, mapData] = await initialize(token);
      console.log("===================================");
      console.log(">> 求解 <<");
      const startTime = performance.now();
      const threads = startThreads(mapData);
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
<<<<<<< HEAD
      console.log(">> 完成 <<");
      console.log("获得皮肤", getSkinName(data.skin_id));
      if (serverMode) {
        console.log(">>>COMPLETED<<<");
      }
=======
      console.log(">> 完成  <<");
      console.log("获得皮肤", getSkinName(data.skin_id));
>>>>>>> 6e89391b9b2e7f25e82cbe946416e8fadf4588ce
      exit(0);
    } catch (e) {
      console.error(e);
      console.log("出现异常");
      exit(1);
    }
  }
};

topic();
