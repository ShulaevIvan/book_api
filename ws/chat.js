const io = require('../app');

io.on('connection', (socket) => {
    const clients = Array.from(io.sockets.sockets).map(socket => socket[0]);
    const clientId = socket.id;
    console.log(`New websocket connected ${clientId}`);
    io.sockets.emit('checkusers', {users: clients});

    socket.on('logout', (msg) => {
        Array.from(io.sockets.sockets).forEach((socketItem) => socketItem[0] === msg.id ? socket.disconnect() : null);
    });

    socket.on('disconnect', (msg) => {
        
      const clients = Array.from(io.sockets.sockets).map(socket => socket[0]);
      io.sockets.emit('checkusers', {users: clients});
      console.log('New websocket disconnected');
     
    });
});