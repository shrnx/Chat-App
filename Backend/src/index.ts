import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port:8000 })

// This is a User interface for the connection information, where Each user has a websocket connection beloning to a specific room
interface User{
    socket: WebSocket,
    // roomId: String   // Here this String is an object and we dont want that
    roomId: string
}

// This is an array to store all active Websocket connections(users) and their rooms
let allSockets: User[] = [];

wss.on("connection", (socket) => {

    socket.on("close", () => {
        allSockets = allSockets.filter(x => x.socket!= socket);
        // This basically removes the socket(user) from the allSockets array when disconnected
    })

    socket.on("message", (message) => {
        // Message format we will be getting from the client
        //      {
        //          "type": "join",
        //          "payload": {
        //              "roomId": "1"
        //          }
        //      }

        // But the message we get from sockets are always a string, so we need to parse them
        if(typeof message === "string") {
            const parsedMessage = JSON.parse(message)

            if(parsedMessage.type === "join") {       // Now we will handle "join" message type, where a user wants to join the room
                // Here we should add the new user to allSockets array following User interface
                allSockets.push({
                    socket,
                    roomId: parsedMessage.payload.roomId
                })
            }

            
            // Now we should handle "chat" message type, where a user wants to chat
            if(parsedMessage.type === "chat") {
                const currentUserRoom = allSockets.find((x) => x.socket == socket)?.roomId

                // Now broadcast message to all users in the same room
                for(let i=0; i<allSockets.length; i++) {
                    if(allSockets[i].roomId == currentUserRoom) {
                        allSockets[i].socket.send(parsedMessage.payload.message);
                    }
                }

                //          We can also write this as

                //          let currentUserRoom = null;
                //          for(let i=0; i<allSockets.length; i++) {
                //              if(allSockets[i].socket == socket) {
                //                  currentUserRoom = allSockets[i].roomId
                //              }
                //          }

                //          Now broadcast message to all users in the same room

                //          allSockets.forEach((x) => {
                //              if(x.roomId == currentUserRoom) {
                //                  x.socket.send(parsedMessage.payload.message);
                //              }
                //          })
            }

        } else {
            console.log("Invalid Message")
        }
    })
})