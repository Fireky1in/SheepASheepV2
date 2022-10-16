const fs = require("fs");
const spawn = require("child_process").spawn;
const { matchPlayInfoToStr } = require("./utils/getMatchPlayInfo");
const { getNewMap, sendMatchInfo } = require("./services/services");
const { getMap } = require("./utils/mapUtils");
const { delay, prompt } = require("./utils/helpers");
const { exit } = require("process");

let retry_count = 0;

const findSolution = (issort, percent, t = 60) => {
  return new Promise((resolve) => {
    const args = [__dirname + "/sheep/autoSolve.py", "-t", t];
    if (issort == "reverse") {
      args.push("-s", "reverse");
    }
    if (percent !== null) {
      args.push("-p", percent);
    }

    console.log(
      "starting thread with mode:",
      "issort",
      issort,
      "percent",
      percent
    );

    const py = spawn("python3", args);
    let solved = false;
    let solution = undefined;

    // py.stdout.setEncoding('utf-8')
    py.stdout.on("data", function (data) {
      const outputs = data
        .toString()
        .split(/\r?\n/)
        .filter((e) => e);

      for (line of outputs) {
        if (line.includes("result")) {
          solved = true;
          solution = JSON.parse(line.replace("result", ""));
        }
      }
    });

    py.stderr.on("data", function (data) {
      console.log(data.toString());
    });

    py.on("exit", async () => {
      if (!solved) {
        console.log(
          "Not solved in 60s using",
          "issort:",
          issort,
          "percent:",
          percent
        );
      } else {
        console.log(
          "Solved in 60s using",
          "issort:",
          issort,
          "percent:",
          percent
        );
      }
      resolve(solution);
    });
  });
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
      console.log("executing No.", retry_count, "try");
      await delay(3);
      console.log("Getting new map");
      const mapInfo = await getNewMap(token);
      console.log("map seed", mapInfo.map_seed);
      const mapData = await getMap(mapInfo.map_md5[1], mapInfo.map_seed);
      console.log("Writing map to map_data.json");
      fs.writeFileSync(__dirname + "/map_data.json", JSON.stringify(mapData));

      const startTime = performance.now();

      console.log("Finding solution");
      const promises = [];
      promises.push(findSolution("reverse", 0.85, 60));
      promises.push(findSolution("reverse", 0, 60));
      promises.push(findSolution("", 0, 60));
      promises.push(findSolution("", null, 60));
      const solutions = await Promise.all(promises);
      const validSolutions = solutions.filter((solution) => solution);
      if (validSolutions.length === 0) {
        console.log("No solution found, start next round");
        await delay(3);
        continue;
      } else {
        console.log(
          "found",
          validSolutions.length,
          "solution. Using first valid solution"
        );
      }
      const solution = validSolutions[0];

      const endTime = performance.now();
      const runningTime = Math.ceil((endTime - startTime) / 1000);

      console.log("Solver running time:", runningTime, 'seconds');
      if (runningTime < 80) {
        const waitTime = 80 - runningTime;
        console.log("wait for", waitTime, "seconds");
        await delay(waitTime);
      }

      console.log("Sending match info");
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
