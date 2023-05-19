const express = require('express')
var cors = require('cors')
const app = express();
const PORT = process.env.PORT || 3001;
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(cors())

app.get('/*', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
server.listen(PORT, () => {
    console.log(`app listening on ${PORT}`)
});
io.on('connection', (socket) => {
    var address = socket.request.connection.remoteAddress;
    console.log(`${address} a user connected`);
    console.log(`user id ${socket.id}`);
    socket.join("chat-room");
    socket.on('disconnect', () => {
        console.log(`${address} user disconnected`);
    });
    socket.on('get-ports', (data) => {
        console.log(`get-ports fired`, data);

    });
    socket.on('send-message-broadcast', (data) => {
        console.log(`send-message fired`, data);
        //socket.emit('send-message', { message: new Date().toISOString() });
        io.to("chat-room").emit('send-message-broadcast', {...data });
        io.to("chat-room").emit('send-message', { message: new Date().toISOString() });
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