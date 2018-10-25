<?php

/** @var \app\models\Object $object */

use yii\helpers\Html;
use yii\bootstrap\ActiveForm;
use mihaildev\ckeditor\CKEditor;
use mihaildev\elfinder\ElFinder;

$this->registerJsFile('js/lib.tree.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/viewer.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/label.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);

$this->registerCssFile('css/loader.object.css', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/loader.object.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);

$this->registerCssFile('css/jquery.fancybox.min.css', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/jquery.fancybox.min.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);

$dataLabels = [];
$labels = $object->labels;
if (!empty($labels)) {
    foreach ($labels as $label) {
        $dataLabels[] = [
            'id' => $label->id,
            'position' => json_decode($label->position),
            'description' =>
                Html::a('Редактировать метку', ['/admin/edit-object-label/' . $object->id, 'label_id' => $label->id], ['class' => ['btn btn-primary']])
                . ' ' . Html::a('Удалить', ['/admin/delete-object-label/' . $label->id], ['class' => ['delete btn btn-danger']])
                . $label->description,
        ];
    }
}

$dataOption = $object->optionArray;
$dataOption->autorotate = false;

$labelsJson = json_encode($dataLabels);
$optionJson = json_encode($dataOption);

$script = <<< JS

    $("a.delete").on("click", function() {
        return confirm("Вы действительно хотите удалить метку?");
    });

    object = {
        option: $optionJson,
        setting: $object->setting,
        labels: $labelsJson
    };
    
    start();
    t.switchEnv('createLabel', true);
JS;


$this->registerJs($script, yii\web\View::POS_READY);

$this->title = $object->name;
$this->params['breadcrumbs'][] = $this->title;

echo $this->render('_header');
echo $this->render('_header_object', ['id' => $object->id]);
?>

<?php if (!empty($model->id)): ?>
    <h2>Редактирование метки</h2>
    <div class="clearfix">
        <div class="pull-right">
            <?= Html::a('Добавить новую метку', ['/admin/edit-object-label/' . $object->id], ['class' => 'btn btn-primary']) ?>
        </div>
    </div>
<?php else: ?>
    <h2>Добавление новой метки</h2>
    <p class="alert alert-info">
        Чтобы изменить или удалить существующую метку, кликните на метку модели и нажмите "Редактировать метку", "Удалить" соответственно
    </p>
<?php endif; ?>

<div class="tree-object">
    <div class="container-object" data-state="static"
         style="background: url(<?= '/' . $object->pathImage . '/' . $object->id . '/' . $object->image ?>) center center / cover;">
        <div class="canvas-object"></div>
    </div>
</div>

<div class="col-xs-12">
    <h1><?= $this->title ?></h1>
    <?php
    $form = ActiveForm::begin();
    ?>

    <?= $form->field($model, 'position')->textInput() ?>
    <?= $form->field($model, 'description')->widget(CKEditor::className(),
        [
            'options' => [
                'allowedContent' => true,
            ],
            'editorOptions' => ElFinder::ckeditorOptions(
                'elfinder',
                [
                    'inline' => false,
                    'skin' => 'office2013,/js/cke/skins/office2013/'
                ]
            ),

        ]) ?>

    <div class="form-group">
        <?= Html::submitButton('Send', ['class' => 'btn btn-primary']) ?>
    </div>

    <?php ActiveForm::end(); ?>
</div>