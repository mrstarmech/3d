<?php

use yii\helpers\Html;
use yii\bootstrap\ActiveForm;
use mihaildev\ckeditor\CKEditor;
use mihaildev\elfinder\ElFinder;

echo $this->render('_header');

$this->title = 'Add 3d model';
$this->params['breadcrumbs'][] = $this->title;
?>
<div class="row">
    <h1><?= Html::encode($this->title) ?></h1>

    <?php $form = ActiveForm::begin([
        'options' => ['enctype' => 'multipart/form-data'],
    ]); ?>

    <?= $form->field($model, 'name')->textInput(['autofocus' => true]) ?>
    <?= $form->field($model, 'description')->widget(CKEditor::className() ,
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
        <div class="col-lg-offset-1 col-lg-11">
            <?= Html::submitButton('Send', ['class' => 'btn btn-primary']) ?>
        </div>
    </div>

    <?= strtotime('now')?>

    <?php ActiveForm::end(); ?>

</div>
