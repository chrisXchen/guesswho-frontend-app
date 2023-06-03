import React from 'react';
import { FormControl, InputLabel, Input, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  formControl: {
    width: 300,
  },
});

const MessageInput = ({ messageText, handleMessageChange, handleMessageSubmit }) => {
  const classes = useStyles();

  return (
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
  );
};

export default MessageInput;
