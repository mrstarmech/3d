<?php
use yii\helpers\Html;
use yii\helpers\Url;
?>
<?php if(!empty($objects)): ?>
    <?php foreach($objects as $object): ?>
        <div class="col-xs-3">
            <div class="item-object">
                <a href="<?= Url::to(['admin/edit-object', 'id' => $object->id]) ?>">
                    <div style="
                        display: block;
                        width: 100%;
                        height: 200px;
                        background: url('<?= '/' . $object->pathImage . '/' . $object->id . '/' . $object->image ?>') no-repeat;
                        background-position: center;
                        background-size: cover;
                        "></div>
                </a>
                <h2><?= $object->name?></h2>
                <p><?= $object->description ?? '&nbsp;'?></p>
                <?= Html::a('view', ['admin/edit-object', 'id' => $object->id]) ?>
            </div>
        </div>
    <?php endforeach; ?>
<?php endif; ?>
