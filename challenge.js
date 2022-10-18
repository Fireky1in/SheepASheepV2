const fs = require("fs");
const { exit } = require("process");
const { performance } = require("perf_hooks");
const { matchPlayInfoToStr } = require("./utils/getMatchPlayInfo");
const { getMapInfo, sendMatchInfo } = require("./services/services");
const { getMap } = require("./utils/mapUtils");
const { delay } = require("./utils/helpers");
const { startThreads, filterSolutions } = require("./utils/solver");
const { getSkinName } = require("./utils/skins");

const initialize = async (token) => {
  console.log("获取地图信息");
  const mapInfo = await getMapInfo(token);
  console.log("Map seed:", mapInfo.map_seed);
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

const challenge = async () => {
  let retry_count = 0;
  let token;

  if (!process.argv.slice(2)[0]) {
    console.log("未提供token");
    exit(1);
  }

  token = process.argv.slice(2)[0];

  while (1) {
    console.log(">>>CLEAR<<<");
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
      const result = await sendMatchInfo(
        token,
        mapInfo.map_seed_2,
        matchPlayInfo
      );
      console.log("服务器返回数据:", result);
      const { err_code: errorCode, data } = result;
      if (errorCode !== 0) {
        console.error("服务器返回数据出错，开始下一轮尝试");
        await delay(3);
        continue;
      }
      if (data.skin_id === 0) {
        console.error("未获得新皮肤，可能今日已通关或者解不正确");
        exit(1);
      }
      console.log(">> 完成  <<");
      console.log("获得皮肤", getSkinName(data.skin_id));
      exit(0);
    } catch (e) {
      console.error(e);
      console.log("出现异常");
      exit(1);
    }
  }
};

challenge();
