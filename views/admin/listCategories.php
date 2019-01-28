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
                <div class="list-group-item">
                    <?= Html::a('<i class="fas fa-edit"></i>', ['admin/edit-category', 'id' => $category->id], ['class' => 'pull-right1']) ?>
                    <?= Html::a(($category->status != \app\models\Category::NOT_AVAILABLE ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>'), ['category/view', 'id' => $category->id]) ?>
                    <?= $category->name ?>
                    <span class="badge"><?= count($category->objects) ?></span>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
<?php endif; ?>