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
        t.appendTo(classNameCanvas, function () {
            OBJECTS.attr('data-render', 'success');

            if (!object.option.menuDisable) {
                OBJECTS.children('.' + classNameContainer).children('.' + classNameCanvas).append(menu());
                OBJECTS.children('.' + classNameContainer).children('.' + classNameCanvas).append(supermenu());
                OBJECTS.children('.' + classNameContainer).children('.' + classNameCanvas).append(modalDialogShare());
                window.modalDialogLayers = modalDialogShareLayersParams('');
                OBJECTS.children('.' + classNameContainer).children('.' + classNameCanvas).append(modalDialogLayers.modal);
                $('pre code').each(function (i, block) {
                    hljs.highlightBlock(block);
                });
                OBJECTS.children('.' + classNameContainer).children('.' + classNameCanvas).append(paletteColor());
                $('.cam-align-btn').hide();
                $('.dots-reset-btn').hide();
                cp = ColorPicker(document.getElementById('slide'), document.getElementById('picker'),
                    function (hex, hsv, rgb, mousePicker, mouseSlide) {
                        currentColor = hex;
                        ColorPicker.positionIndicators(
                            document.getElementById('slide-indicator'),
                            document.getElementById('picker-indicator'),
                            mouseSlide, mousePicker
                        );
                        if (currentDrawingId == null){
                            backgroundColor = hex;
                            t.switchEnv('background', hex);
                        }
                        else {
                            drawings[currentDrawingId].color = hex;
                            t.redrawTexture();
                        }
                    });
            }
            OBJECTS.children('.' + classNameContainer).attr('data-state', 'dynamic');
        });

        return t;
    } catch (error) {
        // console.log(error);
    }
};

function disableMenu()
{
    $('.container-supermenu-object').hide();
    $('.container-menu-object').hide();
}
function enableMenu()
{
    $('.container-supermenu-object').show();
    $('.container-menu-object').show();
}

function supermenu() {
    var supermenu = $('<div class="btn-group btn-group-sm container-supermenu-object" role="toolbar"></div>');
    if (Array.isArray(object.setting.texture) && object.setting.texture.length > 1)
        supermenu.append('<button title="Change Texture" class="btn menu-object" data-menu="texture-change"><i class="fas fa-book fa-2x" style="color:blue"></i></button>');

    if (Array.isArray(object.setting.drawing)) {
        var inputAlpha = '<div id="rt_popover">';
        for (var i = 0; i < object.setting.drawing.length; i++) {
            if (Array.isArray(object.setting.layersParams) && typeof object.setting.layersParams[i].alpha != 'undefined')
                alphaValue = object.setting.layersParams[i].alpha;
            else alphaValue = 1;
            inputAlpha += (i+1)
                + ' : <input type=\'range\' id=\'' + i + '\' class=\'alpha-value\' step=\'0.05\' min=\'-1\' max=\'1\' value=\'' + alphaValue + '\'>'
                + '<button value="' + i + '" class="btn menu-object cp-button" data-menu="layer_pallete" data-html="true" data-container="#rt_popover"'
                + 'data-toggle="popover" data-placement="bottom"><i class="fas fa-palette"></i></button>' + '<br>';
        }
        inputAlpha += '</div>';

        rt_popover = $(inputAlpha);

        var rt = $('<button id="rt" title="Overlays" class="btn menu-object" data-menu="reconstruction-tools" data-html="true" data-container=".container-supermenu-object"' +
                   'data-toggle="popover" data-placement="bottom"><i class="fas fa-atlas fa-2x" style="color:green"></i></button>');
        supermenu.append(rt);
    }
    
    
    supermenu.append('<button title="Align camera" class="btn menu-object cam-align-btn" data-menu="align-camera"><i class="fas fa-crosshairs"></i></button>');
    supermenu.append('<button title="Reset dots" class="btn menu-object dots-reset-btn" data-menu="reset-dots"><i class="fas fa-redo"></i></button>');
    
    return supermenu;
}


function menu() {
    var menu = $('<div class="btn-toolbar container-menu-object" role="toolbar"></div>'),
        topmenu = $('<div class="btn-group btn-group-sm" role="group"></div>'),
        submenu = $('<div class="btn-group btn-group-sm submenu" role="group"></div>');

    topmenu.append('<button title="Options" class="btn menu-object" data-menu="submenu"><i class="fas fa-cog"></i></button>');
    topmenu.append('<button title="Fullscreen" class="btn menu-object" data-menu="full-screen"><i class="fas fa-expand"></i></button>');
    topmenu.append('<button title="Reset camera" class="btn menu-object cam-reset-btn" data-menu="reset-camera"><i class="fas fa-redo"></i></button>');

    if (object.option.wireframe) {
        submenu.append('<button title="Wireframe" class="btn menu-object active" data-menu="wire-frame"><i class="fas fa-globe"></i></button>');
    } else {
        submenu.append('<button title="Wireframe" class="btn menu-object" data-menu="wire-frame"><i class="fas fa-globe"></i></button>');
    }

    if (Array.isArray(object.labels) && object.labels.length != 0) {
        submenu.append('<button title="Label" class="btn menu-object active" data-menu="label"><i class="fas fa-tags"></i></button>');
        object.option.label = true;
    }

    submenu.append('<button title="Background" class="btn menu-object cp-button" data-menu="background"><i class="fas fa-palette"></i></button>');

    if (object.option.autorotate) {
        submenu.append('<button title="Autorotation off" class="btn menu-object active" data-menu="rotate"><i class="fas fa-sync-alt"></i></button>');
    } else {
        submenu.append('<button title="Autorotation on" class="btn menu-object" data-menu="rotate"><i class="fas fa-sync-alt"></i></button>');
    }
    submenu.append('<button title="Share" class="btn menu-object" data-menu="share"><i class="fas fa-share-alt"></i></button>');
    submenu.append('<button title="Ruler" class="btn menu-object ruler" data-menu="ruler"><i class="fas fa-ruler"></i></button>');
    submenu.append('<button title="Light" class="btn menu-object" data-menu="light"><i class="fas fa-lightbulb"></i></button>');
    submenu.append('<button title="Disable Texture" class="btn menu-object" data-menu="texture-disable"><i class="fas fa-image"></i></button>');

    if (object.option.grid) {
        submenu.append('<button title="Grid off" class="btn menu-object active" data-menu="grid"><i class="fas fa-th-large"></i></button>');
    } else {
        submenu.append('<button title="Grid on" class="btn menu-object" data-menu="grid"><i class="fas fa-th-large"></i></button>');
    }

    //var inputZoom = '<input type=\'range\' class=\'zoom-value\' step=\'0.1\' min=\'1\' max=\'20\' value=\'1\'>';
    //submenu.append('<button title="Zoom" class="btn menu-object" data-menu="zoom" data-html="true" data-container=".submenu" data-toggle="popover" data-placement="top" data-content="' + inputZoom + '"><i class="fas fa-search-plus"></i></button>');
    if (Array.isArray(object.setting.texture) && object.setting.texture.length > 1)
        submenu.append('<button title="Change Texture" class="btn menu-object" data-menu="texture-change"><i class="fas fa-book"></i></button>');
    submenu.append('<button title="Orthographer" class="btn menu-object orthographer" data-menu="toggle-orthographer"><i class="fas fa-camera"></i></button>');
    submenu.append('<button title="Switch Camera" class="btn menu-object cam-switch-btn" data-menu="switch-camera"><i class="fas fa-eye"></i></button>');

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

function layersParamsToggle(txt)
{
    modalDialogLayers.setText(txt);
    modalDialogLayers.modal.modal();
    $('.modal-backdrop').appendTo($('.' + classNameContainer).parent());
    $('body').removeClass();
}

function modalDialogShareLayersParams() {
    var modal = $('<div class="modal fade" id="share-object-layers" tabindex="-1" role="dialog" aria-labelledby="dialog_confirm_mapLabel" aria-hidden="true"></div>'),
        dialog = $('<div class="modal-dialog"></div>'),
        content = $('<div class="modal-content"></div>'),
        body = $('<div class="modal-body"></div>'),
        pre = $('<pre></pre>'),
        code = $('<code id="' + object.sef + '" onclick="copy()"></code>');
    code.text('');

    pre.append(code);
    body.append(pre);
    content.append(body);
    dialog.append(content);
    modal.append(dialog);

    function setText(txt)
    {
        code.text(txt);
    }

    return {modal, setText: setText};
}

function paletteColor() {
    return $('<div id="color" class="container-pallete" style="display: none">\n' +
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
        case 'reset-dots':
            t.switchEnv('reset-dots', false);
            break;
        case 'shot-camera':
            t.switchEnv('shot', false);
            break;
        case 'align-camera':
            t.switchEnv('align', false);
            break;
        case 'reset-camera':
            t.switchEnv('reset', false);
            break;
        case 'toggle-orthographer':
            t.switchEnv('toggle-ortho', t.orthographer = !t.orthographer);
            
            if(t.orthographer == true)
            {
                $('.cam-align-btn').show();
                $('.dots-reset-btn').show();
            }
            else
            {
                $('.cam-align-btn').hide();
                $('.dots-reset-btn').hide();
            }
            if(object.option.ruler)
            {
                object.option.ruler = false;
                t.switchEnv('ruler', object.option.ruler);
                buttonActive($('.ruler'), object.option.ruler);
            }
            buttonActive($(this), t.orthographer);
            break;
        case 'switch-camera':
            $('.cam-switch-btn').toggleClass('active');
            if($('.cam-switch-btn').hasClass('active')){
                $('.cam-switch-btn').css('border',' 1px solid red');
                $('.cam-switch-btn').attr('title','Orthographic Camera Active');
            }
            else{
                $('.cam-switch-btn').css('border', 'none');
                $('.cam-switch-btn').attr('title','Switch camera');
            }

            t.switchEnv('swCam');
            break;
        case 'submenu':
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
            if(object.option.ruler && t.orthographer)
            {
                t.switchEnv('toggle-ortho',t.orthographer = !t.orthographer);
                $('.cam-align-btn').hide();
                $('.dots-reset-btn').hide();
                buttonActive($('.orthographer'), t.orthographer);
            }
            buttonActive($(this), object.option.ruler);
            break;
        case 'label':
            object.option.label = !object.option.label;
            t.switchEnv('label');
            buttonActive($(this), object.option.label);
            break;
        case 'background':
            var active_state = !$(this).hasClass('active');
            $(".cp-button").removeClass('active');
            if (active_state) {
                $(this).addClass('active');
                currentDrawingId = null;
                $('#color').show();
                if (typeof backgroundColor != 'undefined')
                    cp.setHex(backgroundColor);
            }
            else $('#color').hide();
            break;
        case 'light':
            object.option.lights = (object.option.lights == 'Cameralight' ? 'AmbientLight' : 'Cameralight');
            buttonActive($(this), object.option.lights === 'AmbientLight');
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
        case 'zoom':
            object.option.zoom = !object.option.zoom;
            if (object.option.zoom) {
                $(this).popover('show');
            } else {
                $(this).popover('destroy');
            }
            buttonActive($(this), object.option.zoom);
            break;
        case 'reconstruction-tools':
        object.option.rt = !object.option.rt;
        if (object.option.rt) {
            $(this).popover({
                content: function(){
                    return '<div id="rt_popover" style="width: 200px">' + rt_popover.html() + '</div>';
                }
            });
            $(this).popover('show');
        } else {
            rt_popover.html($('#rt_popover').html());
            $(this).popover('destroy');
        }
        buttonActive($(this), object.option.rt);
        break;
        case 'layer_pallete':
            var active_state = !$(this).hasClass('active');
            $(".cp-button").removeClass('active');
            if (active_state) {
                $(this).addClass('active');
                currentDrawingId = $(this).val();
                $('#color').show();
                if (typeof drawings[currentDrawingId].color != 'undefined' && drawings[currentDrawingId].color !== null)
                    cp.setHex(drawings[currentDrawingId].color);
            }
            else $('#color').hide();
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
    })
    .on('dblclick', '.zoom-value', function () {
        return false;
    })
    .on('input change', '.zoom-value', function () {
        t.camera.zoom = $(this).val();
        t.camera.updateProjectionMatrix();
    })
    .on('input change', '.alpha-value', function () {
    $(this).attr('value', $(this).val());
    drawings[parseInt($(this).attr('id'))].alpha = parseFloat($(this).val());
    t.redrawTexture();
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