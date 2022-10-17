const spawn = require("child_process").spawn;
const { Server } = require("socket.io");

const spawnSolverProcess = (fileName, token, socket) => {
  const solverProcess = spawn("node", [fileName, token]);
  solverProcess.stdout.on("data", (data) => {
    const outputs = data
      .toString()
      .split(/\r?\n/)
      .filter((e) => e);

    for (line of outputs) {
      socket.emit("solverUpdate", line)
    }
  });

  solverProcess.stderr.on("data", (data) => {
    socket.emit("solverUpdate", data.toString())
  });

  solverProcess.on("exit", () => {
    socket.data.challenge_started = false;
    console.log("solver process exited");
  });

  return solverProcess;
};

const io = new Server(3500, {
  cors: {
    origin: "*",
    credentials: false,
  },
});

io.on("connection", (socket) => {
  // ...
  console.log(socket.id, "connected");

  socket.on("disconnecting", () => {
    console.log("client disconnecting");
    console.log("killing solver processes");
    if (socket.data.challenge_started) {
      socket.data.challenge_process.kill();
    }
  });

  socket.on("challenge", (ylgyToken) => {
    console.log("socket.id:", socket.id, ylgyToken);
    if (!socket.data.challenge_started) {
      console.log("starting challenge solver process");
      socket.data.challenge_started = true;
      const challenge_process = spawnSolverProcess('challenge.js', ylgyToken, socket)
      socket.data.challenge_process = challenge_process;
    } else {
      socket.emit("serverError", "Challenge already started");
    }
  });

  socket.on("topic", (ylgyToken) => {
    console.log("socket.id:", socket.id, ylgyToken);
    if (!socket.data.topic_started) {
      console.log("starting topic solver process");
      socket.data.topic_started = true;
      const topic_process = spawnSolverProcess('challenge.js', ylgyToken, socket)
      socket.data.topic_process = topic_process;
    } else {
      socket.emit("serverError", "Topic already started");
    }
  });
});
