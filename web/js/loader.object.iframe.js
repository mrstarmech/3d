var OBJECT,
    classNameContainer = 'container-object',
    classNameCanvas = 'canvas-object';

OBJECT = $('.tree-object');

OBJECT.click(function () {

    if ($(this).attr('data-render') == 'success') {
        distance();
    }

    if ($(this).attr('data-render')) {
        return false;
    }
});

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
}

function menu() {
    var menu = $('<div class="btn-toolbar container-menu-object" role="toolbar"></div>'),
        topmenu = $('<div class="btn-group btn-group-sm" role="group"></div>');

    topmenu.append('<button class="btn menu-object" data-menu="ruler"><i class="fas fa-ruler"></i></button>');
    topmenu.append('<button class="btn menu-object" data-menu="texture-disable"><i class="fas fa-image"></i></button>');
    topmenu.append('<button class="btn menu-object" data-menu="light"><i class="fas fa-lightbulb"></i></button>');
    topmenu.append('<button class="btn menu-object" data-menu="texture-change"><i class="fas fa-book"></i></button>');
    topmenu.append('<button class="btn menu-object" data-menu="full-screen"><i class="fas fa-expand"></i></button>');

    menu.append(topmenu);
    return menu;
}

function distance() {
    if (object.option.ruler && t.rulerDistance() !== 0) {
        $('.menu-object[data-menu=ruler]').attr({
            'data-toggle': 'tooltip',
            'data-html': 'true',
            'data-placement': 'top',
            'title': t.rulerDistance() + '&nbsp;мм'
        });
        $('.menu-object[data-menu=ruler]').tooltip('show');
    } else {
        $('.menu-object[data-menu=ruler]').tooltip('destroy');
    }
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
            }
            break;
        case 'ruler':
            object.option.ruler = !object.option.ruler;
            t.switchEnv('ruler', object.option.ruler);
            buttonActive($(this), object.option.ruler);
            break;
        case 'light':
            object.option.lights = (object.option.lights == 'Cameralight' ? 'AmbientLight' : 'Cameralight');
            t.switchEnv('lights', object.option.lights);
            break;
        case 'texture-disable':
            object.option.textureDisable = !object.option.textureDisable;
            buttonActive($(this), object.option.textureDisable);
            t.switchEnv('textureDisable', object.option.textureDisable);
            break;
        case 'texture-change':
            object.option.textureChange = !object.option.textureChange;
            t.switchEnv('textureChange', object.option.textureChange);

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

$('.' + classNameContainer)
    .on('dblclick', '.' + classNameCanvas, function () {
        object.option.autorotate = !object.option.autorotate;
        t.switchEnv('autoRotate', object.option.autorotate);
        buttonActive($('.menu-object[data-menu=rotate]'), object.option.autorotate);
    })
    .on('dblclick', '.menu-object', function () {
        return false;
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
            value = element.attr('data-full-screen') === 'true';
        element.attr('data-full-screen', !value);
        buttonActive(element, !value);
    }, false);
}