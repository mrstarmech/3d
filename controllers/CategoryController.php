<?php

namespace app\controllers;

use app\models\Category;
use app\models\Object;
use Yii;
use yii\web\Controller;
use yii\web\HttpException;

class CategoryController extends Controller
{
    public function actionIndex()
    {
        $categories = Category::find()->all();
        $all = Object::findAll(['visible' => 1]);
        return $this->render('index',[
            'categories' => $categories,
            'all' => $all,
        ]);
    }

    public function actionView($id){
        if($id == 'all'){
            $objects = Object::find()
                ->where(['visible' => 1])
                ->all();
            return $this->render('all',[
                'objects' => $objects,
            ]);
        }else{
            $category = Category::findOne($id);
            if(empty($category)){
                throw new HttpException(404);
            }
            return $this->render('view',[
                'category' => $category,
            ]);
        }
    }
}
