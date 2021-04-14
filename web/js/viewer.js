/**

 Viewer for THREE.js objects v 0.9.7

 **/
function viewer(model, options, labels, admin) {
    options = typeof options !== 'undefined' ? options : {
        grid: false,
        ruler: false,
        wireframe: false,
        autorotate: false,
        backgroundColor: '#fffffd',
        fov: 55,
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
    if(typeof options.deteriorationLayers === 'undefined') options.deteriorationLayers = [];

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
    backgrounds = [];
    drawings = [];

    var firstPass,
        orthographer = false,
        orthocam = false,
        gltfMin = new THREE.Vector3(),
        gltfMax = new THREE.Vector3(),
        scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera(60, 1 / 1, 2, 5000000),
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: options.preserveDrawingBuffer
        }),
        raycaster = new THREE.Raycaster(),
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
                elem.shadow.mapSize.width = 2048;
                elem.shadow.mapSize.height = 2048;

                var d = 150;

                elem.shadow.camera.left = -d * 1.2;
                elem.shadow.camera.right = d * 1.2;
                elem.shadow.camera.top = d;
                elem.shadow.camera.bottom = -d;

                elem.shadow.camera.near = 200;
                elem.shadow.camera.far = 500;
                return elem;
            },
            ManualSetup: function (count, coords) {
                drivenLightsGroup = new THREE.Group();
                drivenLightsGroup.name = 'manualLightGroup';
                for (var i = 0; i < count; i++) {
                    var position = new THREE.Vector3();
                    position.fromArray(coords[i]);
                    var lightPoint = new THREE.DirectionalLight(0xffffff, 0.7);
                    lightPoint.name = 'light_' + i;
                    lightPoint.position.copy(position);
                    drivenLightsGroup.add(lightPoint);
                }
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
                loadingBar.style.background = "url('" + model.poster + "') center center / auto 100% no-repeat";
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

            init();
        }   
    }

    var clientWidth, clientHeight;

    function init() {
        clientWidth = viewerContainer.clientWidth;
        clientHeight = viewerContainer.clientHeight;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0xf0f0f0);
        renderer.setSize(clientWidth, clientHeight);
        renderer.domElement.addEventListener( 'wheel', mouseWheelHandler, false );
        camera.aspect = viewerContainer.clientWidth / viewerContainer.clientHeight;
        camera.updateProjectionMatrix();

        control = controls[options.controls]();
        control.rotateSpeed = 1.2;
        control.enableZoom = false;
        

        

        helpers.mouseHelper = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 10), new THREE.MeshNormalMaterial());
        helpers.mouseHelper.visible = false;

        pinPoints['intersections'] = Array();
        pinPoints['rulerPoints'] = Array();

        switchEnv('lights', options.lights);

        loadModel(model, function (value) {
            if (value) {

                if (options.camera == 'auto') {
                    camera.position.set(0,0,1);
                    cameraModelFit();
                    if(options.fov)
                        camera.fov = parseInt(options.fov);
                    camera.updateProjectionMatrix();
                } else if (options.camera == 'manual') {
                    camera.position.set(options.cameraCoords.x, options.cameraCoords.y, options.cameraCoords.z);
                    camera.fov = options.fov ? parseInt(options.fov) : 60;
                    camera.updateProjectionMatrix();
                }
                

                scene.traverse(function (node) {
                    if (node.type == 'Mesh') {
                        node.material.needsUpdate = true;
                    }
                    
                });

                viewerContainer.removeChild(loadingBar);
                viewerContainer.appendChild(renderer.domElement);

                if (options.backgroundColor) {
                    switchEnv('background', options.backgroundColor);
                }
                

                if (options.ruler) {
                    switchEnv('ruler', true);
                }
                
                if (options.grid) {
                    switchEnv('grid', true);
                }
                
                if (options.wireframe) {
                    switchEnv('wireframe', true);
                }
                
                if (options.autorotate) {
                    switchEnv('autoRotate', true);
                }
                
                if (options.focalLenght) {
                    switchEnv('focalLenght', options.focalLenght);
                }
                
                if (options.fov) {
                    switchEnv('cameraFov', options.fov);
                }
                
                if (options.scale) {
                    switchEnv('scale', options.scale);
                }

                renderer.domElement.addEventListener('pointerdown', onContainerPointerDown, false);
                window.addEventListener('resize', onWindowResize, false);


                addLabels();
                addCompass();
                animate();
                externalCallback();
            }  
        });
    }

    function redrawTexture(clean){
        if(typeof texture === 'undefined') return;
        clean = !texEnabled;
        //1. For each background: if loaded - create backgrounds[i].ctx canvas with background image
        for (let i = 0; i < backgrounds.length; i++) {
            
            if (backgrounds[i].image.complete && backgrounds[i].image.naturalHeight !== 0 && typeof backgrounds[i].ctx === 'undefined') 
            {
                backgrounds[i].ctx = document.createElement('canvas').getContext('2d');
                backgrounds[i].ctx.canvas.width = backgrounds[i].image.width;
                backgrounds[i].ctx.canvas.height = backgrounds[i].image.height;
                backgrounds[i].ctx.drawImage(backgrounds[i].image, 0, 0);
            }
            else if(backgrounds[i].image == "")
            {
                backgrounds[i].ctx = document.createElement('canvas').getContext('2d');
                backgrounds[i].ctx.canvas.width = 1;
                backgrounds[i].ctx.canvas.height = 1;
                backgrounds[i].ctx.beginPath();
                backgrounds[i].ctx.rect(0, 0, 1, 1);
                backgrounds[i].ctx.fillStyle = model.color;
                backgrounds[i].ctx.fill();
            }
        }

        //2. Draw
        for (let i = 0; i < backgrounds.length; i++) {
            if (backgrounds[i].path === controllers.currentTexture[0]) {
                //2a. draw current background in main ctx
                if (typeof backgrounds[i].ctx == 'undefined') return;
                canvasWidth = backgrounds[i].ctx.canvas.width;
                canvasHeight = backgrounds[i].ctx.canvas.height;
                ctx.canvas.width = canvasWidth;
                ctx.canvas.height = canvasHeight;
                ctx.globalAlpha = 1;
                if(!clean)
                {
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    ctx.drawImage(backgrounds[i].ctx.canvas, 0, 0);
                }
                else
                {
                    ctx.beginPath();
                    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    ctx.fillStyle = "white";
                    ctx.fill();
                }
                //2b. if loaded - create cleaner.ctx canvas with cleaner image
                if (typeof cleaner !== 'undefined' && typeof cleaner.ctx === 'undefined') {
                    cleaner.ctx = document.createElement('canvas').getContext('2d');
                    cleaner.ctx.canvas.width = canvasWidth;
                    cleaner.ctx.canvas.height = canvasHeight;
                    cleaner.ctx.drawImage(cleaner, 0, 0);
                }
                //2c. For each drawing: if loaded - create drawings[i].ctx canvas with drawing image
                // and drawings[i].coloredCtx with colored drawing image
                for (let i = 0; i < drawings.length; i++) {
                    if (drawings[i].image.complete && drawings[i].image.naturalHeight !== 0 && typeof drawings[i].ctx === 'undefined') 
                    {
                        drawings[i].ctx = document.createElement('canvas').getContext('2d');
                        drawings[i].ctx.canvas.width = canvasWidth;
                        drawings[i].ctx.canvas.height = canvasHeight;
                        drawings[i].ctx.drawImage(drawings[i].image, 0, 0);

                        drawings[i].coloredCtx = document.createElement('canvas').getContext('2d');
                        let coloredCtx = drawings[i].coloredCtx;
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
                for (let i = 0; i < drawings.length; i++) {
                    if (drawings[i].ctx && typeof drawings[i].color === 'string' &&
                        (typeof drawings[i].currentColor == "undefined" || drawings[i].currentColor != drawings[i].color)) 
                    {
                            let coloredCtx = drawings[i].coloredCtx;
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
                for (let i = 0; i < drawings.length; i++) {
                    if (typeof drawings[i].ctx != 'undefined' && typeof cleaner != 'undefined' && typeof drawings[i].minusedCtx === 'undefined') 
                    {
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
                for (let i = 0; i < drawings.length; i++) {
                    if (drawings[i].alpha < 0) {
                        if (typeof drawings[i].minusedCtx != 'undefined' ) {
                            ctx.globalAlpha = -drawings[i].alpha;
                            ctx.drawImage(drawings[i].minusedCtx.canvas, 0, 0);
                        }
                    }
                }

                for (let i = 0; i < drawings.length; i++) {
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
        let forceUpdate = false;
        let parametersMaterial = {
            /*
            specular: 0xffffff,
            shininess: 50,
            shading: THREE.SmoothShading
            */
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
        drawings = [];
        if (controllers.textures[0].length >0)
        {
            for (var i = 0; i < controllers.textures[0].length; i++) {
                if(controllers.textures[0] != "")
                {
                    bgItem = new Image();
                    backgrounds.push({"image": bgItem, "path": controllers.textures[0][i]});
                    bgItem.src = controllers.textures[0][i];
                    bgItem.onload = () => {
                        redrawTexture();
                    };
                }
                else
                {
                    backgrounds.push({"image": '', "path": ''});
                    forceUpdate = true;
                    
                }
            }
            
            if (modelDrawings) {
                for (let i = 0; i < modelDrawings.length; i++) {
                    drawing = new Image();
                    drawing.src = modelDrawings[i];
                    let alpha = 1;
                    let color = null;
                    if (Array.isArray(model.layersParams) && model.layersParams.length === modelDrawings.length){
                        if (typeof model.layersParams[i].alpha != 'undefined') alpha = model.layersParams[i].alpha;
                        if (typeof model.layersParams[i].color != 'undefined') color = model.layersParams[i].color;
                    }else{
                        model.layersParams = [];
                        for (let j = 0; j < modelDrawings.length; j++)
                        {
                            model.layersParams.push({alpha:1,color:null});
                        }
                    }

                    drawings.push({"image": drawing, "alpha": alpha, "color": color});
                    drawing.onload = () => {
                        redrawTexture();
                    };
                }
            }
            if (modelCleaner) {
                img_cleaner = new Image();
                img_cleaner.src = modelCleaner;
                img_cleaner.onload = () => {
                    cleaner = img_cleaner;
                    redrawTexture();
                };
            }
            texture = new THREE.CanvasTexture(ctx.canvas);
            if(options.loader === 'gltfLoader') texture.flipY = false;
            parametersMaterial.map = texture;
        }

        material = new THREE.MeshLambertMaterial(parametersMaterial);
        if(options.loader === 'gltfLoader')
        {
            material.userData.rt_value = {value:0};
            material.onBeforeCompile = shader =>{
                shader.uniforms.rt_value = material.userData.rt_value;
                shader.vertexShader = 
                    `
                    uniform float rt_value;
                    attribute vec3 _position_t;
                    attribute vec3 _normal_t;
                    float map(float value, float min1, float max1, float min2, float max2) 
                    {
                        return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
                    }
                    ` + shader.vertexShader;
                shader.vertexShader = shader.vertexShader.replace(
                    '#include <project_vertex>',
                    `
                    transformed = transformed + _position_t * rt_value;

                    vec4 mvPosition = vec4( transformed, 1 );

                    #ifdef USE_INSTANCING
                    
                        mvPosition = instanceMatrix * mvPosition;
                    
                    #endif
                    
                    mvPosition = modelViewMatrix * mvPosition;
                    
                    gl_Position = projectionMatrix * mvPosition;`
                );
                shader.vertexShader = shader.vertexShader.replace(
                    '#include <beginnormal_vertex>',`
                    vec3 objectNormal = vec3( normal ) + _normal_t * rt_value;
                    
                    #ifdef USE_TANGENT
                    
                        vec3 objectTangent = vec3( tangent.xyz );
                    
                    #endif
                    `
                );
                shader.fragmentShader = shader.fragmentShader.replace(
                    `#include <color_fragment>`,' '
                );
            };
        }
        
        var onProgress = function (progress) {

        };

        var onError = function (e) {
            console.log('loading error: ' + e);
        };
        let loader;
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
                        
                        object.traverse(function (node) {
                            if (node.type === 'Mesh') {
                                node.geometry.computeVertexNormals();
                                node.geometry.normalizeNormals();
                                node.geometry.computeBoundingBox();
                                node.geometry.computeBoundingSphere();
                                node.material = material;
                                node.material.needsUpdate = true;
                                sceneObjectsMesh.push(node);
                            }
                            
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
                        
                        sceneObjectsMesh.push(object);

                        callback(true);
                    }, onProgress, onError
                );
                break;
            case 'gltfLoader':
                loader = new THREE.GLTFLoader();
                drcLoader = new THREE.DRACOLoader();
                drcLoader.setDecoderPath('/js/three/draco_r1.3.6/');
                drcLoader.setDecoderConfig({type: 'js'});
                loader.setDRACOLoader(drcLoader);
                loader.load(
                    model.mesh,
                    function (object) {
                        scene.add(object.scene);
                        sceneObjectsMesh.push(object.scene.children[0]);
                        sceneObjectsMesh[0].material = material;
                        material.needsUpdate = true;
                        //sceneObjectsMesh[0].geometry.morphTargetsRelative = false;
                        drcLoader.dispose();
                        callback(true);
                    }, onProgress, onError
                );
                break;
            case 'dracoLoader':
                loader = new THREE.DRACOLoader();
                loader.setDecoderPath('/js/three/draco_r1.3.6/');
                loader.setDecoderConfig({type: 'js'});

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
                    

                    scene.add(mesh);

                    sceneObjectsMesh.push(mesh);

                    // Release decoder resources.
                    loader.dispose();

                    callback(true);

                }, onProgress, onError);
                break;
        }
        
        if(forceUpdate) redrawTexture();
    }

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
                    
                } catch (e) {
                }
                
            }
            
            //supported, but disabled
            return 1;
        } else {
            //not supported
            return 2;
        }
        
    }

    function switchEnv(object, value) {
        value = typeof value !== 'undefined' ? value : false;
        switch (object) {
            case 'enable-outline':
                olEnabled = !olEnabled;
                break;
            case 'rotate90':
                rotateObject();
                break;
            case 'scale-ruler':
                scrSpCan.show(value);
                break;
            case 'white-back':
                whiteBack(value);
                break;
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
                    });
                } else {
                    pinsGroup.traverse(function (node) {
                        if (!node.visible) {
                            node.visible = true;
                        }
                    });
                }
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

                break;
            case 'lights':
                if (typeof (value) == 'object') {
                    if (controllers.currentLight.name == 'sceneAmbientLight' || controllers.currentLight.name == 'sceneCameraLight') {
                        scene.remove(controllers.currentLight);
                    }


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
                        sceneObjectsMesh[0].material.needsUpdate = true;
                    }

                }

                break;
            case 'background':
                if (value) {
                    renderer.setClearColor(value);
                }

                break;
            case 'autoRotate':
                if (value && typeof (value) == 'boolean') {

                    control.autoRotate = value;
                    controllers.autorotate = value;
                } else {
                    control.autoRotate = false;
                    controllers.autorotate = false;
                }

                break;
            case 'cameraFov':
                if (value && typeof (value) == 'number') {
                    camera.fov = value;
                    camera.updateProjectionMatrix();
                }

                break;
            case 'focalLenght':
                if (value && typeof (value) == 'number') {
                    camera.setLens(value);
                }

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
                    sceneObjectsMesh.forEach((item,i) => {
                        if (item.type === 'Mesh') {
                            if (!controllers.originMaterial) {
                                controllers.originMaterial = [];
                            }
                            if (controllers.originMaterial[i] === undefined) {
                                controllers.originMaterial[i] = item.material.map;
                            }

                            if (value) {
                                // item.material.map = "";/*new THREE.MeshLambertMaterial({
                                //     color: 0xdddddd,
                                //     shading: THREE.SmoothShading
                                // });*/
                                //item.material.needsUpdate = true;
                                texEnabled = false;
                                redrawTexture(true);

                            } 
                            else //(controllers.originMaterial[i] !== undefined) 
                            {
                                //item.material.map = controllers.originMaterial[i];
                                //item.material.needsUpdate = true;
                                texEnabled = true;
                                redrawTexture(false);
                            }

                        }
                    });
                }
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
            case 'morph':
                if(value.type === "target-weight") setMorphTargetWeight(value.val);
                else if(value.type === "texture-weight") {
                    for (let i = 0; i < options.deteriorationLayers.length; i++)
                    {
                        drawings[options.deteriorationLayers[i]].alpha = -value.val;
                    }
                    redrawTexture();
                }
                else if(value.type === "both-weight"){
                    setMorphTargetWeight(value.val);
                    texReconstVal = value.val;
                    for (let i = 0; i < options.deteriorationLayers.length; i++)
                    {
                        drawings[options.deteriorationLayers[i]].alpha = -value.val;
                    }
                    redrawTexture();
                }
                break;
            default:
                break;
        }
        
    }

    function getBoundingSphereRadius() {
        let radius = 0;
        sceneObjectsMesh.forEach(function (elem) {
            let bbox = new THREE.BoxHelper(elem);
            if (bbox.geometry.boundingSphere.radius >= radius) {
                radius = bbox.geometry.boundingSphere.radius;
            }
            
        });
        return radius;
    }

    function getObjectFromGroup(objectsGroup, elemMouseCoords) {
        let intersects;
        let mousePosition = {};

        mousePosition.x = (elemMouseCoords.x / viewerContainer.clientWidth) * 2 - 1;
        mousePosition.y = -(elemMouseCoords.y / viewerContainer.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mousePosition, orthocam? co : camera);

        intersects = raycaster.intersectObjects(objectsGroup);

        if (intersects.length > 0) {
            return intersects[0];
        } else {
            return false;
        }

    }

    function getObjectSplite(objectsGroup, elemMouseCoords) {
        let intersects;
        let mousePosition = {};

        mousePosition.x = (elemMouseCoords.x / viewerContainer.clientWidth) * 2 - 1;
        mousePosition.y = -(elemMouseCoords.y / viewerContainer.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mousePosition, orthocam? co : camera);

        intersects = raycaster.intersectObjects(objectsGroup);

        if (intersects.length > 0) {
            return intersects[0];
        } else {
            return false;
        }

    }

    function CreateSplite(intersects) {
        if (intersects && !newlabel) {
            let r = getBoundingSphereRadius(),
                p = r / 30,
                w = r / 60;
            let n = intersects.face.normal.clone().multiplyScalar(w).add(intersects.point);
            let spriteMap = new THREE.ImageUtils.loadTexture('/img/labels/label.png');
            let material = new THREE.SpriteMaterial({map: spriteMap});
            let sprite = new THREE.Sprite(material);
            scene.add(sprite);
            sprite.position.copy(n);
            sprite.scale.set(p, p, p);

            newlabel = sprite;
            scene.add(sprite);
        } else if (intersects && newlabel) {
            let n = intersects.face.normal.clone().multiplyScalar(0.3).add(intersects.point);
            newlabel.position.copy(n);
        }
    }

    function getDistance() {
        if (pinPoints.intersections.length === 2 && controllers.ruler == true) {
            let x = pinPoints.intersections[1].x - pinPoints.intersections[0].x;
            let y = pinPoints.intersections[1].y - pinPoints.intersections[0].y;
            let z = pinPoints.intersections[1].z - pinPoints.intersections[0].z;

            let distance = Math.sqrt(x * x + y * y + z * z);
            distance = distance.toFixed(2);
            return distance;
        } else if (pinPoints.intersections.length !== 2 && controllers.ruler == true) {
            return 0;
        } else if (controllers.ruler == false) {
            return null;
        }

    }

    function getNewLabel() {
        return newlabel;
    }

    var rLineMat = new THREE.LineBasicMaterial({color: 0x0000FF, linewidth: 4});
    var pSphereMat = new THREE.MeshBasicMaterial({color: 0x349938});

    function rulerBuild(intersects) {
        if (!sceneObjectsMesh[0]) return;

        if (typeof intersects == 'object' && pinsGroup.children.length < 2) {
            let onePin = new THREE.Group();
            onePin.name = 'pin';
            let p = intersects.point;

            pinPoints.intersections.push(p);

            helpers.mouseHelper.position.copy(p);
            intersection.point.copy(p);

            let n = intersects.face.normal.clone();
            let rulerDrawPoint = n.clone();
            rulerDrawPoint.add(intersects.point);
            //n.multiplyScalar(5);
            //n.add(intersects.point);
            pinPoints.rulerPoints.push(rulerDrawPoint);

            intersection.normal.copy(intersects.face.normal);
            helpers.mouseHelper.lookAt(n);

            let pinLine = new THREE.Line(new THREE.Geometry(), rLineMat);
            pinLine.name = 'pinline';
            pinLine.geometry.vertices.push(new THREE.Vector3());
            pinLine.geometry.vertices.push(n);
            pinLine.geometry.verticesNeedUpdate = true;
            pinLine.position.copy(p);

            let pinSphere = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), pSphereMat);
            pinSphere.position.copy(pinLine.geometry.vertices[1]);
            pinSphere.name = 'pinsphere';

            onePin.add(pinLine);
            onePin.add(pinSphere);

            pinsGroup.children.push(onePin);

            scene.add(onePin);

            if (pinsGroup.children.length == 2) {

                let material = new THREE.LineBasicMaterial({color: 0x000033, linewidth: 30});
                let lineGeometry = new THREE.Geometry();
                lineGeometry.vertices.push(pinPoints.rulerPoints[0]);
                lineGeometry.vertices.push(pinPoints.rulerPoints[1]);
                let line = new THREE.Line(lineGeometry, material);
                scene.add(line);
                pinsGroup.children.push(line);
            }
        } else if (typeof intersects == 'object' && pinsGroup.children.length == 3) {
            pinsGroup.children.forEach(function (element, index) {
                scene.remove(element);
            });
            scene.remove(pinsGroup);
            pinPoints.intersections = Array();
            pinPoints.rulerPoints = Array();
            pinsGroup = new THREE.Group();
            scene.add(pinsGroup);
            rulerBuild(intersects);
        }

    }

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
                    if(ch1.name === 'pinsphere')
                    {
                        ch1.position.copy(d.add(p));
                    }
                });
            }
        });
    }

    function saveOptions() {
        let savedOptions = {};

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
            let color = renderer.getClearColor();
            return 'rgd(' + color.r + ',' + color.g + ',' + color.b + ')';
        })();

        switch (controllers.currentLight.name) {
            case'manualLightGroup':
                savedOptions.lights = {
                    state: 'init',
                    count: controllers.currentLight.children.length,
                    coords: (function () {
                        let tmpArr = Array();
                        controllers.currentLight.children.forEach(function (elem) {
                            let elemCoords = [elem.position.x, elem.position.y, elem.position.z];
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


        return savedOptions;
    }

    function onContainerPointerDown(event) {
        renderer.domElement.addEventListener('pointermove', onContainerPointerMove, false);
        renderer.domElement.addEventListener('pointerup', onContainerPointerUp, false);
        renderer.domElement.addEventListener('pointerout', onContainerPointerOut, false);

        mouseMoveTrigger = 0;
    }

    function onContainerPointerMove(event) {
        if (event.movementX === 0 && event.movementY === 0) {
            mouseMoveTrigger = 0;
        } else {
            mouseMoveTrigger = 1;

        }
    }

    function onContainerPointerUp(event) {
        renderer.domElement.removeEventListener('pointermove', onContainerPointerMove, false);
        renderer.domElement.removeEventListener('pointerup', onContainerPointerUp, false);
        renderer.domElement.removeEventListener('pointerout', onContainerPointerOut, false);

        if (mouseMoveTrigger == 0) {

            var mouse = {};
            mouse.x = event.offsetX == undefined ? event.layerX : event.offsetX;
            mouse.y = event.offsetY == undefined ? event.layerY : event.offsetY;

            if (controllers.ruler == true) {
                let intersects = getObjectFromGroup(sceneObjectsMesh, mouse);

                rulerBuild(intersects);
            }
            let intersects = getObjectSplite(label, mouse);
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
                let intersects = getObjectSplite(sceneObjectsMesh, mouse);
                CreateSplite(intersects);
            }
        }

    }

    

    function onContainerPointerOut(event) {
        renderer.domElement.removeEventListener('pointermove', onContainerPointerMove, false);
        renderer.domElement.removeEventListener('pointerup', onContainerPointerUp, false);
        renderer.domElement.removeEventListener('pointerout', onContainerPointerOut, false);
    }

    function onWindowResize() {
        document.body.style.overflow = 'hidden';
        camera.aspect = viewerContainer.clientWidth / viewerContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
        effectComposer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        //camera.lookAt(scene.position);
        updateOrthoCam();
        control.update();
        if (scene.getObjectByName('sceneCameraLight', true)) {
            let elem = scene.getObjectByName('sceneCameraLight', true);
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
            if(options.rotation)
                sceneObjectsMesh[0].quaternion.copy(new THREE.Quaternion(
                    parseFloat(options.rotation.x),
                    parseFloat(options.rotation.y),
                    parseFloat(options.rotation.z),
                    parseFloat(options.rotation.w),
                ));
            if(admin) addScaleRuler();
            SetupComposer();
        }
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.geometry.type === 'SphereGeometry') {
                updateDotScale(child);
            }
        });
        if(admin) {
            updateScaleRuler();
            updateScaleLabel(scrSpCan.label, TEXT_SIZE);
        }
        updateRulerScale();
        if(orthocam)
        {
            effectComposer.passes[0].enabled = false;
            effectComposer.passes[1].enabled = true;
        }
        else
        {
            effectComposer.passes[0].enabled = true;
            effectComposer.passes[1].enabled = false;
        }
        TestCorrectRulerVisibility();
        effectComposer.render();

        if(clientHeight !== viewerContainer.clientHeight || clientWidth !== viewerContainer.clientWidth)
        {
            clientWidth = viewerContainer.clientWidth;
            clientHeight = viewerContainer.clientHeight;
            effectComposer.setSize(clientWidth, clientHeight);
            renderer.setSize(clientWidth, clientHeight);
            camera.aspect = clientWidth/clientHeight;
            camera.updateProjectionMatrix();
        }
    }

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
        let wd = new THREE.Vector3();
        let objPlane = new THREE.Plane(camera.getWorldDirection(wd).clone());
        let planarDistance = Math.abs(objPlane.distanceToPoint(camera.position));
        
        let s = camera.fov * planarDistance/2000;
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

    function updateOrthoCam(clip) 
    {
        let halfSizeX,
            halfSizeY;
        let fov = (camera.fov * Math.PI / 180);
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
        if(tri!==undefined)tri.clear();
        let ps = new THREE.Vector2();
        let mvs = cameraSpaceBoundingBox(true);
        let asp = camera.aspect;
        let ofov = camera.fov;
        let opos = camera.position.clone();
        renderer.getSize(ps);
        if(orthocam)
        {
            co.position.copy(mvs.center);
            camera.aspect = mvs.visibleSize.x/mvs.visibleSize.y;
            if(mvs.visibleSize.x > mvs.visibleSize.y) {
                renderer.setSize(resolution,resolution/camera.aspect);
                effectComposer.setSize(resolution,resolution/camera.aspect);
            }
            else {
                renderer.setSize(resolution*camera.aspect,resolution);
                effectComposer.setSize(resolution*camera.aspect,resolution);
            }
            co.left = -mvs.visibleSize.x / 2;
            co.right = mvs.visibleSize.x / 2;
            co.top = mvs.visibleSize.y / 2;
            co.bottom = -mvs.visibleSize.y / 2;

            co.updateProjectionMatrix();
        }
        else
        {
            camera.position.copy(mvs.center);
            if(camera.aspect > 1) {
                renderer.setSize(resolution, resolution/camera.aspect);
                effectComposer.setSize(resolution, resolution/camera.aspect);
            }else{
                renderer.setSize(resolution/camera.aspect, resolution);
                effectComposer.setSize(resolution/camera.aspect, resolution);
            }

            camera.updateProjectionMatrix();
        }

        scrSpCan.get('scaleLabel').opt.vPos = -0.1;
        updateScaleRuler(true);
        updateScaleLabel(scrSpCan.label,TEXT_SIZE);
        if(olEnabled){
            scrSpCan.show(false);
            clearC = renderer.getClearColor().getHexString();
            renderer.setClearColor(0x000000,0);
            effectComposer.render();
            let mDataUrl = renderer.domElement.toDataURL('image/png');
            scrSpCan.show(true);
            sceneObjectsMesh[0].visible = false;
            effectComposer.render();
            let rDataUrl = renderer.domElement.toDataURL('image/png');
            processOutline(renderer.domElement,mDataUrl,rDataUrl,ColorToRGB(clearC));
            renderer.setSize(ps.x,ps.y);
            effectComposer.setSize(ps.x,ps.y);
            camera.aspect = asp;
            camera.fov = ofov;
            camera.position.copy(opos);
            camera.updateProjectionMatrix();
            scrSpCan.get('scaleLabel').opt.vPos = 0;
            renderer.setClearColor("#"+clearC,1);
            sceneObjectsMesh[0].visible = true;
        }
        else
        {
            effectComposer.render();
            downloadImage(renderer.domElement.toDataURL('image/jpeg', 1));
            renderer.setSize(ps.x,ps.y);
            effectComposer.setSize(ps.x,ps.y);
            camera.aspect = asp;
            camera.fov = ofov;
            camera.position.copy(opos);
            camera.updateProjectionMatrix();
            scrSpCan.get('scaleLabel').opt.vPos = 0;
        }
    }

    function downloadImage(url)
    {
        let a = document.createElement('a');
        document.body.appendChild(a);
        a.href = url;
        a.download = "image.jpg";
        a.click();
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
            let wd = new THREE.Vector3();
            let objPlane = new THREE.Plane(camera.getWorldDirection(wd).clone());
            let planarDistance = Math.abs(objPlane.distanceToPoint(camera.position));
        
            
            let d = camera.position.distanceTo(cen);
            
            //control.target.copy(cen);
            camera.position.copy(cen.add(norm.multiplyScalar(planarDistance)));
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
        if(value)
        {
            renderer.domElement.addEventListener('click',orthoClickHandler);
            tri = new triangle();
        }
        else
        {
            if(tri!==undefined)tri.clear();
            tri = undefined;
            renderer.domElement.removeEventListener('click',orthoClickHandler);
        }
    }

    function orthoClickHandler(event)
    {
        if(mouseMoveTrigger === 0)
        {
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
        if(tri!==undefined)tri.clear();
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
        };
    }

    var effectComposer = new THREE.EffectComposer(renderer);
    var renderPass;
    var orthoPass;
    const BACK_COLOR = 0xf0f0f0;
    var enableOutline = false;
    var texEnabled = true;
    var olEnabled = false;

    function whiteBack(enable)
    {
        if(enable)
        {
            renderer.setClearColor('white');
        }
        else
        {
            renderer.setClearColor(BACK_COLOR);
        }
    }

    function SetupComposer()
    {
        renderPass = new THREE.RenderPass(scene,camera);
        effectComposer.addPass(renderPass);
        orthoPass = new THREE.RenderPass(scene, co);
        orthoPass.enabled = false;
        effectComposer.addPass(orthoPass);
        effectComposer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
    }

    //ScreenSpace-------------------------------------------------------------------------
    const C_FOV_MAX = 85;
    const C_FOV_MIN = 1;
    
    
    function screenSpaceCanvas(cam0)
    {
        ssc = {
            add: addToSSC,
            update: update,
            get: get,
            show: show,
        };

        ssc.camera = cam0;
        ssc.height = 1;
        ssc.aspect = 1;
        ssc.width = 1;
        ssc.scale = 1;
        ssc.index = 1;
        ssc.aboveQuart = false;
        ssc.planeDist = cam0.near * 2;
        ssc.UI = new THREE.Group();
        scene.add(ssc.UI);

        ssc.UI.position.set(0,0,cam0.near + 1);
        
        ssc.objects = [];
        ssc.label = '';
        ssc.stage = 10000000;

        function show(val)
        {
            ssc.UI.visible = val;
        }

        function addToSSC(obj0, id0, options0)
        {
            let opt0 = options0 !== undefined ? options0 : {
                parent: undefined,
                hPaddingType : 'left',
                vPaddingType : 'top',
                hPos : .5,//percent
                vPos : .5,//percent
                width: 16,//mm
                height: 8,//mm
                hConst: true,
                wConst: false
            };

            let obj1 = {
                id : id0,
                obj : obj0,
                opt : opt0
            };

            ssc.objects.push(obj1);
            ssc.UI.add(obj0);

            adjustPosScale(obj1);
        }

        function adjustPosScale(sscObj)
        {
            let w;
            let h; 
            
            let X;
            let Y;
            
            w = sscObj.opt.width * ssc.scale;
            h = sscObj.opt.height * ssc.scale;
            if(sscObj.opt.hConst) h = sscObj.opt.height * ssc.height / 100;
            if(sscObj.opt.wConst) w = sscObj.opt.width * ssc.width / (100 * ssc.aspect);

            if(sscObj.opt.parent !== undefined)
            {
                let pw = sscObj.opt.parent.obj.scale.x;
                let ph = sscObj.opt.parent.obj.scale.y;

                if(sscObj.opt.hPaddingType === 'left') X = sscObj.opt.parent.obj.position.x - pw/2 + w/2 + pw * sscObj.opt.hPos;
                else X = sscObj.opt.parent.obj.position.x + pw/2 - w/2 - pw * sscObj.opt.hPos;
                if(sscObj.opt.vPaddingType === 'bottom') Y = sscObj.opt.parent.obj.position.y - ph/2 + h/2 + ph * sscObj.opt.vPos;
                else Y = sscObj.opt.parent.obj.position.y + ph/2 - h/2 - ph * sscObj.opt.vPos;
            }
            else
            {
                if(sscObj.opt.hPaddingType === 'left') X = -ssc.width + w/2 + ssc.width * sscObj.opt.hPos;
                else X = - w/2 + ssc.width * sscObj.opt.hPos;
                if(sscObj.opt.vPaddingType === 'bottom') Y = -ssc.height + h/2 + ssc.height * sscObj.opt.vPos;
                else Y = - h/2 + ssc.height * sscObj.opt.vPos;
            }
            
            sscObj.obj.scale.set(w, h, 1);
            sscObj.obj.position.set(X, Y, 0);
        }

        function update(cameraDist)
        {
            let p = new THREE.Vector3();
            let d = new THREE.Vector3();
            let q = new THREE.Quaternion();
            let aHeight;
            let aWidth;
            let fovTan;
            if(orthocam)
            {
                ssc.aspect = co.right / co.top;
                ssc.height = co.top;

                ssc.width = ssc.height * ssc.aspect;
                ssc.scale = 1;
                ssc.planeDist = co.near + 1;
                co.getWorldPosition(p);
                co.getWorldDirection(d);
                p.addVectors(p, d.multiplyScalar(ssc.planeDist));
                ssc.UI.position.copy(p);
                co.getWorldQuaternion(q);
                ssc.UI.quaternion.copy(q);
            }
            else
            {
                ssc.planeDist = ssc.camera.near + 1;
                ssc.camera.getWorldPosition(p);
                ssc.camera.getWorldDirection(d);
                p.addVectors(p, d.multiplyScalar(ssc.planeDist));
                ssc.UI.position.copy(p);
                ssc.camera.getWorldQuaternion(q);
                ssc.UI.quaternion.copy(q);
                ssc.aspect = ssc.camera.aspect;
                fovTan = Math.tan(ssc.camera.fov * 0.5 * Math.PI/180);
                aHeight = cameraDist * fovTan;
                aWidth = aHeight * ssc.aspect;
                ssc.height = ssc.planeDist * fovTan;
                ssc.width = ssc.height * ssc.aspect;
                ssc.scale = ssc.height / aHeight;
            }
            aHeight = co.top * 2;
            aWidth = co.right * 2;
            let stage = 1;
            let stageIndex = 0;
            let halfWidth = aWidth * 0.5;
            let tenPercent = aWidth * 0.1;

            for (let si = 0; si < stages.length; si++) {
                const st = stages[si];
                if (st >= tenPercent && st <= halfWidth) {
                    stage = st;
                    stageIndex = si;
                }
            }

            if(isNaN(stage) && isNaN(stageIndex))
            {
                stage = 1;
                stageIndex = 0;
            }


            let unitIndex = Math.min(Math.trunc(stageIndex / 5), units.length);
            let unit = units[unitIndex];
            let div = unitIndex;

            if (stageIndex > 19) div = unitIndex - 1;
            if (stageIndex > 24) div = unitIndex - 2;
            if (stageIndex > 29) div = unitIndex;

            ssc.label = stage / (10 ** div) + unit;
            ssc.stage = stage;
            ssc.index = stageIndex;
            ssc.aboveQuart = stage > aWidth * 0.25;
            let secNum = parseInt(ssc.stage.toString().charAt(0));
            if(ssc.aboveQuart && stage > 2 && stage < 10000 && secNum == 1)
            {
                ssc.label = stage / (10 ** div) + '0' + units[unitIndex - 1];
            }
            ssc.objects.forEach(o => {
                adjustPosScale(o);
            });
        }

        function get(id)
        {
            return ssc.objects.find((elem)=>{ return elem.id === id; });
        }

        return ssc;
    }

    scrSpCan = screenSpaceCanvas(camera);
    const TEXT_SIZE = 30;

    function createScaleLabel()
    {
        let scaleGeom = new THREE.PlaneGeometry(1,1);
        let uvs = scaleGeom.faceVertexUvs[ 0 ];
        uvs[ 0 ][ 0 ].set( 0, 1 );
        uvs[ 0 ][ 1 ].set( 0, 0 );
        uvs[ 0 ][ 2 ].set( 1, 1 );
        uvs[ 1 ][ 0 ].set( 0, 0 );
        uvs[ 1 ][ 1 ].set( 1, 0 );
        uvs[ 1 ][ 2 ].set( 1, 1 );
        let scaleMat = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, depthTest: false, transparent: true});
        let scaleText = new THREE.Mesh(scaleGeom, scaleMat);
        scaleText.name = 'scaleLabel';
        scrSpCan.add(scaleText, 'scaleLabel',{
            parent: undefined,
            hPaddingType : 'right',
            vPaddingType : 'bottom',
            hPos : 1,//percent
            vPos : 0,//percent
            width: 32,//mm
            height: 32,//mm
            hConst: true,
            wConst: true
        });
        scaleText.renderOrder = 999;
    }

    function updateScaleLabel(text, size) {
        let lcanvas = document.createElement("canvas");
        lcanvas.width = 128;
        lcanvas.height = 128;
        let lcontext = lcanvas.getContext("2d");

        lcontext.font = size + "px arial";

        lcontext.textAlign = "center";
        lcontext.textBaseline = "middle";
        lcontext.fillStyle = "black";
        lcontext.fillText(text, lcanvas.width/2, lcanvas.height/2);

        var ltexture = new THREE.Texture(lcanvas);
        ltexture.needsUpdate = true;

        let l = scrSpCan.get('scaleLabel');

        l.obj.material.map = ltexture;
        l.obj.material.needsUpdate = true;
    }

    function addScaleRuler()
    {
        createScaleLabel();
        createRulerObjects();
    }

    function createRulerObjects(texture)
    {
        let rsections = [];
        let rulerGeom = new THREE.PlaneGeometry(1,1);
        let rmat = new THREE.MeshBasicMaterial({color:'black', side: THREE.DoubleSide, depthTest: false, transparent: false});
        let rwmat = new THREE.MeshBasicMaterial({color:'white', side: THREE.DoubleSide, depthTest: false, transparent: false});
        let uvs = rulerGeom.faceVertexUvs[ 0 ];
        uvs[ 0 ][ 0 ].set( 0, 1 );
        uvs[ 0 ][ 1 ].set( 0, 0 );
        uvs[ 0 ][ 2 ].set( 1, 1 );
        uvs[ 1 ][ 0 ].set( 0, 0 );
        uvs[ 1 ][ 1 ].set( 1, 0 );
        uvs[ 1 ][ 2 ].set( 1, 1 );
        for (let rulerI = 0; rulerI < 17; rulerI++)
        {
            let robj = new THREE.Mesh(rulerGeom, rmat);
            if(rulerI > 0) robj.renderOrder = 999;
            else robj.renderOrder = 900;
            robj.name = 'rulerSection'+rulerI;
            rsections.push(robj);
        }
        for (let rulerI = 17; rulerI < 22; rulerI++)
        {
            let robj = new THREE.Mesh(rulerGeom, rwmat);
            robj.renderOrder = 995;
            robj.name = 'rulerSection'+rulerI;
            rsections.push(robj);
        }

        scrSpCan.add(rsections[0], 'main',{
            parent: scrSpCan.get('scaleLabel'),
            hPaddingType : 'right',
            vPaddingType : 'bottom',
            hPos : 0.95,//percent
            vPos : 0.40,//percent
            width: 10,//mm
            height: 5,//mm
            hConst: true,
            wConst: false
        });
        for (let i = 0; i < 11; i++) {
            scrSpCan.add(rsections[i+1], 'pin' + i, {
                parent: scrSpCan.get('main'),
                hPaddingType: 'right',
                vPaddingType: 'bottom',
                hPos: i === 10 ? 1:(i-0.05)/10,//percent
                vPos: 0,//percent
                width: 0.5,//mm
                height: 10,//mm
                hConst: true,
                wConst: true
            });
        }
        for (let i = 0, k = 0; i < 10; i+=2, k++) {
            scrSpCan.add(rsections[k + 12], 'rect' + i, {
                parent: scrSpCan.get('pin' + i),
                hPaddingType: 'right',
                vPaddingType: 'bottom',
                hPos: 0.5,//percent
                vPos: 0.07,//percent
                width: 1,//mm
                height: 4,//mm
                hConst: true,
                wConst: false
            });
        }
        for (let i = 1, k = 0; i < 10; i+=2, k++){
            scrSpCan.add(rsections[k + 17], 'rect' + i, {
                parent: scrSpCan.get('pin' + i),
                hPaddingType: 'right',
                vPaddingType: 'bottom',
                hPos: 0.5,//percent
                vPos: 0.07,//percent
                width: 1,//mm
                height: 4,//mm
                hConst: true,
                wConst: false
            });
        }
    }

    function updateScaleRuler(ensure)
    {
        let wd = new THREE.Vector3();
        let objPlane = new THREE.Plane(camera.getWorldDirection(wd).clone());
        let planarDistance = new THREE.Vector3().subVectors(camera.position, control.target).length();
        scrSpCan.update(planarDistance);
        let secNum = parseInt(ssc.stage.toString().charAt(0));
        if(secNum == 1 && ssc.stage > 2 && ssc.stage < 10000 && ssc.aboveQuart) secNum = 10;
        let main = scrSpCan.get('main');
        if(main !== undefined) main.opt.width = scrSpCan.stage;
        for (let i = 0; i < 10; i++)
        {
            scrSpCan.get('rect' + i).obj.visible = false;
            scrSpCan.get('pin' + i).obj.visible = false;
        }
        scrSpCan.get('pin0').obj.visible = true;
        for (let i = 0; i < secNum; i++)
        {
            let rect = scrSpCan.get('rect' + i);
            rect.opt.width = main.opt.width / secNum;
            rect.obj.visible = true;
            if(i>0 && i<secNum) {
                let pin = scrSpCan.get('pin' + i);
                pin.obj.visible = true;
                pin.opt.hPos = i/secNum;
                pin.opt.height = 8;
                if(secNum == 10 && i == 5)
                {
                    pin.opt.height = 10;
                    rect.opt.vPos = 0.05;
                }
            }
        }
        scrSpCan.get('pin10').obj.visible = true;
        if(ensure)scrSpCan.update(planarDistance);
    }

    function mouseWheelHandler(event)
    {
        event.preventDefault();
        event.stopPropagation();
        
        let f = camera.fov;
        let delta = event.deltaY;
        f = Math.max(C_FOV_MIN, Math.min(C_FOV_MAX, f + delta/100));
        camera.fov = f;
        camera.updateProjectionMatrix();
    }

    var stages = [1,1,1,1,5,10,10,10,10,50,100,100,100,100,500,1000,1000,1000,1000,5000,10000,10000,10000,10000,50000,100000,100000,100000,100000,500000,1000000,1000000,1000000,1000000,5000000];
    var units  = ['mm','cm','dm','m','m','m','km'];
    //------------------------------------------------------------------------------------
    //BoundingBoxCalculations-------------------------------------------------------------
    var calcObj;
    function cameraSpaceBoundingBox(withRuler)
    {
        if(calcObj === undefined)
        {
            calcObj = {
                obj2calc: sceneObjectsMesh[0],
                cam2calc: camera,
                bVx: sceneObjectsMesh[0].geometry.getAttribute('position').array,
            };
        }
        if(orthocam) calcObj.cam2calc = co;
        else calcObj.cam2calc = camera;
        let minx = Infinity, miny = Infinity;
        let maxx = -Infinity, maxy = -Infinity;

        for (let bvxI = 0; bvxI < calcObj.bVx.length; bvxI+=3) {
            const vx = new THREE.Vector3().set(calcObj.bVx[bvxI],calcObj.bVx[bvxI+1],calcObj.bVx[bvxI+2]);
            const cvx = calcObj.cam2calc.worldToLocal(calcObj.obj2calc.localToWorld(vx));
            if(cvx.x < minx) minx = cvx.x;
            if(cvx.y < miny) miny = cvx.y;
            if(cvx.x > maxx) maxx = cvx.x;
            if(cvx.y > maxy) maxy = cvx.y;
        }
        let low = new THREE.Vector2(minx,miny);
        let high = new THREE.Vector2(maxx,maxy);
        let center = new THREE.Vector2().addVectors(high,low).multiplyScalar(0.5);
        let visibleSize = new THREE.Vector2().subVectors(high,low);
        visibleSize.addVectors(visibleSize,visibleSize.clone().multiplyScalar(0.03));
        if(withRuler)
        {
            let rulerHeight = scrSpCan.get('scaleLabel').obj.scale.y;
            visibleSize.y = visibleSize.y + rulerHeight/2;
            let div = new THREE.Vector3(0,rulerHeight/4);
            center.subVectors(center,div);
        }
        center = calcObj.cam2calc.localToWorld(new THREE.Vector3().set(center.x,center.y,0));
        return {visibleSize, center};
    }
    //------------------------------------------------------------------------------------

    function TestCorrectRulerVisibility()
    {
        if(controllers.ruler)
        {
            if(pinsGroup !== 'undefined' && pinsGroup.children.length > 0)
            {
                pinsGroup.traverse(pin => {
                    pin.traverse(pinElement => {
                        pinElement.visible = true;
                    });
                });
            }
        }
    }

    function rotateObject() {
        sceneObjectsMesh[0].rotateOnWorldAxis(new THREE.Vector3(0,0,1), Math.PI/2);
    }

    function getRot()
    {
        return new THREE.Quaternion().copy(sceneObjectsMesh[0].quaternion);
    }

    function processOutline(canvas, modelDataUrl, rulerDataUrl, clearColor)
    {
        const tC = {
            r:240,
            g:240,
            b:240
        };
        const cW = canvas.width;
        const cH = canvas.height;
        const cWB = cW * 4; // canvas width in bytes
        let modelCanvas = document.createElement('canvas');
        modelCanvas.width = cW;
        modelCanvas.height = cH;
        let image = new Image();
        image.onload = function () {
            let ctx = modelCanvas.getContext('2d');
            ctx.drawImage(image,0,0);
            let imageData = ctx.getImageData(0,0,cW,cH);
            let data = imageData.data;
            let imageData2 = new ImageData(cW,cH);
            let data2 = imageData2.data;
            for(let x = 4; x < cWB - 4; x+=4)
            {
                for(let y = 1; y < cH - 1; y++)
                {
                    let pR = data[y*cWB + x];
                    let pG = data[y*cWB + x + 1];
                    let pB = data[y*cWB + x + 2];
                    let pA = data[y*cWB + x + 3];
                    
                    if(pA === 0)
                    {
                        const nb = new Uint8ClampedArray(32);
                        let p1i = {x: x-4, y: y-1}; //top left index
                        //pixels above
                        //top left neighbour
                        nb[0] = data[p1i.y * cWB + p1i.x];
                        nb[1] = data[p1i.y * cWB + p1i.x + 1];
                        nb[2] = data[p1i.y * cWB + p1i.x + 2];
                        nb[3] = data[p1i.y * cWB + p1i.x + 3];
                        //top center neighbour
                        nb[4] = data[p1i.y * cWB + p1i.x + 4];
                        nb[5] = data[p1i.y * cWB + p1i.x + 5];
                        nb[6] = data[p1i.y * cWB + p1i.x + 6];
                        nb[7] = data[p1i.y * cWB + p1i.x + 7];
                        //top right neighbour
                        nb[8] = data[p1i.y * cWB + p1i.x + 8];
                        nb[9] = data[p1i.y * cWB + p1i.x + 9];
                        nb[10] = data[p1i.y * cWB + p1i.x + 10];
                        nb[11] = data[p1i.y * cWB + p1i.x + 11];
                        //pixels inline
                        p1i.y++;
                        //right neighbour
                        nb[12] = data[p1i.y * cWB + p1i.x];
                        nb[13] = data[p1i.y * cWB + p1i.x + 1];
                        nb[14] = data[p1i.y * cWB + p1i.x + 2];
                        nb[15] = data[p1i.y * cWB + p1i.x + 3];
                        //left neighbour
                        nb[16] = data[p1i.y * cWB + p1i.x + 8];
                        nb[17] = data[p1i.y * cWB + p1i.x + 9];
                        nb[18] = data[p1i.y * cWB + p1i.x + 10];
                        nb[19] = data[p1i.y * cWB + p1i.x + 11];
                        //pixels below
                        p1i.y++;
                        //bottom left neighbour
                        nb[20] = data[p1i.y * cWB + p1i.x];
                        nb[21] = data[p1i.y * cWB + p1i.x + 1];
                        nb[22] = data[p1i.y * cWB + p1i.x + 2];
                        nb[23] = data[p1i.y * cWB + p1i.x + 3];
                        //bottom center neighbour
                        nb[24] = data[p1i.y * cWB + p1i.x + 4];
                        nb[25] = data[p1i.y * cWB + p1i.x + 5];
                        nb[26] = data[p1i.y * cWB + p1i.x + 6];
                        nb[27] = data[p1i.y * cWB + p1i.x + 7];
                        //bottom right neighbour
                        nb[28] = data[p1i.y * cWB + p1i.x + 8];
                        nb[29] = data[p1i.y * cWB + p1i.x + 9];
                        nb[30] = data[p1i.y * cWB + p1i.x + 10];
                        nb[31] = data[p1i.y * cWB + p1i.x + 11];
                        
                        for(let i = 0; i < 32; i+=4)
                        {
                            if(nb[i + 3] != 0)
                            {
                                pR = 0;
                                pG = pB = 0;
                                pA = 255;
                                break;
                            }
                        }
                    }
                    else
                    {
                        pA = 255;
                    }

                    data2[y*cWB + x] = pR;
                    data2[y*cWB + x + 1] = pG;
                    data2[y*cWB + x + 2] = pB;
                    data2[y*cWB + x + 3] = pA;
                }
            }
            for(let x = 0; x < cWB; x+=4)
            {
                for(let y = 0; y < cH; y++)
                {
                    let d2A = THREE.MathUtils.mapLinear(data2[y*cWB + x + 3],0,255,0,1);
                    if( d2A < 1)
                    {
                        data2[y*cWB + x] = Math.round(data2[y*cWB + x] * d2A + clearColor[0] * (1-d2A));
                        data2[y*cWB + x + 1] = Math.round(data2[y*cWB + x + 1] * d2A + clearColor[1] * (1-d2A));
                        data2[y*cWB + x + 2] = Math.round(data2[y*cWB + x + 2] * d2A + clearColor[2] * (1-d2A));
                        data2[y*cWB + x + 3] = 255;
                    }
                }
            }
            let rulerCanvas = document.createElement('canvas');
            rulerCanvas.width = cW;
            rulerCanvas.height = cH;
            let rImage = new Image();
            rImage.onload = function(){
                let rctx = rulerCanvas.getContext('2d');
                rctx.drawImage(rImage,0,0);
                let rImageData = rctx.getImageData(0,0,cW,cH);
                let rdata = rImageData.data;
                for(x = 0; x < cWB; x+=4)
                {
                    for(y = 0; y < cH; y++)
                    {
                        let rA = THREE.MathUtils.mapLinear(rdata[y*cWB + x + 3],0,255,0,1);
                        if(rA > 0)
                        {
                            data2[y*cWB + x] = Math.round(data2[y*cWB + x] * (1-rA) + rdata[y*cWB + x] * rA);
                            data2[y*cWB + x + 1] = Math.round(data2[y*cWB + x + 1] * (1-rA) + rdata[y*cWB + x + 1] * rA);
                            data2[y*cWB + x + 2] = Math.round(data2[y*cWB + x + 2] * (1-rA) + rdata[y*cWB + x + 2] * rA);
                        }
                    }
                }
                ctx.putImageData(imageData2, 0, 0);
                downloadImage(modelCanvas.toDataURL("image/jpeg", 1));
            };
            rImage.src = rulerDataUrl;
        };
        image.src = modelDataUrl;
    }

    function ColorToRGB(color)
    {
        let R = parseInt("0x"+color[0]+color[1]);
        let G = parseInt("0x"+color[2]+color[3]);
        let B = parseInt("0x"+color[4]+color[5]);
        let rgb = new Uint8ClampedArray(4);
        rgb[0] = R;
        rgb[1] = G;
        rgb[2] = B;
        rgb[3] = 255;

        return rgb;
    }

    let texReconstVal = 0;

    function setMorphTargetWeight(value){
        material.userData.rt_value.value = value;
    }

    return {
        appendTo: appendTo,
        render: render,
        switchEnv: switchEnv,
        redrawTexture: redrawTexture,
        rulerDistance: getDistance,
        getRotation: getRot,
        saveOptions: saveOptions,
        getNewLabel: getNewLabel,
        addLabels: addLabels,
        camera: camera,
        renderer: renderer,
        orthographer: orthographer,
        olEnabled: olEnabled,
    };
}
