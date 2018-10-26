var OBJECTS,
    classNameContainer = 'container-object',
    classNameCanvas = 'canvas-object';

OBJECTS = $('.tree-object');

OBJECTS.click(function () {

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

        OBJECTS.attr('data-render', 'success');
        OBJECTS.children('.' + classNameContainer).children('.' + classNameCanvas).append(menu());
        OBJECTS.children('.' + classNameContainer).children('.' + classNameCanvas).append(modalDialog());
        OBJECTS.children('.' + classNameContainer).attr('data-state', 'dynamic');

        return t;
    } catch (error) {
        console.log(error);
    }
};

function menu() {
    var menu = $('<div class="btn-toolbar container-menu-object" role="toolbar"></div>'),
        topmenu = $('<div class="btn-group btn-group-sm" role="group"></div>'),
        submenu = $('<div class="btn-group btn-group-sm submenu" role="group"></div>');

    topmenu.append('<button class="btn menu-object" data-menu="collapse"><i class="fas fa-cog"></i></button>');
    topmenu.append('<button class="btn menu-object" data-menu="full-screen"><i class="fas fa-expand"></i></button>');

    submenu.append('<button class="btn menu-object" data-menu="wire-frame"><i class="fas fa-globe"></i></button>');

    if (object.labels.length != 0) {
        submenu.append('<button class="btn menu-object active" data-menu="label"><i class="fas fa-tags"></i></button>');
        object.option.label = true;
    }
    // submenu.append('<button class="btn menu-object" disabled><i class="fas fa-palette"></i></button>');
    if (object.option.autorotate) {
        submenu.append('<button class="btn menu-object active" data-menu="rotate"><i class="fas fa-sync-alt"></i></button>');
        object.option.autorotate = true;
    }else {
        submenu.append('<button class="btn menu-object" data-menu="rotate"><i class="fas fa-sync-alt"></i></button>');
    }
    // submenu.append('<button class="btn menu-object" disabled data-menu="share"><i class="fas fa-share-alt"></i></button>');
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
    code.text('<div class="tree-test"></div>');

    pre.append(code);
    body.append(pre);
    content.append(body);
    dialog.append(content);
    modal.append(dialog);

    return modal;
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
                ;
            }
            break;
        case 'collapse':
            $('.' + classNameContainer + " .submenu").toggle();
            buttonActive($(this), $('.' + classNameContainer + " .submenu").is(':visible'));
            break;
        case 'rotate':
            object.option.autorotate = !object.option.autorotate;
            t.switchEnv('autoRotate', object.option.autorotate);
            buttonActive($(this), object.option.autorotate);
            break;
        case 'wire-frame':
            object.option.valuewireframe = !object.option.valuewireframe;
            t.switchEnv('wireframe', object.option.valuewireframe);
            buttonActive($(this), object.option.valuewireframe);
            break;
        case 'share':
            $('#share-object').modal();
            $('.modal-backdrop').appendTo($('.' + classNameContainer).parent());
            $('body').removeClass();
            break;
        case 'ruler':
            object.option.ruler = !object.option.ruler;
            t.switchEnv('ruler', object.option.ruler);
            buttonActive($(this), object.option.ruler);
            break;
        case 'label':
            object.option.label = !object.option.label;
            t.switchEnv('label');
            buttonActive($(this), object.option.label);
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

$('.' + classNameContainer).on('click', '.' + classNameCanvas, function () {
    var new_label = t.getNewLabel();
    if (new_label) {
        var position = new_label.position;
        $('input[id=objectlabel-position]').val(JSON.stringify(position));
    }
});