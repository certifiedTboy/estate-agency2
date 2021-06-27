  var socket = io();
                          $(() => {
                              $("#send").click(()=>{
                                  sendMessage({name: $("#name").val(), message: $("#message").val()});
                              })
                      
                              getMessages()
                          })
                      
                          socket.on('message', addMessages)
                      
                          function addMessages(message){
                              $("#messages").append(`<h4> ${message.name} </h4> <p> ${message.message} </p>`)
                              $("#message").val("")
                          }
                      
                            //is typing...

                        let messageInput = document.getElementById("message");
                        let typing = document.getElementById("typing");

                        //isTyping event
                        messageInput.addEventListener("keypress", () => {
                          socket.emit("typing", { user: "Someone", message: "is typing..." });
                        });

                        socket.on("notifyTyping", data => {
                          typing.innerText = data.user + " " + data.message;
                          console.log(data.user + data.message);
                        });

                        //stop typing
                        messageInput.addEventListener("keyup", () => {
                          socket.emit("stopTyping", "");
                        });

                        socket.on("notifyStopTyping", () => {
                          typing.innerText = "";
                        });


                          function getMessages(){
                            $.get('http://localhost:3000/response/<%=data.id%>', (data) => {
                              data.forEach(addMessages);
                            })
                          }
                      
                          function sendMessage(message){
                            $.post('http://localhost:3000/response/<%=data.id%>', message)
                          }