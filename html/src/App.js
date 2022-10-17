import { io } from "socket.io-client";
import { useEffect, useState } from "react";

import "./App.css";

const URL = "http://server.i6502.com:3500";
const socket = io(URL);

const Button = () => {
  const [token, setToken] = useState("");
  return (
    <div className="flex flex-col w-auto space-y-4">
      <div className="flex flex-col w-auto space-y-4">
        <div>请在下方输入 token</div>
        <textarea
          className="w-80 h-40 border border-slate-600 p-3"
          onChange={(e) => {
            setToken(e.target.value);
          }}
          value={token}
        />
      </div>
      <div>
        <button
          className="text-lg border-2 border-blue-500 w-20 rounded-lg p-2"
          onClick={() => {
            if (!socket.connected) return;
            socket.emit("challenge", token);
          }}
        >
          冲!
        </button>
      </div>
    </div>
  );
};

const MessageCard = ({ msg }) => {
  return <div>{msg}</div>;
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
    <div className="flex flex-col self-center w-11/12">
      <div className="flex w-auto self-center text-xl"> 羊了个羊 </div>
      <div className="flex flex-col w-auto space-y-4">
        {!connected && <div>Connecting</div>}
        {connected && <Button />}
        <div className="flex flex-col w-auto space-y-2 border p-3 rounded-md border-slate-300">
          {messageList.map((msg, index) => (
            <MessageCard key={msg + index} msg={msg} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
