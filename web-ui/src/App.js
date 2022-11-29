import useWebSocket, { ReadyState } from "react-use-websocket";
import "./App.css";
import { useEffect, useState } from "react";
import Scoreboard from "./Scoreboard";
import Leaderboard from "./Leaderboard";
import UpDownAnimator from "./UpDownAnimator";
import WhackAnimator from "./WhackAnimator";
import PlayerInput from "./PlayerInput";
import mallet from "./mallet.png";
import hole from "./hole.png";


// sendMessage(JSON.stringify({ action: "set_name", name }))
function App() {
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    process.env.REACT_APP_WEBSOCKET_URL
  );

  const [score, setScore] = useState(0);
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    if (!lastMessage) {
      return;
    }

    const data = JSON.parse(lastMessage.data);

    switch (data.action) {
      case "update_score":
        setScore(data.score);
        return;
      case "update_leaderboard":
        setLeaders(data.leaderboard);
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
      <div className="TopAnimation">
        <img src={hole} width="450px" height="60px" className="hole" />
        <WhackAnimator children={<img src={mallet} width="130px" height="130px" alt="whacking hammer animation" className="mallet" />} />
        <UpDownAnimator children={<h1>Whack A Mole</h1>} />
      </div>
      {readyState === ReadyState.OPEN ? (
        <div className="main">
          <div><PlayerInput text="Enter your name" onSubmit={console.log("form")} /></div>
          <div>
            <div><Scoreboard score={score} /></div>
            <div><Leaderboard leaders={leaders} /></div>
          </div>
        </div>
      ) : (
        <>
          <h2>Connecting to the backend (status {connectionStatus})...</h2>
        </>
      )}
    </div>
  );
}

export default App;
