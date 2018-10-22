<?php

use yii\helpers\Html;
use yii\helpers\Url;

$this->title = Yii::t('app', 'Category');
$this->params['breadcrumbs'][] = $this->title;
?>
<h1><?= $this->title ?></h1>
<?php if (!empty($all) and !empty($categories)): ?>
    <div class="list-group">
        <?php if (!empty($all)): ?>
            <a class="list-group-item" href="<?= Url::to(['category/view', 'id' => 'all']) ?>">
                <?= Yii::t('app', 'All') ?>
                <span class="badge"><?= count($all) ?></span>
            </a>
        <?php endif; ?>
        <?php if (!empty($categories)): ?>
            <?php foreach ($categories as $category): ?>
                <?php if (count($category->objects)): ?>
                    <a class="list-group-item" href="<?= Url::to(['category/view', 'id' => $category->id]) ?>">
                        <?= $category->name ?>
                        <span class="badge"><?= count($category->objects) ?></span>
                    </a>
                    <?php
                    ?>
                <?php endif; ?>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
<?php endif; ?>
