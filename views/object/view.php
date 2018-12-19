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
?>
<div class="col-xs-12 col-md-6 tree-object">
    <div class="container-object" data-state="static">
        <div class="canvas-object"></div>
    </div>
    <?php if (Yii::$app->user->can(\app\models\User::ROLE_ADMINISTRATOR)): ?>
        <div class="text-right">
            <?= $object->tech_info ?>
        </div>
        <br>
    <?php endif; ?>
</div>
<?php if (Yii::$app->user->can(\app\models\User::ROLE_ADMINISTRATOR)): ?>
    <div class="pull-right">
        <?= Html::a(Yii::t('app', 'Edit'), ['admin/edit-object-general', 'id' => $object->id], ['class' => 'btn btn-primary']) ?>
    </div>
<?php endif; ?>
<h1><?= $this->title ?></h1>

<?= $object->description ?>
