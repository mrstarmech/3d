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

        if (!object.option.menuDisable) {
            OBJECTS.children('.' + classNameContainer).children('.' + classNameCanvas).append(menu());
            OBJECTS.children('.' + classNameContainer).children('.' + classNameCanvas).append(modalDialogShare());
            $('pre code').each(function (i, block) {
                hljs.highlightBlock(block);
            });
            OBJECTS.children('.' + classNameContainer).children('.' + classNameCanvas).append(paletteColor());
            cp = ColorPicker(document.getElementById('slide'), document.getElementById('picker'),
                function (hex, hsv, rgb, mousePicker, mouseSlide) {
                    currentColor = hex;
                    ColorPicker.positionIndicators(
                        document.getElementById('slide-indicator'),
                        document.getElementById('picker-indicator'),
                        mouseSlide, mousePicker
                    );
                    t.switchEnv('background', hex);
                });
        }
        OBJECTS.children('.' + classNameContainer).attr('data-state', 'dynamic');

        return t;
    } catch (error) {
        // console.log(error);
    }
};

function menu() {
    var menu = $('<div class="btn-toolbar container-menu-object" role="toolbar"></div>'),
        topmenu = $('<div class="btn-group btn-group-sm" role="group"></div>'),
        submenu = $('<div class="btn-group btn-group-sm submenu" role="group"></div>');

    topmenu.append('<button class="btn menu-object" data-menu="collapse"><i class="fas fa-cog"></i></button>');
    topmenu.append('<button class="btn menu-object" data-menu="full-screen"><i class="fas fa-expand"></i></button>');

    if (object.option.wireframe) {
        submenu.append('<button class="btn menu-object active" data-menu="wire-frame"><i class="fas fa-globe"></i></button>');
    } else {
        submenu.append('<button class="btn menu-object" data-menu="wire-frame"><i class="fas fa-globe"></i></button>');
    }

    if (object.labels.length != 0) {
        submenu.append('<button class="btn menu-object active" data-menu="label"><i class="fas fa-tags"></i></button>');
        object.option.label = true;
    }

    submenu.append('<button class="btn menu-object" data-menu="background"><i class="fas fa-palette"></i></button>');

    if (object.option.autorotate) {
        submenu.append('<button class="btn menu-object active" data-menu="rotate"><i class="fas fa-sync-alt"></i></button>');
    } else {
        submenu.append('<button class="btn menu-object" data-menu="rotate"><i class="fas fa-sync-alt"></i></button>');
    }
    submenu.append('<button class="btn menu-object" data-menu="share"><i class="fas fa-share-alt"></i></button>');
    submenu.append('<button class="btn menu-object" data-menu="ruler"><i class="fas fa-ruler"></i></button>');
    submenu.append('<button class="btn menu-object" data-menu="light"><i class="fas fa-lightbulb"></i></button>');
    submenu.append('<button class="btn menu-object" data-menu="texture-disable"><i class="fas fa-image"></i></button>');

    if (object.option.grid) {
        submenu.append('<button class="btn menu-object active" data-menu="grid"><i class="fas fa-th-large"></i></button>');
    } else {
        submenu.append('<button class="btn menu-object" data-menu="grid"><i class="fas fa-th-large"></i></button>');
    }

    menu.append(submenu);
    menu.append(topmenu);

    return menu;
}

function modalDialogShare() {
    var modal = $('<div class="modal fade" id="share-object" tabindex="-1" role="dialog" aria-labelledby="dialog_confirm_mapLabel" aria-hidden="true"></div>'),
        dialog = $('<div class="modal-dialog"></div>'),
        content = $('<div class="modal-content"></div>'),
        body = $('<div class="modal-body"></div>'),
        pre = $('<pre></pre>'),
        code = $('<code id="' + object.sef + '" onclick="copy()"></code>');
    code.text('<iframe src="' + host + '/iframe/' + object.sef + '" style="width: 400px; height: 300px; scrolling: no; border: 0px;" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>');

    pre.append(code);
    body.append(pre);
    content.append(body);
    dialog.append(content);
    modal.append(dialog);

    return modal;
}

function paletteColor() {
    return $('<div id="color" style="display: none">\n' +
        '    <div id="color-picker" class="cp-default">\n' +
        '        <div class="picker-wrapper">\n' +
        '            <div id="picker" class="picker"></div>\n' +
        '            <div id="picker-indicator" class="picker-indicator"></div>\n' +
        '        </div>\n' +
        '        <div class="slide-wrapper">\n' +
        '            <div id="slide" class="slide"></div>\n' +
        '            <div id="slide-indicator" class="slide-indicator"></div>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '</div>');
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

function copy() {
    selectText(object.sef);
    document.execCommand("copy");
}

function selectText(containerid) {
    if (document.selection) { // IE
        var range = document.body.createTextRange();
        range.moveToElementText(document.getElementById(containerid));
        range.select();
    } else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(document.getElementById(containerid));
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
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
            object.option.wireframe = !object.option.wireframe;
            t.switchEnv('wireframe', object.option.wireframe);
            buttonActive($(this), object.option.wireframe);
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
        case 'background':
            object.option.background = !object.option.background;
            buttonActive($(this), object.option.background);
            $('#color').toggle();
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
        case 'grid':
            object.option.grid = !object.option.grid;
            t.switchEnv('grid', object.option.grid);
            buttonActive($(this), object.option.grid);
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
    })

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