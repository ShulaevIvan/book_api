
window.addEventListener('DOMContentLoaded', () => {
    if (!/^\/view\/\S+\/$/.test(`${window.location.pathname}/`)) return;
    const wsServer = 'http://localhost:3000';
    const appData = {
        currentUser: {username: '', userId: null},
        selectedUser: {username: '', userId: null},
        allUsersInChat: [],
        socketEvents: [
            {
                name: 'login',
                func: async (msg) => {
                    return new Promise((resolve, reject) => {
                        console.log('login');
                        resolve(clearUsersInChat());
                    })
                    .then(() => {
                        appData.allUsersInChat = [...msg.users];
                        appData.allUsersInChat.forEach((userItem) => {
                            const you = userItem.chatId === socket.id ? true : false;
                            addUserItemToChat(userItem.username, userItem.chatId, you);
                        });
                        appData.currentUser.userId = socket.id;
                        chatMessagesColumn.scrollTop = chatMessagesColumn.scrollHeight;
                    });
                }
            },
            {
                name: 'logout',
                func: async (msg) => {
                    return new Promise((resolve, reject) => {
                        console.log('logout');
                    })
                    .then(() => {
                        appData.selectedUser.username = '';
                        appData.selectedUser.userId = null;
                        appData.currentUser.userId = '';
                    });
                }
            },
            {
                name: 'message',
                func: async (msg) => {
                    if (msg && msg.data) {
                        const { fromUser, toUser, text, fromUsername, toUsername, time } = msg.data;
                        await createMessage(
                            fromUsername ? fromUsername : fromUser, 
                            toUsername ? toUsername : toUser, 
                            text,
                            fromUser,
                            time
                        )
                        .then((messageItem) => {
                            chatMessagesColumn.appendChild(messageItem);
                            chatMessagesColumn.scrollTop = chatMessagesColumn.scrollHeight;
                        });
                    } 
                }
            },
            {
                name: 'history',
                func: async (msg) => {
                    await loadHistoryMsg(msg)
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
    const chatMessagesColumn = chatWrap.querySelector('.chat-messages');

    const addSocketEvents = () => {
        appData.socketEvents.forEach((event) => socket.on(event.name, event.func));
    };

    const removeSocketEvents = () => {
        appData.socketEvents.forEach((event) => socket.removeListener(event.name));
    };

    const sendEmit = (event, data={}) => {
        socket.emit(event, {
            id: socket.id,
            data: data,
        });
    };

    const sendMessageToChat = (fromUser, to) => {
        return sendEmit('message', {
            fromUser: fromUser,
            toUser: to,
            text: mainChatKeyboard.value,
        });
    };

    const clearMessages = () => {
        const allMesgItems = chatWrap.querySelectorAll('.chat-message-item');
        allMesgItems.forEach((item) => item.remove());

    };

    const createMessage = (fromUser, toUser, text, fromUserId, time) => {
        return new Promise((resolve, reject) => {
            const you = appData.currentUser.userId === fromUserId ? true : false;
            const chatMessageItem = document.createElement('div');
            const chatUsernameWrap = document.createElement('div');
            const chatMessageFrom = document.createElement('span');
            const chatMessageTo = document.createElement('span');
            const chatText = document.createElement('p');
            const chatMessageTime = document.createElement('div');
        
            chatMessageFrom.classList.add('chat-message-from');
            chatMessageTime.classList.add('chat-message-time');

            if (toUser === appData.currentUser.username) chatMessageTo.classList.add('chat-message-color-you');
            else chatMessageTo.classList.add('chat-message-color');

            chatMessageItem.classList.add('chat-message-item');
            chatUsernameWrap.classList.add('chat-message-username-wrap');

            chatMessageFrom.textContent = fromUser;
            chatMessageTo.textContent = toUser;
            chatText.textContent = text;
            chatMessageTime.textContent = time;

            if (you) chatMessageFrom.classList.add('chat-message-color-you');
            else chatMessageFrom.classList.add('chat-message-color');

            chatUsernameWrap.appendChild(chatMessageFrom);
            chatUsernameWrap.appendChild(chatMessageTo);
            chatMessageItem.appendChild(chatMessageTime)
            chatMessageItem.appendChild(chatUsernameWrap);
            chatMessageItem.appendChild(chatText);
            resolve(chatMessageItem);
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

    const loadHistoryMsg = async (msgData) => {
        if (msgData && msgData.length > 0) {
            msgData.forEach((msgItem) => {
                createMessage(
                    msgItem.fromUserName, 
                    msgItem.toUserName, 
                    msgItem.message, 
                    msgItem.fromUserId, 
                    msgItem.time
                )
                .then((msgData) => {
                    chatMessagesColumn.appendChild(msgData);
                    chatMessagesColumn.scrollTop = chatMessagesColumn.scrollHeight;
                });
            });
        }
        return;  
    };

    const sendMessageToChatHandler = (e) => {
        if (!mainChatKeyboard.value.trim()) return;
        if (e.key && e.key !== 'Enter') return;
        if (appData.currentUser.userId && appData.selectedUser.userId) {
            sendMessageToChat(appData.currentUser.userId, appData.selectedUser.userId);
            mainChatKeyboard.blur();
            mainChatKeyboard.value = '';
            return;
        }
        sendMessageToChat(appData.currentUser.userId, 'all');
        mainChatKeyboard.blur();
        mainChatKeyboard.value = '';
    };

    const selectChatUserHandler = (e) => {
        e.preventDefault();
        const targetUser = e.target;

        if (targetUser.classList.contains('user-item-selected')) {
            targetUser.classList.remove('user-item-selected');
            appData.selectedUser.userId = '';
            appData.selectedUser.username = '';
            return;
        }
        targetUser.classList.add('user-item-selected');
        appData.selectedUser.userId = targetUser.getAttribute('userId');
        appData.selectedUser.username = targetUser.textContent;
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

    sendToChatBtn.addEventListener('click', sendMessageToChatHandler);
    mainChatKeyboard.addEventListener('keydown', sendMessageToChatHandler);

    registerNameInput.addEventListener('input', (e) => {
        appData.currentUser.username = e.target.value;
    });

    registerClearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerNameInput.value = '';
        registerDisabledBtns('clearBtn');
        sendEmit('logout', {userName: appData.currentUser.username, userId: socket.id});
        appData.allUsersInChat = [];
        removeSocketEvents();
        clearUsersInChat();
        clearMessages();
        mainChatKeyboard.value = '';
    });

    registerSelectBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!registerNameInput.value) return;
        registerDisabledBtns();
        appData.currentUser.username = registerNameInput.value;
        socket = io(wsServer, { query: `username=${registerNameInput.value}` });
        appData.currentUser.userId = socket.id;
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
        registerClearBtn.click();
        chatWrap.classList.add('chat-hide');
    };

    chatBtn.addEventListener('click', (e) => chatOpenHandler(e, chatWrap.classList.contains('chat-hide') ? 'open' : 'close'));
    closeChatPopup.addEventListener('click', (e) => chatOpenHandler(e, 'close'));
    
});