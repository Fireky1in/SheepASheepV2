import { useContext, useEffect, useState } from "react";
import MessageCard from "./MessageCard";
import { SocketContext } from "../App";

const TokenInput = ({ onClick }) => {
  return (
    <div className="flex flex-col w-auto space-y-4">
      <div className="flex flex-col w-auto space-y-4">
        <textarea
          id="token_input"
          placeholder="输入token，然后点击冲"
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

  useEffect(() => {
    socket.on("serverError", (err) => {
      console.log(err);
      // setMessageList([]);
    });

    socket.on("solverUpdate", (msg) => {
      if (msg === ">>>CLEAR<<<") {
        setMessageList(() => []);
        return;
      }
      if (msg === ">>>COMPLETED<<<") {
        return;
      }

      setMessageList((messageList) => [...messageList, msg]);
      console.log(msg);
    });

    socket.on("solverError", (msg) => {
      console.error(msg);
    });

    socket.on("solverStarted", () => {
      setMessageList(() => []);
    });
  }, [socket]);

  useEffect(() => {
    if (!connected) {
      setMessageList(() => []);
    }
  }, [connected]);

  const onClick = () => {
    if (!socket.connected) return;
    const token = document.getElementById("token_input").value;
    socket.emit(solverType, token);
    // setMessageList([]);
  };

  return (
    <div className="flex flex-col self-center w-11/12">
      <div className="flex flex-col align-middle items-center w-auto space-y-4">
        <div className="flex flex-col text-3xl py-5">
          {solverType === "challenge" ? "每日挑战" : "今日话题"}自动解题
        </div>
        {!connected && <div>Connecting</div>}
        {connected && <TokenInput onClick={onClick} />}
        {connected && messageList.length !== 0 && (
          <div className="flex flex-col space-y-2 border p-3 rounded-md border-slate-300 ">
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
