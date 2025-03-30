const socket = io();
const form = document.getElementById("chat-form");
const scroll = document.querySelector(".chat-messages");
const userList = document.getElementById("users");
const roomName = document.getElementById("room-name");

// Parse username and room from URL query string
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

// Emit joinRoom event to server
socket.emit("joinRoom", { username, room });

// Update room name in the sidebar
if (roomName) {
    roomName.textContent = room;
}

// Ensure the form exists before adding an event listener
if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault(); // Prevent default form submission

        const message = e.target.elements.msg.value;

        if (message.trim() !== "") { // Avoid sending empty messages
            socket.emit("chatMessage", message); // Send message to server
            e.target.elements.msg.value = ""; // Clear input field after sending
            e.target.elements.msg.focus(); // Refocus input field
        }
    });
}

// Listen for incoming messages
socket.on("message", (message) => {
    console.log(message);
    output(message); // Display message in the chat

    if (scroll) {
        scroll.scrollTop = scroll.scrollHeight; // Auto-scroll to the bottom
    }
});

// Function to display messages in the chat
function output(message) {
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `
        <p class="meta">${message.username} <span>${message.time}</span></p>
        <p class="text">${message.text}</p>
    `;

    if (scroll) {
        scroll.appendChild(div); // Append message to chat container
    }
}

// Listen for updated user list from the server
socket.on("roomUsers", ({ users }) => {
    updateUserList(users);
});

// Function to update user list dynamically
function updateUserList(users) {
    if (userList) {
        userList.innerHTML = ""; // Clear existing users
        users.forEach(user => {
            const li = document.createElement("li");
            li.textContent = user.username;
            userList.appendChild(li);
        });
    }
}
