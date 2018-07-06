<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;

class ObjectController extends Controller
{
    public function actionIndex()
    {
        return $this->render('index');
    }
}
