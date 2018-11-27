<?php

use yii\helpers\Html;
use yii\bootstrap\ActiveForm;
use conquer\codemirror\CodemirrorWidget;

echo $this->render('_header');
echo $this->render('_header_object', ['id' => $object->id]);

$this->title = 'Редактирование файла';
$this->params['breadcrumbs'][] = $this->title;
?>
<h1><?= Html::encode($this->title) ?>
    <small><?= $object->name ?> (UtfJs)</small>
</h1>

<?php $form = ActiveForm::begin([
    'options' => ['enctype' => 'multipart/form-data'],
]); ?>

<?= $form->field($object, 'contentUtfJs')->widget(
    CodemirrorWidget::className(),
    [
        'preset' => 'php',
        'options' => ['rows' => 20],
    ]
);
?>
<div class="form-group">
    <?= Html::submitButton('Сохранить', ['class' => 'btn btn-primary']) ?>
</div>

<?php ActiveForm::end(); ?>

