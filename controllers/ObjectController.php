<?php

namespace app\controllers;

use app\models\Object;
use Yii;
use yii\web\Controller;
use yii\web\HttpException;

class ObjectController extends Controller
{
    public function actionIndex()
    {
        return $this->render('index');
    }

    public function actionView($id){
        $object = Object::find()->where(['id' => $id,'visible' => 1])->one();
        if(empty($object)){
            throw new HttpException(405);
        }
        return $this->render('view', [
            'object' => $object,
        ]);
    }

    public function actionData(){
        $id = (int)Yii::$app->request->post('id');
        $object = Object::findOne($id) ? Object::findOne($id)->toArray() : null;
        return json_encode($object);
    }

    public function actionSetting(){
        $model = new Object();
        $setting['pathImage'] = $model->pathImage;
        $setting['pathFile'] = $model->pathFile;
        return json_encode($setting);
    }
}
