const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

toastr.options = {
  timeOut: 4000,
  positionClass : 'toast-bottom-right',
  extendedTimeOut: 0,
  fadeOut: 3,
  fadeIn: 0,
  showDuration: 5,
  hideDuration: 5,
  debug: false
};

socket.on('new-notification', (resp) => {
toastr.success(resp, 'New notification')
});

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on('message', (message) => {
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;
 
  msg = msg.trim();
  
  if (!msg) {
    return false;
  }

  socket.emit("send-notification", "You have a new Message");

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
 
}


// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}



//user is typing 
var typing=false;
var user; 


$(document).ready(function(){
  $('#msg').keypress((e)=>{
    if(e.which!=13){
      typing=true
      socket.emit('typing', {user:$("#name").val(), typing:true})
     
    }
  })

  
  socket.on('display', (data)=>{
    if(data.typing===true)
      $('.typing').text(`${data.user} is typing...`)
    else
      $('.typing').text("")
  })
})


// stop typing
$(document).ready(function(){
  $('#msg').keyup(()=>{
      typing=false
      socket.emit('stopTyping', {user:$("#name").val(), typing:false})
     
  })

  //code explained later
  socket.on('hidden', (data)=>{
    if(data.typing===false)
      $('.typing').text(" ")
    else
      $('.typing').text("")
  })
})