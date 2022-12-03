import styled from "styled-components";

const Input = styled.input`
    font-size: 4rem;
    padding: 0.5rem;
    margin: 0.1rem;
    margin-left: 5rem;
    border: 2px solid #137547;
    border-radius: 10px;
    background-color: #054a29;
    color: whitesmoke;
    font-family: "VT323", monospace;
`;

const Button = styled.button`
    font-size: 4rem;
    padding: 0.5rem;
    margin: 0.1rem;
    border: 2px solid #137547;
    border-radius: 10px;
    background-color: #054a29;
    color: whitesmoke;
    font-family: "VT323", monospace;
`;

function PlayerInput({ text, onChange, onSubmit, value }) {
    return (
        <form onSubmit={onSubmit}>
            <Input type="text" placeholder={text} onChange={onChange} value={value}/>
            <Button onClick={onSubmit}>Submit</Button>
        </form>
    );
}

export default PlayerInput;