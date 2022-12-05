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
  const [displayedInput, setDisplayedInput] = useState("");
  const [userInput, setUserInput] = useState("");
  const [submitAnimation, setSubmitAnimation] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: strip whitespaces and cleanup input before sending
    // add screen goes red on wrong mole hit
    // repalce /1029 with /#### for reset password
    if (userInput[0] === "/") {
      if (userInput === "/1029") {
        alert("Leaderboard reset")
        resetLdb();
      } else {
        alert("Incorrect password")
      }
      setUserInput("")
      e.target.value = setDisplayedInput("")
    } else {
      sendMessage(JSON.stringify({ "action": "start_game", "currentPlayer": userInput }))
      e.target.value = setDisplayedInput("")
      setUserInput("")
      setSubmitAnimation(true)
    }
  }

  const handleInputChange = (e) => {
    if (e.target.value[0] === "/") {
      setUserInput((prev) => `${prev + e.target.value.slice(-1)}`)
      setDisplayedInput(`/${"*".repeat(e.target.value.length - 1)}`)
    } else {
      setUserInput(e.target.value)
      setDisplayedInput(e.target.value)
    }
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
              <ScaleAnimator children={<PlayerInput text="Enter your name" onChange={handleInputChange} onSubmit={handleSubmit} value={displayedInput} />} submitted={submitAnimation} />
              {/* <button className="resetldb" onClick={resetLdb}>Reset Leaderboard</button> */}
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
      <div className="BottomTextContainer">
      <span>Enter /pass to reset leaderboard</span>
      </div>
    </div>
  );
}

export default App;
