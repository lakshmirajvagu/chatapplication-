// const express = require("express");
// const path = require("path");
// const http = require("http");
// const socketio = require("socket.io");
// const formatmsg = require("./utils/messages"); // Import the message formatting function
// const app = express();
// const server = http.createServer(app);
// const io = socketio(server);

// const port = process.env.PORT || 3000;

// app.use(express.static(path.join(__dirname, "html")));

// io.on("connection", (socket) => {
    
//     console.log("New WebSocket connection established");
//     const botname = "ChatBot"; // Define the bot name
//     // Send welcome message to the new user
//     socket.emit("message", formatmsg(botname,"Welcome to the WebSocket server!"));

//     // Notify all other users that a new user has joined
//     socket.broadcast.emit("message", formatmsg(botname,"A new user has joined the chat!"));

//     // Handle chat messages from clients
   

//     // When a user disconnects
//     socket.on("disconnect", () => {
//         io.emit("message", formatmsg(botname,"A user has left the chat!"));
//     });
//     socket.on("chatMessage", (message) => {
//         console.log(`User message: ${message}`);
//         io.emit("message", formatmsg('user',message)); // ✅ Broadcast message to all clients
//     });
// });

// server.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });
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
    });

    // Handle chat messages within a room
    // socket.on("chatMessage", (message) => {
    //     const user = users[socket.id];
    //     if (!user || !user.room) return;

    //     console.log(`Message in ${user.room}: ${message}`);
    //     io.to(user.room).emit("message", formatmsg(user.username, message)); // Send only to the specific room
    // });
    socket.on("chatMessage", (message) => {
        const user = users[socket.id];
        if (!user || !user.room) return;
    
        const formattedMessage = formatmsg(user.username, message); // Format the message
        console.log("Formatted message:", formattedMessage); // Log the formatted message
        io.to(user.room).emit("message", formattedMessage); // Emit the formatted message to the room
    });
    

    // Handle user disconnect
    socket.on("disconnect", () => {
        const user = users[socket.id];
        if (user && user.room) {
            io.to(user.room).emit("message", formatmsg(botname, `${user.username} has left the chat!`));
        }
        delete users[socket.id];
    });
});

server.listen(3001, () => {
    console.log(`Server is running on port ${port}`);
});
