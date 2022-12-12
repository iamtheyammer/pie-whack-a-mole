import useWebSocket, { ReadyState } from "react-use-websocket";
import "./App.css";
import { useEffect, useRef, useState } from "react";
import Scoreboard from "./Scoreboard";
import Leaderboard from "./Leaderboard";
import UpDownAnimator from "./UpDownAnimator";
import WhackAnimator from "./WhackAnimator";
import BannerAnimator from "./BannerAnimator";
import PlayerInput from "./PlayerInput";
import mallet from "./mallet.png";
import hole from "./hole.png";
import Countdown from "react-countdown";

function App() {
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    process.env.REACT_APP_WEBSOCKET_URL
  );

  const [score, setScore] = useState(0);
  const [leaders, setLeaders] = useState([]);
  const [displayedInput, setDisplayedInput] = useState("");
  const [userInput, setUserInput] = useState("");
  const [submitAnimation, setSubmitAnimation] = useState(false);
  const [bannerTrigger, setBannerTrigger] = useState(0);
  const [gameState, setGameState] = useState("");
  const countdownRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: strip whitespaces and cleanup input before sending
    // add screen goes red on wrong mole hit
    // add medals for top 3
    // hide scrollbar on scroallable container, style it in css
    if (userInput[0] === "/") {
      if (userInput === `/${process.env.REACT_APP_LDB_RESET_PASS}`) {
        alert("Leaderboard reset")
        resetLdb();
      } else {
        alert("Incorrect password")
      }
      setUserInput("")
      e.target.value = setDisplayedInput("")
    } else if (userInput === "") {
      alert("Please enter a name")
    } else {
      const game_state = "playing_game"
      setGameState(game_state)
      sendMessage(JSON.stringify({ "action": "game_state", "gameState": game_state, "currentPlayer": userInput }))
      e.target.value = setDisplayedInput("")
      setBannerTrigger((prev) => prev + 1)
      countdownRef.current.start()
    }
  }

  const handleInputChange = (e) => {
    if (gameState !== "playing_game") {
      if (e.target.value[0] === "/") {
        setUserInput((prev) => `${prev + e.target.value.slice(-1)}`)
        setDisplayedInput(`/${"*".repeat(e.target.value.length - 1)}`)
      } else {
        setUserInput(e.target.value)
        setDisplayedInput(e.target.value)
      }
    }
  }

  const timerEndHandler = () => {
    let game_state = "end_game"
    setGameState(game_state)
    sendMessage(JSON.stringify({ "action": "game_state", "gameState": game_state, "currentPlayer": userInput }))
    setUserInput("")
  }

  const resetLdb = () => {
    sendMessage(JSON.stringify({ "action": "reset_leaderboard" }))
  }

  useEffect(() => {
    setSubmitAnimation(true)
    setTimeout(() => {
      setSubmitAnimation(false);
    }, 1000);
  }, [bannerTrigger]);

  const countdownRenderer = ({ minutes, seconds, completed }) => {
    if (completed) {
      return (
        <div className="countdownWrapper">
          <span className="countdownTitle">Timer</span>
          <span className="countdown">{0}:{0}</span>
        </div>
      )
    } else {
      return (
        <div className="countdownWrapper">
          <span className="countdownTitle">Timer</span>
          <span className="countdown">{minutes}:{seconds}</span>
        </div>
      )
    }
  };

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
        console.log(data)
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
      <BannerAnimator submitted={submitAnimation}>
        Whack A Mole
      </BannerAnimator>
      <div className="AppContent">
        <div className="TopAnimation">
          <img src={hole} width="450px" height="60px" className="hole" alt="black hole" />
          <WhackAnimator children={<img src={mallet} width="130px" height="130px" alt="whacking hammer animation" className="mallet" />} />
          <UpDownAnimator children={<h1>Whack A Mole</h1>} />
        </div>
        {readyState === ReadyState.OPEN ? (
          <div className="main">
            <div>
              <div>
                <PlayerInput
                  text="Enter your name"
                  onChange={handleInputChange}
                  onSubmit={handleSubmit}
                  value={displayedInput} />
              </div>
              <div><Scoreboard score={score} /></div>
            </div>
            <div>
              <Countdown
                date={Date.now() + 10000}
                zeroPadTime={2}
                renderer={countdownRenderer}
                autoStart={false}
                onComplete={timerEndHandler}
                ref={countdownRef}
              />
            </div>
            <div><Leaderboard leaders={leaders} /></div>
          </div>
        ) : (
          <>
            <h2>Connecting to the backend (status {connectionStatus})...</h2>
          </>
        )}
        <div className="BottomTextContainer">
          <span>Enter /password to reset leaderboard</span>
        </div>
      </div>
    </div>
  );
}

export default App;
