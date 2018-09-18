$(document).ready(function () {
    $('.collapsible').collapsible();
    var socket = io();
    var button = document.querySelectorAll('button');
    //formattedTime = moment(message.createdAt).format('h:mm a');
    socket.on('connect', function () {
        console.log('User connected');
    });

    socket.on('disconnect', function () {
        console.log('Disconnected from server');
    });
});
