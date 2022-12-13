import styled from "styled-components";

const BrigthnessBanner = styled.div`
    position: absolute;
    z-index: 1;
    display: ${props => props.submitted ? "flex" : "none"};
    flex-direction: column;
    justify-content: center;
`;
const GameBanner = styled.div`
    width: 1920px;
    height: 1080px;
    background-color: #080e0b;
    opacity: 0.9;
`;

const BannerDiv = styled.div`
    position: absolute;
    z-index: 2;
    left: ${props => props.children==="Game started!" ? "535px" : "610px"};
`;

const BannerText = styled.span`
    display: flex;
    align-items: center;
    font-size: 10rem;
    color: whitesmoke;
    font-family: "VT323", monospace;
    background-color: #054a29;
    border-radius: 10px;
    padding: 10px;
`;

function BannerAnimator({ children, submitted }) {
    return (
        <BrigthnessBanner submitted={submitted}>
            <BannerDiv>
                <BannerText>{children}</BannerText>
            </BannerDiv>
            <GameBanner submitted={submitted}/>   
        </BrigthnessBanner>
    );
}

export default BannerAnimator;
