<?php
use yii\helpers\Html;
use yii\helpers\Url;

?>
    <div class="row">
        <div class="col-xs-12">
            <div class="pull-right">
                <?= Html::a('Добавить категорию', ['admin/add-category'],['class' => 'btn btn-primary']) ?>
            </div>
        </div>
    </div>

    <br>
<?php if(!empty($categories)): ?>
    <div class="list-group">
        <?php if(!empty($categories)): ?>
            <?php foreach($categories as $category): ?>
                <a class="list-group-item" href="<?= Url::to(['admin/edit-category', 'id' => $category->id]) ?>">
                    <?= $category->name ?>
                    <span class="badge"><?= count($category->objects) ?></span>
                </a>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
<?php endif; ?>