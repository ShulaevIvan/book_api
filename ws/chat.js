const io = require('../app');
const ChatUser = require('../models/ChatUsers');
const ChatMessage = require('../models/ChatMessage');

io.on('connection', async (socket) => {
    const clientId = socket.id;
    const username = socket.handshake.query.username;
    if (!username) socket.disconnect();
    clientConnect(clientId, username);
    console.log('connection add ' + clientId);
    await getAllMessages()
    .then((data) => {
      const onlyAllMsg = data.filter((msg) => msg.toUserId === 'all');
      socket.emit('history', onlyAllMsg);
    });


    socket.on('logout', async (msg) => {
      removeUser(socket.id)
      .then(() => {
        socket.disconnect();
        ChatUser.find({})
        .then((data) => {
          socket.broadcast.emit('logout', {users: data});
        })
      })
    });

    socket.on('disconnect', async () => {
      const removeSocketId = socket.id;
      removeUser(socket.id)
      .then(() => {
        socket.disconnect();
        ChatUser.find({})
        .then((data) => {
          socket.broadcast.emit('logout', {users: data})
        });
      })
    });

    socket.on('message', async (msg) => {
      return new Promise((resolve, reject) => {
        const { fromUser, toUser, text } = msg.data;
        const date = new Date();
        const msgTime = getTime(date);
        if (toUser && toUser === 'all') {
          ChatUser.find({chatId: fromUser})
          .then((fromUserData) => {
            if (fromUserData && fromUserData.length > 0) {
              const fromUsername = fromUserData[0].username;
              msg.data.fromUsername = fromUsername;
              msg.data.time = msgTime;
              ChatMessage.create({
                message: text,
                time: msgTime,
                date: date,
                fromUserId: fromUser,
                toUserId: toUser,
                fromUserName: fromUsername,
                toUserName: toUser !== 'all' ? ChatUser.find({chatId: toUser})[0].username : 'all'
              });

              resolve(io.sockets.emit('message', msg));
            }
          })
        }
        else if (toUser && toUser) {
          ChatUser.find({chatId: fromUser})
          .then((fromUserData) => {
            if (fromUserData && fromUserData.length > 0) {
              msg.data.fromUsername = fromUserData[0].username;
            }
          })
          .then((data) => {
            ChatUser.find({chatId: toUser})
            .then((toUserData) => {
              if (toUserData && toUserData.length > 0) {
                const senderUserId = msg.data.fromUser;
                const reciveUserId = msg.data.toUser;

                msg.data.toUser = toUserData[0].username;
                msg.data.time = msgTime;
                ChatMessage.create({
                  message: text,
                  time: msgTime,
                  date: date,
                  fromUserId: fromUser,
                  toUserId: toUser,
                  fromUserName: msg.data.fromUsername,
                  toUserName: toUser !== 'all' ? toUserData[0].username : 'all'
                });
                if (senderUserId === reciveUserId) {
                  socket.emit('message', msg);
                  return;
                }
                socket.emit('message', msg);
                io.to(reciveUserId).emit('message', msg);
              }
            });
          });
        }
      });
    })
});


const clientConnect = async (userId, userName) => {
  const currentClients = Array.from(io.sockets.sockets).map(socket => socket[0]);
  createUser(userId, userName)
  .then(() => {
    ChatUser.find({})
     .then((data) => {
       io.sockets.emit('login', {users: data});
      });
  });
};

const getAllMessages = async () => {
  return await ChatMessage.find({})
};

const createUser = async (userId, userName) => {
  await ChatUser.create({username: userName, chatId: userId});
};

const removeUser = async (userId) => {
  await ChatUser.deleteOne({chatId: userId});
};

const getTime = (date) => {
  const addZero = (value) => {
    if (value <= 9) return `0${value}`;
    return `${value}`;
  };

  const time = `Time: ${addZero(date.getHours())}:${addZero(date.getMinutes())}:${addZero(date.getSeconds())}`
  const today = `Date: ${addZero(date.getDay())} / ${addZero(date.getMonth())} / ${addZero(date.getFullYear())}`;

  return `${time} ${today}`;
};

