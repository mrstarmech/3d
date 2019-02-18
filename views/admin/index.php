<?php
use yii\helpers\Html;
use yii\helpers\Url;
use yii\widgets\LinkPager;

?>
<div class="row">
    <div class="col-xs-12">
        <div class="pull-right">
            <?= Html::a('Добавить модель', ['admin/add-object'],['class' => 'btn btn-primary']) ?>
        </div>
    </div>
</div>

<?php if(!empty($objects)): ?>
    <div class="row">
        <?php foreach($objects as $object): ?>


        <?php
        // Следует решить как хранить превью к модели (должно оно совпадать с постером или нет, если нет - сделать интерфейс загрузки) 
            if (empty($object->image)){
                if (empty(json_decode($object->setting)->poster)) {
                    $backgroundUrl = '/img/poster.none.jpg';
                }
                else $backgroundUrl = json_decode($object->setting)->poster;
            }
            else $backgroundUrl = '/' . $object->pathImage . '/' . $object->id . '/' . $object->image;
        ?>
            <div class="col-xs-12 col-sm-6 col-md-4">
                <div class="item-object">
                    <a href="<?= Url::to(['admin/edit-object-general', 'id' => $object->id]) ?>">
                        <div style="
                                display: block;
                                width: 100%;
                                height: 250px;
                                background: url('$backgroundUrl') no-repeat;
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

<div class="clearfix"></div>

<?= LinkPager::widget([
    'pagination' => $pages,
]); ?>