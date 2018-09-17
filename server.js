const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const exphbs = require('express-handlebars');
const favicon = require('express-favicon');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const passport = require('passport');

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
const User = require('./models/user');
const path = require('path');
const publicPath = path.join(__dirname, 'public');
const config = require('./config/database');
const port = process.env.PORT || 3000;

var users = new Users();

mongoose.connect(config.database, {
    useNewUrlParser: true
});

let conn = mongoose.connection;

conn.once('open', () => {
    console.log('Database Connection Established Successfully.');
});

conn.on('error', (err) => {
    console.log('Unable to Connect to Database. ' + err);
});

const userRoute = require('./routes/users');
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

// app.use(favicon(publicPath + '/img/favicon.png'));
app.use(express.static(publicPath));
app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'main'
}));
app.set('view engine', '.hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser('keybaord cat'));
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());
app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res);
    next();
});
app.use(expressValidator({
    errorFormatter: (param, msg, value) => {
        let namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return{
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    res.locals.success_message = req.flash('success');
    res.locals.failure_message = req.flash('failure');
    next();
});

app.use('/users', userRoute);

app.get('/', (req, res) => {
    res.render('index', {
        title: 'Home page',
        style: '/css/index.css',
        script: '/js/index.js'
    });
});

app.get('/:id/chat', (req, res) => {
    User.findOne({_id: req.params.id}, (err, returnedUser) => {
        if (err) {
            return console.log(err);
        } else {
            let user = returnedUser;
            res.sendFile(__dirname + '/views/chat.html');
        }
    });
});


io.on('connection', (socket) => {
    console.log('New user connected');

     socket.on('join', (params, callback) => {
         // var clients = io.sockets.adapter.rooms[params.room].sockets;
         var userList = users.getUserList(params.room);
         if (!isRealString(params.username) || !isRealString(params.room)) {
             return callback('Name and room name are required.');
         } else if (userList.includes(params.username)) {
             callback('You are already a member of this chat room');
         } else {
             if (params.room === '100 Level' || params.room === '200 Level' || params.room === '300 Level' || params.room === '400 Level') {
                 socket.join(params.room);
                 users.removeUser(socket.id);
                 users.addUser(socket.id, params.username, params.room);

                 console.log(params.room);

                 io.to(params.room).emit('updateUserList', users.getUserList(params.room));
                 // socket.leave(params.room);

                 // io.emit -> io.to(params.room).emit;
                 // socket.broadcast.emit => socket.broadcast.to(params.room).emit
                 // socket.emit

                 socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
                 socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.username} has joined`));
                 callback();

             } else {
                 callback ('You are not allowed to create a room');
             }
         }
     });

     socket.on('createMessage', (message, callback) => {
         var user = users.getUser(socket.id);
         if (user && isRealString(message.text)) {
            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
         }
         callback();
    });

     socket.on('createLocationMessage', (coords) => {
         var user = users.getUser(socket.id);
         if (user) {
             io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
         }
     });

     socket.on('typingNotification', function () {
         var user = users.getUser(socket.id);
         console.log('typing event received');
         socket.broadcast.to(user.room).emit('userTypingNotification', {
             user: user.name,
             text: 'is typing...'
         });

     });

      socket.on('disconnect', () => {
          console.log('User was disconnected');
          var user = users.removeUser(socket.id);
          if (user) {
              io.to(user.room).emit('updateUserList', users.getUserList(user.room));
              io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
          }
      });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
