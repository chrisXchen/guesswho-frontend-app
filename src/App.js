import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chat from './Chat'; // import the new Chat component
import './App.css';
import { FormControl, InputLabel, Input, Button, Select, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  formControl: {
    width: 300,
  },
});

const base_url = process.env.REACT_APP_BASE_URL;

function App() {
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [maxMessages, setMaxMessages] = useState(0);
  const [messages, setMessages] = useState([]);
  const [numMessages, setNumMessages] = useState(0);
  const [messageText, setMessageText] = useState('');
  const [guess, setGuess] = useState('');
  const [characters, setCharacters] = useState([]); // add a state variable to store the list of characters

  const classes = useStyles();

  useEffect(() => {
    // Get the selected character from the server when the component mounts
    axios.get(base_url + '/selected_character')
      .then(res => setSelectedCharacter(res.data.selected_character))
      .catch(err => console.error(err));

    // Make a request to the /characters endpoint to get the list of characters
    axios.get(base_url + '/characters')
      .then(res => setCharacters(res.data.characters)) // store the list of characters in the characters state variable
      .catch(err => console.error(err));

    // Make a request to the /message_nums endpoint to get the max number of messages allowed
    axios.get(base_url + '/message_nums')
      .then(res => setMaxMessages(res.data.max_messages))
      .catch(err => console.error(err));

    // Make a request to /message_nums endpoint to get current number of messages
    axios.get(base_url + '/message_nums')
      .then(res => setNumMessages(res.data.current_messages))
      .catch(err => console.error(err));
  }, []);

  const handleMessageChange = e => {
    setMessageText(e.target.value);
  };

  const handleGuessChange = e => {
    setGuess(e.target.value);
  };

  const updateNumMessages = num => {
    setNumMessages(num);
  };

  const handleMessageSubmit = e => {
    e.preventDefault();
    // Check if the maximum number of messages has been reached
    if (numMessages >= maxMessages) {
      // If the maximum number of messages has been reached, show an error message
      setMessages(prevMessages => [...prevMessages, {
        sender: '- Mystery Character',
        text: 'You have reached the maximum number of messages. Please guess who you are talking to.'
      }]);
    } else {
      // If the maximum number of messages has not been reached, send the message to the server
      axios.post(base_url + '/chat', { text: messageText })
        .then(res => {
          setMessages(prevMessages => [...prevMessages, {
            sender: '- You',
            text: res.data.message.text
          }]);
          setMessages(prevMessages => [...prevMessages, {
            sender: '- Mystery Character',
            text: res.data.response
          }]);
          setMessageText('');
          updateNumMessages(numMessages + 1); // increment the numMessages state variable
        })
        .catch(err => console.error(err));
    }
  };

  const handleGuessSubmit = e => {
    e.preventDefault();
    // Send a character guess to the server
    axios.post(base_url + '/guess', { character: guess })
      .then(res => {
        if (res.data.correct) {
          setMessages(prevMessages => [...prevMessages, {
            sender: '- Mystery Character',
            text: res.data.response
          }]);
        } else {
          setMessages(prevMessages => [...prevMessages, {
            sender: '- Mystery Character',
            text: res.data.response
          }]);
        }
        setGuess('');
      })
      .catch(err => console.error(err));
  };

  const handleRestart = () => {
    axios.post(base_url + '/reset')
      .then(res => {
        // Reset the number of messages and the list of messages
        setNumMessages(0);
        setMessages([]);
        // Get the new selected character from the server
        axios.get(base_url + '/selected_character')
          .then(res => setSelectedCharacter(res.data.selected_character))
          .catch(err => console.error(err));
      })
      .catch(err => console.error(err));
  };


  return (
    <div className="App">
      <Chat messages={messages} />
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="message-input">Chat</InputLabel>
        <Input
          id="message-input"
          value={messageText}
          onChange={handleMessageChange}
        />
        <Button type="submit" onClick={handleMessageSubmit}>
          Send
        </Button>
      </FormControl>
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor="guess-input">Enter a character name...</InputLabel>
        <Select
          id="guess-input"
          value={guess}
          onChange={handleGuessChange}
        >
          {characters.map(character => (
            <MenuItem key={character} value={character}>{character}</MenuItem>
          ))}
        </Select>
        <Button type="submit" onClick={handleGuessSubmit}>
          Guess
        </Button>
      </FormControl>
      <Button onClick={handleRestart}>
        Restart
      </Button>
      {/* Display the message counter */}
      <div>
        {numMessages}/{maxMessages} messages sent
      </div>
    </div>
  );
};

export default App;

