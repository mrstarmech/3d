<?php

use yii\helpers\Html;
use yii\bootstrap\ActiveForm;
use yii\helpers\ArrayHelper;
use mihaildev\ckeditor\CKEditor;
use mihaildev\elfinder\ElFinder;

echo $this->render('_header');
echo $this->render('_header_object', ['id' => $model->id]);

$this->title = 'Редактирование модели';
$this->params['breadcrumbs'][] = $this->title;
?>
<h1><?= Html::encode($this->title) ?> <small><?= $model->name ?></small></h1>

<small>
    Дата создания: <?= date("d.m.Y H:i:s", $model->created_at) ?>
    <br>
    Дата последнего изменения: <?= date("d.m.Y H:i:s", $model->updated_at) ?>
</small>

<?php $form = ActiveForm::begin([
    'options' => ['enctype' => 'multipart/form-data'],
]); ?>

<?= $form->field($model, 'visible')->checkbox() ?>
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

<?= $form->field($model, 'fileImage')->fileInput() ?>
<?= $form->field($model, 'fileObj')->fileInput() ?>
<?= $form->field($model, 'fileMtl')->fileInput() ?>
<?= $form->field($model, 'fileTexture')->fileInput() ?>
<div class="form-group">
    <?= Html::submitButton('Сохранить', ['class' => 'btn btn-primary']) ?>

    <div class="pull-right">
        <?= Html::a('Удалить модель', [
            'admin/delete-object',
            'id' => $model->id
        ],
        [
            'class' => 'btn btn-danger',
            'data' => [
                'confirm' => 'Вы уверены, что хотите удалить эту модель?',
                'method' => 'post',
            ],
        ]) ?>
    </div>
</div>

<?php ActiveForm::end(); ?>

