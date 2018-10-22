<?php

use yii\helpers\Html;

$this->registerJsFile('js/lib.tree.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/viewer.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/label.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);

$this->registerCssFile('css/loader.object.css', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/loader.object.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);

$this->registerJsFile('js/tmp.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);

$script = <<< JS
object = {
    option: $object->option,
    setting: $object->setting
};

start();

// console.log(object);
JS;

$this->registerJs($script, yii\web\View::POS_READY);

$this->title = $object->name;
$this->params['breadcrumbs'][] = $this->title;
?>
<div class="col-xs-12 col-md-6 tree-object">
    <div class="container-object" data-state="static"
         style="background: url(<?= '/' . $object->pathImage . '/' . $object->id . '/' . $object->image ?>) center center / cover;">
        <div class="canvas-object"></div>
    </div>
</div>
<?php if (!Yii::$app->user->isGuest): // TODO: admin check ?>
    <div class="pull-right">
        <?= Html::a('Edit', ['admin/edit-object-general', 'id' => $object->id], ['class' => 'btn btn-primary']) ?>
    </div>
<?php endif; ?>
<h1><?= $this->title ?></h1>
<?= $object->description ?>
