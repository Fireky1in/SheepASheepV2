const fs = require("fs");
const { exit } = require("process");
const { matchPlayInfoToStr } = require("./utils/getMatchPlayInfo");
const { getMapInfo, sendMatchInfo } = require("./services/services");
const { getMap } = require("./utils/mapUtils");
const { delay, prompt } = require("./utils/helpers");
const { findSolution } = require("./utils/solver");

let retry_count = 0;

const initialize = async (token) => {
  console.log("Getting map info");
  const mapInfo = await getMapInfo(token);
  console.log("Map seed:", mapInfo.map_seed);
  console.log("Getting map data");
  const mapData = await getMap(mapInfo.map_md5[1], mapInfo.map_seed);
  console.log("Writing map data to map_data.json");
  fs.writeFileSync(__dirname + "/map_data.json", JSON.stringify(mapData));

  return [mapInfo, mapData];
};

const startThreads = () => {
  const promises = [];
  promises.push(findSolution("reverse", 0.85, 60));
  promises.push(findSolution("reverse", 0, 60));
  promises.push(findSolution("", 0, 60));
  promises.push(findSolution("", null, 60));

  return promises;
};

const filterSolutions = async (threads) => {
  const solutions = await Promise.all(threads);
  const validSolutions = solutions.filter((solution) => solution);
  if (validSolutions.length > 0) {
    console.log(
      "Found",
      validSolutions.length,
      "solution. Using first valid solution"
    );

    return validSolutions[0];
  }
  return undefined;
};

const waitForSomeTime = async (runningTime) => {
  console.log("Solver running time:", runningTime, "seconds");
  if (runningTime < 80) {
    const waitTime = 80 - runningTime;
    console.log("Wait for", waitTime, "seconds");
    console.log("===================================");
    await delay(waitTime);
  }
};

(async () => {
  if (process.argv.slice(2)[0]) {
    token = process.argv.slice(2)[0];
  } else {
    token = await prompt("token: ");
  }

  while (1) {
    console.clear();
    retry_count += 1;
    try {
      console.log("Executing no.", retry_count, "try");
      console.log("===================================");
      await delay(3);
      console.log(">Initialization<");
      const [mapInfo, mapData] = await initialize(token);
      console.log("===================================");
      console.log(">Finding solution<");
      const startTime = performance.now();
      const threads = startThreads();
      console.log("===================================");

      const solution = await filterSolutions(threads);
      if (!solution) {
        console.log("No solution found, start next round");
        await delay(3);
        continue;
      }
      const endTime = performance.now();

      const runningTime = Math.ceil((endTime - startTime) / 1000);
      await waitForSomeTime(runningTime);

      console.log(">Sending match info<");
      const matchPlayInfo = await matchPlayInfoToStr(mapData, solution);
      console.log(matchPlayInfo);
      const result = await sendMatchInfo(
        token,
        mapInfo.map_seed_2,
        matchPlayInfo
      );

      console.log("Completed", result);
      exit(0);
    } catch (e) {
      console.log(e);
      exit(1);
    }
  }
})();
