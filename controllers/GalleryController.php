<?php

namespace app\controllers;

use app\models\Object;
use Yii;
use yii\web\Controller;
use yii\web\HttpException;

class GalleryController extends Controller
{
    public function actionIndex()
    {
        $objects = Object::find()
            ->where(['visible' => 1])
            ->all();
        return $this->render('index',[
            'objects' => $objects,
        ]);
    }
}
