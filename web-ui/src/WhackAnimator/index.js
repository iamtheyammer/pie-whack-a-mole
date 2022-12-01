import styled, { keyframes } from "styled-components";

// Create the keyframes
const whack = keyframes`
  80% {
    transform: rotate(0deg);
  }

  90% {
    transform: rotate(-90deg);
  }

  100% {
    transform: rotate(0deg); 
  }
`;

const Whack = styled.div`
  animation: ${whack} 2s linear infinite;
`;

function WhackAnimator({ children }) {
    return (
        <Whack>
            {children}
        </Whack>
    );
}

export default WhackAnimator;