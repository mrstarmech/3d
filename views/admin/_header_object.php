<div class="row">
    <?= yii\bootstrap\Nav::widget([
        'options' => ['class' => 'navbar-nav'],
        'items' => [
            ['label' => 'Общие', 'url' => ['admin/edit-object-general', 'id' => $id]],
            ['label' => 'Метки', 'url' => ['admin/edit-object-label', 'id' => $id]],
            ['label' => 'Категории', 'url' => ['admin/edit-object-category', 'id' => $id]],
            ['label' => 'Обработка', 'url' => ['admin/processing', 'id' => $id]],
            ['label' => 'Скриншот', 'url' => ['admin/shot', 'id' => $id]],
        ],
    ]) ?>
</div>
