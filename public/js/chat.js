
window.addEventListener('DOMContentLoaded', () => {
    if (!/^\/view\/\S+\/$/.test(`${window.location.pathname}/`)) return;
    const wsServer = 'http://localhost:3000';
    const appData = {
        currentUser: {username: '', userId: null, inChat: false},
        allUsersInChat: [],
        socketEvents: [
            {
                name: 'checkusers', 
                func: (msg) => {
                    this.allUsersInChat = [...msg.users]
                    console.log(this.allUsersInChat)
                }
            },
            {
                name: 'getUserId',
                func: (msg) => {
                    appData.currentUser.userId = msg.userId;
                    addUserItemToChat(appData.currentUser.username, appData.currentUser.userId);
                }
            }
        ],
    }
    const chatBtn = document.querySelector('.chat-open-btn');
    const chatWrap = document.querySelector('.book-chat-wrap');
    const usersColumnWrap = chatWrap.querySelector('.chat-users');
    const closeChatPopup = chatWrap.querySelector('.book-chat-close-btn');
    const registerNameInput = chatWrap.querySelector('#register-name-input');
    const registerSelectBtn = chatWrap.querySelector('.register-select-btn');
    const registerClearBtn = chatWrap.querySelector('.register-clear-btn');
    const mainChatKeyboard = chatWrap.querySelector('.chat-keyboard');
    const sendToChatBtn = chatWrap.querySelector('.chat-keyboard-send-btn');

    const addSocketEvents = () => {
        appData.socketEvents.forEach((event) => socket.on(event.name, event.func));
    };

    const removeSocketEvents = () => {
        appData.socketEvents.forEach((event) => socket.removeListener(event.name));
    };

    const sendEmit = (event, data={}) => {
        socket.emit(event, {
            id: socket.id,
            userName: appData.currentUser.username,
            data: data,
        });
    };

    const addUserItemToChat = (username, userId) => {
        const userItemWrap = document.createElement('div');
        userItemWrap.classList.add('user-item-wrap');
        userItemWrap.setAttribute('userId', userId);
        userItemWrap.textContent = username;
        userItemWrap.classList.add(appData.currentUser.userId === userId ? 'user-item-you' : null);
        userItemWrap.addEventListener('click', selectChatUserHandler);
        usersColumnWrap.appendChild(userItemWrap);
    };

    const removeUserItemFromChat = (userId) => {
        const targetUser = usersColumnWrap.querySelector(`[userId="${userId}"]`);
        targetUser.removeEventListener('click', selectChatUserHandler);
        targetUser.remove();
    };

    const selectChatUserHandler = (e) => {
        e.preventDefault();
        const targetUser = e.target;
        if (targetUser.classList.contains('user-item-selected')) {
            targetUser.classList.remove('user-item-selected');
            return;
        }
        targetUser.classList.add('user-item-selected')
    };

    const registerDisabledBtns = (param) => {
        if (param === 'clearBtn') {
            mainChatKeyboard.setAttribute('disabled', true);
            sendToChatBtn.setAttribute('disabled', true);
            registerSelectBtn.removeAttribute('disabled');
            registerNameInput.removeAttribute('disabled');
            return;
        }
        registerNameInput.setAttribute('disabled', true);
        registerSelectBtn.setAttribute('disabled', true);
        mainChatKeyboard.removeAttribute('disabled');
        sendToChatBtn.removeAttribute('disabled');
    };

    registerNameInput.addEventListener('input', (e) => {
        appData.currentUser.username = e.target.value;
    });

    registerClearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerNameInput.value = '';
        registerDisabledBtns('clearBtn');
        sendEmit('logout');
        removeUserItemFromChat(appData.currentUser.userId);
        removeSocketEvents();
    })

    registerSelectBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!registerNameInput.value) return;
        registerDisabledBtns();
        appData.currentUser.username = registerNameInput.value;
        socket = io(wsServer);
        addSocketEvents();
    });


    const chatOpenHandler = (e, action='close') => {
        e.preventDefault();
        if (action === 'open') {
            mainChatKeyboard.setAttribute('disabled', true);
            sendToChatBtn.setAttribute('disabled', true);
            chatWrap.classList.remove('chat-hide');
            return;
        }
        chatWrap.classList.add('chat-hide');
    };

    chatBtn.addEventListener('click', (e) => chatOpenHandler(e, chatWrap.classList.contains('chat-hide') ? 'open' : 'close'));
    closeChatPopup.addEventListener('click', (e) => chatOpenHandler(e, 'close'));


    
});