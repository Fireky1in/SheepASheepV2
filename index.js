const fs = require("fs");
const spawn = require("child_process").spawn;
const { matchPlayInfoToStr } = require("./utils/getMatchPlayInfo");
const { getNewMap, sendMatchInfo } = require("./services/services");
const { getMap } = require("./utils/mapUtils");
const { delay, getRandom } = require("./utils/helpers");

const findSolution = async () => {
  const py = spawn("python", [__dirname + "/SheepSolver/main.py"]);
  let solution;

  py.stdout.on("data", function (data) {
    const outputs = data
      .toString()
      .split(/\r?\n/)
      .filter((e) => e);
    for (line of outputs) {
      console.log(line)
      if (line.includes("[")) {
        solution = JSON.parse(line);
      }
    }
  });

  py.stderr.on("data", function (data) {
    console.log(data.toString())
  });

  const sec = getRandom(60, 90)
  console.log('wait for', sec)
  await delay(sec);
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
    fs.writeFileSync(__dirname + "/SheepSolver/online_data.json", JSON.stringify(mapData));
    console.log('Finding solution')


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
