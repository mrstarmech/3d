<?php

namespace app\controllers;

use app\models\Category;
use app\models\Object;
use app\models\User;
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

        $query = Category::find()->where(['id' => $id]);

        if (!Yii::$app->user->can(User::ROLE_ADMINISTRATOR)) {
            $query = $query->andWhere(['!=', 'status', Category::NOT_AVAILABLE]);
        }

        $category = $query->one();

        if (empty($category)) {
            throw new HttpException(403);
        } elseif ($category->status == Category::NOT_AVAILABLE) {
            Yii::$app->session->setFlash('info', 'Эта категория недоступна пользователям');
        }

        $categories = Category::find()
            ->where(['status' => Category::AVAILABLE_MENU])
            ->andWhere(['parent' => 0])
            ->all();
        $subCategories = Category::find()
            ->where(['status' => Category::AVAILABLE_MENU])
            ->andWhere(['!=', 'parent', 0])
            ->all();

        if (!empty($categories)) {
            foreach ($categories as $item) {
                if (!empty($item->objects)) {
                    $children = array();
                    foreach ($subCategories as $subItem)
                    {
                        if($subItem->parent == $item->id)
                            $children[] = [
                                'label' => $subItem->name,
                                'url' => ['category/view', 'id' => $subItem->id],
                            ];
                    }
                    if(!empty($children))
                    {
                        $children = array_merge([[
                            'label' => $item->name,
                            'url'=>['category/view', 'id' => $item->id]]],
                            $children);
                    }
                    $catMenu[] = [
                        'label' => $item->name,
                        'url' => ['category/view', 'id' => $item->id],
                        'items' => $children,
                    ];
                }
            }
        }

        $query = Object::find()
            ->joinWith('objectCategory')
            ->andWhere(['visible' => 1])
            ->andWhere(['category_id' => $id]);

        $pages = new Pagination(['totalCount' => $query->count(), 'pageSize' => 9]);

        $objects = $query
            ->offset($pages->offset)
            ->limit($pages->limit)
            ->orderBy([new \yii\db\Expression('display_order IS NULL ASC, display_order ASC, id DESC')])
            ->all();

        return $this->render('view', [
            'objects' => $objects,
            'category' => $category,
            'categories' => $categories,
            'catMenu' => $catMenu,
            'pages' => $pages,
        ]);
    }
}
