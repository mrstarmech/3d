<div class="clearfix">
    <?= yii\bootstrap\Nav::widget([
        'options' => ['class' => 'nav navbar navbar-nav'],
        'items' => [
            ('<li style="padding: 15px 15px 0 0">' . $object->name . '</li>'),
            ['label' => 'Общие', 'url' => ['admin/edit-object-general', 'id' => $object->id]],
            ['label' => 'Метки', 'url' => ['admin/edit-object-label', 'id' => $object->id]],
            ['label' => 'Категории', 'url' => ['admin/edit-object-category', 'id' => $object->id]],
            ['label' => 'Обработка', 'url' => ['admin/processing', 'id' => $object->id]],
            ['label' => 'Скриншот', 'url' => ['admin/shot', 'id' => $object->id]],
        ],
    ]) ?>
</div>
