import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

const useStyles = makeStyles({
    root: {
    width: '100%',
    maxWidth: 360,
    },
});

const ChatMessage = ({ message }) => {
    const classes = useStyles();

    return (
        <List className={classes.root}>
            <ListItem>
                <ListItemText primary={message.text} secondary={message.sender} />
            </ListItem>
        </List>
        );
    };

const Chat = ({ messages }) => {
    return (
        <div>
            {messages.map((message, i) => (
                <ChatMessage key={i} message={message} />
            ))}
        </div>
    );
};

export default Chat;
