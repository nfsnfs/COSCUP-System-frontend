//var baseUrl = '//staff.coscup.org/coscup';
var baseUrl = '//coscup.nfsnfs.net/coscup';

$(function() {
    // click listener on buttons
    $('body').on('click', '#login-submit', login_handler);
    $('body').on('click', '#apply-submit', apply_handler);
    $('body').on('click', '#regdata-submit', regdata_handler);
    $('body').on('click', '#invite-add', invite_add_handler);
    $('body').on('click', '#invite-del', invite_del_handler);
    $('body').on('click', '#invite-submit', invite_handler);

    // show id-number field if needed
    $('body').on('click', '#accommodation', function() {
        var id_number_field = $('#id-number-field');
        if(this.checked)
            id_number_field.show();
        else
            id_number_field.hide();
        console.log(this.checked);
    });

    // click listener on <a>
    $('body').on('click', 'a', function() {
        var href = $(this).attr('href')
        if(href.lastIndexOf('#', 0) == 0) {
            if(href === '#logout') {
                window.sessionStorage.removeItem('token');
                window.sessionStorage.removeItem('data');
                window.sessionStorage.removeItem('role');
                show_loggedout();
            }
            //console.log(href.replace('#',''));
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
            
            switch(page) {
                case 'apply':
                    apply_init();
                    break;
                case 'invite':
                    invite_init();
                    break;
                case 'personal':
                    personal_init();
                    break;
            }
        },
        404: function() {
            section.html('404 not found - ' + page);
        }
    }});
};

var show_errormsg = function(message) {
    var errormsg = $('#error-msg');
    errormsg.html(message);
    $('.negative.message').show();
};

var show_loggedin = function() {
    $('body #nav-login').hide();
    $('body #nav-reg').show();
    $('body #nav-logout').show();

    var role = JSON.parse(window.sessionStorage.getItem('role'));
    console.log(role)
    if($.inArray('admin', role) != -1) {
        $('body #nav-invite').show();
    }

    var data = window.sessionStorage.getItem('data');
    if(data == "true") {
        $('body #nav-reg').hide();
    }
};

var show_loggedout = function() {
    $('body #nav-logout').hide();
    $('body #nav-reg').hide();
    $('body #nav-login').show();
    $('body #nav-invite').hide();
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

var getUrlParameter = function(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}          


// for login
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
                    storage.setItem('data', resp['data']);
                    storage.setItem('role', JSON.stringify(resp['role']));
                    show_loggedin();
                    if(resp['data'] == false) {
                        window.history.replaceState({}, '', '#regdata');
                        load_page('regdata');        
                    } else {
                        window.history.replaceState({}, '', '#test');
                        load_page('test');
                    }
                } else {
                    show_errormsg(resp['exception']);
                }
            }
    });
};

// for apply
var apply_handler = function(event) {
    event.preventDefault();
    $('.negative.message').hide();

    if($('#apply-passwd').val() !== $('#confirm-passwd').val()) {
        show_errormsg('wrong password');
        return;
    }
    var data = { 'user': $('#apply-user').val(), 
                 'passwd': $('#apply-passwd').val(), 
                 'role': $('#apply-team').val(),
                 'email': $('#apply-email').val() };

    apply_token = getUrlParameter('apply');   

    $.ajax({url: baseUrl + '/apply/' + getUrlParameter('apply'),
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

var apply_init = function() {
    apply_token = getUrlParameter('apply');   
    //console.log(apply_token);
    
    $.ajax({url: baseUrl + '/apply/' + apply_token,
            type: 'get',
            dataType: 'json',
            success: function(resp) {
                if(!resp['exception']) {
                    $('#apply-email').val(resp['email']);
                    $('#apply-team').val(resp['team']);
                }
            }
    });
};

// for regdata
var regdata_handler = function(event) {
    event.preventDefault();
    $('.negative.message').hide();

    var data = { 'food': 'meat',
                 'traffic': false,
                 'certificate': false,
                 'accommodation': false,
                 'commuting': false,
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
                    data['food'] = tmp['value'];
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
            case 'commuting-time':
                data['commuting'] = true;
                break;
            case 'id-number':
                if(tmp['value'] !== '')
                    data['id-number'] = tmp['value'];
                break;
            default:
                data[tmp['name']] = tmp['value'];
                break;

        }
    }

    //console.log(window.sessionStorage.getItem('token'));
    var authorization = window.sessionStorage.getItem('token');
    $.ajax({url: baseUrl + '/user',
            headers: { 'Token': authorization },
            type: 'post',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(data),
            success: function(resp) {
                if(!resp['exception']) {
                    alert('Save!');
                    window.sessionStorage.setItem('data', true);
                    $('#nav-reg').hide();
                    load_page('useful');
                } else {
                    show_errormsg(resp['exception']);
                }
            },
    });
};

// for invite
var invite_add_handler = function() {
    $('#invite-info').clone(false).removeAttr('id').appendTo('#invite-fields');
};

var invite_del_handler = function() {
    var count = $('.two.fields').length;
    if(count > 1)
        $('#invite-fields .two.fields:last').remove();
};

var invite_handler = function(e) {
    e.preventDefault();
    var authorization = window.sessionStorage.getItem('token');
    var data = [];
    var team = [];

    $('input[name=team]:checked').each(function() {
        team.push($(this).val());
    });

    $('.two.fields').each(function() {
        var nickname = $(this).find('input[name=nickname]').val();
        var email = $(this).find('input[name=email]').val();
        if(nickname !== '' && email !== '')
            data.push({'nickname': nickname, 'email': email, 'team': team });
    });

    //console.log(JSON.stringify(data));

    $.ajax({url: baseUrl + '/invite',
            type: 'post',
            headers: { 'Token': authorization },
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(data),
            success: function(resp) {
                if(!resp['exception']) {
                    //console.log(JSON.stringify(resp['email']));
                    $('form').trigger('reset');
                    alert('ok');
                } else {
                    alert(resp['exception'])
                }
            }
    });
};

var invite_init = function() {
};

// for personal
var personal_init = function() {
    var authorization = window.sessionStorage.getItem('token');
    $.ajax({url: baseUrl + '/user',
            type: 'get',
            headers: { 'Token': authorization },
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(resp) {
                var size = ['xs', 's', 'm', 'l', 'xl', '2xl', '3xl'];
                var food = ['meat', 'vegetarian', 'meat-no-beef', 'meat-no-pork'];
                var skill = ['medical', 'law', 'pr'];
                var language = ['english', 'japanese', 'taiwanese', 'cantonese'];
                if(!resp['exception']) {
                    for(var key in resp) {
                        if(typeof resp[key] == 'string') {
                            switch(key) {
                                case 'food':
                                    if(food.indexOf(resp[key]) == -1) {
                                        $('#food-other').prop('checked', true);
                                        $('#food-other-msg').val(resp[key]);
                                    } else {
                                        $('#'+resp[key]).prop('checked', true);
                                    }
                                    break;
                                case 't-shirt':
                                    if(size.indexOf(resp[key]) == -1) {
                                        $('#t-shirt-other').prop('checked', true);
                                        $('#t-shirt-other-msg').val(resp[key]);
                                    } else {
                                        $('#'+resp[key]).prop('checked', true);
                                    }
                                    break;
                                case 'gender':
                                    $('#'+resp[key]).prop('checked', true);
                                    break;
                                default:
                                    $('#'+key).val(resp[key].toString());
                                    break;
                            }
                        } else if(typeof resp[key] == 'object') {
                            for(var i in resp[key]) {
                                $('#'+resp[key][i]).prop('checked', true);
                                if(key == 'skill') {
                                    if(skill.indexOf(resp[key][i]) == -1) {
                                        $('#skill-other').prop('checked', true);
                                        $('#skill-other-msg').val(resp[key][i]);
                                    }
                                } else if(key == 'lanaguage') {
                                    if(lanaguage.indexOf(resp[key][i]) == -1) {
                                        $('#lanaguage-other').prop('checked', true);
                                        $('#lanaguage-other-msg').val(resp[key][i]);
                                    }
                                }
                            }
                        } else if(typeof resp[key] == 'boolean') {
                            $('#'+key).prop('checked', true);
                            if(key == 'commuting') {
                                $('#commuting-time').prop('checked', true);
                            }
                        }
                    }
                } else {
                    alert(resp['exception']);
                }
            }
    });
};

var personal_hander = function() {
    
};
