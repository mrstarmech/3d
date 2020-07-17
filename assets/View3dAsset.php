<?php

namespace app\assets;

use yii\web\AssetBundle;

/**
 * Class View3dAsset
 * @package app\assets
 */
class View3dAsset extends AssetBundle
{
    public $basePath = '@webroot';
    public $baseUrl = '@web';
    public $css = [
        'css/loader.object.css?20200430',
        'css/jquery.fancybox.min.css',
        'css/colorpicker.css',
    ];
    public $js = [
        'js/three/dat.gui.min.js',
        'js/three/three.min.js?202007130',
        'js/three/OrbitControls.js?202007130',
        'js/three/OBJLoader.js',
        'js/three/MTLLoader.js',
        'js/three/UTF8Loader.js',
        'js/three/GLTFLoader.js',
        'js/three/DRACOLoader.js',
        'js/three/TrackballControls.js',
        'js/jquery.fancybox.min.js',
        'js/colorpicker.min.js',
        'js/viewer.js?2020071335',
        'js/label.js',
        'js/loader.object.js?202007136',
    ];
    public $depends = [
        'yii\web\YiiAsset',
        'yii\bootstrap\BootstrapPluginAsset',
        'rmrevin\yii\fontawesome\AssetBundle',
    ];
}






