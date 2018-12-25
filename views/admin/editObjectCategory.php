<?php

use yii\helpers\Html;
use yii\bootstrap\ActiveForm;
use yii\helpers\ArrayHelper;
use mihaildev\ckeditor\CKEditor;
use mihaildev\elfinder\ElFinder;

echo $this->render('_header_object', ['object' => $model]);

$this->title = 'Редактирование категорий модели';
$this->params['breadcrumbs'][] = $this->title;
?>
<h1><?= Html::encode($this->title) ?> <small><?= $model->name ?></small></h1>

<div class="row">
    <div class="col-xs-6">
        <h3>
            Список категорий модели
        </h3>

        <?php
        $categories_ = ArrayHelper::map($categories,'id', 'name');
        ?>
        <?php if(!empty($objectCategories)): ?>
            <ul>
                <?php foreach ($objectCategories as $item): ?>
                    <?php
                    ArrayHelper::remove($categories_, $item->category_id);
                    ?>
                    <li>
                        <?= $item->category->name ?>
                        <?= Html::a('удалить', ['admin/delete-object-category', 'id' => $item->id]) ?>
                    </li>
                <?php endforeach; ?>
            </ul>
        <?php endif; ?>

    </div>
    <div class="col-xs-6">
        <h3>
            Добавить категории модели
        </h3>

        <?php
        $form = ActiveForm::begin([
            'options' => ['enctype' => 'multipart/form-data'],
        ]);
        ?>

        <?= $form->field($objectCategory, 'category_id')->dropDownList($categories_, ['class' => 'form-control'])->label(false) ?>
        <?= $form->field($objectCategory, 'object_id')->hiddenInput(['value' => $model->id])->label(false) ?>

        <div class="form-group">
            <?= Html::submitButton('Добавить', ['class' => 'btn btn-primary']) ?>
        </div>

        <?php ActiveForm::end(); ?>
    </div>
</div>

