<?php
use yii\helpers\Html;
use yii\helpers\Url;
?>

<?php if(!empty($objects)): ?>
<div class="row">
    <?php foreach($objects as $object): ?>
        <div class="col-xs-12 col-sm-6 col-md-4">
            <div class="item-object">
                <a href="<?= Url::to(['object/view', 'id' => $object->id]) ?>">
                    <div style="
                            display: block;
                            width: 100%;
                            height: 250px;
                            <?php if(!empty($object->image)): ?>
                                background: url('<?= '/' . $object->pathImage . '/' . $object->id . '/' . $object->image ?>') no-repeat;
                            <?php else: ?>
                                background: url('/img/poster.none.png') no-repeat;
                            <?php endif; ?>
                            background-size: cover;
                            background-position: center;
                            ">

                    </div>
                </a>
                <span><?= $object->name?></span>
            </div>
        </div>
    <?php endforeach; ?>
</div>
<?php endif; ?>
