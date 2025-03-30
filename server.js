const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatmsg = require("./utils/messages");
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3000;
const botname = "ChatBot";

// Store user-room mapping
const users = {};

app.use(express.static(path.join(__dirname, "html")));

io.on("connection", (socket) => {
    console.log("New WebSocket connection established");

    // Handle user joining a room
    socket.on("joinRoom", ({ username, room }) => {
        if (!room) return;

        socket.join(room); // Join the specified room
        users[socket.id] = { username, room }; // Store user's room info

        socket.emit("message", formatmsg(botname, `Welcome to the ${room} room!`));
        socket.broadcast.to(room).emit("message", formatmsg(botname, `${username} has joined the chat!`));

        // Send updated user list
        updateRoomUsers(room);
    });

    // Handle incoming chat message
    socket.on("chatMessage", (message) => {
        const user = users[socket.id];
        if (!user || !user.room) return;
    
        const formattedMessage = formatmsg(user.username, message);
        io.to(user.room).emit("message", formattedMessage);
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
        const user = users[socket.id];
        if (user) {
            io.to(user.room).emit("message", formatmsg(botname, `${user.username} has left the chat!`));
            delete users[socket.id];
            updateRoomUsers(user.room);
        }
    });

    // Function to update room users
    function updateRoomUsers(room) {
        const roomUsers = Object.values(users).filter(user => user.room === room);
        io.to(room).emit("roomUsers", { users: roomUsers });
    }
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
