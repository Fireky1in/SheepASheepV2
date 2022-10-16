const spawn = require("child_process").spawn;

const findSolution = (issort, percent, t = 60) => {
  return new Promise((resolve) => {
    let solved = false;
    let solution = undefined;
    console.log(
      "starting thread with mode:",
      "issort",
      issort,
      "percent",
      percent
    );

    const pyExec = process.platform === "win32" ? "python" : "python3";
    const args = [__dirname + "/../sheep/autoSolve.py", "-t", t];
    if (issort == "reverse") {
      args.push("-s", "reverse");
    }
    if (percent !== null) {
      args.push("-p", percent);
    }

    const py = spawn(pyExec, args);

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

module.exports = { findSolution };
