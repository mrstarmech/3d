<?php

use yii\helpers\Html;
use app\assets\View3dAsset;

$dataLabels = [];
$labels = $object->labels;
if (!empty($labels)) {
    foreach ($labels as $label) {
        $dataLabels[] = [
            'id' => $label->id,
            'position' => json_decode($label->position),
            'description' => $label->description,
        ];
    }
}

$host = Yii::$app->urlManager->createAbsoluteUrl(['/']);
$labelsJson = json_encode($dataLabels);
$script = <<< JS
object = {
    id: $object->id,
    sef: '$object->link',
    option: $object->option,
    setting: $object->setting,
    labels: $labelsJson,
};
host = '$host';

start();

JS;

$this->title = $object->name;
$this->params['breadcrumbs'][] = $this->title;

View3dAsset::register($this);
\dominus77\highlight\Plugin::register($this);
$this->registerJs($script, yii\web\View::POS_READY);
?>


<div class="clearfix">
    <div class="col-xs-12 col-md-6 tree-object">
        <div class="container-object" data-state="static">
            <div class="canvas-object"></div>
        </div>
        <?php if (Yii::$app->user->can(\app\models\User::ROLE_ADMINISTRATOR) and !empty($object->tech_info)): ?>
            <div class="alert alert-info">
                <?= nl2br($object->tech_info) ?>
            </div>
        <?php endif; ?>
    </div>
    <?php if (Yii::$app->user->can(\app\models\User::ROLE_ADMINISTRATOR)): ?>
        <div class="pull-right">
            <?= Html::a(Yii::t('app', 'Edit'), ['admin/edit-object-general', 'id' => $object->id], ['class' => 'btn btn-primary']) ?>
        </div>
    <?php endif; ?>
    <h1><?= $this->title ?></h1>
    <?= $object->description ?>
</div>

<?php if($categoryId): ?>
    <div class="clearfix">
        <?php if($objectPrev): ?>
            <?= Html::a('<i class="fas fa-backward"></i> ' . $objectPrev->name, ['/object/view', 'categoryId' => $categoryId, 'id' => $objectPrev->link], ['class' => 'pull-left btn btn-default'])?>
        <?php endif; ?>
        <?php if($objectNext): ?>
            <?= Html::a($objectNext->name . ' <i class="fas fa-forward"></i>', ['/object/view', 'categoryId' => $categoryId, 'id' => $objectNext->link], ['class' => 'pull-right btn btn-default'])?>
        <?php endif; ?>

    </div>
<?php endif; ?>
