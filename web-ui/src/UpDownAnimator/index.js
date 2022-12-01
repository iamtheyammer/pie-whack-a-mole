import styled, { keyframes } from "styled-components";

// Create the keyframes
const popup = keyframes`
  0% {
    transform: translateY(0px);
    opacity: 0;
  }

  80% {
    transform: translateY(-50px); 
    opacity: 1;
  }
`;

const Popup = styled.div`
  display: inline-block;
  animation: ${popup} 2s linear infinite;
`;

function UpDownAnimator({ children }) {
    return (
        <Popup>
            {children}
        </Popup>
    );
}

export default UpDownAnimator;