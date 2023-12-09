import http from 'http';
import WebSocket from 'ws';
import express from "express";

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + "/views");
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => res.render('home'));
app.get("/*", (req, res) => res.redirect("/"));

// app.listen(3000, () => {console.log('Listening on http://localhost:3000')});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on('connection', (socket) =>{
    sockets.push(socket);
    socket['nickname'] = '익명';
    console.log('Connected to Browser ✅');
    socket.on('close', () => console.log('Disconnected to Browser ❌'));
    socket.on('message', (message) => {
        const parsed = JSON.parse(message);
        if (parsed.type == 'new_message') {
            sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${parsed.payload}`));
        } else if (parsed.type == 'nickname') {
            socket['nickname'] = parsed.payload;
        }
    });
});

server.listen(3000, () => {console.log('Listening on http://localhost:3000')});