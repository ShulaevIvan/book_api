
window.addEventListener('DOMContentLoaded', () => {
    if (!/^\/view\/\S+\/$/.test(`${window.location.pathname}/`)) return;
    const wsServer = 'http://localhost:3000';
    const appData = {
        currentUser: {username: '', userId: null, inChat: false},
        allUsersInChat: [],
        socketEvents: [
            {
                name: 'checkusers', 
                func: async (msg) => {
                    console.log('check users event')
                    appData.allUsersInChat = [...msg.users]
                    clearUsersInChat();
                    appData.allUsersInChat.forEach((userItem) => {
                        addUserItemToChat(userItem.username, userItem.chatId); 
                    });
                    addUserItemToChat(appData.currentUser.username, appData.currentUser.userId , true); 
                }
            },
            {
                name: 'getUserId',
                func: (msg) => {
                    appData.currentUser.userId = msg.userId;
                    appData.currentUser.username = msg.username;
                }
            },
            {
                name: 'login',
                func: (msg) => {
                    console.log('login');
                    console.log(msg)
                }
            },
            {
                name: 'logout',
                func: (msg) => {
                    console.log('logout');
                    console.log(msg)
                }
            }
        ],
    }
    const chatBtn = document.querySelector('.chat-open-btn');
    const chatWrap = document.querySelector('.book-chat-wrap');
    const usersColumnWrap = chatWrap.querySelector('.chat-users-column');
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

    const addUserItemToChat = (username, userId, you=false) => {

        const userItemWrap = document.createElement('div');
        userItemWrap.classList.add('user-item-wrap');
        userItemWrap.setAttribute('userId', userId);
        userItemWrap.textContent = username;
        userItemWrap.addEventListener('click', selectChatUserHandler);
        if (you) {
            userItemWrap.classList.add('user-item-you');
            const firstNode = usersColumnWrap.childNodes[0];
            usersColumnWrap.insertBefore(userItemWrap, firstNode);
            return;
        }
        usersColumnWrap.appendChild(userItemWrap);
        
        
    };

    const clearUsersInChat = () => {
        usersColumnWrap.querySelectorAll('.user-item-wrap').forEach((item) => item.remove());
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
            // removeUserItemFromChat(appData.currentUser.userId);
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
        clearUsersInChat();
        appData.allUsersInChat = [];
        removeSocketEvents();
    })

    registerSelectBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!registerNameInput.value) return;
        registerDisabledBtns();
        appData.currentUser.username = registerNameInput.value;
        socket = io(wsServer, { query: `username=${registerNameInput.value}` });
        addSocketEvents();
        registerNameInput.value = '';
    });


    const chatOpenHandler = (e, action='close') => {
        e.preventDefault();
        if (action === 'open') {
            mainChatKeyboard.setAttribute('disabled', true);
            sendToChatBtn.setAttribute('disabled', true);
            chatWrap.classList.remove('chat-hide');
            return;
        }
        registerClearBtn.click();
        chatWrap.classList.add('chat-hide');
    };

    chatBtn.addEventListener('click', (e) => chatOpenHandler(e, chatWrap.classList.contains('chat-hide') ? 'open' : 'close'));
    closeChatPopup.addEventListener('click', (e) => chatOpenHandler(e, 'close'));
    
});