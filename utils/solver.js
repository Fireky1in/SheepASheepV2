const spawn = require("child_process").spawn;

const getMode = (issort, percent) => {
  if (issort !== "true" && issort !== "reverse" && percent === 0.85) {
    return "普通模式";
  } else if (issort == "reverse" && percent == 0.85) {
    return "高层优先模式";
  } else if (issort != "true" && issort != "reverse" && percent == 0) {
    return "优先移除两张相同类型的手牌模式";
  } else if (issort == "reverse" && percent == 0) {
    return "高层优先且优先移除两张相同类型的手牌模式";
  } else {
    return "自定义模式";
  }
};

const findSolution = (issort, percent = 0, t = 60) => {
  return new Promise((resolve) => {
    let solved = false;
    let solution = undefined;
    const mode = getMode(issort, percent);
    console.log("启动", mode);

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
        console.log(mode, "在", t, "秒内没有找到解");
      } else {
        console.log(mode, "在", t, "秒内成功找到解, 等待其他线程结束");
      }
      resolve(solution);
    });
  });
};

module.exports = { findSolution };
