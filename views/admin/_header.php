<div class="row">
    <?= yii\bootstrap\Nav::widget([
        'options' => ['class' => 'navbar-nav'],
        'items' => [
            ['label' => 'Objects', 'url' => ['admin/index']],
            ['label' => 'List Object Setting', 'url' => ['admin/list-object-setting']],
            ['label' => 'List Object Option', 'url' => ['admin/list-object-option']],
            ['label' => 'Categories', 'url' => ['admin/list-category']],
        ],
    ]) ?>
</div>
