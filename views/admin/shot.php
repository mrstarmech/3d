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

start();

JS;

$this->registerJs($script, yii\web\View::POS_READY);

$this->title = $object->name;
$this->params['breadcrumbs'][] = $this->title;

echo $this->render('_header');
echo $this->render('_header_object', ['id' => $object->id]);
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
