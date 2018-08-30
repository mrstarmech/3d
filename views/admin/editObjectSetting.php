<?php

use yii\helpers\Html;
use yii\bootstrap\ActiveForm;

echo $this->render('_header');

$this->title = 'Edit Option';
$this->params['breadcrumbs'][] = $this->title;
?>
<?php
$form = ActiveForm::begin([
    'options' => ['enctype' => 'multipart/form-data'],
]);
?>

<?= $form->field($model, 'name')->textInput(['autofocus' => true]) ?>
<?= $form->field($model, 'default_value')->textInput() ?>

<div class="form-group">
    <?= Html::submitButton('Send', ['class' => 'btn btn-primary']) ?>
</div>

<?php ActiveForm::end(); ?>
