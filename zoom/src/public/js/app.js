const socket = io();

const welcome = document.getElementById('welcome');
const form = welcome.querySelector('form');
const room = document.getElementById('room');

room.hidden = true;

let roomName = '';

const addMessage = (msg) => {
    const ul = room.querySelector('ul');
    const li = document.createElement('li');
    li.innerText = msg;
    ul.appendChild(li);
}

const showRoom = (msg) => {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector('h3');
    h3.innerText = `Room ${roomName}`;
    
    const nameForm = room.querySelector('#name');
    nameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = nameForm.querySelector('input');
        const value = input.value;
        socket.emit('nickname', value);
        input.value = '';
    })

    const msgForm = room.querySelector('#msg');
    msgForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = msgForm.querySelector('input');
        const value = input.value;
        socket.emit('new_message', input.value, roomName, () => {
            addMessage('You: ' + value);
        });
        input.value = '';
    })
}

form.addEventListener('submit', (e)=> {
    e.preventDefault();
    const input = form.querySelector('input');
    socket.emit('enter_room', input.value, showRoom);
    roomName = input.value;
    input.value = '';
});

socket.on('welcome', (user, newCount) => {
    const h3 = room.querySelector('h3');
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user}가 들어왔다.`);
});

socket.on('bye', (left, newCount) => {
    const h3 = room.querySelector('h3');
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${left}가 나갔다.`);
});

socket.on('new_message', (msg) => addMessage(msg));

socket.on('room_change', (rooms) => {
    const roomList = welcome.querySelector('ul');
    roomList.innerHTML = '';

    if (rooms.length === 0) return;

    rooms.forEach(room => {
        const li = document.createElement('li');
        li.innerText = room;
        roomList.append(li);
    });
})