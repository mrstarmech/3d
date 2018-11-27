<?php

use yii\helpers\Html;
use yii\bootstrap\ActiveForm;
use yii\helpers\ArrayHelper;
use mihaildev\ckeditor\CKEditor;
use mihaildev\elfinder\ElFinder;
use kdn\yii2\JsonEditor;
use yii\helpers\Url;

echo $this->render('_header');
echo $this->render('_header_object', ['id' => $model->id]);

$this->title = 'Редактирование модели';
$this->params['breadcrumbs'][] = $this->title;

?>
<h1><?= Html::encode($this->title) ?>
    <small><?= $model->name ?></small>
</h1>

<small>
    Дата создания: <?= date("d.m.Y H:i:s", $model->created_at) ?>
    <br>
    Дата последнего изменения: <?= date("d.m.Y H:i:s", $model->updated_at) ?>
</small>

<div class="pull-right">
    <?= Html::a('Просмотр', ['object/view', 'id' => $model->id]) ?>
</div>
<?php $form = ActiveForm::begin([
    'options' => ['enctype' => 'multipart/form-data'],
]); ?>

<div class="row">
    <div class="clearfix">
        <div class="col-xs-6">
            <?= $form->field($model, 'visible')->checkbox() ?>
        </div>
    </div>
    <div class="clearfix">
        <div class="col-xs-6">
            <?= $form->field($model, 'sef')->textInput() ?>
        </div>
    </div>
    <div class="col-xs-6">
        <?= $form->field($model, 'name')->textInput() ?>
        <?= $form->field($model, 'description')->widget(CKEditor::className(),
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
        <?= $form->field($model, 'description_en')->widget(CKEditor::className(),
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

        <?= $form->field($model, 'fileImage')->fileInput() ?>

        <?php
        if (!empty($model->contentObj)) {
            echo Html::a('Редактировать файл OBJ', ['admin/edit-file-obj', 'id' => $model->id]);
        }
        ?>
        <?= $form->field($model, 'fileObj')->fileInput() ?>

        <?php
        if (!empty($model->contentMtl)) {
            echo Html::a('Редактировать файл MTL', ['admin/edit-file-mtl', 'id' => $model->id]);
        }
        ?>
        <?= $form->field($model, 'fileMtl')->fileInput() ?>


        <?= $form->field($model, 'fileTexture')->fileInput() ?>

        <?php
        if (!empty($model->contentUtfJs)) {
            echo Html::a('Редактировать файл UTF JS', ['admin/edit-file-utf-js', 'id' => $model->id]);
        }
        ?>
    </div>
    <div class="col-xs-6">
        <?= $form->field($model, 'tech_info')->textarea() ?>
    </div>

    <div class="clearfix"></div>

    <div class="col-xs-6">
        <?= $form->field($model, 'option')->widget(
            JsonEditor::className(),
            [
                'clientOptions' => ['modes' => ['code', 'tree']],
            ]
        ) ?>
    </div>
    <div class="col-xs-6">
        <?= $form->field($model, 'setting')->widget(
            JsonEditor::className(),
            [
                'clientOptions' => ['modes' => ['code', 'tree']],
            ]
        ) ?>
    </div>
</div>

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

