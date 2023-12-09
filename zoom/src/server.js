import http from 'http';
import { Server } from 'socket.io'
import { instrument } from '@socket.io/admin-ui';
import express from 'express';

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['https://admin.socket.io'],
        credentials: true
    }
});

instrument(io, {
    auth: false,
    mode: 'development',
});

io.on('connection', (socket) => {
    socket.onAny((event) => {
        console.log('Socket Name: ', event);
    });

    socket.on('join_room', (roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit('welcome');
    });

    socket.on('offer', (offer, roomName) => {
        socket.to(roomName).emit('offer', offer);
    });

    socket.on('answer', (answer, roomName) => {
        socket.to(roomName).emit('answer', answer);
    });

    socket.on('ice', (ice, roomName) => {
        socket.to(roomName).emit('ice', ice);
    });
});

server.listen(3000, () => console.log('Listening on http://localhost:3000'));