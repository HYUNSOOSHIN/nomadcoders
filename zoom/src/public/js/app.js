const socket = io();

// CALL 

const myFace = document.getElementById('myFace');
const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');
const camerasSelect = document.getElementById('cameras');
const call = document.getElementById('call');
call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName = '';
let myPeerConnection;
let myDataChannel;

const getCameras = async () => {
    try { 
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera => {
            const option = document.createElement('option');
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if (currentCamera == camera.label) {
                option.selected = true;
            }
            camerasSelect.appendChild(option);
        })
    } catch (e) {
        console.log(e)
    }
}

const getMedia = async (deviceId) => {
    const initialConstraints = {
        audio: true,
        video: { facingMode: 'user' }
    }

    const cameraConstraints = {
        audio: true,
        video: { deviceId: { exact: deviceId } }
    }

    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId? cameraConstraints : initialConstraints
        );
        myFace.srcObject = myStream;
        if (!deviceId) {
            await getCameras();
        }
    } catch (e) {
        console.log(e)
    }
}

muteBtn.addEventListener('click', () => {
    myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);

    if (!muted) {
        muteBtn.innerText = 'Unmute';
        muted = true;
    } else {
        muteBtn.innerText = 'Mute';
        muted = false;
    }
});

cameraBtn.addEventListener('click', () => {
    myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);

    if (cameraOff) {
        cameraBtn.innerText = 'Turn Camera Off';
        cameraOff = false;
    } else {
        cameraBtn.innerText = 'Turn Camera On';
        cameraOff = true;
    }
});

camerasSelect.addEventListener('change', async (e) => {
    await getMedia(camerasSelect.value);
    if (myPeerConnection) {
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind === 'video');
        videoSender.replaceTrack(videoTrack);
    }
});

// CHAT 

const chat = document.getElementById('chat');
chat.hidden = true;
const chatForm = chat.querySelector('form');

const makeMsg = (msg) => {
    const ul = chat.querySelector('ul');
    const li = document.createElement('li');
    li.innerText = msg;
    ul.appendChild(li);
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = chatForm.querySelector('input');
    myDataChannel.send(input.value);
    makeMsg(`나: ${input.value}`);
    input.value = '';
})

// WELCOME

const welcome = document.getElementById('welcome');
const welcomeForm = welcome.querySelector('form');

const initCall = async () => {
    welcome.hidden = true;  
    call.hidden = false;
    chat.hidden = false;
    await getMedia();
    makeConnection();
}

welcomeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = welcomeForm.querySelector('input');
    roomName = input.value;
    await initCall();
    socket.emit('join_room', roomName);
    input.value = '';
})

// SOCKET

socket.on('welcome', async () => {
    console.log(myPeerConnection)
    myDataChannel = myPeerConnection.createDataChannel('chat');
    myDataChannel.addEventListener('message', (e) => {
        makeMsg(`너: ${e.data}`);
    });
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log('sent the offer');
    socket.emit('offer', offer, roomName);
});

socket.on('offer', async (offer) => {
    myPeerConnection.addEventListener('datachannel', (e) => {
        myDataChannel = e.channel;
        myDataChannel.addEventListener('message', (e) => {
            makeMsg(`너: ${e.data}`);
        });
    });
    console.log('received the offer');
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    console.log('sent the answer');
    socket.emit('answer', answer, roomName);
});

socket.on('answer', (answer) => {
    console.log('received the answer');
    myPeerConnection.setRemoteDescription(answer);
});

socket.on('ice', (ice) => {
    console.log('received the ice');
    myPeerConnection.addIceCandidate(ice);
})

// CONNECTION

const makeConnection = () => {
    myPeerConnection = new RTCPeerConnection({
        iceServers: [{
            urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun3.l.google.com:19302',
                'stun:stun4.l.google.com:19302',
            ],
        }]
    });
    myPeerConnection.addEventListener('icecandidate', (data) => {
        console.log('sent the ice');
        socket.emit('ice', data.candidate, roomName);
    });
    myPeerConnection.addEventListener('addStream', (data) => {
        console.log('got an event from my peer');
        console.log(data.stream, myStream);
        const peerFace = document.getElementById('peerFace');
        peerFace.srcObject = data.stream;
    });
    // 최신 아이폰에서 addStream 이벤트가 작동하지 않는 경우에 사용
    // myPeerConnection.addEventListener('track', (data) => {
    //     console.log('handle track')
    //     const peerFace = document.querySelector('#peerFace')
    //     peerFace.srcObject = data.streams[0]
    // });
    if(myStream) myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
}
