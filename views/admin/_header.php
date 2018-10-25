<div class="row">
    <?= yii\bootstrap\Nav::widget([
        'options' => ['class' => 'navbar-nav'],
        'items' => [
            ['label' => 'Модели', 'url' => ['admin/index']],
            ['label' => 'Категории', 'url' => ['admin/list-category']],
        ],
    ]) ?>
</div>
