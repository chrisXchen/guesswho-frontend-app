import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Chat from './Chat';
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
  const [maxMessages, setMaxMessages] = useState(5); // Maximum number of messages
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [guess, setGuess] = useState('');
  const [characters, setCharacters] = useState([]);

  // Initialize game state from the cookie, or with default values
  const gameCookie = Cookies.get('game_cookie') ? JSON.parse(Cookies.get('game_cookie')) : { numMessages: 0, selectedCharacter: '' };
  const [numMessages, setNumMessages] = useState(gameCookie.numMessages);
  const [selectedCharacter, setSelectedCharacter] = useState(gameCookie.selectedCharacter);

  const classes = useStyles();

  // this and useEffect needed the biggest changes so far
  const updateGameCookie = () => {
    Cookies.set('game_cookie', JSON.stringify({ numMessages, selectedCharacter }));
  };

  useEffect(() => {
    // Get the characters from the server when the component mounts
    axios.get(base_url + '/characters')
      .then(res => setCharacters(res.data.characters))
      .catch(err => console.error(err));

    // If the cookie doesn't have a selectedCharacter, get one from the server
    if (!gameCookie.selectedCharacter) {
      axios.post(base_url + '/change_character', { gameCookie })
        .then(res => {
          setSelectedCharacter(res.data.character);
          updateGameCookie();
        })
        .catch(err => console.error(err));
    }
  }, []);

  const handleMessageChange = e => {
    setMessageText(e.target.value);
  };

  const handleGuessChange = e => {
    setGuess(e.target.value);
  };

  const handleMessageSubmit = e => {
    e.preventDefault();
    axios.post(base_url + '/chat', { text: messageText, gameCookie })
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
        setNumMessages(prevNumMessages => prevNumMessages + 1);
        updateGameCookie();
      })
      .catch(err => console.error(err));
  };

  const handleGuessSubmit = e => {
    e.preventDefault();
    axios.post(base_url + '/guess', { guess: guess, gameCookie })
      .then(res => {
        setMessages(prevMessages => [...prevMessages, {
            sender: '- Mystery Character',
            text: res.data.response
          }]);
        setGuess('');
        updateGameCookie();
      })
      .catch(err => console.error(err));
  };

  // this is looking good
  const handleRestart = () => {
    axios.post(base_url + '/change_character', { gameCookie })
      .then(res => {
        const newCharacter = res.data.character;
        const newNumMessages = 0;

        setSelectedCharacter(newCharacter);
        setNumMessages(newNumMessages);
        setMessages([]);
        Cookies.set('game_cookie', JSON.stringify({ numMessages: newNumMessages, selectedCharacter: newCharacter }));
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
      <div>
        {numMessages}/{maxMessages} messages sent
      </div>
    </div>
  );
};

export default App;
