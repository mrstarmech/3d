<?php

use yii\helpers\Html;
use yii\bootstrap\ActiveForm;
use conquer\codemirror\CodemirrorWidget;

echo $this->render('_header');
echo $this->render('_header_object', ['id' => $object->id]);

$this->title = 'Обработка';
$this->params['breadcrumbs'][] = $this->title;
?>
<h1><?= Html::encode($this->title) ?>
    <small><?= $object->name ?></small>
</h1>

<?php $form = ActiveForm::begin(); ?>

<div class="form-group">
    <?= Html::submitButton('Конвертировать текстуру в WEBP', [
        'name' => 'convertWebp',
        'class' => ['class' => 'btn btn-primary'],
        'disabled' => $object->contentObj ? false : true,
    ]) ?>
</div>

<div class="form-group">
    <?= Html::submitButton('Центрировать OBJ', [
        'name' => 'center',
        'class' => ['class' => 'btn btn-primary'],
        'disabled' => $object->contentObj ? false : true,
    ]) ?>
</div>

<div class="form-group">
    <?= Html::submitButton('Конвертировать OBJ в JS', [
        'name' => 'convertJs',
        'class' => ['class' => 'btn btn-primary'],
        'disabled' => $object->contentObj ? false : true,
    ]) ?>
</div>

<?php ActiveForm::end(); ?>

