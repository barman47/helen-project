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
const moment = require('moment');

const {generateMessage, generateLocationMessage, generateDatabaseMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
const {ensureAuthenticated} = require('./utils/access-control');
const Message = require('./models/message');
const User = require('./models/user');
const Lecturer = require('./models/lecturer');
const {saveMessage} = require('./utils/insert-message');
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
const lecturers = require('./routes/lecturers');
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(favicon(publicPath + '/img/favicon.png'));
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
app.use('/lecturers', lecturers);

app.get('/', (req, res) => {
    res.render('index', {
        title: 'User Login',
        style: '/css/index.css',
        script: '/js/index.js'
    });
});

app.get('/:id/chat', ensureAuthenticated, (req, res) => {
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
         var userList = users.getUserList(params.room);
         if (!isRealString(params.username) || !isRealString(params.room)) {
             return callback('Name and room name are required.');
         } else if (userList.includes(params.username)) {
             callback('You are already a member of this chat room');
         } else {
             if (params.room === 'Year One' || params.room === 'Year Two' || params.room === 'Year Three' || params.room === 'Year Four') {
                 socket.join(params.room);
                 users.removeUser(socket.id);
                 users.addUser(socket.id, params.username, params.room);

                 io.to(params.room).emit('updateUserList', users.getUserList(params.room));
                 // socket.leave(params.room);

                 // io.emit -> io.to(params.room).emit;
                 // socket.broadcast.emit => socket.broadcast.to(params.room).emit
                 // socket.emit

                 // Query Database for messages here
                 //socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.username} has joined`));
                 Message.find({room: params.room}, (err, messages) => {
                     if (err) {
                         return console.log(err);
                     } else {
                         messages.forEach((message) => {
                            io.to(params.room).emit('newDatabaseMessage', generateDatabaseMessage(message.sender, message.message, message.time));
                         });
                     }
                 });

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
            let time = moment();
            let chatMessage = new Message({
                message: message.text,
                sender: user.name,
                time: time.format('h:mm a'),
                room: user.room
            });
            chatMessage.save((err) => {
                if (err) {
                    return console.log(err);
                } else {
                    callback();
                }
            });
         }

    });

     socket.on('createLocationMessage', (coords) => {
         var user = users.getUser(socket.id);
         if (user) {
             io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
         }
     });

     socket.on('userTyping', (message) => {
         socket.broadcast.to(message.room).emit('typingNotification', {
             user: message.user,
             typing: message.typing
         });
     });

     socket.on('focusoutEvent', (message) => {
         socket.broadcast.to(message.room).emit('focusout', {
             text: message.info
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
