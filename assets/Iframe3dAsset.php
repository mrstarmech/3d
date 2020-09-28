<?php

namespace app\assets;

use yii\web\AssetBundle;

/**
 * Class View3dAsset
 *
 * @package app\assets
 */
class Iframe3dAsset extends AssetBundle
{
    public $basePath = '@webroot';
    public $baseUrl = '@web';
    public $css = [
        'css/loader.object.css?2020043',
        'css/iframe.css',
        'css/jquery.fancybox.min.css',
        'css/colorpicker.css',
    ];
    public $js = [
        'js/three/dat.gui.min.js',
        'js/three/three.min.js?123',
        'js/three/OrbitControls.js?123',
        'js/three/OBJLoader.js',
        'js/three/MTLLoader.js',
        'js/three/UTF8Loader.js',
        'js/three/GLTFLoader.js',
        'js/three/DRACOLoader.js',
        'js/three/TrackballControls.js',
        'js/three/postprocessing/EffectComposer.js',
        'js/three/postprocessing/ShaderPass.js',
        'js/three/shaders/CopyShader.js',
        'js/three/postprocessing/RenderPass.js',
        'js/three/postprocessing/OutlinePass.js?123',
        'js/jquery.fancybox.min.js',
        'js/colorpicker.min.js',
        'js/viewer.js?4',
        'js/label.js',
        'js/loader.object.iframe.js?4',
    ];
    public $depends = [
        'yii\web\YiiAsset',
        'yii\bootstrap\BootstrapPluginAsset',
        'rmrevin\yii\fontawesome\AssetBundle',
    ];
}






