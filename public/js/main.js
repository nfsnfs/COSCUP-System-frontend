var baseUrl = '//coscup.nfsnfs.net/coscup';

$(function() {
    // click listener on buttons
    $('body').on('click', '#login-submit', login_handler);
    $('body').on('click', '#apply-submit', apply_handler);
    $('body').on('click', '#regdata-submit', regdata_handler);

    // click listener on <a>
    $('body').on('click', 'a', function() {
        var href = $(this).attr('href')
        if(href.lastIndexOf('#', 0) == 0) {
            if(href === '#logout') {
                window.sessionStorage.removeItem('token');
                show_loggedout();
            }
            console.log(href.replace('#',''));
            load_page(href.replace('#', ''));
        }
    });

    // show logout button if users logged in
    // hide login button if users logged in
    if(window.sessionStorage.getItem('token')) {
        show_loggedin();
    };

    // load page by hash
    hash_handler();
    
});

var load_page = function(page) {
    var section = $('.section');

    $.ajax({url: page + '.html', type: 'get', statusCode: {
        200: function(data) {
            section.empty();
            section.html(data);
        },
        404: function() {
            section.html('404 not found - ' + page);
        }
    }});
};

var show_errormsg = function(message) {
    var errormsg = $('#error-msg');
    errormsg.html(message);
    $('.error').show();
};

var show_loggedin = function() {
    $('body #nav-login').hide();
    $('body #nav-reg').show();
    $('body #nav-logout').show();
};

var show_loggedout = function() {
    $('body #nav-logout').hide();
    $('body #nav-reg').hide();
    $('body #nav-login').show();
};

var hash_handler = function() {
    var hash = location.hash.replace('#', '');
    
    if(hash !== '') {
        load_page(hash);
        console.log(hash);
    } else {
        load_page('useful');
    }
};

var login_handler = function(event) {
    event.preventDefault();
    var data = { 'user': $('#login-user').val(), 'passwd': $('#login-passwd').val() };

    $.ajax({url: baseUrl + '/login', 
            type: 'post',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(data),
            success: function(resp) { 
                if(!resp['exception']) {
                    var storage = window.sessionStorage;
                    storage.setItem('token', resp['token']);
                    window.history.replaceState({}, '', '#test');
                    show_loggedin();
                    load_page('test');
                } else {
                    show_errormsg(resp['exception']);
                }
            }
    });
};

var apply_handler = function(event) {
    event.preventDefault();
    $('.error').hide();

    if($('#apply-passwd').val() !== $('#confirm-passwd').val()) {
        $('#error-msg').html('wrong password');
        $('.error').show();
        return;
    }
    var data = { 'user': $('#apply-user').val(), 'passwd': $('#apply-passwd').val() };

    $.ajax({url: baseUrl + '/apply',
            type: 'post',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(data),
            success: function(resp) {
                if(!resp['exception']) {
                    load_page('login');
                } else {
                    show_errormsg(resp['exception']);
                }
            }
    });
};

var regdata_handler = function(event) {
    event.preventDefault();
    $('.error').hide();

    var data = { 'food': 'meat',
                 'traffic': false,
                 'certificate': false,
                 'accommodataion': false,
                 'new': false,
                 'language': [],
                 'team': [],
                 'skill': [],
                 'others': []
    };
    
    var form_data = $('form').serializeArray();

    for(var key in form_data) {
        var tmp = form_data[key];

        switch(tmp['name']) {
            case 'team':
                data['team'].push(tmp['value']);
                break;
            case 'certificate':
                data['certificate'] = true;
                break;
            case 'accommodation':
                data['accommodation'] = true;
                break;
            case 'traffic':
                data['traffic'] = true;
                break;
            case 'new':
                data['new'] = true;
                break;
            case 'language':
                if(tmp['value'] !== 'language-other')
                    data['language'].push(tmp['value']);
                break;
            case 'language-other':
                if(tmp['value'] !== '')
                    data['language'].push(tmp['value']);
                break;
            case 'food-other':
                if(tmp['value'] !== '')
                    data['food'].push(tmp['value']);
                break;
            case 'skill':
                if(tmp['value'] !== 'skill-other')
                    data['skill'].push(tmp['value']);
                break;
            case 'skill-other':
                if(tmp['value'] !== '')
                    data['skill'].push(tmp['value']);
                break;
            case 'birthday':
                data['birthday'] = (tmp['value'] == "0")? 0: 1;
                break;
            case 't-shirt-other':
                if(tmp['value'] !== '')
                    data['t-shirt'] = tmp['value'];
                break;
            default:
                data[tmp['name']] = tmp['value'];
                break;

        }
    }

    //console.log(JSON.stringify(data));
    console.log(window.sessionStorage.getItem('token'));
    var authorization = window.sessionStorage.getItem('token');
    $.ajax({url: baseUrl + '/user',
            headers: { 'Token': authorization },
            type: 'post',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(data),
            success: function(resp) {
                if(!resp['exception']) {
                    alert('您的資料已經被儲存!');
                    load_page('useful');
                } else {
                    show_errormsg(resp['exception']);
                }
            },
    });
};
