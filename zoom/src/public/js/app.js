const nickForm = document.querySelector('#nick');
const msgList = document.querySelector('ul');
const msgForm = document.querySelector('#message');
const socket = new WebSocket(`ws://${window.location.host}`);

const makeMessage = (type, payload) => {
    const msg = {type, payload}
    return JSON.stringify(msg);
}

const handleOpen = () => {
    console.log('Connected to Server ✅');
}

const handleClose = () => {
    console.log('Disconnected to Server ❌');
}

const handleMessage = (message) => {
    const li = document.createElement('li');
    li.innerText = message.data;
    msgList.append(li);
}

socket.addEventListener('open', handleOpen);
socket.addEventListener('close', handleClose);
socket.addEventListener('message', handleMessage);

//
nickForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = nickForm.querySelector('input');
    socket.send(makeMessage('nickname', input.value));
});

msgForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = msgForm.querySelector('input');
    socket.send(makeMessage('new_message', input.value));
    const li = document.createElement('li');
    li.innerText = "You: " + input.value;
    msgList.append(li);
    input.value = '';
})
