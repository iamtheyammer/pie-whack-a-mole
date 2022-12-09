import styled, { keyframes } from "styled-components";
import { useEffect, useState } from "react";

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
    const [animationRunning, setAnimationRunning] = useState(false);

    useEffect(() => {
        setAnimationRunning(true);
        setTimeout(() => {
            setAnimationRunning(false);
        }, 500);
    }, [submitted]);

    return (
        <Anim submitted={animationRunning}>
            {children}
        </Anim>
    );
}

export default ScaleAnimator;

