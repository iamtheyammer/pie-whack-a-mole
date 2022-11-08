import styled from "styled-components";

const StyledScoreboard = styled.div`
  display: inline-block;
  padding: 5px;
  background-color: #054a29;
  color: whitesmoke;
  font-family: "VT323", monospace;
  border-radius: 10px;
  border: 2px solid #137547;
`;

const StyledScoreText = styled.span`
  text-align: left;
`;

const StyledScore = styled.span`
  font-size: 10vh;
  border-radius: 10px;
  border: 2px solid #137547;
  min-width: 250px;
  padding-top: -10px;
  padding-bottom: -100px;
`;

function Scoreboard({ score }) {
  return (
    <StyledScoreboard>
      <StyledScoreText>Score</StyledScoreText>
      <br />
      <StyledScore>{score}</StyledScore>
    </StyledScoreboard>
  );
}

export default Scoreboard;
