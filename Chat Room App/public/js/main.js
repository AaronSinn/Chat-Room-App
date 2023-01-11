const chatFrom = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//Get username and room from URL
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

//Join chatroom
socket.emit('joinRoom', {username, room});

//Get room and users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
});

//message from server
socket.on('message', message => {
    outputMessage(message);

    //Will scroll to bottom when message is sent
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Message for submition of 

chatFrom.addEventListener('submit', (e) => {
    //prevents form from submiting to 
    e.preventDefault();

    //in chat.html, the form's id element is msg
    //this is getting the message text
    const msg = e.target.elements.msg.value;

    //sending message to server
    socket.emit('chatMessage', msg);

    //Clear input
    e.target.elements.msg.value = '';
    //focus will make sure the cursor is on the input field after you hit send
    e.target.elements.msg.focus();
});

//Output message to DOM
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class = "meta">${message.userName}<span> ${message.time}</span></p>
    <p class = "text"> ${message.text} </p>`;
    document.querySelector('.chat-messages').appendChild(div);
    console.log(message);
}

//Add room name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}

//Add users to DOM
function outputUsers(users){
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
}