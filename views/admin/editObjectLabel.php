<?php
use yii\helpers\Html;
use yii\bootstrap\ActiveForm;
use mihaildev\ckeditor\CKEditor;
use mihaildev\elfinder\ElFinder;

$this->registerJsFile('js/lib.tree.js',['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/viewer.js',['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/label.js',['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);

$this->registerCssFile('css/loader.object.css', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/loader.object.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);

$this->registerJsFile('js/tmp.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->title = $object->name;
$this->params['breadcrumbs'][] = $this->title;

echo $this->render('_header');
echo $this->render('_header_object', ['id' => $object->id]);
?>
<div class="col-xs-12 tree-object" data-tree-object="<?= $object->id ?>"></div>

<div class="col-xs-12">
    <h1><?= $this->title ?></h1>
    <?php
    $form = ActiveForm::begin([
        'options' => ['enctype' => 'multipart/form-data'],
    ]);
    ?>

    <?= $form->field($label, 'position')->textInput() ?>
    <?= $form->field($label, 'description')->widget(CKEditor::className() ,
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