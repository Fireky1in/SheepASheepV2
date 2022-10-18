import { useContext, useEffect, useState } from "react";
import MessageCard from "./MessageCard";
import { SocketContext } from "../App";

const TokenInput = ({ onClick }) => {
  return (
    <div className="flex flex-col w-auto space-y-4">
      <div className="flex flex-col w-auto space-y-4">
        <div>请在下方输入 token</div>
        <textarea
          id="token_input"
          className="w-80 h-40 border border-slate-600 p-3"
        />
      </div>
      <div>
        <button
          className="text-lg border border-slate-600 w-20 rounded-lg p-2"
          onClick={onClick}
        >
          冲!
        </button>
      </div>
    </div>
  );
};

const Solver = ({ solverType }) => {
  const [messageList, setMessageList] = useState([]);
  const [socket, connected] = useContext(SocketContext);
  // console.log(connected)
  // if(!connected) setMessageList([])

  useEffect(() => {
    socket.on("serverError", () => {
      setMessageList([]);
    });

    socket.on("solverUpdate", (msg) => {
      if (msg === ">>>CLEAR<<<") {
        setMessageList([]);
        return;
      }
      setMessageList((messageList) => [...messageList, msg]);
      console.log(msg);
    });
  }, [socket]);

  const onClick = () => {
    if (!socket.connected) return;
    const token = document.getElementById("token_input").value;
    socket.emit(solverType, token);
    // setMessageList([]);
  };

  return (
    <div className="flex flex-col self-center w-11/12">
      <div className="flex flex-col w-auto space-y-4">
        <div>{solverType === "challenge" ? "每日挑战" : "今日话题"}</div>
        {!connected && <div>Connecting</div>}
        {connected && <TokenInput onClick={onClick} />}
        {messageList.length !== 0 && (
          <div className="flex flex-col w-auto space-y-2 border p-3 rounded-md border-slate-300">
            {messageList.map((msg, index) => (
              <MessageCard key={msg + index} msg={msg} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Solver;
