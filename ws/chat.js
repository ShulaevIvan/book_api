const io = require('../app');
const ChatUser = require('../models/ChatUsers');

io.on('connection', async (socket) => {
    const clientId = socket.id;
    const username = socket.handshake.query.username;
    if (!username) socket.disconnect();
    console.log(username)
    clientConnect(clientId, username);
    console.log('connection add ' + clientId)


    socket.on('logout', async (msg) => {
      const logoutSocketId = socket.id;
      socket.disconnect();
      const currentClients = Array.from(io.sockets.sockets).map(socket => socket[0]);
      socket.broadcast.emit('logout', {users: currentClients});
    });

    socket.on('disconnect', async () => {
      const removeSocketId = socket.id;
      socket.disconnect();
      const currentClients = Array.from(io.sockets.sockets).map(socket => socket[0]);
      socket.broadcast.emit('logout', {users: currentClients})
    })
});


const clientConnect = async (userId, userName) => {
  const currentClients = Array.from(io.sockets.sockets).map(socket => socket[0]);
  io.sockets.emit('login', {users: currentClients});
  findConnections()
}

const findConnections = async () => {
  return new Promise((resolve, reject) => {
    Array.from(io.sockets.sockets).map((socket) => {
      console.log(socket)
    })
  })
}