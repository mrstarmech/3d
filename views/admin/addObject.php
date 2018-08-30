<?php

use yii\helpers\Html;
use yii\bootstrap\ActiveForm;
use mihaildev\ckeditor\CKEditor;
use mihaildev\elfinder\ElFinder;

echo $this->render('_header');

$this->title = 'Добавить модель';
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
        <?= Html::submitButton('Добавить', ['class' => 'btn btn-primary']) ?>
    </div>

    <?php ActiveForm::end(); ?>

</div>
