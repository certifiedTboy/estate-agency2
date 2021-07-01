const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

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

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../join-chat';
  } else {
  }
});

 



// user typing 
var typing=false;
var timeout=undefined;
var user;

const messageInput = document.querySelector(".message")

  $(document).ready(function(){
    $('.message').keypress(()=>{
        
          typing=true
          socket.emit('typing', {user: $("#name").val(), typing:true})
          clearTimeout(timeout)
          timeout=setTimeout(typingTimeout, 3000)
     
      })

    
      socket.on("display", function(data){
        if(data.typing===true){
          $('#typing').text(`${data.user} is typing ...`)
        }else{
          $('#typing').text("")
        }
      })
})

 

// STOP TYPING 

$(document).ready(function(){
  $('.message').keyup(()=>{
      
        typing=false;
        socket.emit('typing', {user: " ", typing:false})
        clearTimeout(timeout)
        timeout=setTimeout(typingTimeout, 3000)
   
    })

  
    socket.on("hidden", function(data){
      if(data.typing===false){
        $('#typing').text("")
      }else{
        $('#typing').text("")
      }
    })
})


