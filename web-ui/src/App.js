import useWebSocket, { ReadyState } from "react-use-websocket";
import "./App.css";
import { useEffect, useState } from "react";
import Scoreboard from "./Scoreboard";

function App() {
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    process.env.REACT_APP_WEBSOCKET_URL
  );

  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!lastMessage) {
      return;
    }

    const data = JSON.parse(lastMessage.data);

    switch (data.action) {
      case "update_score":
        setScore(data.score);
        return;
      default:
        console.log(`unrecognized websocket action: ${data}`);
    }
  }, [lastMessage]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  return (
    <div className="App">
      <h1>Whack A Mole</h1>
      {readyState === ReadyState.OPEN ? (
        <Scoreboard score={score} />
      ) : (
        <h2>Connecting to the backend (status {connectionStatus})...</h2>
      )}
    </div>
  );
}

export default App;
