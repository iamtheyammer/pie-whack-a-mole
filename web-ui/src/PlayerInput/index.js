import styled from "styled-components";

const Input = styled.input`
    font-size: 1.5rem;
    padding: 0.5rem;
    margin: 0.5rem;
    border: 2px solid palevioletred;
    border-radius: 3px;
`;

const Button = styled.button`
    font-size: 1.5rem;
    padding: 0.5rem;
    margin: 0.5rem;
    border: 2px solid palevioletred;
    border-radius: 3px;
`;

function PlayerInput({ text, onSubmit }) {
    return (
        <div>
            <Input type="text" placeholder={text} />
            <Button onClick={onSubmit}>Submit</Button>
        </div>
    );
}

export default PlayerInput;