<?php
use yii\helpers\Html;
use yii\helpers\Url;

$this->title = 'Категория «' . $category->name . '»';
$this->params['breadcrumbs'] = [
    ['label' => 'Категории', 'url' => ['/category/index']],
    $category->name,
];
?>
<h1><?= $category->name ?></h1>
<?php if(!empty($category->objects)): ?>
   <div class="row">
        <?php foreach($category->objects as $item): ?>
            <div class="col-xs-12 col-sm-6 col-md-4">
                <div class="item-object">
                    <a href="<?= Url::to(['object/view', 'id' => $item->object->id]) ?>">
                        <div style="
                                display: block;
                                width: 100%;
                                height: 250px;
                        <?php if(!empty($item->object->image)): ?>
                                background: url('<?= '/' . $item->object->pathImage . '/' . $item->object->id . '/' . $item->object->image ?>') no-repeat;
                        <?php else: ?>
                                background: url('/img/poster.none.png') no-repeat;
                        <?php endif; ?>
                                background-size: cover;
                                background-position: center;
                                ">

                        </div>
                    </a>
                    <span><?= $item->object->name?></span>
                </div>
            </div>
        <?php endforeach; ?>
   </div>
<?php endif; ?>