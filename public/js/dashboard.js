$(document).ready(function () {
    $('.sidenav').sidenav();
    $('.tooltipped').tooltip();
    $('.modal').modal({preventScrolling: true});
    $(document).ready(function(){
        $('select').formSelect();
    });

    var dataFields = [
        document.querySelector('#studentName'),
        document.querySelector('#email'),
        document.querySelector('#password'),
        document.querySelector('#level')
    ];

    var editButton = document.querySelector('#editButton');
    var saveButton = document.querySelector('#saveButton');

    const emailRegExp = /^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$/;
    const passwordRegExp = /^[\w@-]{8,20}$/;
    const levelRegExp = /^[1-4][0][0] level$/i;

    editButton.addEventListener('click', function (event) {
        dataFields.forEach(function (dataField) {
            if (dataField.disabled) {
                dataField.disabled = false;
            }
        });
        M.toast({
            html: 'You can now edit your information. Proceed with caution.',
            classes: 'rounded'
        });
    }, false);

    // function disableDataFields (dataFields) {
    //     dataFields.forEach(function (dataField) {
    //         if (!dataField.disabled) {
    //             dataField.disabled = true;
    //         }
    //     });
    // }
    //
    // $('main').on('focus', function () {
    //     disableDataFields(dataFields);
    // });

    function isEmpty (element) {
        if (element.value === '' || element.value.trim() === '') {
            return true;
        } else {
            return false;
        }
    }

    function ajaxUpdate () {
        var password = $('#password').val();
        if (password === '') {
            password = null;
        }
        $target = $('#saveButton');
        const id = $target.attr('data-id');
        const url = `/users/dashboard/${id}`;
        let data = {
            name: $('#studentName').val(),
            email: $('#email').val(),
            password: password,
            level: $('#level').val()
        }
        $.ajax(url, {
            type: 'PUT',
            data: data
        }).done(function () {
            M.toast({
                html: 'Update Successful.',
                classes: 'greenToast'
            });
            setTimeout(function () {
                window.location.href = `/users/dashboard/${id}`;
            }, 3000);
        }).fail(function (jqXHR, status) {
            alert('Update Unsucessful. Please Try Again. ' + status);
        });
    }

    function submitData () {
        var okay;
        for (var i = 0; i < dataFields.length; i++) {
            if (isEmpty(dataFields[i])) {
                dataFields[i].classList.add('invalid');
                dataFields[i].disabled = false;
                dataFields[i].focus();
                M.toast({html: 'Please provide data to be updated'});
                okay = false;
                break;
            }
        }
        if (okay !== false && dataFields[2].value.length >= 8) {
            ajaxUpdate();
        }
    }

    function checkInputs () {
        dataFields[1].addEventListener('keyup', function (event) {
            if (!emailRegExp.test(event.target.value)) {
                event.target.classList.add('invalid');
                event.target.classList.remove('valid');
            } else {
                event.target.classList.add('valid');
                event.target.classList.remove('invalid');
            }
        }, false);

        dataFields[1].addEventListener('focusout', function (event) {
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

        dataFields[2].addEventListener('keyup', function (event) {
            if (!passwordRegExp.test(event.target.value)) {
                event.target.classList.add('invalid');
                event.target.classList.remove('valid');
            } else {
                event.target.classList.add('valid');
                event.target.classList.remove('invalid');
            }
        }, false);

        dataFields[2].addEventListener('focusout', function (event) {
            if (!passwordRegExp.test(event.target.value)) {
                event.target.classList.add('invalid');
                event.target.classList.remove('valid');
                event.target.focus();
                M.toast({html: 'Please provide a valid password'});
            } else {
                event.target.classList.add('valid');
                event.target.classList.remove('invalid');
            }
        }, false);

        dataFields[3].addEventListener('keyup', function (event) {
            if (!levelRegExp.test(event.target.value)) {
                event.target.classList.add('invalid');
                event.target.classList.remove('valid');
            } else {
                event.target.classList.add('valid');
                event.target.classList.remove('invalid');
            }
        }, false);

        dataFields[3].addEventListener('focusout', function (event) {
            if (!levelRegExp.test(event.target.value)) {
                event.target.classList.add('invalid');
                event.target.classList.remove('valid');
                event.target.focus();
                M.toast({html: 'Please provide a valid level'});
            } else {
                event.target.classList.add('valid');
                event.target.classList.remove('invalid');
            }
        }, false);
    }
    checkInputs();
    saveButton.addEventListener('click', submitData, false);
});
