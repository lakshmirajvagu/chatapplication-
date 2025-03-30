const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatmsg = require("./utils/messages"); // Import the message formatting function
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "html")));

io.on("connection", (socket) => {
    
    console.log("New WebSocket connection established");
    const botname = "ChatBot"; // Define the bot name
    // Send welcome message to the new user
    socket.emit("message", formatmsg(botname,"Welcome to the WebSocket server!"));

    // Notify all other users that a new user has joined
    socket.broadcast.emit("message", formatmsg(botname,"A new user has joined the chat!"));

    // Handle chat messages from clients
   

    // When a user disconnects
    socket.on("disconnect", () => {
        io.emit("message", formatmsg(botname,"A user has left the chat!"));
    });
    socket.on("chatMessage", (message) => {
        console.log(`User message: ${message}`);
        io.emit("message", formatmsg('user',message)); // ✅ Broadcast message to all clients
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
