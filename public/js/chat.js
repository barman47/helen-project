var socket = io();

function scrollToBottom () {
  // Selectors
  var messages = $('#messages');
  var newMessage = messages.children('li:last-child');
  var message = $('#message');
  // Heights
  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  var formattedTime, template;

  if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }
}

socket.on('connect', function () {
    var params = $.deparam(window.location.search);
    socket.emit('join', params, function (err) {
        if (err) {
            alert(err);
            window.location.href = '/';
        } else {
            console.log('No error');
        }
    });
});

socket.on('disconnect', function () {
    console.log('Disconnected from server');
});

socket.on('updateUserList', function (users) {
    var ol = $('<ol></ol>');
    users.forEach(function (user) {
        ol.append($('<li></li>').text(user));
    });

    $('#users').html(ol);
});

socket.on('newMessage', function (message) {
    formattedTime = moment(message.createdAt).format('h:mm a');
    template = $('#message-template').html();
    var html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    });

    $('.typingNotifier').html('');
    jQuery('#messages').append(html);
    scrollToBottom();
});

socket.on('newDatabaseMessage', function (message) {
    template = $('#message-template').html();
    var html = Mustache.render(template, {
        from: message.from,
        text: message.text,
        createdAt: message.createdAt
    });

    jQuery('#messages').append(html);
    scrollToBottom();
});

socket.on('newLocationMessage', function (message) {
    formattedTime = moment(message.createdAt).format('h:mm a');
    template = $('#location-message-template').html();
    var html = Mustache.render(template, {
        from: message.from,
        url: message.url,
        createdAt: formattedTime
    });

$('#messages').append(html);
    scrollToBottom();
});

$('#message-form').on('submit', function (e) {
    e.preventDefault();
    var params = $.deparam(window.location.search);
    var messageTextbox = $('[name=message]');

    socket.emit('createMessage', {
        text: messageTextbox.val(),
        room: params.room
    }, function () {
        messageTextbox.val('');
    });
});

var locationButton = $('#send-location');
locationButton.on('click', function () {
    if (!navigator.geolocation) {
        return alert('Geolocation not supported by your browser.');
    }

    locationButton.attr('disabled', 'disabled').text('Sending location...');

    navigator.geolocation.getCurrentPosition(function (position) {
        locationButton.removeAttr('disabled').text('Send location');
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }, function () {
        locationButton.removeAttr('disabled').text('Send location');
        alert('Unable to fetch location.');
    });
});

var messageBox = document.getElementById('message');
messageBox.addEventListener('keypress', function (e) {
    if (!isEmpty(messageBox.value) && e.keyCode !== 32) {
        var params = $.deparam(window.location.search);
        socket.emit('userTyping', {
            user: params.username,
            room: params.room,
            typing: true
        });
    }
}, false);

socket.on('typingNotification', function (message) {
    var typing = `${message.user} is typing...`;
    var isTyping = true;

    while (isTyping === true) {
        if ($('.typingNotifier').attr('class') === 'typingNotifier') {
            if ($('#message').html() === '') {
                $('.typingNotifier').html('');
                isTyping = false;
            }
            $('.typingNotifier').html(typing);
            isTyping = false;
        } else {
            $('.typingNotifier').attr('class', '');
            $('.typingNotifier').html('');
            isTyping = false;
        }
    }
});

function isEmpty(element) {
    if (element.value === '' && element.value.trim() === '') {
        return true;
    } else {
        return false;
    }
}

$('#message').focusout(function (event) {
    socket.emit('focusoutEvent', {
        info: 'message textfield focusedout'
    });
});

socket.on('focusout', function (message) {
    console.log(message.text);
    $('.typingNotifier').html('');
});
