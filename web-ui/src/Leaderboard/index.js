import styled from "styled-components";

const StyledLeaderboard = styled.div`
    display: inline-block;
    padding: 5px;
    background-color: #054a29;
    color: whitesmoke;
    font-family: "VT323", monospace;
    border-radius: 10px;
    border: 2px solid #137547;
    min-width: 600px;
`;

const ScrollContainer = styled.div`
    min-height: 50vh;
    max-height: 50vh;
    overflow-y: scroll;
`;

const StyledRow = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-around;
`;

const StyledColumn = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 10px;
`;

const StyledHeader = styled.span`
    text-align: center;
    font-size: 10vh;
`;

const StyledScore = styled.span`
  font-size: 8vh;
  border-radius: 10px;
  border: 2px solid #137547;
  padding: 10px;
  min-width: 250px;
`;

function Leaderboard({ leaders }) {
    return (
        <StyledLeaderboard>
            <StyledRow>
                <StyledColumn>
                    <StyledHeader><u>Player</u></StyledHeader>
                    <br />
                </StyledColumn>
                <StyledColumn>
                    <StyledHeader><u>Score</u></StyledHeader>
                    <br />
                </StyledColumn>
            </StyledRow>
            <ScrollContainer>
                {leaders.map((score, i) => (
                    <StyledRow key={i}>
                        <StyledColumn key={i + 1}>
                            <StyledScore>{score.person}</StyledScore>
                            <br />
                        </StyledColumn>
                        <StyledColumn>
                            <StyledScore>{score.value}</StyledScore>
                            <br />
                        </StyledColumn>
                    </StyledRow>
                ))}
            </ScrollContainer>
        </StyledLeaderboard>
    );
}

export default Leaderboard;
