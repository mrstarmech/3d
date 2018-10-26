<?php

/* @var $this yii\web\View */
/* @var $form yii\bootstrap\ActiveForm */
/* @var $model app\models\LoginForm */

use yii\helpers\Html;
use yii\bootstrap\ActiveForm;
use mihaildev\ckeditor\CKEditor;
use mihaildev\elfinder\ElFinder;

echo $this->render('_header');

$this->title = 'Редактировать категорию';
$this->params['breadcrumbs'][] = $this->title;
?>
<h1><?= Html::encode($this->title) ?> <small><?= $model->name ?></small></h1>

<small>
    Дата создания: <?= date("d.m.Y H:i:s", $model->created_at) ?>
    <br>
    Дата последнего изменения: <?= date("d.m.Y H:i:s", $model->updated_at) ?>
</small>

<div class="clearfix"></div>

<br>

<?php $form = ActiveForm::begin() ?>
<div class="row">
    <div class="col-xs-6">

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
    </div>
    <div class="col-xs-6">

        <?= $form->field($model, 'name_en')->textInput(['autofocus' => true]) ?>
        <?= $form->field($model, 'description_en')->widget(CKEditor::className() ,
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
    </div>
</div>
<div class="form-group">
        <?= Html::submitButton('Сохранить', ['class' => 'btn btn-primary']) ?>    <div class="pull-right">
        <?= Html::a('Удалить категорию', [
            'admin/delete-category',
            'id' => $model->id
        ],
            [
                'class' => 'btn btn-danger',
                'data' => [
                    'confirm' => 'Вы уверены, что хотите удалить эту категорию?',
                    'method' => 'post',
                ],
            ]) ?>
    </div>
</div>

<?php ActiveForm::end(); ?>

