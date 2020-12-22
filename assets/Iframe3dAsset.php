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
        'js/three/three.min.js?20200311',
        'js/three/OrbitControls.js?20200311',
        'js/three/OBJLoader.js?20200311',
        'js/three/MTLLoader.js?20200311',
        'js/three/GLTFLoader.js?20200311',
        'js/three/DRACOLoader.js?20200311',
        'js/three/TrackballControls.js?20200311',
        'js/three/postprocessing/EffectComposer.js?20200311',
        'js/three/postprocessing/ShaderPass.js?20200311',
        'js/three/shaders/CopyShader.js?20200311',
        'js/three/postprocessing/RenderPass.js?20200311',
        'js/three/postprocessing/OutlinePass.js?20200311',
        'js/jquery.fancybox.min.js',
        'js/colorpicker.min.js',
        'js/viewer.js?20201222',
        'js/label.js',
        'js/loader.object.iframe.js?20201021',
    ];
    public $depends = [
        'yii\web\YiiAsset',
        'yii\bootstrap\BootstrapPluginAsset',
        'rmrevin\yii\fontawesome\AssetBundle',
    ];
}