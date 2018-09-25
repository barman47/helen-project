$(document).ready(function () {
    var form = document.signupForm;
    var inputs = [
        form.name,
        form.email,
        form.username,
        form.password,
        form.confirmPassword
    ];

    var gender = form.gender;
    var submitButton = document.querySelector('button');

    var emailRegExp = /^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$/;
    var passwordRegExp = /^[\w@-]{8,20}$/;

    function submitForm (event) {
        for (var i = 0; i < inputs.length; i++) {
            if (isEmpty(inputs[i])) {
                event.preventDefault();
                inputs[i].classList.add('invalid');
                inputs[i].focus();
                break;
            }
        }
    }

    function isEmpty (element) {
        if (element.value === '' || element.value.trim() === '') {
            return true;
        } else {
            return false;
        }
    }

    function checkInputs () {
        form.email.addEventListener('keyup', function (event) {
            if (!emailRegExp.test(event.target.value)) {
                event.target.classList.add('invalid');
                event.target.classList.remove('valid');
            } else {
                event.target.classList.add('valid');
                event.target.classList.remove('invalid');
            }
        }, false);

        form.email.addEventListener('focusout', function (event) {
            if (!emailRegExp.test(event.target.value)) {
                event.target.classList.add('invalid');
                event.target.classList.remove('valid');
                event.target.focus();
                M.toast({
                    html: 'Please provide a valid email to continue'
                });
            } else {
                event.target.classList.add('valid');
                event.target.classList.remove('invalid');
            }
        }, false);

        form.username.addEventListener('focusout', function (event) {
            if (isEmpty(form.username)) {
                event.target.classList.add('invalid');
                event.target.classList.remove('valid');
                event.target.focus();
                M.toast({
                    html: 'Please provide a username'
                });
            } else {
                event.target.classList.add('valid');
                event.target.classList.remove('invalid');
            }
        }, false);

        form.password.addEventListener('keyup', function (event) {
            if (!passwordRegExp.test(event.target.value)) {
                event.target.classList.add('invalid');
                event.target.classList.remove('valid');
            } else {
                event.target.classList.add('valid');
                event.target.classList.remove('invalid');
            }
        }, false);

        form.password.addEventListener('focusout', function (event) {
            if (!passwordRegExp.test(event.target.value)) {
                event.target.classList.add('invalid');
                event.target.classList.remove('valid');
                event.target.focus();
                M.toast({
                    html: 'Please provide your password'
                });
            } else {
                event.target.classList.add('valid');
                event.target.classList.remove('invalid');
            }
        }, false);

        form.confirmPassword.addEventListener('keyup', function (event) {
            if(event.target.value === form.password.value) {
                event.target.classList.add('valid');
                event.target.classList.remove('invalid');
            } else {
                event.target.classList.add('invalid');
                event.target.classList.remove('valid');
            }
        }, false);

        form.confirmPassword.addEventListener('focusout', function (event) {
            if (isEmpty(confirmPassword)) {
                event.target.classList.add('invalid');
                event.target.classList.remove('valid');
                event.target.focus();
                M.toast({
                    html: 'Please re-enter your password'
                });
            } else {
                event.target.classList.add('valid');
                event.target.classList.remove('invalid');
            }
        }, false);
    }
    form.addEventListener('submit', submitForm, false);
    checkInputs();
});
