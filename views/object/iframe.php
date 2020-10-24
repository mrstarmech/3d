<?php

use yii\helpers\Html;
use app\assets\Iframe3dAsset;

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

$licenseInfo = ['author'=>$object->author, 'copyright'=>$object->copyright, 'license'=>$object->license];
$licinfo = json_encode($licenseInfo);

$script = <<< JS
object = {
    option: $object->option,
    setting: $object->setting,
    labels: $labelsJson,
    licinfo: $licinfo
};

object.option.backgroundColor = '$bgColor';

start();

JS;

Iframe3dAsset::register($this);
$this->registerJs($script, yii\web\View::POS_READY);

$this->title = $object->name;
?>
<div class="tree-object">
    <div class="container-object" data-state="static"
         style="background: url(<?= '/' . $object->pathImage . '/' . $object->id . '/' . $object->image ?>) center center / cover;">
        <?= Html::a('3d.nsu.ru', Yii::$app->urlManager->createAbsoluteUrl(['/object/view', 'id' => $object->link]), ['class' => 'link-site', 'target' => '_blank']) ?>
        <div class="canvas-object"></div>
    </div>
</div>
