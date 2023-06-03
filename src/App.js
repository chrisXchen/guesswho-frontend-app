import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Chat from './components/Chat/Chat';
import MessageInput from './components/MessageInput/MessageInput';
import './App.css';
import { FormControl, InputLabel, Select, MenuItem, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  formControl: {
    width: 300,
  },
});

const base_url = process.env.REACT_APP_BASE_URL;

function App() {
  const [maxMessages, setMaxMessages] = useState(5);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [guess, setGuess] = useState('');
  const [characters, setCharacters] = useState([]);

  const gameCookie = Cookies.get('game_cookie') ? JSON.parse(Cookies.get('game_cookie')) : { numMessages: 0, selectedCharacter: '' };
  const [numMessages, setNumMessages] = useState(gameCookie.numMessages);
  const [selectedCharacter, setSelectedCharacter] = useState(gameCookie.selectedCharacter);

  const classes = useStyles();

  const updateGameCookie = () => {
    Cookies.set('game_cookie', JSON.stringify({ numMessages, selectedCharacter }));
  };

  useEffect(() => {
    axios.get(base_url + '/characters')
      .then(res => setCharacters(res.data.characters))
      .catch(err => console.error(err));

    if (!gameCookie.selectedCharacter) {
      axios.post(base_url + '/change_character', { gameCookie })
        .then(res => {
          setSelectedCharacter(res.data.character);
          Cookies.set('game_cookie', JSON.stringify({ numMessages: numMessages, selectedCharacter: res.data.character }));
        })
        .catch(err => console.error(err));
    }
  }, []);

  const handleMessageChange = e => {
    setMessageText(e.target.value);
  };

  const handleMessageSubmit = e => {
    e.preventDefault();
    axios.post(base_url + '/chat', { text: messageText, gameCookie })
      .then(res => {
        const isMaxMessages = "error" in res.data ? true : false;
        const newNumMessages = res.data.game_cookie.num_messages;
        const message = res.data.message;
        const response = res.data.response;

        setMessages(prevMessages => [...prevMessages, {
          sender: '- You',
          text: message
        }]);
        setMessages(prevMessages => [...prevMessages, {
          sender: '- Mystery Character',
          text: response
        }]);
        if (isMaxMessages) {
          console.log(res.data.error);
        }
        setMessageText('');
        setNumMessages(newNumMessages)
        Cookies.set('game_cookie', JSON.stringify({ numMessages: newNumMessages, selectedCharacter: selectedCharacter }));
      })
      .catch(err => console.error(err));
  };

  const handleGuessChange = e => {
    setGuess(e.target.value);
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
      <h1> You are now guessing Game of Thrones characters. Good luck! </h1>
      <Chat messages={messages} />
      <MessageInput
        messageText={messageText}
        handleMessageChange={handleMessageChange}
        handleMessageSubmit={handleMessageSubmit}
      />
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
      <Button onClick={handleRestart}>Restart Game</Button>
      <div>
        {numMessages}/{maxMessages} messages sent
      </div>
    </div>
  );
}

export default App;
