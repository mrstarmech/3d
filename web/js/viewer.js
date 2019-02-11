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

    var selfObj = this,
        scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera(60, 1 / 1, 2, 5000),
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
        createLabel: false
    };

    var label = [],
        newlabel = null;

    alertMessages = {
        noWebglSupport: 'Sorry, but your browser doesn\'t even know what WebGL is.',
        noSupportError: 'No WebGL support found.',
        webglDisabled: 'WebGL disabled.',
        disabledError: 'webGL disabled.'
    };

    function appendTo(object) {
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
                    var modelSize = getBoundingSphereRadius();
                    modelSize = modelSize * 2;
                    camera.position.set(modelSize * options.cameraDistanceMultiplier, 0, 0);
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

                // projector = new THREE.Projector();
                // document.addEventListener( 'mousedown', onDocumentMouseDown, false );

                renderer.domElement.addEventListener('mousedown', onContainerMouseDown, false);
                window.addEventListener('resize', onWindowResize, false);


                addLabels();
                animate();
            }
            ;
        });
    };

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
        if (model.texture !== undefined && model.texture !== '') {
            var texture = new THREE.ImageUtils.loadTexture(model.texture);
            parametersMaterial.map = texture;
        } else {
            var texture = new THREE.ImageUtils.loadTexture();
        }

        var material = new THREE.MeshLambertMaterial(parametersMaterial);

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

                            } else if (controllers.originMaterial[i] !== undefined) {
                                item.material = controllers.originMaterial[i];
                            }

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

            var p = intersects.point;

            pinPoints['intersections'].push(p);

            helpers.mouseHelper.position.copy(p);
            intersection.point.copy(p);

            var n = intersects.face.normal.clone();
            var rulerDrawPoint = n.clone().multiplyScalar(0.7);
            rulerDrawPoint.add(intersects.point);
            n.multiplyScalar(5);
            n.add(intersects.point);
            pinPoints['rulerPoints'].push(rulerDrawPoint);

            intersection.normal.copy(intersects.face.normal);
            helpers.mouseHelper.lookAt(n);

            var pinLine = new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial({
                color: 0x000033,
                linewidth: 4
            }));
            pinLine.geometry.vertices.push(intersection.point);
            pinLine.geometry.vertices.push(n);
            pinLine.geometry.verticesNeedUpdate = true;

            var sphereRadius = getBoundingSphereRadius();
            sphereRadius = (sphereRadius * 5) / 100;

            var pinSphere = new THREE.Mesh(new THREE.SphereGeometry(sphereRadius, 32, 32), new THREE.MeshBasicMaterial({color: 0x349938}));
            pinSphere.position.copy(pinLine.geometry.vertices[1]);

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
    };

    function animate() {
        requestAnimationFrame(animate);
        render();
    };

    function render() {
        camera.lookAt(scene.position);
        control.update();
        if (scene.getObjectByName('sceneCameraLight', true)) {
            var elem = scene.getObjectByName('sceneCameraLight', true);
            elem.position.copy(camera.position);
        }
        ;
        renderer.render(scene, camera);
    };

    return {
        appendTo: appendTo,
        switchEnv: switchEnv,
        rulerDistance: getDistance,
        saveOptions: saveOptions,
        getNewLabel: getNewLabel,
        addLabels: addLabels,
        camera: camera,
        renderer: renderer
    };
};