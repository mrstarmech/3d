<?php
use yii\helpers\Html;
use yii\helpers\Url;

echo $this->render('_header');

?>

<?= Html::a('Add', ['admin/add-object-setting'],['class' => 'btn btn-primary']) ?>

<?php if(!empty($listObjectSetting)): ?>
    <table class="table table-responsive table-bordered">
        <?php foreach($listObjectSetting as $item): ?>
            <tr>
                <td>
                    <?= Html::a($item->name,['admin/edit-object-Setting','id' => $item->id]) ?>
                </td>
                <td>
                    <?= $item->default_value ?>
                </td>
            </tr>
        <?php endforeach; ?>
    </table>
<?php endif; ?>