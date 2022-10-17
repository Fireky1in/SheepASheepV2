import { io } from "socket.io-client";
import { useEffect, useState } from "react";

import "./App.css";

const URL = "http://localhost:3500";
const socket = io(URL);

const Button = () => {
  const [token, setToken] = useState("");
  return (
    <div>
      <div>
        <div>请在下方输入 token</div>
        <textarea
          style={{ height: "200px", width: "400px" }}
          type="password"
          onChange={(e) => {
            setToken(e.target.value);
          }}
          value={token}
        />
      </div>
      <button
        onClick={() => {
          if (!socket.connected) return;
          socket.emit("challenge", token);
        }}
      >
        冲!
      </button>
    </div>
  );
};

function App() {
  const [connected, setConnected] = useState(false);
  const [messageList, setMessageList] = useState([]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected to server");
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("disconnected from server");
      setConnected(false);
    });

    socket.on("serverError", (msg) => {
      console.error(msg);
    });

    socket.on("solverUpdate", (msg) => {
      setMessageList((messageList) => [...messageList, msg]);
      console.log(msg);
    });
  }, []);

  return (
    <div className="App">
      {!connected && <div>Connecting</div>}
      {connected && <Button />}
      {messageList.map((msg, index) => (
        <div key={msg + index}>{msg}</div>
      ))}
    </div>
  );
}

export default App;
