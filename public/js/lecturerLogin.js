$(document).ready(function () {
    $(".dropdown-trigger").dropdown();
    var form = document.forms.loginForm;

    var inputs = [
        document.querySelector('#username'),
        document.querySelector('#password')
    ];

    form.addEventListener('submit', function (event) {
        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].value === '' || inputs[i].value.trim() === '') {
                event.preventDefault();
                M.toast({html: 'Please provide your username and password'});
                inputs[i].focus();
                break;
            }
        }
    }, false);
});
