import { io } from "socket.io-client";
import { createContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";

export const SocketContext = createContext();
const SERVER_URL = window.SERVER_URL;

const App = () => {
  const [socket] = useState(io(SERVER_URL, { autoConnect: false }));
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("connected to server");
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("disconnected from server");
      setConnected(false);
    });
  });

  return (
    <SocketContext.Provider value={[socket, connected]}>
      <div className="flex flex-col h-screen bg-gray-100">
        <div className="p-3">
          <NavBar />
        </div>
        <div className="px-6 py-8 h-full text-gray-700">
          <Outlet />
        </div>
      </div>
    </SocketContext.Provider>
  );
};

export default App;
