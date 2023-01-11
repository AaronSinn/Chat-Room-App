const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
//returns message as an object
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Bot';

//run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room)

        socket.emit('message', formatMessage(botName,`Welcome to the ${user.room} chat room!`));

        //Broadcast when a user connects, boradcast means the user who connects wont see the message
        socket.broadcast.to(user.room).emit('message', formatMessage(botName,`${user.username} has joined the chat`));

        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //Runs when client disconnects
    socket.on('disconnect', () =>{
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the chat`));
        }

        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(3000, () => {
    console.log(`Server running on port ${PORT}`);
});