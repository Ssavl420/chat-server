const express = require("express");
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();

const route = require('./route');
const { addUser, findUser, getRoomUsers, removeUser } = require("./users");

app.use(cors({ origin: "*" }));
app.use(route);

const server = http.createServer(app);

const io = new Server(server, {
   cors: {
      origin: "*",
      methods: ["GET", "POST"],
   },
});

io.on('connection', (socket) => {
   socket.on('join', ({ name, room }) => {

      socket.join(room);

      const { user, isExist } = addUser({ name, room });

      const adminPrivateMessage = isExist ? `${user.name}, и снова здравствуйте!` : `Здравствуйте, ${user.name}!`

      // Сообщение для user от Админа
      socket.emit('message', {
         data: {
            user: {
               name: "Администратор"
            },
            message: adminPrivateMessage
         }
      });

      const adminGroupMessage = isExist ? `${user.name}, перезагрузил(-a) страницу чата.` : `К чату присоединяется, ${user.name}!`

      // Сообщение участникам комнаты от Админа
      socket.broadcast.to(user.room).emit('message', {
         data: {
            user: {
               name: "Администратор"
            },
            message: adminGroupMessage
         }
      });

      io.to(user.room).emit('joinRoom', {
         data: { users: getRoomUsers(user.room) },
      });
   });

   // Слушатель, отправлено ли сообщение
   socket.on('sendMessage', ({ message, params, sendTime }) => {
      const user = findUser(params);

      if (user) {
         io.to(user.room).emit('message', { data: { user, message, sendTime } })
      }
   });

   // Слушатель, выхода из комнаты
   socket.on('leaveRoom', ({ params }) => {
      const user = removeUser(params);

      if (user) {
         const { room, name } = user

         io.to(room).emit('message', {
            data: {
               user: {
                  name: "Администратор"
               },
               message: `${name}, вышел из чата.`
            },
         });

         io.to(room).emit('joinRoom', {
            data: { users: getRoomUsers(room) },
         });
      }
   });

   io.on('disconnection', () => {
      console.log("Disconnect")
   });
});

server.listen(5000, () => {
   console.log("Server is running");
});

