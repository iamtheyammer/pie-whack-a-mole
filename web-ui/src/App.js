import useWebSocket, { ReadyState } from "react-use-websocket";
import "./App.css";
import { useEffect, useState } from "react";
import Scoreboard from "./Scoreboard";
import Leaderboard from "./Leaderboard";
import UpDownAnimator from "./UpDownAnimator";
import WhackAnimator from "./WhackAnimator";
import ScaleAnimator from "./ScaleAnimator";
import PlayerInput from "./PlayerInput";
import mallet from "./mallet.png";
import hole from "./hole.png";

function App() {
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    process.env.REACT_APP_WEBSOCKET_URL
  );

  const [score, setScore] = useState(0);
  const [leaders, setLeaders] = useState([]);
  const [inputText, setInputText] = useState("");
  const [submitAnimation, setSubmitAnimation] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputText.length > 15) {
      setInputText(inp => inp.substring(0, 15))
      console.log(inputText);
    }
    sendMessage(JSON.stringify({ "action": "start_game", "currentPlayer": `${inputText}` }))
    e.target.value = setInputText("")
    setSubmitAnimation(true)
  }

  const resetLdb = () => {
    sendMessage(JSON.stringify({ "action": "reset_leaderboard" }))
  }

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
        console.log(data.leaderboard);
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
        <img src={hole} width="450px" height="60px" className="hole" alt="black hole" />
        <WhackAnimator children={<img src={mallet} width="130px" height="130px" alt="whacking hammer animation" className="mallet" />} />
        <UpDownAnimator children={<h1>Whack A Mole</h1>} />
      </div>
      {readyState === ReadyState.OPEN ? (
        <div className="main">
          <div>
            <div>
              <ScaleAnimator children={<PlayerInput text="Enter your name" onChange={(e) => { setInputText(e.target.value) }} onSubmit={handleSubmit} value={inputText} />} submitted={submitAnimation} />
              <button className="resetldb" onClick={resetLdb}>Reset Leaderboard</button>
            </div>
            <div><Scoreboard score={score} /></div>
          </div>
          <div><Leaderboard leaders={leaders} /></div>
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
