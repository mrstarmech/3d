<?php

namespace app\controllers;

use app\models\Category;
use app\models\Object;
use Yii;
use yii\data\Pagination;
use yii\web\Controller;
use yii\web\HttpException;

/**
 * Class CategoryController
 * @package app\controllers
 */
class CategoryController extends Controller
{
    /**
     * Display default category
     *
     * @return string
     * @throws HttpException
     */
    public function actionIndex()
    {
        return $this->actionView(1);
    }

    /**
     * Display list categories where available for menu
     *
     * @return string
     */
    public function actionList()
    {
        $categories = Category::find()->where(['status' => Category::AVAILABLE_MENU])->all();
        $all = Object::findAll(['visible' => 1]);
        return $this->render('index', [
            'categories' => $categories,
            'all' => $all,
        ]);
    }

    /**
     * Display list categories where available for menu and reference
     *
     * @param $id
     * @return string
     * @throws HttpException
     */
    public function actionView($id)
    {
        $category = null;
        $categories = Category::find()
            ->where(['status' => Category::AVAILABLE_MENU])
            ->all();

        $catMenu = [['label' => Yii::t('app', 'All'), 'url' => ['category/view', 'id' => 'all']]];

        if (!empty($categories)) {
            foreach ($categories as $category) {
                if (!empty($category->objects)) {
                    $catMenu[] = [
                        'label' => $category->name,
                        'url' => ['category/view', 'id' => $category->id],
                    ];
                }
            }
        }

        if ($id == 'all') {

            $query = Object::find()->where(['visible' => 1]);
            $pages = new Pagination(['totalCount' => $query->count(), 'pageSize' => 12]);
            $objects = $query->offset($pages->offset)
                ->limit($pages->limit)
                ->orderBy(['id' => SORT_DESC])
                ->all();

        } else {

            $category = Category::find()
                ->where(['id' => $id])
                ->andWhere(['!=', 'status', Category::NOT_AVAILABLE])
                ->one();


            if (empty($category)) {
                throw new HttpException(403);
            }

            $query = Object::find()
                ->joinWith('objectCategory')
                ->andWhere(['visible' => 1])
                ->andWhere(['category_id' => $id]);

            $pages = new Pagination(['totalCount' => $query->count(), 'pageSize' => 9]);

            $objects = $query
                ->offset($pages->offset)
                ->limit($pages->limit)
                ->orderBy(['id' => SORT_DESC])
                ->all();
        }

        if (empty($objects) or (!empty($category) and empty($objects))) {
            throw new HttpException(500);
        }

        return $this->render('view', [
            'objects' => $objects,
            'category' => $category,
            'categories' => $categories,
            'catMenu' => $catMenu,
            'pages' => $pages,
        ]);
    }
}
