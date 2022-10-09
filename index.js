const fs = require("fs");
const spawn = require("child_process").spawn;
const { matchPlayInfoToStr } = require("./utils/getMatchPlayInfo");
const { getNewMap, sendMatchInfo } = require("./services/services");
const { getMap } = require("./utils/mapUtils");
const { delay, getRandom, prompt } = require("./utils/helpers");
const { exit } = require("process");

retry_count = 0;

const findSolution = async () => {
  const py = spawn("python", [__dirname + "/SheepSolver/main.py"]);
  let solution;

  py.stdout.on("data", function (data) {
    const outputs = data
      .toString()
      .split(/\r?\n/)
      .filter((e) => e);

    let currStep = 0;
    let totSteps = 0;
    let tot = 0;

    console.clear();

    for (line of outputs) {
      if (line.includes("[")) {
        solution = JSON.parse(line);
      } else if (line.includes("progress")) {
        const group = line.match(/(\d+)\/(\d+)/);

        if (group[1] && group[2]) {
          currStep += parseInt(group[1], 10);
          totSteps += parseInt(group[2], 10);
          tot += 1;
        }
      }
    }

    // print out avaerage progress
    if (!solution && tot !== 0) {
      currStep = Math.floor(currStep / tot);
      totSteps = Math.floor(totSteps / tot);
      console.log(
        retry_count +
          "th try progress: " +
          Math.floor((currStep / totSteps) * 100) +
          "%"
      );
    }
  });

  py.stderr.on("data", function (data) {
    console.log(data.toString());
  });

  const sec = getRandom(60, 65);
  console.log("wait for", sec);
  await delay(sec);

  py.kill();

  return solution;
};

(async () => {
  let token
  if(process.argv.slice(2)[0]) {
    token = process.argv.slice(2)[0]
  } else {
    token = await prompt("token: ");
  }

  while (1) {
    retry_count += 1;
    try {
      console.log("Getting new map");
      const mapInfo = await getNewMap(token);
      console.log("map seed", mapInfo.map_seed);
      const mapData = await getMap(mapInfo.map_md5[1], mapInfo.map_seed);
      console.log("Writing map to online_data.json");
      fs.writeFileSync(
        __dirname + "/SheepSolver/online_data.json",
        JSON.stringify(mapData)
      );

      console.log("Finding solution");
      const solution = await findSolution();

      console.log("check solution");
      if (solution) {
        console.log("Found solution", JSON.stringify(solution));
        console.log("Sending match info", JSON.stringify(solution));

        const matchPlayInfo = await matchPlayInfoToStr(solution, mapData);
        const result = await sendMatchInfo(
          token,
          mapInfo.map_seed_2,
          matchPlayInfo
        );

        console.log("Complete!", result);
        exit(0);
      } else {
        console.log("No solution. Changing to a new map");
        await delay(5);
      }
    } catch (e) {
      console.log(e);
      exit(1);
    }
  }
})();
