<?php

/* @var $this yii\web\View */
/* @var $form yii\bootstrap\ActiveForm */

/* @var $model app\models\LoginForm */

use yii\helpers\Html;
use yii\bootstrap\ActiveForm;
use mihaildev\ckeditor\CKEditor;
use mihaildev\elfinder\ElFinder;
use app\models\Category;


$this->title = 'Редактировать категорию';
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

<div class="clearfix"></div>

<br>
<div class="row">
    <div class="col-xs-12 text-right">
        <br>
        <?= Html::a('Просмотр', ['category/view', 'id' => $model->id]) ?>
    </div>
</div>
<?php $form = ActiveForm::begin() ?>
<div class="row">

    <div class="col-xs-6">
        <?= $form->field($model, 'status')->dropDownList([
            Category::NOT_AVAILABLE => 'Не доступно',
            Category::AVAILABLE_MENU => 'Видно в меню',
            Category::AVAILABLE_REFERENCE => 'Доступно только по ссылке',
        ]) ?>
    </div>

    <div class="col-xs-6">
        <?= $form->field($model, 'parent')->dropDownList(
            \yii\helpers\ArrayHelper::map($availableParents, 'id', 'name')
        ) ?>
    </div>

    <div class="clearfix"></div>

    <div class="col-xs-6">

        <?= $form->field($model, 'name')->textInput(['autofocus' => true]) ?>
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
</div>
<div class="form-group">
    <?= Html::submitButton('Сохранить', ['class' => 'btn btn-primary']) ?>
    <div class="pull-right">
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

