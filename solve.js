const fs = require("fs");
const axios = require("axios");
const spawn = require("child_process").spawn;
const { matchPlayInfoToStr } = require("./getMatchPlayInfo");
const { getNewMap, sendMatchInfo } = require("./services");
const { getMap } = require("./mapUtils");
const { delay } = require("./utils");

const findSolution = async () => {
  const py = spawn("python3", ["./SheepSolver/main.py"]);
  let solution;

  py.stdout.on("data", function (data) {
    const outputs = data
      .toString()
      .split(/\r?\n/)
      .filter((e) => e);
    for (line of outputs) {
      // console.log(line)
      if (line.includes("[")) {
        solution = JSON.parse(line);
      }
    }
  });
  await delay(60);
  py.kill();
  console.log("check answer");
  if (!solution) await delay(5);
  return solution;
};

(async () => {
  while (1) {
    const token = ""
    const mapInfo = await getNewMap(token);
    console.log(mapInfo);
    const mapData = await getMap(mapInfo.map_md5[1], mapInfo.map_seed);
    // console.log(mapData);
    console.log('Finding solution')

    fs.writeFileSync("./SheepSolver/online_data.json", JSON.stringify(mapData));

    const solution = await findSolution();
    if (solution) {
      console.log("Found solution", JSON.stringify(solution));

      await matchPlayInfoToStr(solution, mapData, (info) => {
        sendMatchInfo(token, mapInfo.map_seed_2, info);
      });

      break;
    } else {
      console.log("Change to a new map");
    }
  }
})();
