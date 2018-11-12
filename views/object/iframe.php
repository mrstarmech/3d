<?php

use yii\helpers\Html;

$this->registerJsFile('js/lib.tree.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/viewer.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/label.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);

$this->registerCssFile('css/loader.object.css', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/loader.object.iframe.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);

$this->registerCssFile('css/iframe.css', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);

$this->registerCssFile('css/jquery.fancybox.min.css', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/jquery.fancybox.min.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);

$dataLabels = [];
$labels = $object->labels;
$bgColor = !empty($color) ? '#' . $color : '#fffffd';
if (!empty($labels)) {
    foreach ($labels as $label) {
        $dataLabels[] = [
            'id' => $label->id,
            'position' => json_decode($label->position),
            'description' => $label->description,
        ];
    }
}

$labelsJson = json_encode($dataLabels);
$script = <<< JS
object = {
    option: $object->option,
    setting: $object->setting,
    labels: $labelsJson
};

object.option.backgroundColor = '$bgColor';

start();

JS;

$this->registerJs($script, yii\web\View::POS_READY);

$this->title = $object->name;
?>
<div class="tree-object">
    <div class="container-object" data-state="static"
         style="background: url(<?= '/' . $object->pathImage . '/' . $object->id . '/' . $object->image ?>) center center / cover;">
        <?= Html::a('3d.nsu.ru', Yii::$app->params['host'] . '/object/view/' . $object->link, ['class' => 'link-site', 'target' => '_blank']) ?>
        <div class="canvas-object"></div>
    </div>
</div>
