/**

 Viewer for THREE.js objects v 0.9.7

 **/
function viewer(model, options, labels) {
    options = typeof options !== 'undefined' ? options : {
        grid: false,
        ruler: false,
        wireframe: false,
        autorotate: false,
        backgroundColor: '#fffffd',
        cameraFov: 55,
        focalLenght: '',
        lights: 'Cameralight',
        loader: 'utf8Loader',
        controls: 'OrbitControls',
        camera: 'auto',
        cameraDistanceMultiplier: 2,
        scale: 1,
        cameraCoords: {
            x: 100,
            y: 100,
            z: 150
        }
    };

    model = typeof model !== 'undefined' ? model : {
        name: 'no_model',
        texture: '',
        mesh: '',
        mtl: '',
        ambient: '',
        color: '',
        specular: '',
        shininess: ''
    };

    labels = typeof labels !== 'undefined' ? labels : null;

    var firstPass,
        orthographer = false,
        orthocam = false,
        selfObj = this,
        scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera(60, 1 / 1, 2, 5000000),
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: options.preserveDrawingBuffer
        }),
        raycaster = new THREE.Raycaster(),
        //sphere = new THREE.Mesh(new THREE.SphereGeometry( 1, 32, 32 ), new THREE.MeshBasicMaterial( {color:0x349938})),
        line = new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial({color: 0x000033, linewidth: 4})),
        lights = {
            AmbientLight: function () {
                var elem = new THREE.AmbientLight();
                elem.name = 'sceneAmbientLight';
                return elem;
            },
            Cameralight: function () {
                var elem = new THREE.DirectionalLight(0xffffff, 1);
                elem.name = 'sceneCameraLight';
                elem.castShadow = true;
                elem.shadowMapWidth = 2048;
                elem.shadowMaHeight = 2048;

                var d = 150;

                elem.shadowCameraLeft = -d * 1.2;
                elem.shadowCameraRight = d * 1.2;
                elem.shadowCameraTop = d;
                elem.shadowCameraBottom = -d;

                elem.shadowCameraNear = 200;
                elem.shadowCameraFar = 500;
                return elem;
            },
            ManualSetup: function (count, coords) {
                drivenLightsGroup = new THREE.Group();
                drivenLightsGroup.name = 'manualLightGroup';
                for (var i = 0; i < count; i++) {
                    var position = new THREE.Vector3();
                    position.fromArray(coords[i]);
                    //var lightSphere = new THREE.Mesh(new THREE.SphereGeometry(2, 16, 8), new THREE.MeshBasicMaterial({color: Math.random() * 0xffffff}));
                    var lightPoint = new THREE.DirectionalLight(0xffffff, 0.7);
                    lightPoint.name = 'light_' + i;
                    //lightPoint.add(lightSphere);
                    lightPoint.position.copy(position);
                    //lightSphere.position.copy(position);

                    drivenLightsGroup.add(lightPoint);
                }
                ;

                return drivenLightsGroup;
            }
        },
        controls = {
            OrbitControls: function () {
                return new THREE.OrbitControls(camera, renderer.domElement);
            },
            TrackballControls: function () {
                return new THREE.TrackballControls(camera, viewerContainer.domElement);
            }
        },
        pinsGroup = new THREE.Group();

    var control,
        rulerDistance,
        mouseMoveTrigger,
        sceneObjectsMesh = Array(),
        pinPoints = Array(),
        helpers = {},
        intersection = {
            point: new THREE.Vector3(),
            normal: new THREE.Vector3()
        };

    var viewerContainer,
        loadingBar,
        alert,
        alertMessages;

    var gridGroup,
        gridHelper,
        asixHelper;

    var drivenLightsGroup;

    var controllers = {
        ruler: 'false',
        wireframe: 'false',
        grid: 'false',
        autorotate: 'false',
        currentLight: '',
        createLabel: false,
        textures: []
    };

    var label = [],
        newlabel = null;

    alertMessages = {
        noWebglSupport: 'Sorry, but your browser doesn\'t even know what WebGL is.',
        noSupportError: 'No WebGL support found.',
        webglDisabled: 'WebGL disabled.',
        disabledError: 'webGL disabled.'
    };

    var externalCallback = function () {};
    
    function appendTo(object, callback) {
        if (typeof callback === "function") {
            externalCallback = callback;
        }

        if (document.getElementById(object)) {
            viewerContainer = document.getElementById(object);
        } else if (document.getElementsByClassName(object)) {
            var tmp = document.getElementsByClassName(object);
            viewerContainer = tmp[0];
        }
        ;

        var webglMarker = webglDetect();
        if (webglMarker == 2) {
            alert.innerHTML = alertMEssages.noWebglSupport;
            container.appendChild(alert);
            throw new Error(alertMEssages.noSupportError);
        } else if (webglMarker == 1) {
            alert.innerHTML = alertMEssages.webglDisabled;
            container.appendChild(alert);
            throw new Error(alertMEssages.disabledError);
        }
        ;

        if (viewerContainer) {

            loadingBar = document.createElement('div');
            loadingBar.id = 'loading';
            loadingBar.style.position = 'relative';
            loadingBar.style.width = '100%';
            loadingBar.style.height = '100%';

            if (model.poster) {
                loadingBar.style.background = "url('" + model.poster + "') center center / cover";
            }
            alert = document.createElement('div');
            alert.id = 'webGJ_allert';
            alert.style.position = 'relative';
            alert.width = '50%';
            alert.style.margin = '0 auto';
            alert.style.top = '50%';
            alert.style.textAlign = 'center';

            var spinner = document.createElement('div');
            spinner.style.position = 'relative';
            spinner.style.margin = 'auto';
            spinner.style.top = '50%';
            spinner.style.right = 0;
            spinner.style.left = 0;
            spinner.style.bottom = 0;
            spinner.style.width = '5em';
            spinner.style.height = '1.5em';

            $(spinner).html("<i class=\"fa fa-spinner fa-spin fa-3x fa-fw\"></i><span class=\"sr-only\">Loading...</span>");
            $(loadingBar).html(spinner);

            viewerContainer.appendChild(loadingBar);

            // setTimeout(init, 1500);
            init();
        }
        ;
    };

    function init() {
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0xf0f0f0);
        renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
        camera.aspect = viewerContainer.clientWidth / viewerContainer.clientHeight;
        camera.updateProjectionMatrix();

        control = controls[options.controls]();
        control.rotateSpeed = 1.2;
        control.zoomSpeed = 1.2;

        

        helpers.mouseHelper = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 10), new THREE.MeshNormalMaterial());
        helpers.mouseHelper.visible = false;

        pinPoints['intersections'] = Array();
        pinPoints['rulerPoints'] = Array();

        switchEnv('lights', options.lights);

        loadModel(model, function (value) {
            if (value) {

                if (options.camera == 'auto') {
                    camera.position.set(1,0,0);
                    cameraModelFit();
                    camera.updateProjectionMatrix();
                } else if (options.camera == 'manual') {
                    camera.position.set(options.cameraCoords.x, options.cameraCoords.y, options.cameraCoords.z);
                    camera.updateProjectionMatrix();
                }
                ;

                scene.traverse(function (node) {
                    if (node.type == 'Mesh') {
                        node.material.needsUpdate = true;
                    }
                    ;
                });

                viewerContainer.removeChild(loadingBar);
                viewerContainer.appendChild(renderer.domElement);

                if (options.backgroundColor) {
                    switchEnv('background', options.backgroundColor);
                }
                ;

                if (options.ruler) {
                    switchEnv('ruler', true);
                }
                ;
                if (options.grid) {
                    switchEnv('grid', true);
                }
                ;
                if (options.wireframe) {
                    switchEnv('wireframe', true);
                }
                ;
                if (options.autorotate) {
                    switchEnv('autoRotate', true);
                }
                ;
                if (options.focalLenght) {
                    switchEnv('focalLenght', options.focalLenght);
                }
                ;
                if (options.cameraFov) {
                    switchEnv('cameraFov', options.cameraFov);
                }
                ;
                if (options.scale) {
                    switchEnv('scale', options.scale);
                }
                ;

                // projector = new THREE.Projector();
                // document.addEventListener( 'mousedown', onDocumentMouseDown, false );

                renderer.domElement.addEventListener('mousedown', onContainerMouseDown, false);
                window.addEventListener('resize', onWindowResize, false);


                addLabels();
                addCompass();
                animate();
                externalCallback();
            }
            ;
        });
    };

    function redrawTexture(){
        //1. For each background: if loaded - create backgrounds[i].ctx canvas with background image
        for (var i = 0; i < backgrounds.length; i++) {
            if (backgrounds[i].image.complete && backgrounds[i].image.naturalHeight !== 0
                && typeof backgrounds[i].ctx === 'undefined') {
                backgrounds[i].ctx = document.createElement('canvas').getContext('2d');
                backgrounds[i].ctx.canvas.width = backgrounds[i].image.width;
                backgrounds[i].ctx.canvas.height = backgrounds[i].image.height;
                backgrounds[i].ctx.drawImage(backgrounds[i].image, 0, 0);
            }
        }

        //2. Draw
        for (var i = 0; i < backgrounds.length; i++) {
            if (backgrounds[i].path == controllers.currentTexture[0]) {
                //2a. draw current background in main ctx
                if (typeof backgrounds[i].ctx == 'undefined') return;
                canvasWidth = backgrounds[i].ctx.canvas.width;
                canvasHeight = backgrounds[i].ctx.canvas.height;
                ctx.canvas.width = canvasWidth;
                ctx.canvas.height = canvasHeight;
                ctx.globalAlpha = 1;
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.drawImage(backgrounds[i].ctx.canvas, 0, 0);

                //2b. if loaded - create cleaner.ctx canvas with cleaner image
                if (typeof cleaner !== 'undefined' && typeof cleaner.ctx === 'undefined') {
                    cleaner.ctx = document.createElement('canvas').getContext('2d');
                    cleaner.ctx.canvas.width = canvasWidth;
                    cleaner.ctx.canvas.height = canvasHeight;
                    cleaner.ctx.drawImage(cleaner, 0, 0);
                }
                //2c. For each drawing: if loaded - create drawings[i].ctx canvas with drawing image
                // and drawings[i].coloredCtx with colored drawing image
                for (var i = 0; i < drawings.length; i++) {
                    if (drawings[i].image.complete && drawings[i].image.naturalHeight !== 0
                        && typeof drawings[i].ctx === 'undefined') {
                        drawings[i].ctx = document.createElement('canvas').getContext('2d');
                        drawings[i].ctx.canvas.width = canvasWidth;
                        drawings[i].ctx.canvas.height = canvasHeight;
                        drawings[i].ctx.drawImage(drawings[i].image, 0, 0);

                        drawings[i].coloredCtx = document.createElement('canvas').getContext('2d');
                        var coloredCtx = drawings[i].coloredCtx;
                        coloredCtx.canvas.width = canvasWidth;
                        coloredCtx.canvas.height = canvasHeight;
                        coloredCtx.clearRect(0, 0, coloredCtx.canvas.width, coloredCtx.canvas.height);
                        coloredCtx.drawImage(drawings[i].ctx.canvas, 0, 0);
                        if (typeof drawings[i].color === 'string') {
                            coloredCtx.fillStyle = drawings[i].color;
                            coloredCtx.globalCompositeOperation = "source-in";
                            coloredCtx.fillRect(0, 0, coloredCtx.canvas.width, coloredCtx.canvas.height);
                            coloredCtx.globalCompositeOperation = "source-over";
                            drawings[i].currentColor = drawings[i].color;
                        }
                    }
                }
                //2d. For each drawing: if color changed - redraw drawings[i].coloredCtx
                for (var i = 0; i < drawings.length; i++) {
                    if (drawings[i].ctx && typeof drawings[i].color === 'string' &&
                        (typeof drawings[i].currentColor == "undefined" || drawings[i].currentColor != drawings[i].color)) {
                            var coloredCtx = drawings[i].coloredCtx;
                            coloredCtx.clearRect(0, 0, coloredCtx.canvas.width, coloredCtx.canvas.height);
                            coloredCtx.drawImage(drawings[i].ctx.canvas, 0, 0);
                            coloredCtx.fillStyle = drawings[i].color;
                            coloredCtx.globalCompositeOperation = "source-in";
                            coloredCtx.fillRect(0, 0, coloredCtx.canvas.width, coloredCtx.canvas.height);
                            coloredCtx.globalCompositeOperation = "source-over";
                            drawings[i].currentColor = drawings[i].color;
                    }

                }
                //2e. For each drawing: if loaded and cleaner loaded - create drawings[i].minusedCtx canvas
                for (var i = 0; i < drawings.length; i++) {
                    if (typeof drawings[i].ctx != 'undefined' && typeof cleaner != 'undefined'
                    && typeof drawings[i].minusedCtx === 'undefined') {
                        drawings[i].minusedCtx = document.createElement('canvas').getContext('2d');
                        var minusedCtx = drawings[i].minusedCtx;
                        minusedCtx.canvas.width = canvasWidth;
                        minusedCtx.canvas.height = canvasHeight;
                        minusedCtx.clearRect(0, 0, minusedCtx.canvas.width, minusedCtx.canvas.height);
                        minusedCtx.drawImage(drawings[i].ctx.canvas, 0, 0);
                        minusedCtx.globalCompositeOperation = "source-in";
                        minusedCtx.drawImage(cleaner.ctx.canvas, 0, 0);
                        minusedCtx.globalCompositeOperation = "source-over";
                    }
                }
                for (var i = 0; i < drawings.length; i++) {
                    if (drawings[i].alpha < 0) {
                        if (typeof drawings[i].minusedCtx != 'undefined' ) {
                            ctx.globalAlpha = -drawings[i].alpha;
                            ctx.drawImage(drawings[i].minusedCtx.canvas, 0, 0);
                        }
                    }
                }
                for (var i = 0; i < drawings.length; i++) {
                    if (drawings[i].alpha > 0) {
                        if (typeof drawings[i].coloredCtx != 'undefined' ) {
                            ctx.globalAlpha = drawings[i].alpha;
                            ctx.drawImage(drawings[i].coloredCtx.canvas, 0, 0);
                        }
                    }
                }
                if (texture) texture.needsUpdate = true;
                if (material) material.needsUpdate = true;
                return;
            }
        }
    }

    function loadModel(model, callback) {
        var parametersMaterial = {
            specular: 0xffffff,
            shininess: 50,
            shading: THREE.SmoothShading
        };

        if (model.ambient !== undefined && model.ambient !== '') {
            parametersMaterial.ambient = model.ambient;
        }
        if (model.color !== undefined && model.color !== '') {
            parametersMaterial.color = model.color;
        }
        if (!controllers.currentTexture)
            controllers.currentTexture = [];

        if (model.texture !== undefined && model.texture !== '') {
            var modelTextures = [];
            if (typeof model.texture === 'string')
                modelTextures[0] = model.texture;
            else
                modelTextures = model.texture;

            //var texture = new THREE.ImageUtils.loadTexture(modelTextures[0]);
            //parametersMaterial.map = texture;

            controllers.currentTexture.push(modelTextures[0]);
            controllers.textures.push(modelTextures);

        } else {
            //var texture = new THREE.ImageUtils.loadTexture();
            controllers.textures.push(['']);
            controllers.currentTexture.push('');
        }

        var modelDrawings = null;
        if (model.drawing !== undefined && model.drawing !== '') {
            modelDrawings = model.drawing;
        }

        var modelCleaner = null;
        if (model.cleaner !== undefined && model.cleaner !== '') {
            modelCleaner = model.cleaner;
        }
        ctx = document.createElement('canvas').getContext('2d');

        backgrounds = [];
        if (controllers.textures[0].length >0)
        {
            for (var i = 0; i < controllers.textures[0].length; i++) {
                bgItem = new Image();
                backgrounds.push({"image": bgItem, "path": controllers.textures[0][i]});
                bgItem.src = controllers.textures[0][i];
                bgItem.onload = () => {
                    redrawTexture();
                }
            }
            drawings = [];
            if (modelDrawings) {
                for (var i = 0; i < modelDrawings.length; i++) {
                    drawing = new Image();
                    drawing.src = modelDrawings[i];
                    var alpha = 1;
                    var color = null;
                    if (Array.isArray(model.layersParams)){
                        if (typeof model.layersParams[i].alpha != 'undefined') alpha = model.layersParams[i].alpha;
                        if (typeof model.layersParams[i].color != 'undefined') color = model.layersParams[i].color;
                    }

                    drawings.push({"image": drawing, "alpha": alpha, "color": color});
                    drawing.onload = () => {
                        redrawTexture();
                    }
                }
            }
            if (modelCleaner) {
                img_cleaner = new Image();
                img_cleaner.src = modelCleaner;
                img_cleaner.onload = () => {
                    cleaner = img_cleaner;
                    redrawTexture();
                }
            }
            texture = new THREE.CanvasTexture(ctx.canvas);
            parametersMaterial.map = texture;
        }

        material = new THREE.MeshLambertMaterial(parametersMaterial);

        var onProgress = function (progress) {

        };

        var onError = function (e) {
            console.log('loading error: ' + e);
        };

        switch (options.loader) {
            case 'jsonLoader':
                loader = new THREE.JSONLoader();

                loader.loadAjaxJSON(
                    loader,
                    model.mesh,
                    function (geometry) {
                        geometry.mergeVertices();
                        geometry.computeVertexNormals();
                        object = new THREE.Mesh(geometry);
                        object.material = material;
                        object.material.needsUpdate = true;
                        object.name = model.name;
                        if (options.objectCoords) {
                            object.position.x = objectDefaultCoords.x;
                            object.position.y = objectDefaultCoords.y;
                            object.position.z = objectDefaultCoords.z;
                        }
                        ;
                        scene.add(object);
                        loadingBar.loaded = true;
                        sceneObjectsMesh.push(object);

                        callback(true);
                    }, '', onProgress);
                break;
            case 'objLoader':
                loader = new THREE.OBJLoader();

                loader.load(
                    model.mesh,
                    function (object) {
                        object.name = model.name;
                        if (options.objectCoords) {
                            object.position.x = objectDefaultCoords.x;
                            object.position.y = objectDefaultCoords.y;
                            object.position.z = objectDefaultCoords.z;
                        }
                        ;
                        object.traverse(function (node) {
                            if (node.type == 'Mesh') {
                                node.geometry.computeVertexNormals();
                                node.geometry.normalizeNormals();
                                node.geometry.computeBoundingBox();
                                node.geometry.computeBoundingSphere();
                                node.material = material;
                                node.material.needsUpdate = true;
                                sceneObjectsMesh.push(node);
                            }
                            ;
                        });
                        scene.add(object);

                        callback(true);
                    }, onProgress, onError
                );
                break;
            case 'objMtlLoader':
                loader = new THREE.OBJMTLLoader();
                loader.load(
                    model.mesh,
                    model.mtl,
                    function (object) {
                        object.children.forEach(function (elem) {
                            elem.geometry.computeVertexNormals();
                        });
                        object.name = model.name;
                        if (options.objectCoords) {
                            object.position.x = objectDefaultCoords.x;
                            object.position.y = objectDefaultCoords.y;
                            object.position.z = objectDefaultCoords.z;
                        }
                        ;
                        sceneObjectsMesh.push(object);

                        callback(true);
                    }, onProgress, onError
                );
                break;
            case 'utf8Loader':
                loader = new THREE.UTF8Loader();

                loader.load(
                    model.mesh,
                    function (object) {
                        object.name = model.name;
                        if (options.objectCoords) {
                            object.position.x = objectDefaultCoords.x;
                            object.position.y = objectDefaultCoords.y;
                            object.position.z = objectDefaultCoords.z;
                        }
                        ;
                        object.traverse(function (node) {
                            if (node.type == 'Mesh') {
                                node.geometry.computeVertexNormals();
                                node.geometry.normalizeNormals();
                                node.geometry.computeBoundingBox();
                                node.geometry.computeBoundingSphere();
                                if (texture !== undefined) {
                                    node.material.texture = texture;
                                }
                                node.material.needsUpdate = true;
                                sceneObjectsMesh.push(node);
                            }
                            ;
                        });

                        scene.add(object);
                        callback(true);
                    },
                    {
                        normalizeRGB: true
                    }
                );
                break;
            case 'gltfLoader':
                loader = new THREE.GLTFLoader();

                loader.load(
                    model.mesh,
                    function (object) {
                        if (options.objectCoords) {
                            object.position.x = objectDefaultCoords.x;
                            object.position.y = objectDefaultCoords.y;
                            object.position.z = objectDefaultCoords.z;
                        }
                        ;
                        object.scene.traverse(function (node) {
                            if (node.type == 'Mesh') {
                                node.geometry.computeVertexNormals();
                                node.geometry.normalizeNormals();
                                node.geometry.computeBoundingBox();
                                node.geometry.computeBoundingSphere();
                                node.material.needsUpdate = true;
                                sceneObjectsMesh.push(node);
                            }
                            ;
                        });
                        scene.add(object.scene);

                        callback(true);
                    }, onProgress, onError
                );
                break;
            case 'dracoLoader':
                THREE.DRACOLoader.setDecoderPath('/js/three/draco/');
                THREE.DRACOLoader.setDecoderConfig({type: 'js'});
                var loader = new THREE.DRACOLoader();

                loader.load(model.mesh, function (geometry) {
                    geometry.computeVertexNormals();
                    geometry.normalizeNormals();
                    geometry.computeBoundingBox();
                    geometry.computeBoundingSphere();

                    var mesh = new THREE.Mesh(geometry, material);
                    material.needsUpdate = true;
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;

                    if (options.objectCoords) {
                        mesh.position.x = objectDefaultCoords.x;
                        mesh.position.y = objectDefaultCoords.y;
                        mesh.position.z = objectDefaultCoords.z;
                    }
                    ;

                    scene.add(mesh);

                    sceneObjectsMesh.push(mesh);

                    // Release decoder resources.
                    THREE.DRACOLoader.releaseDecoderModule();

                    callback(true);

                }, onProgress, onError);
                break;
        }
        ;

    };

    function addLabels() {
        if (labels) {
            var name_texture = '/img/labels/label.png';
            var r = getBoundingSphereRadius(),
                n = r / 30;
            $.each(labels, function (index, value) {
                if (index < 10) {
                    name_texture = '/img/labels/label-' + index + '.png';
                } else {
                    name_texture = '/img/labels/label.png';
                }
                var spriteMap = new THREE.ImageUtils.loadTexture(name_texture);
                var material = new THREE.SpriteMaterial({map: spriteMap});
                var sprite = new THREE.Sprite(material);
                scene.add(sprite);
                sprite.position.set(value.position.x, value.position.y, value.position.z);
                sprite.name = value.id;
                sprite.description = value.description;
                sprite.scale.set(n, n, n);
                label.push(sprite);
            });
        }
    }

    function addCompass()
    {
        if (typeof model.compass == 'undefined') return;
        var loader = new THREE.FontLoader();
        loader.load( '/../js/three/helvetiker_regular.typeface.json', function ( font ) {
            group = new THREE.Group();
            var materialN = new THREE.LineBasicMaterial({
                color: 0xff0000
            });
            var materialE = new THREE.LineBasicMaterial({
                color: 0x00ff00
            });
            var materialUp = new THREE.LineBasicMaterial({
                color: 0x0000ff
            });
            var pointsN = [];
            pointsN.push( new THREE.Vector3( 0, 0, 0 ) );
            pointsN.push( new THREE.Vector3( 0, 0, 50 ) );
            var geometryN = new THREE.BufferGeometry().setFromPoints( pointsN );
            var lineN = new THREE.Line( geometryN, materialN );
            group.add( lineN );

            var pointsE = [];
            pointsE.push( new THREE.Vector3( 0, 0, 0 ) );
            pointsE.push( new THREE.Vector3( -50, 0, 0 ) );
            var geometryE = new THREE.BufferGeometry().setFromPoints( pointsE );
            var lineE = new THREE.Line( geometryE, materialE );
            group.add( lineE );

            var pointsUp = [];
            pointsUp.push( new THREE.Vector3( 0, 0, 0 ) );
            pointsUp.push( new THREE.Vector3( 0, 50, 0 ) );
            var geometryUp = new THREE.BufferGeometry().setFromPoints( pointsUp );
            var lineUp = new THREE.Line( geometryUp, materialUp );
            group.add( lineUp );

            var params = {
                size: 5,
                height: 2,
                curveSegments: 6,
                font: font,
                style: "normal"
            }

            var textNGeo = new THREE.TextGeometry('N', params);
            var  textN = new THREE.Mesh(textNGeo , materialN);
            textN.position.x = 0;
            textN.position.y = 0;
            textN.position.z = 60;
            //textN.rotation = camera.rotation;
            group.add(textN);

            var textEGeo = new THREE.TextGeometry('E', params);
            var  textE = new THREE.Mesh(textEGeo , materialE);
            textE.position.x = -60;
            textE.position.y = 0;
            textE.position.z = 0;
            //textN.rotation = camera.rotation;
            group.add(textE);

            var textUpGeo = new THREE.TextGeometry('Up', params);
            var  textUp = new THREE.Mesh(textUpGeo , materialUp);
            textUp.position.x = 0;
            textUp.position.y = 60;
            textUp.position.z = 0;
            //textN.rotation = camera.rotation;
            group.add(textUp);

            scene.add( group );
        } );

    }

    function webglDetect() {
        if (!!window.WebGLRenderingContext) {
            var canvas = document.createElement("canvas"),
                names = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"],
                context = false;

            for (var i = 0; i < 4; i++) {
                try {
                    context = canvas.getContext(names[i]);
                    if (context && typeof context.getParameter == "function") {
                        //enabled
                        return 0;
                    }
                    ;
                } catch (e) {
                }
                ;
            }
            ;
            //supported, but disabled
            return 1;
        } else {
            //not supported
            return 2;
        }
        ;
    };

    function switchEnv(object, value) {
        value = typeof value !== 'undefined' ? value : false;
        switch (object) {
            case 'reset-dots':
                resetDots();
                break;
            case 'shot':
                orthoShot(value);
                break;
            case 'toggle-ortho':
                orthographer = value;
                toggleOrthographer(value);
                break;
            case 'swCam':
                toggleOrthoCam();
                break;
            case 'align':
                alignCam();
                break;
            case 'reset':
                resetCam();
                break;
            case 'ruler':
                controllers.ruler = value;
                if (!value) {
                    pinsGroup.traverse(function (node) {
                        if (node.visible) {
                            node.visible = false;
                        }
                        ;
                    });
                } else {
                    pinsGroup.traverse(function (node) {
                        if (!node.visible) {
                            node.visible = true;
                        }
                        ;
                    });
                }
                ;
                break;
            case 'createLabel':
                if (value && typeof (value) == 'boolean') {

                    controllers.createLabel = value;
                } else {
                    controllers.createLabel = false;
                }
                ;
                break;
            case 'wireframe':
                controllers.wireframe = value;
                if (value && typeof (value) == 'boolean') {
                    options.wireframe = true;
                    sceneObjectsMesh.forEach(function (elem) {
                        elem.material.wireframe = true;
                        elem.material.transparent = true;
                        elem.material.depthTest = false;
                        elem.material.opacity = 0.25;
                    });
                } else {
                    options.wireframe = false;
                    sceneObjectsMesh.forEach(function (elem) {
                        elem.material.wireframe = false;
                        elem.material.depthTest = true;
                        elem.material.opacity = 1;
                        elem.material.transparent = false;
                    });
                }
                ;

                break;
            case 'grid':
                controllers.grid = value;
                if (value && typeof (value) == 'boolean') {
                    gridGroup = new THREE.Group();
                    gridHelper = new THREE.GridHelper(200, 10);
                    asixHelper = new THREE.AxesHelper(100);
                    // gridHelper.setColors(0x0000ff, 0x808080);
                    gridHelper.position.y = -100;
                    gridGroup.add(gridHelper);
                    gridGroup.add(asixHelper);

                    scene.add(gridGroup);
                } else {
                    scene.remove(gridGroup);
                }
                ;
                break;
            case 'lights':
                if (typeof (value) == 'object') {
                    if (controllers.currentLight.name == 'sceneAmbientLight' || controllers.currentLight.name == 'sceneCameraLight') {
                        scene.remove(controllers.currentLight);
                    }
                    ;

                    switch (value.state) {
                        case'init':
                            var lightElem = lights.ManualSetup(value.count, value.coords);
                            scene.add(lightElem);
                            break;
                        case'setedElem':
                            var el = drivenLightsGroup.getObjectByName('light_' + value.elemN);
                            var vec = new THREE.Vector3();
                            vec.fromArray(value.coords);
                            el.position.copy(vec);
                            el.children[0].position.copy(vec);
                            break;
                    }
                    ;

                    controllers.currentLight = drivenLightsGroup;
                } else if (typeof (value) == 'string') {

                    if (scene.children.length > 0) {
                        scene.children.forEach(function (item) {
                            if (item == controllers.currentLight) {
                                scene.remove(item);
                            }
                        });
                    }

                    light = lights[value]();
                    scene.add(light);
                    controllers.currentLight = light;
                    if(light.name == 'CameraLight')
                    {
                        lightEnabled = true;
                    }
                    else
                    {
                        lightEnabled = false;
                    }

                    if (sceneObjectsMesh.length > 0) {
                        sceneObjectsMesh[0].material.needsUpdate = true
                    }

                }
                ;
                break;
            case 'background':
                if (value) {
                    renderer.setClearColor(value);
                }
                ;
                break;
            case 'autoRotate':
                if (value && typeof (value) == 'boolean') {

                    control.autoRotate = value;
                    controllers.autorotate = value;
                } else {
                    control.autoRotate = false;
                    controllers.autorotate = false;
                }
                ;
                break;
            case 'cameraFov':
                if (value && typeof (value) == 'number') {
                    camera.fov = value;
                    camera.updateProjectionMatrix();
                }
                ;
                break;
            case 'focalLenght':
                if (value && typeof (value) == 'number') {
                    //console.log(camera);
                    camera.setLens(value);
                }
                ;
                break;
            case 'bbox':
                break;
            case 'label':
                if (label.length !== 0) {
                    $.each(label, function (index, item) {
                        item.visible = !item.visible;
                    });
                }
                break;
            case 'textureDisable':
                if (sceneObjectsMesh.length > 0) {
                    $.each(sceneObjectsMesh, function (i, item) {
                        if (item.type === 'Mesh') {
                            if (!controllers.originMaterial) {
                                controllers.originMaterial = [];
                            }
                            if (controllers.originMaterial[i] === undefined) {
                                controllers.originMaterial[i] = item.material;
                            }

                            if (value) {
                                item.material = new THREE.MeshLambertMaterial({
                                    color: 0xdddddd,
                                    shading: THREE.SmoothShading
                                });
                                texEnabled = false;

                            } else if (controllers.originMaterial[i] !== undefined) {
                                item.material = controllers.originMaterial[i];
                                texEnabled = true;
                            }

                        }
                    });
                }
                console.log(texEnabled);
                switchEnv('wireframe', options.wireframe);
                break;
            case 'scale':
                if (sceneObjectsMesh.length > 0 && value && value * 1 === value) {
                    $.each(sceneObjectsMesh, function (i, item) {
                        if (item.type === 'Mesh') {
                            item.scale.set(value, value, value);
                        }
                    });
                }
                break;
            case 'textureChange':
                if (sceneObjectsMesh.length > 0) {
                    $.each(sceneObjectsMesh, function (i, item) {
                        if (item.type === 'Mesh') {
                            ind = controllers.textures[i].indexOf(controllers.currentTexture[i]);
                            ind = (ind+1 === controllers.textures[i].length)? 0: ind+1; 

                            newtexture = controllers.textures[i][ind];
                            controllers.currentTexture[i] = newtexture;
 /*                           if(newtexture !== '')
                                newtexture = new THREE.ImageUtils.loadTexture(newtexture);
                            else
                                newtexture = new THREE.ImageUtils.loadTexture();   
                            
                            item.material = new THREE.MeshLambertMaterial({
                                specular: 0xffffff,
                                shininess: 50,
                                shading: THREE.SmoothShading,
                                map: newtexture
                            });*/
                            redrawTexture();
                        }
                    });
                }
                
                switchEnv('wireframe', options.wireframe);
                break;
        }
        ;
    };

    function getBoundingSphereRadius() {
        var radius = 0;
        sceneObjectsMesh.forEach(function (elem) {
            var bbox = new THREE.BoxHelper(elem);
            if (bbox.geometry.boundingSphere.radius >= radius) {
                radius = bbox.geometry.boundingSphere.radius;
            }
            ;
        });
        return radius;
    };

    function getObjectFromGroup(objectsGroup, elemMouseCoords) {
        var intersects;
        var mousePosition = {};

        mousePosition.x = (elemMouseCoords.x / viewerContainer.clientWidth) * 2 - 1;
        mousePosition.y = -(elemMouseCoords.y / viewerContainer.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mousePosition, camera);

        intersects = raycaster.intersectObjects(objectsGroup);

        if (intersects.length > 0) {
            return intersects[0];
        } else {
            return false;
        }
        ;
    };

    function getObjectSplite(objectsGroup, elemMouseCoords) {
        var intersects;
        var mousePosition = {};

        mousePosition.x = (elemMouseCoords.x / viewerContainer.clientWidth) * 2 - 1;
        mousePosition.y = -(elemMouseCoords.y / viewerContainer.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mousePosition, camera);

        intersects = raycaster.intersectObjects(objectsGroup);

        if (intersects.length > 0) {
            return intersects[0];
        } else {
            return false;
        }
        ;
    };

    function CreateSplite(intersects) {
        if (intersects && !newlabel) {
            var r = getBoundingSphereRadius(),
                p = r / 30,
                w = r / 60;
            var n = intersects.face.normal.clone().multiplyScalar(w).add(intersects.point);
            var spriteMap = new THREE.ImageUtils.loadTexture('/img/labels/label.png');
            var material = new THREE.SpriteMaterial({map: spriteMap});
            var sprite = new THREE.Sprite(material);
            scene.add(sprite);
            sprite.position.copy(n);
            sprite.scale.set(p, p, p);

            newlabel = sprite;
            scene.add(sprite);
        } else if (intersects && newlabel) {
            var n = intersects.face.normal.clone().multiplyScalar(0.3).add(intersects.point);
            newlabel.position.copy(n);
        }
    };

    function getDistance() {
        if (pinPoints['intersections'].length == 2 && controllers.ruler == true) {
            var x = pinPoints['intersections'][1].x - pinPoints['intersections'][0].x;
            var y = pinPoints['intersections'][1].y - pinPoints['intersections'][0].y;
            var z = pinPoints['intersections'][1].z - pinPoints['intersections'][0].z;

            var distance = Math.sqrt(x * x + y * y + z * z);
            distance = distance.toFixed(2);
            return distance;
        } else if (pinPoints['intersections'].length !== 2 && controllers.ruler == true) {
            return 0;
        } else if (controllers.ruler == false) {
            return null;
        }
        ;
    };

    function getNewLabel() {
        return newlabel;
    };

    function rulerBuild(intersects) {
        if (!sceneObjectsMesh[0]) return;

        if (typeof intersects == 'object' && pinsGroup.children.length < 2) {
            var onePin = new THREE.Group();
            onePin.name = 'pin';
            var p = intersects.point;

            pinPoints['intersections'].push(p);

            helpers.mouseHelper.position.copy(p);
            intersection.point.copy(p);

            var n = intersects.face.normal.clone();
            var rulerDrawPoint = n.clone();
            rulerDrawPoint.add(intersects.point);
            //n.multiplyScalar(5);
            //n.add(intersects.point);
            pinPoints['rulerPoints'].push(rulerDrawPoint);

            intersection.normal.copy(intersects.face.normal);
            helpers.mouseHelper.lookAt(n);

            var pinLine = new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial({
                color: 0x0000FF,
                linewidth: 4
            }));
            pinLine.name = 'pinline';
            pinLine.geometry.vertices.push(new THREE.Vector3());
            pinLine.geometry.vertices.push(n);
            pinLine.geometry.verticesNeedUpdate = true;
            pinLine.position.copy(p);

            

            var pinSphere = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), new THREE.MeshBasicMaterial({color: 0x349938}));
            pinSphere.position.copy(pinLine.geometry.vertices[1]);
            pinSphere.name = 'sphere';

            onePin.add(pinLine);
            onePin.add(pinSphere);

            pinsGroup.children.push(onePin);

            scene.add(onePin);

            if (pinsGroup.children.length == 2) {

                var material = new THREE.LineBasicMaterial({color: 0x000033, linewidth: 30});
                var lineGeometry = new THREE.Geometry();
                lineGeometry.vertices.push(pinPoints['rulerPoints'][0]);
                lineGeometry.vertices.push(pinPoints['rulerPoints'][1]);
                var line = new THREE.Line(lineGeometry, material);
                scene.add(line);
                pinsGroup.children.push(line);
            }
            ;
        } else if (typeof intersects == 'object' && pinsGroup.children.length == 3) {
            pinsGroup.children.forEach(function (element, index) {
                scene.remove(element);
            });
            scene.remove(pinsGroup);
            pinPoints['intersections'] = Array();
            pinPoints['rulerPoints'] = Array();
            pinsGroup = new THREE.Group();
            scene.add(pinsGroup);
            rulerBuild(intersects);
        }
        ;
    };

    function updateRulerScale()
    {
        if(pinsGroup === undefined || pinsGroup.length < 1) return;
        let cp = new THREE.Vector3().copy(camera.position);
        let tp = new THREE.Vector3().copy(control.target);
        let dist = new THREE.Vector3().subVectors(cp,tp).length();

        pinsGroup.children.forEach((child, index) => {
            if(child.name === "pin")
            {
                let p = new THREE.Vector3(0,0,0);
                let d = new THREE.Vector3(0,0,0);
                child.traverse((ch) => {    
                    if(ch.name === 'pinline')
                    {
                        p.copy(ch.position);
                        d.copy(ch.geometry.vertices[1]);
                        d.normalize();
                        d.multiplyScalar(dist * (1/camera.zoom) / 10);
                        ch.geometry.vertices[1].copy(d);
                        ch.geometry.verticesNeedUpdate = true;
                    }
                });
                child.traverse((ch1) => {    
                    if(ch1.name === 'sphere')
                    {
                        ch1.position.copy(d.add(p));
                    }
                });
            }
        });
    }

    function saveOptions() {
        var savedOptions = {};

        controllers.ruler == false ? savedOptions.ruler = true : savedOptions.ruler = false;
        controllers.wireframe == false ? savedOptions.wireframe = true : savedOptions.wireframe = false;
        controllers.grid == false ? savedOptions.grid = true : savedOptions.grid = false;
        controllers.autorotate == false ? savedOptions.autorotate = true : savedOptions.autorotate = false;

        savedOptions.loader = options.loader;
        savedOptions.controls = options.controls;
        savedOptions.camera = options.camera;
        savedOptions.cameraDistanceMultiplier = options.cameraDistanceMultiplier;
        savedOptions.cameraCoords = {x: camera.position.x, y: camera.position.y, z: camera.position.z};
        savedOptions.backgroundColor = (function () {
            var color = renderer.getClearColor();
            return 'rgd(' + color.r + ',' + color.g + ',' + color.b + ')';
        })();

        switch (controllers.currentLight.name) {
            case'manualLightGroup':
                savedOptions.lights = {
                    state: 'init',
                    count: controllers.currentLight.children.length,
                    coords: (function () {
                        var tmpArr = Array();
                        controllers.currentLight.children.forEach(function (elem) {
                            var elemCoords = [elem.position.x, elem.position.y, elem.position.z];
                            tmpArr.push(elemCoords);
                        });
                        return tmpArr;
                    })()
                };
                break;
            case'sceneCameraLight':
                savedOptions.lights = 'Cameralight';
                break;
            case'sceneAmbientLight':
                savedOptions.lights = 'AmbientLight';
                break;
        }
        ;

        return savedOptions;
    };

    function onContainerMouseDown(event) {
        renderer.domElement.addEventListener('mousemove', onContainerMouseMove, false);
        renderer.domElement.addEventListener('mouseup', onContainerMouseUp, false);
        renderer.domElement.addEventListener('mouseout', onContainerMouseOut, false);

        mouseMoveTrigger = 0;
    };

    function onContainerMouseMove(event) {
        if (event.movementX === 0 && event.movementY === 0) {
            mouseMoveTrigger = 0;
        } else {
            mouseMoveTrigger = 1;

        }
    };

    function onContainerMouseUp(event) {
        renderer.domElement.removeEventListener('mousemove', onContainerMouseMove, false);
        renderer.domElement.removeEventListener('mouseup', onContainerMouseUp, false);
        renderer.domElement.removeEventListener('mouseout', onContainerMouseOut, false);

        if (mouseMoveTrigger == 0) {

            var mouse = {};
            mouse.x = event.offsetX == undefined ? event.layerX : event.offsetX;
            mouse.y = event.offsetY == undefined ? event.layerY : event.offsetY;

            if (controllers.ruler == true) {
                var intersects = getObjectFromGroup(sceneObjectsMesh, mouse);

                rulerBuild(intersects);
            }
            ;

            var intersects = getObjectSplite(label, mouse);
            if (intersects && intersects.object.type == 'Sprite') {
                try {
                    $.fancybox.open({
                        src: '<div class="message">' + intersects.object.description + '</div>',
                        type: 'html',
                        smallBtn: false,
                        parentEl: '.' + $(viewerContainer).attr('class')
                    });

                } catch (e) {
                }
            } else if (controllers.createLabel) {
                var intersects = getObjectSplite(sceneObjectsMesh, mouse);
                CreateSplite(intersects);
            }
        }
        ;
    };

    

    function onContainerMouseOut(event) {
        renderer.domElement.removeEventListener('mousemove', onContainerMouseMove, false);
        renderer.domElement.removeEventListener('mouseup', onContainerMouseUp, false);
        renderer.domElement.removeEventListener('mouseout', onContainerMouseOut, false);
    };

    function onWindowResize() {
        document.body.style.overflow = 'hidden';
        camera.aspect = viewerContainer.clientWidth / viewerContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
        effectComposer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
    };

    function animate() {
        requestAnimationFrame(animate);
        render();
    };

    function render() {
        //camera.lookAt(scene.position);
        updateOrthoCam();
        control.update();
        if (scene.getObjectByName('sceneCameraLight', true)) {
            var elem = scene.getObjectByName('sceneCameraLight', true);
            elem.position.copy(camera.position);
        }
        if (typeof group != 'undefined' && typeof model.compass != 'undefined') {
            group.rotation.copy( camera.rotation );
            group.position.copy (camera.position);
            var s = Math.tan( camera.fov * Math.PI / 180 / 2 ) * options.cameraCoords.z ;
            group.scale.set(s/200,s/200,s/200)
            group.translateZ(- options.cameraCoords.z);
            group.translateY(s  * 6/10);
            group.translateX(s * camera.aspect * 6/10);
            group.rotation.x -=  camera.rotation.x - model.compass.up * Math.PI / 180;
            group.rotation.y -=  camera.rotation.y - model.compass.n * Math.PI / 180;
            group.rotation.z -=  camera.rotation.z;
            group.updateMatrix();
        }
        if(firstPass === undefined)
        {
            firstPass = true;
            control.saveState();
            control.screenSpacePanning = true;
            scene.add(co);
            scene.add(p1);
            scene.add(p2);
            scene.add(p3);
            createScaleObject();
            createScaleLabel();
            SetupComposer();
        }
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh
                && child.geometry.type === 'SphereGeometry') {
                updateDotScale(child)
            }
        });
        updateRulerScale();
        updateScaleObject();
        testRulerSizeX();
        checkOutline();
        /*
        updateDotScale(p1);
        updateDotScale(p2);
        updateDotScale(p3);
        */
        //renderer.render(scene, orthocam ? co : camera);
        if(orthocam)
        {
            effectComposer.passes[0].enabled = false;
            effectComposer.passes[1].enabled = true;
            if(enableOutline)
            {
                effectComposer.passes[2].enabled = false;
                effectComposer.passes[3].enabled = true;
            }
        }
        else
        {
            effectComposer.passes[0].enabled = true;
            effectComposer.passes[1].enabled = false;
            if(enableOutline)
            {
                effectComposer.passes[2].enabled = true;
                effectComposer.passes[3].enabled = false;
            }
        }
        effectComposer.render();
    };

    //orthoshotext----------------------------------------------------------------------------------------------------------------------------
    const GLOBAL_UP = new THREE.Vector3(0,1,0);
    var cameraTarget = new THREE.Vector3();
    var co = new THREE.OrthographicCamera(-1,1,1,-1,1,5000000);
    var sphG = new THREE.SphereGeometry(1,16,16);
    var sphM = new THREE.MeshBasicMaterial({color: 0xFF0000});
    var p1 = new THREE.Mesh(sphG,sphM),
        p2 = new THREE.Mesh(sphG,sphM),
        p3 = new THREE.Mesh(sphG,sphM);
    

    var tri;

    p1.visible = false;
    p2.visible = false;
    p3.visible = false;

    function updateDotScale(dot)
    {
        let cp = new THREE.Vector3().copy(camera.position);
        let tp = new THREE.Vector3().copy(control.target);
        let d = new THREE.Vector3().subVectors(cp,tp).length();
        //console.log(d);
        let s = d * (1/camera.zoom) / 60;
        dot.scale.set(s,s,s);
    }

    function cameraModelFit()
    {
        let opos = new THREE.Vector3();
        let hFov = (camera.fov * Math.PI / 180)/2;
        let r = getBoundingSphereRadius();
        let d;
        d = r / Math.tan(hFov);
        opos.copy(camera.position);
        opos.normalize();
        camera.position.copy(opos.multiplyScalar(d));
        updateDotScale(p1);
        updateDotScale(p2);
        updateDotScale(p3);
    }

    function updateOrthoCam(square) {
        let halfSizeX,
            halfSizeY;
        let fov = (camera.fov * Math.PI / 180)/camera.zoom;
        let cp = new THREE.Vector3().copy(camera.position);
        let tp = new THREE.Vector3().copy(control.target);
        let d = new THREE.Vector3().subVectors(cp,tp).length();
        halfSizeY = Math.tan(fov / 2) * d;
        halfSizeX = halfSizeY * camera.aspect;
        co.left = -halfSizeX;
        co.right = halfSizeX;
        co.top = halfSizeY;
        co.bottom = -halfSizeY;
        co.position.copy(camera.position);
        co.rotation.copy(camera.rotation);
        co.updateProjectionMatrix();
    }

    function orthoShot(resolution)
    {
        tri.clear();
        let ps = new THREE.Vector2();
        renderer.getSize(ps);
        renderer.setSize(resolution,resolution);
        updateOrthoCam(true);
        renderer.render(scene, co);
        downloadImage(renderer.domElement.toDataURL("image/jpeg", 1));
        renderer.setSize(ps.x,ps.y);
    }

    function downloadImage(url)
    {
        let a = document.createElement('a');
        document.body.appendChild(a);
        a.href = url;
        a.download = "image.jpg";
        a.click()
        document.body.removeChild(a);
    }

    function alignCam() {
        if(tri !== undefined && tri.isReady())
        {
            
            let norm = new THREE.Vector3();
            tri.getNormal(norm);
            let camDir = new THREE.Vector3();
            camera.getWorldDirection(camDir);

            if(camDir.dot(norm) >= 0)
            {
                norm = norm.multiplyScalar(-1);
            }

            let cen = new THREE.Vector3();
            //tri.getCenter(cen);
            cen.copy(control.target)
            
            let d = camera.position.distanceTo(cen);
            
            //control.target.copy(cen);
            camera.position.copy(cen.add(norm.multiplyScalar(d)));
            control.update();
            camera.updateProjectionMatrix();
            updateOrthoCam();
        }
    }

    function toggleOrthoCam()
    {
        orthocam = !orthocam;
    }

    function toggleOrthographer(value)
    {
        console.log('toggled ' + value);
        if(value)
        {
            renderer.domElement.addEventListener('click',orthoClickHandler);
            tri = new triangle();
        }
        else
        {
            tri.clear();
            tri = undefined;
            renderer.domElement.removeEventListener('click',orthoClickHandler);
        }
    }

    function orthoClickHandler(event)
    {
        if(mouseMoveTrigger === 0)
        {
            console.log('click');
            //mouse = new THREE.Vector2(((event.clientX - renderer.domElement.offsetLeft) / renderer.domElement.clientWidth) * 2 - 1, 
            //                        -(((event.clientY - renderer.domElement.offsetTop) / renderer.domElement.clientHeight) * 2 - 1));
            var mouse = {};
            mouse.x = event.offsetX == undefined ? event.layerX : event.offsetX;
            mouse.y = event.offsetY == undefined ? event.layerY : event.offsetY;

            var mousePosition = {};
            mousePosition.x = (mouse.x / viewerContainer.clientWidth) * 2 - 1;
            mousePosition.y = -(mouse.y / viewerContainer.clientHeight) * 2 + 1;

            raycaster.setFromCamera(new THREE.Vector2().set(mousePosition.x,mousePosition.y), orthocam ? co : camera);
            var intrscts = raycaster.intersectObject( sceneObjectsMesh[0] );
            if(intrscts.length > 0)
            {
                tri.add(intrscts[0].point);
            }
        }
    }

    function resetDots(){
        tri.clear();
    }

    function resetCam(){
        control.reset();
    }

    function triangle() {
        var v1,
            v2,
            v3,
            center,
            normal,
            ready = false;

        function calcCenter(c)
        {
            center = new THREE.Vector3();
            center.add(v1).add(v2).add(v3);
            center.divideScalar(3);
            c.copy(center);
        }

        function calcNormal(n)
        {
            let v12 = new THREE.Vector3();
            let v13 = new THREE.Vector3();
            v12.subVectors(v2,v1);
            v13.subVectors(v3,v1);
            v12.cross(v13);
            normal = v12.normalize();
            n.copy(normal);
        }

        function addVertex(v)
        {
            if(v1 === undefined)
            {
                v1 = new THREE.Vector3().copy(v);
                p1.position.copy(v1);
                p1.visible = true;
            }
            else if(v2 === undefined)
            {
                v2 = new THREE.Vector3().copy(v);
                p2.position.copy(v2);
                p2.visible = true;
            }
            else if(v3 === undefined)
            {
                v3 = new THREE.Vector3().copy(v);
                p3.position.copy(v3);
                p3.visible = true;
                ready = true;
            }
        }

        function isReady()
        {
            return ready;
        }

        function getNormal(n)
        {
            return calcNormal(n);
        }

        function getCenter(c)
        {
            return calcCenter(c);
        }

        function clear()
        {
            v1=v2=v3=normal=center=undefined;
            p1.visible = false;
            p2.visible = false;
            p3.visible = false;
            ready=false;
        }

        
        

        

        return {
            add: addVertex,
            isReady: isReady,
            getNormal: getNormal,
            getCenter:getCenter,
            clear: clear,
            center: center,
            normal: normal,
        }
    }

    
    const scaleHeight = 2; //percents
    const scaleMaxWidth = 10; //percents
    const scaleMinWidth = 1; //percents
    const scalePosHeight = -90; //percents
    const scalePosWidth = -70; //percents
    var scaleObj;
    var scaleText;
    function createScaleObject()
    {
        let vSize = co.top - co.bottom;
        let hSize = co.right - co.left;
        let cp = new THREE.Vector3().copy(camera.position);
        let tp = new THREE.Vector3().copy(control.target);
        let d = new THREE.Vector3().subVectors(cp,tp).length();
        let scaleGeom = new THREE.PlaneGeometry(1,1);
        let uvs = scaleGeom.faceVertexUvs[ 0 ];
        uvs[ 0 ][ 0 ].set( 0, 1 );
        uvs[ 0 ][ 1 ].set( 0, 0 );
        uvs[ 0 ][ 2 ].set( 1, 1 );
        uvs[ 1 ][ 0 ].set( 0, 0 );
        uvs[ 1 ][ 1 ].set( 1, 0 );
        uvs[ 1 ][ 2 ].set( 1, 1 );
        let scaleMat = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, depthTest: false, transparent: true});
        scaleObj = new THREE.Mesh(scaleGeom, scaleMat);
        scaleObj.name = 'scaleRuler';
        co.add(scaleObj);
        scaleObj.renderOrder = 999;
        scaleObj.position.copy(new THREE.Vector3(scalePosWidth/2)/100,vSize*(scalePosHeight/2)/100);
        new THREE.TextureLoader().load( '/img/m_ruler_no_digits.png?123', (rulerTexture)=>{
            scaleObj.material.map = rulerTexture;
            scaleObj.material.needsUpdate = true;
        } );
        //scaleText = new SpriteText2D("SPRITE", { align: textAlign.center,  font: '40px Arial', fillStyle: '#000000' , antialias: false });
        //scene.add(scaleText);
    }

    const LABEL_OFFSET_MULT = 0.5;
    const TEXT_SIZE = 100;

    var mult = 0;
    function updateScaleObject()
    {
        
        let vSize = co.top - co.bottom;
        let hSize = co.right - co.left;
        let cp = new THREE.Vector3().copy(camera.position);
        let tp = new THREE.Vector3().copy(control.target);
        let d = new THREE.Vector3().subVectors(cp,tp).length();
        let nmult = 1;

        if(hSize < 5)
        {
            nmult = 0.25;
        }
        else if(hSize < 10)
        {
            nmult = 1;
        }
        else if(hSize < 25)
        {
            nmult = 2.5;
        }
        else if(hSize < 50)
        {
            nmult = 5;
        }
        else if(hSize < 100)
        {
            nmult = 10;
        }
        else if(hSize < 250)
        {
            nmult = 25;
        }
        else if(hSize < 500)
        {
            nmult = 50;
        }
        else if(hSize < 750)
        {
            nmult = 75;
        }
        else if(hSize < 1000)
        {
            nmult = 100;
        }
        else if(hSize < 2500)
        {
            nmult = 250
        }
        else if(hSize < 5000)
        {
            nmult = 500;
        }
        else if(hSize < 7500)
        {
            nmult = 750;
        }
        else if(hSize < 10000)
        {
            nmult = 1000;
        }
        else if(hSize < 25000)
        {
            nmult = 2500;
        }
        else if(hSize < 50000)
        {
            nmult = 5000;
        }
        else if(hSize < 75000)
        {
            nmult = 7500;
        }
        else if(hSize < 100000)
        {
            nmult = 10000;
        }
        else if(hSize < 250000)
        {
            nmult = 25000;
        }
        else if(hSize < 500000)
        {
            nmult = 50000;
        }
        else if(hSize < 750000)
        {
            nmult = 75000;
        }
        else if(hSize < 1000000)
        {
            nmult = 100000;
        }
        else if(hSize < 2500000)
        {
            nmult = 250000;
        }
        else
        {
            nmult = 500000;
        }

        if(mult != nmult)
        {
            mult = nmult;
            updateLabel(logScale(nmult),TEXT_SIZE);
        }
        
        scaleObj.scale.set(nmult, nmult/8,1);
        scaleText.scale.set(nmult * 2/3, nmult * 2/3,1);
        scaleObj.position.copy(new THREE.Vector3(hSize*(scalePosWidth/2)/100,vSize*(scalePosHeight/2)/100,-d));
        scaleText.position.set(scaleObj.position.x + scaleObj.scale.x*LABEL_OFFSET_MULT + scaleText.scale.x * LABEL_OFFSET_MULT ,scaleObj.position.y,-d);
    }

    function testRulerSizeX()
    {
        let v1 = scaleObj.geometry.vertices[0].clone();
        v1.add(scaleObj.position);
        let v2 = scaleObj.geometry.vertices[1].clone();
        v2.add(scaleObj.position);
        let d = v1.sub(v2).length();
    }

    function logScale(mult)
    {
        let m = ''
        let val = 0;
        if(mult < 10)
        {
            val = mult;
            m = 'mm';
        }
        else if(mult < 100)
        {
            val = mult/10;
            m = 'cm';
        }
        else if(mult < 1000)
        {
            val = mult/100;
            m = 'dm';
        }
        else if(mult < 1000000)
        {
            val = mult/1000;
            m = 'm';
        }
        else
        {
            val = mult/1000000;
            m = 'km';
        }
        return val + m;
    }

    function createScaleLabel()
    {
        let vSize = co.top - co.bottom;
        let hSize = co.right - co.left;
        let cp = new THREE.Vector3().copy(camera.position);
        let tp = new THREE.Vector3().copy(control.target);
        let d = new THREE.Vector3().subVectors(cp,tp).length();
        let scaleGeom = new THREE.PlaneGeometry(1,1);
        let uvs = scaleGeom.faceVertexUvs[ 0 ];
        uvs[ 0 ][ 0 ].set( 0, 1 );
        uvs[ 0 ][ 1 ].set( 0, 0 );
        uvs[ 0 ][ 2 ].set( 1, 1 );
        uvs[ 1 ][ 0 ].set( 0, 0 );
        uvs[ 1 ][ 1 ].set( 1, 0 );
        uvs[ 1 ][ 2 ].set( 1, 1 );
        let scaleMat = new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide, depthTest: false, transparent: true});
        scaleText = new THREE.Mesh(scaleGeom, scaleMat);
        scaleText.name = 'scaleLabel';
        co.add(scaleText);
        scaleText.renderOrder = 999;
        scaleText.position.set(0,0,-d);
    }

    function updateLabel(text, size) {
        let lcanvas = document.createElement("canvas");
        lcanvas.width = 512;
        lcanvas.height = 512;
        let lcontext = lcanvas.getContext("2d");

        lcontext.font = size + "pt Arial";

        let lmargin = 10;
        let ltextWidth = lcontext.measureText(text).width;

        //lcontext.strokeStyle = "black";
        //lcontext.strokeRect(0, 0, lcanvas.width, lcanvas.height);

        //lcontext.strokeStyle = "red";
        //lcontext.strokeRect(lcanvas.width / 2 - ltextWidth / 2 - lmargin / 2, lcanvas.height / 2 - size / 2 - +lmargin / 2, ltextWidth + lmargin, size + lmargin);

        lcontext.textAlign = "center";
        lcontext.textBaseline = "middle";
        lcontext.fillStyle = "black";
        lcontext.fillText(text, lcanvas.width/2, lcanvas.height/2);

        var ltexture = new THREE.Texture(lcanvas);
        ltexture.needsUpdate = true;

        scaleText.material.map = ltexture;
        scaleText.material.needsUpdate = true;

        
    }

    var effectComposer = new THREE.EffectComposer(renderer);
    var renderPass;
    var orthoPass;
    var outlinePass;
    var outlineOrthoPass;
    var enableOutline = false;
    var texEnabled = true;
    function checkOutline()
    {
        if(!texEnabled)
        {
            enableOutline = true;
        }
        else
        {
            enableOutline = false;
            effectComposer.passes[2].enabled = false;
            effectComposer.passes[3].enabled = false;
        }
    }

    function SetupComposer()
    {
        renderPass = new THREE.RenderPass(scene,camera);
        effectComposer.addPass(renderPass);
        orthoPass = new THREE.RenderPass(scene, co);
        orthoPass.enabled = false;
        effectComposer.addPass(orthoPass);

        outlinePass = new THREE.OutlinePass(new THREE.Vector2(1024,1024), scene,camera);
        outlinePass.enabled = false;
        outlinePass.visibleEdgeColor.set('black');
        outlinePass.edgeStrength = 2;
        outlinePass.edgeGlow = 0;
        outlinePass.edgeThickness = 0.1;
        effectComposer.addPass(outlinePass);

        outlineOrthoPass = new THREE.OutlinePass(new THREE.Vector2(1024,1024), scene,co);
        outlineOrthoPass.enabled = false;
        outlineOrthoPass.visibleEdgeColor.set('black');
        outlineOrthoPass.edgeStrength = 2;
        outlineOrthoPass.edgeGlow = 0;
        outlineOrthoPass.edgeThickness = 0.1;
        effectComposer.addPass(outlineOrthoPass);
        outlinePass.selectedObjects = sceneObjectsMesh;
        outlineOrthoPass.selectedObjects = sceneObjectsMesh;

        effectComposer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
    }

    //----------------------------------------------------------------------------------------------------------------------------------------

    return {
        appendTo: appendTo,
        switchEnv: switchEnv,
        redrawTexture: redrawTexture,
        rulerDistance: getDistance,
        saveOptions: saveOptions,
        getNewLabel: getNewLabel,
        addLabels: addLabels,
        camera: camera,
        renderer: renderer,
        orthographer: orthographer,
    };
};