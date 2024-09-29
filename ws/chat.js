const io = require('../app');
const ChatUser = require('../models/ChatUsers');

io.on('connection', async (socket) => {
    const clientId = socket.id;
    const username = socket.handshake.query.username;
    if (!username) socket.disconnect();
    clientConnect(clientId, username);
    console.log('connection add ' + clientId)


    socket.on('logout', async (msg) => {
      const logoutSocketId = socket.id;
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

const createUser = async (userId, userName) => {
  await ChatUser.create({username: userName, chatId: userId});
};

const removeUser = async (userId) => {
  await ChatUser.deleteOne({chatId: userId});
};