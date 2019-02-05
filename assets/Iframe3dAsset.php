<?php

namespace app\assets;

use yii\web\AssetBundle;

/**
 * Class View3dAsset
 * @package app\assets
 */
class Iframe3dAsset extends AssetBundle
{
    public $basePath = '@webroot';
    public $baseUrl = '@web';
    public $css = [
        'css/loader.object.css',
        'css/iframe.css',
        'css/jquery.fancybox.min.css',
        'css/colorpicker.css',
    ];
    public $js = [
        'js/three/dat.gui.min.js',
        'js/three/three.min.js',
        'js/three/OrbitControls.js',
        'js/three/OBJLoader.js',
        'js/three/MTLLoader.js',
        'js/three/UTF8Loader.js',
        'js/three/GLTFLoader.js',
        'js/three/DRACOLoader.js',
        'js/three/TrackballControls.js',
        'js/jquery.fancybox.min.js',
        'js/colorpicker.min.js',
        'js/viewer.js?201901311622',
        'js/label.js',
        'js/loader.object.iframe.js',
    ];
    public $depends = [
        'yii\web\YiiAsset',
        'yii\bootstrap\BootstrapAsset',
        'rmrevin\yii\fontawesome\AssetBundle',
    ];
}






