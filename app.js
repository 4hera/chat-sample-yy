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
io.on('connection', (socket) => {
    var address = socket.request.connection.remoteAddress;
    //  console.log(`${address} a user connected`);
    // console.log(`user id ${socket.id}`);
    socket.join("chat-room");
    socket.on('disconnect', () => {
        //    console.log(` disconnected user id ${socket.id}`);
        messages.forEach(element => {
            if (element.socket_id == socket.id) {
                element.isLive = false;
            }
        });
        io.to("chat-room").emit('chat-history', { chat_history: messages });
        //  console.log(`${address} user disconnected`);
    });

    socket.on('send-message-broadcast', (data) => {
        const time = new Date();
        data.timestamp = time.getHours() + ":" + time.getMinutes();
        data.isLive = true;
        messages = [...messages, data];
        io.to("chat-room").emit('send-message-broadcast', {...data });
    });
    socket.on('chat-history', (data) => {
        socket.emit('chat-history', { chat_history: messages });
    });
});


/*
    client ---> ...... (408 timeout=30s)
                            server (... 5. usb takıldı)
                    200 <--- port eklendi.
    client ---> ...... (408 timeout=30s)
                          server (... 30 sn geçti)
                    408 <--- port eklendi.
    client ---> ...... (408 timeout=30s)                

*/