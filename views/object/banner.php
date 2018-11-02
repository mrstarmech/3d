<?php

use yii\helpers\Html;

$this->registerJsFile('js/lib.tree.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/viewer.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/label.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);

$this->registerCssFile('css/loader.object.css', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/loader.object.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);

$this->registerCssFile('css/jquery.fancybox.min.css', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/jquery.fancybox.min.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);

$this->registerCssFile('css/colorpicker.css', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/colorpicker.min.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);


\dominus77\highlight\Plugin::register($this);

$dataLabels = [];
$object = $banner->object;
$labels = $object->labels;
if (!empty($labels)) {
    foreach ($labels as $label) {
        $dataLabels[] = [
            'id' => $label->id,
            'position' => json_decode($label->position),
            'description' => $label->description,
        ];
    }
}

$host = Yii::$app->params['host'];
$labelsJson = json_encode($dataLabels);
$script = <<< JS
object = {
    id: $object->id,
    sef: '$object->link',
    option: $object->option,
    setting: $object->setting,
    labels: $labelsJson,
};
host = '$host';
object.option.backgroundColor = '#ffffff';
object.option.menuDisable = true;
object.option.autorotate = true;
start();

JS;

$this->registerJs($script, yii\web\View::POS_READY);

$this->title = $object->name;
$this->params['breadcrumbs'][] = $this->title;
?>
<div class="row">
    <div class="col-xs-3 tree-object">
        <div class="container-object" style="height: 85px;" data-state="static"
             style="background: url(<?= '/' . $object->pathImage . '/' . $object->id . '/' . $object->image ?>) center center / cover;">
            <div class="canvas-object"></div>
        </div>
    </div>
    <div class="col-xs-9" style="font-size: 12px;">
        <div class="pull-right">
            <a href="<?= $host ?>" target="_blank" style="margin: 10px;">3d.nsu.ru</a>
        </div>
        <h4><?= $this->title ?></h4>
        <?= $banner->description ?>
        [<a href="<?= Yii::$app->urlManager->createAbsoluteUrl(['object/view', 'id' => $object->link]) ?>" target="_blank">Подробнее</a>]
    </div>
</div>
