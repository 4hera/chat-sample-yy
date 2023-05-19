var app = new Vue({
    el: '#app',
    data: {
        chat_messages: [],
        online_users: 0,
        typing: ""
    }
})
var timeout;
document.getElementById("chat-username").value = localStorage.getItem("yy_username") || `anonim-${Math.random().toString(36).slice(-6)}`;
var socket = io(window.location.origin, {
    transports: ["websocket", "polling"],
    rejectUnauthorized: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000
});
socket.on("connect", () => {
    socket.emit("chat-history", {});
})

function sendMessage() {
    var message = document.getElementById("chat-message").value;
    var username = document.getElementById("chat-username").value;
    localStorage.setItem("yy_username", username);
    socket.emit("send-message-broadcast", {
        username: username,
        message: message,
        socket_id: socket.id
    });
    document.getElementById("chat-message").value = "";
    clearTimeout(timeout)
    timeoutFunction();

}
var input = document.getElementById("chat-message");
input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});
socket.on("chat-history", (data) => {
    data.chat_history.forEach(element => {
        element.isClient = false;
        if (element.socket_id == socket.id) {
            element.isClient = true;
        }
    });
    app.chat_messages = data.chat_history;
});
socket.on("send-message-broadcast", (data) => {
    data.isClient = false;
    if (data.socket_id == socket.id) {
        data.isClient = true;
        app.chat_messages = [...app.chat_messages, data];
    } else {
        app.chat_messages = [...app.chat_messages, data];
    }
})
socket.on("online-users", (data) => {
    app.online_users = data.count;
})
socket.on("display", (data) => {
    if (data.typing && data.socket_id != socket.id) {
        app.typing = `( ${data.username} yazıyor... )`;
    } else {
        app.typing = "";
    }
})


function timeoutFunction() {
    var message = document.getElementById("chat-message").value;
    var username = document.getElementById("chat-username").value;
    socket.emit("typing", {
        typing: false,
        username: username,
        message: message,
        socket_id: socket.id
    });
}

input.addEventListener('keyup', function(event) {
    var message = document.getElementById("chat-message").value;
    var username = document.getElementById("chat-username").value;
    socket.emit('typing', {
        typing: true,
        username: username,
        message: message,
        socket_id: socket.id
    });
    clearTimeout(timeout)
    timeout = setTimeout(timeoutFunction, 2000)

})