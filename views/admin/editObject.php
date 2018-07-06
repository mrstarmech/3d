<?php

use yii\helpers\Html;
use yii\bootstrap\ActiveForm;
use yii\helpers\ArrayHelper;

$this->title = 'Edit 3d model';
$this->params['breadcrumbs'][] = $this->title;
?>
<h1><?= Html::encode($this->title) ?></h1>

<?php $form = ActiveForm::begin([
    'options' => ['enctype' => 'multipart/form-data'],
]); ?>

<?= $form->field($model, 'name')->textInput(['autofocus' => true]) ?>
<?= $form->field($model, 'description')->textarea() ?>

<?= $form->field($model, 'fileImage')->fileInput() ?>
<?= $form->field($model, 'fileObj')->fileInput() ?>
<?= $form->field($model, 'fileMtl')->fileInput() ?>
<?= $form->field($model, 'fileTexture')->fileInput() ?>
<div class="form-group">
    <?= Html::submitButton('Send', ['class' => 'btn btn-primary']) ?>
    <div class="pull-right">
        <?= Html::a('Delete', [
            'admin/delete-object',
            'id' => $model->id
        ],
        [
            'class' => 'btn btn-danger',
            'data' => [
                'confirm' => 'Are you sure you want to delete this item?',
                'method' => 'post',
            ],
        ]) ?>
    </div>
</div>

<?php ActiveForm::end(); ?>

<hr>
<?php
$categories_ = ArrayHelper::map($categories,'id', 'name');
?>
<?php if(!empty($objectCategories)): ?>
    <ul>
        <?php foreach ($objectCategories as $item): ?>
            <?php
            ArrayHelper::remove($categories_, $item->id);
            ?>
            <li><?= $item->category->name ?></li>
        <?php endforeach; ?>
    </ul>
<?php endif; ?>

<?php
$form = ActiveForm::begin([
    'options' => ['enctype' => 'multipart/form-data'],
]);
?>

<?= $form->field($objectCategory, 'id_category')->dropDownList($categories_,['class' => 'form-control']) ?>
<?= $form->field($objectCategory, 'id_object')->hiddenInput(['value' => $model->id])->label(false) ?>

<div class="form-group">
    <?= Html::submitButton('Send', ['class' => 'btn btn-primary']) ?>
</div>

<?php ActiveForm::end(); ?>

