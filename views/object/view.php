<?php
use yii\helpers\Html;

$this->registerJsFile('js/lib.tree.js',['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/viewer.js',['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/label.js',['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);

$this->registerCssFile('css/loader.object.css', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/loader.object.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);

$this->registerJsFile('js/tmp.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->title = $object->name;
$this->params['breadcrumbs'][] = $this->title;
?>
<div class="col-xs-12 col-md-6 tree-object" data-tree-object="<?= $object->id ?>"></div>
<?php if(1): // TODO: admin check ?>
    <div class="pull-right">
        <?= Html::a('Edit', ['admin/edit-object', 'id' => $object->id], ['class' => 'btn btn-primary'])?>
    </div>
<?php endif; ?>
<h1><?= $this->title ?></h1>
<?= $object->description ?>
