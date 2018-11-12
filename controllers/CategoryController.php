<?php

namespace app\controllers;

use app\models\Category;
use app\models\Object;
use app\models\ObjectCategory;
use Yii;
use yii\data\Pagination;
use yii\web\Controller;
use yii\web\HttpException;

class CategoryController extends Controller
{
    public function actionIndex()
    {
        return $this->actionView(1);
    }

    public function actionList()
    {
        $categories = Category::find()->all();
        $all = Object::findAll(['visible' => 1]);
        return $this->render('index',[
            'categories' => $categories,
            'all' => $all,
        ]);
    }

    public function actionView($id){
        $category = null;

        if($id == 'all'){

            $query = Object::find()->where(['visible' => 1]);
            $pages = new Pagination(['totalCount' => $query->count(), 'pageSize' => 12]);
            $objects = $query->offset($pages->offset)
                ->limit($pages->limit)
                ->orderBy(['id' => SORT_DESC])
                ->all();

        }else{

            $category = Category::findOne($id);

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

        if(empty($objects) or (!empty($category) and empty($objects))){
            throw new HttpException(500);
        }

        return $this->render('view',[
            'objects' => $objects,
            'category' => $category,
            'pages' => $pages,
        ]);
    }
}
