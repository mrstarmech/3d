var OBJECTS,
    classNameContainer = 'container-object',
    classNameCanvas = 'canvas-object';

OBJECTS = $('.tree-object');

OBJECTS.each(function() {
    var value = $(this).attr('data-tree-object'),
        object = getObject(value),
        model = getModel(),
        divContainer = $('<div class=' + classNameContainer + ' data-state="static"></div>'),
        divCanvas = $('<div class="' + classNameCanvas + '"></div>');

    var styleDivContainer = {
        'background': 'url(\'/' + model['pathImage'] +'/' + object['id'] + '/' + object['image'] + '\')',
        'background-position': 'center',
        'background-size': 'cover',
    };

    divContainer.css(styleDivContainer);
    divContainer.append(divCanvas);

    $(this).append(divContainer);
});

OBJECTS.click(function () {
    distance();
    if($(this).attr('data-render')){
        return false;
    }
    var value = $(this).attr('data-tree-object'),
        object = getObject(value),
        model = getModel();

    setting = {
        "name": object['name'],
        "texture": '/' + model['pathFile'] + '/' + object['id'] + '/' + object['texture'],
        "mesh": '/' + model['pathFile'] + '/' + object['id'] + '/' + object['obj'],
        "ambient": "",
        "color": "",
        "specular": "",
        "shininess": ""
    };
    options = {
        "grid": false,
        "ruler": false,
        "wireframe": false,
        "autorotate": false,
        "showgui": false,
        "lights": "AmbientLight",
        "loader": "objLoader",
        "controls": "OrbitControls",
        "camera": "auto",
        "cameraDistanceMultiplier": 1,
        "cameraCoords": {
            "x": 0,
            "y": 0,
            "z": 0
        }
    };
    try {
        window.t = new viewer(setting, options);
        t.appendTo(classNameCanvas);
        t.switchEnv('createLabel',true);
        $(this).attr('data-render','success');
        $(this).children('.' + classNameContainer).children('.' + classNameCanvas).append(menu());
        $(this).children('.' + classNameContainer).children('.' + classNameCanvas).append(modalDialog());
        $(this).children('.' + classNameContainer).attr('data-state','dynamic');
    } catch (error) {
        console.log(error);
    }
});

function getObject(id) {
    var csrfToken = $('meta[name="csrf-token"]').attr("content");
    var object;
    $.ajax({
        async: false,
        type: "POST",
        dataType: "json",
        url: "/object/data",
        data: {id: id, _csrf: csrfToken},
        cache: false,
        success: function(response){
            object = response;
        }
    });
    return object;
}

function getModel() {
    var csrfToken = $('meta[name="csrf-token"]').attr("content");
    var model;
    $.ajax({
        async: false,
        type: "POST",
        dataType: "json",
        url: "/object/setting",
        data: {_csrf: csrfToken},
        cache: false,
        success: function(response){
            model = response;
        }
    });
    return model;
}

function menu() {
    var menu = $('<div class="btn-toolbar container-menu-object" role="toolbar"></div>'),
        topmenu = $('<div class="btn-group btn-group-sm" role="group"></div>'),
        submenu = $('<div class="btn-group btn-group-sm submenu" role="group"></div>');

    topmenu.append('<button class="btn menu-object" data-menu="collapse"><i class="fas fa-cog"></i></button>');
    topmenu.append('<button class="btn menu-object" data-menu="full-screen"><i class="fas fa-expand"></i></button>');

    submenu.append('<button class="btn menu-object" data-menu="value-wire-frame"><i class="fas fa-globe"></i></button>');
    submenu.append('<button class="btn menu-object" disabled><i class="fas fa-palette"></i></button>');
    submenu.append('<button class="btn menu-object" data-menu="rotate"><i class="fas fa-sync-alt"></i></button>');
    submenu.append('<button class="btn menu-object" data-menu="share"><i class="fas fa-share-alt"></i></button>');
    submenu.append('<button class="btn menu-object" data-menu="ruler"><i class="fas fa-ruler"></i></button>');

    menu.append(submenu);
    menu.append(topmenu);
    return menu;
}

function modalDialog() {
    var modal = $('<div class="modal fade" id="share-object" tabindex="-1" role="dialog" aria-labelledby="dialog_confirm_mapLabel" aria-hidden="true"></div>'),
        dialog = $('<div class="modal-dialog"></div>'),
        content = $('<div class="modal-content"></div>'),
        body = $('<div class="modal-body"></div>'),
        pre = $('<pre></pre>'),
        code = $('<code></code>');
    code.text('<div class="tree-test"></div>');;
    pre.append(code);
    body.append(pre);
    content.append(body);
    dialog.append(content);
    modal.append(dialog);

    return modal;
}

function distance(){
    if(options.ruler && t.rulerDistance() !== 0){
        $('.menu-object[data-menu=ruler]').attr({
            'data-toggle': 'tooltip',
            'data-html': 'true',
            'data-placement': 'top',
            'title': t.rulerDistance() + '&nbsp;мм'
        });
        $('.menu-object[data-menu=ruler]').tooltip('show');
    }else{
        $('.menu-object[data-menu=ruler]').tooltip('destroy');
    }
}


$('.' + classNameContainer).on('click', '.menu-object', function(){
    switch ($(this).attr('data-menu')){
        case 'full-screen':
            if($(this).attr('data-full-screen') === 'true'){
                if(document.exitFullscreen) document.exitFullscreen();
                else if(document.mozCancelFullScreen) document.mozCancelFullScreen();
                else if(document.webkitCancelFullScreen) document.webkitCancelFullScreen();
                else if(document.msExitFullscreen) document.msExitFullscreen();
                else {
                    //альтернативное решение для браузеров, которые не поддерживают exitfullscreen()
                }
            }else{
                var elements = document.getElementsByClassName(classNameCanvas);
                var i = elements[0];
                if (i.requestFullscreen) {
                    i.requestFullscreen();
                } else if (i.webkitRequestFullscreen) {
                    i.webkitRequestFullscreen();
                } else if (i.mozRequestFullScreen) {
                    i.mozRequestFullScreen();
                } else if (i.msRequestFullscreen) {
                    i.msRequestFullscreen();
                };
            }
            break;
        case 'collapse':
            $('.' + classNameContainer + " .submenu").toggle();
            buttonActive($(this),$('.' + classNameContainer + " .submenu").is(':visible'));
            break;
        case 'rotate':
            options.autorotate = !options.autorotate;
            t.switchEnv('autoRotate', options.autorotate);
            buttonActive($(this),options.autorotate);
            break;
        case 'value-wire-frame':
            options.valuewireframe = !options.valuewireframe;
            t.switchEnv('wireframe',options.valuewireframe);
            buttonActive($(this),options.valuewireframe);
            break;
        case 'share':
            $('#share-object').modal();
            $('.modal-backdrop').appendTo($('.' + classNameContainer).parent());
            $('body').removeClass();
            break;
        case 'ruler':
            options.ruler = !options.ruler;
            t.switchEnv('ruler',options.ruler);
            buttonActive($(this),options.ruler);
            break;
    }
});

function buttonActive(element,value){
    if(value){
        element.addClass('active');
    }else {
        element.removeClass('active');
    }
}

$('.' + classNameContainer).on('dblclick', '.' + classNameCanvas, function(){
    options.autorotate = !options.autorotate;
    t.switchEnv('autoRotate', options.autorotate);
    buttonActive($('.menu-object[data-menu=rotate]'),options.autorotate);
});

var eFullscreenName = function (){
    if('onfullscreenchange' in document) return 'fullscreenchange';
    if('onmozfullscreenchange' in document) return 'mozfullscreenchange';
    if('onwebkitfullscreenchange' in document) return 'webkitfullscreenchange';
    if('onmsfullscreenchange' in document) return 'MSFullscreenChange';
    return false;
}();

if(eFullscreenName){
    document.addEventListener(eFullscreenName, function () {
        var element = $('.menu-object[data-menu=full-screen]'),
            value = element.attr('data-full-screen') === 'true'
        element.attr('data-full-screen', !value);
        buttonActive(element,!value);
    }, false);
}

$('.' + classNameContainer).on('click', '.' + classNameCanvas, function(){
    var new_label = t.getNewLabel();
    if(new_label){
        var position = new_label.position;
        $('input[id=objectlabel-position]').val(JSON.stringify(position));
    }
});
// $("form").submit( function(e) {
//     var messageLength = CKEDITOR.instances['description'].getData().replace(/<[^>]*>/gi, '').length;
//     if( !messageLength ) {
//         alert( 'Пожалуйста, заполните описание метки' );
//         e.preventDefault();
//     }
// });