<?php
use yii\helpers\Html;
use yii\helpers\Url;

echo $this->render('_header');

?>

<?= Html::a('Add', ['admin/add-category'],['class' => 'btn btn-primary']) ?>

<?php if(!empty($categories)): ?>
    <table class="table table-responsive table-bordered">
        <?php foreach($categories as $item): ?>
            <tr>
                <td>
                    <?= Html::a($item->name,['admin/edit-category','id' => $item->id]) ?>
                </td>
                <td>
                    <?= $item->description ?>
                </td>
            </tr>
        <?php endforeach; ?>
    </table>
<?php endif; ?>