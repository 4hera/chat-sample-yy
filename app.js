const path = require('path')
const express = require('express')
var cors = require('cors')
const app = express();
const PORT = process.env.PORT || 3001;
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(cors())
app.use(express.static(path.join(__dirname + '/www')));
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname + '/www/index.html'));
});
server.listen(PORT, () => {
    console.log(`app listening on ${PORT}`)
});
var messages = [];

function getDateTime() {
    let d = Date.now();
    let ho = new Intl.DateTimeFormat("tr-TR", {
        hour: "2-digit",
        hour12: false,
    }).format(d);
    let mi = new Intl.DateTimeFormat("tr-TR", { minute: "2-digit" }).format(d);

    return ho + ":" + mi.padStart(2, '0');
}
io.on('connection', (socket) => {
    socket.join("chat-room");
    io.in("chat-room").fetchSockets().then(sockets => {
        io.to("chat-room").emit('online-users', { count: sockets.length });
    });
    socket.on('disconnect', () => {
        socket.leave("chat-room")
        messages.forEach(element => {
            if (element.socket_id == socket.id) {
                element.isLive = false;
            }
        });
        io.to("chat-room").emit('chat-history', { chat_history: messages });
        io.in("chat-room").fetchSockets().then(sockets => {
            io.to("chat-room").emit('online-users', { count: sockets.length });
        });
    });
    socket.on('send-message-broadcast', (data) => {
        const time = new Date();
        data.timestamp = getDateTime();
        data.isLive = true;
        messages = [...messages, data];
        io.to("chat-room").emit('send-message-broadcast', {...data });
    });
    socket.on('chat-history', (data) => {
        socket.emit('chat-history', { chat_history: messages });
    });
    socket.on('typing', (data) => {
        if (data.typing == true) {
            io.to("chat-room").emit('display', data)
        } else {
            io.to("chat-room").emit('display', data)
        }
    })
});