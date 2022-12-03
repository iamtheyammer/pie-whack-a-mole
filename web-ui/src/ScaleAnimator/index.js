import styled, { keyframes } from "styled-components";

const submitScale = keyframes`
    0% {
        opacity: 1;
    }

    50% {
        transform: scaleX(105%) scaleY(105%);
    }

    100% {
        opacity: 1;
    }
`;

const Anim = styled.div`
    animation: ${props => props.submitted=true ? submitScale : null} 0.5s linear;
`;

function ScaleAnimator({ children, submitted }) {
    return (
        <Anim submitted={submitted}>
            {children}
        </Anim>
    );
}

export default ScaleAnimator;

