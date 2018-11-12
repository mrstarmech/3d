var OBJECT,
    classNameContainer = 'container-object',
    classNameCanvas = 'canvas-object';

OBJECT = $('.tree-object');

function start() {
    try {
        window.t = new viewer(object.setting, object.option, object.labels);
        t.appendTo(classNameCanvas);

        OBJECT.attr('data-render', 'success');
        OBJECT.children('.' + classNameContainer).children('.' + classNameCanvas).append(menu());
        OBJECT.children('.' + classNameContainer).attr('data-state', 'dynamic');

        return t;
    } catch (error) {
        console.log(error);
    }
};

function menu() {
    var menu = $('<div class="btn-toolbar container-menu-object" role="toolbar"></div>'),
        topmenu = $('<div class="btn-group btn-group-sm" role="group"></div>');

    topmenu.append('<button class="btn menu-object" data-menu="full-screen"><i class="fas fa-expand"></i></button>');

    menu.append(topmenu);
    return menu;
}


$('.' + classNameContainer).on('click', '.menu-object', function () {
    switch ($(this).attr('data-menu')) {
        case 'full-screen':
            if ($(this).attr('data-full-screen') === 'true') {
                if (document.exitFullscreen) document.exitFullscreen();
                else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
                else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
                else if (document.msExitFullscreen) document.msExitFullscreen();
                else {
                    //альтернативное решение для браузеров, которые не поддерживают exitfullscreen()
                }
            } else {
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
                }
                ;
            }
            break;
    }
});

function buttonActive(element, value) {
    if (value) {
        element.addClass('active');
    } else {
        element.removeClass('active');
    }
}

$('.' + classNameContainer).on('dblclick', '.' + classNameCanvas, function () {
    object.option.autorotate = !object.option.autorotate;
    t.switchEnv('autoRotate', object.option.autorotate);
    buttonActive($('.menu-object[data-menu=rotate]'), object.option.autorotate);
});

var eFullscreenName = function () {
    if ('onfullscreenchange' in document) return 'fullscreenchange';
    if ('onmozfullscreenchange' in document) return 'mozfullscreenchange';
    if ('onwebkitfullscreenchange' in document) return 'webkitfullscreenchange';
    if ('onmsfullscreenchange' in document) return 'MSFullscreenChange';
    return false;
}();

if (eFullscreenName) {
    document.addEventListener(eFullscreenName, function () {
        var element = $('.menu-object[data-menu=full-screen]'),
            value = element.attr('data-full-screen') === 'true'
        element.attr('data-full-screen', !value);
        buttonActive(element, !value);
    }, false);
}