<?php

use yii\helpers\Html;
use yii\helpers\Url;
use yii\widgets\LinkPager;
use yii\bootstrap\Nav;

$categoryName = empty($category->name) ? 'All' : $category->name;
$this->title = Yii::t('app', 'Category') . ' «' . $categoryName . '»';
$this->params['breadcrumbs'] = [
    ['label' => Yii::t('app', 'Category'), 'url' => ['/category/index']],
    $categoryName,
];
?>
<?php if (!empty($objects) and !empty($catMenu)): ?>
    <div class="row">
        <div class="col-xs-12 col-sm-10">

            <h1><?= $this->title ?></h1>

            <?php if (!empty($objects)): ?>
                <div class="row">
                    <?php foreach ($objects as $object): ?>
                        <div class="col-xs-12 col-sm-6 col-md-4">
                            <div class="item-object">
                                <a href="<?= Url::to(['object/view', 'id' => $object->link]) ?>">
                                    <div style="
                                            display: block;
                                            width: 100%;
                                            height: 250px;
                                    <?php if (!empty($object->image)): ?>
                                            background: url('<?= '/' . $object->pathImage . '/' . $object->id . '/' . $object->image ?>') no-repeat;
                                    <?php else: ?>
                                            background: url('/img/poster.none.png') no-repeat;
                                    <?php endif; ?>
                                            background-size: cover;
                                            background-position: center;
                                            ">

                                    </div>
                                </a>
                                <span><?= $object->name ?></span>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>

                <div class="clearfix"></div>

                <?= LinkPager::widget([
                    'pagination' => $pages,
                ]); ?>
            <?php endif; ?>
        </div>
        <div class="hidden-xs col-sm-2">

            <h2><?= Yii::t('app', 'Categories') ?></h2>

            <?= Nav::widget([
                'items' => $catMenu
            ]); ?>
        </div>

    </div>
<?php endif; ?>
