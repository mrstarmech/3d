<?php

namespace app\controllers;

use app\models\Object;
use app\models\ObjectLabel;
use Yii;
use yii\web\Controller;
use yii\web\HttpException;

class ObjectController extends Controller
{
    public function actionIndex()
    {
        return $this->render('index');
    }

    public function actionView($id)
    {
        $object = Object::find()
            ->where(['or', ['id' => $id], ['sef' => $id]])
            ->andWhere([ 'visible' => 1])
            ->one();
        if (empty($object)) {
            throw new HttpException(405);
        }
        return $this->render('view', [
            'object' => $object,
        ]);
    }

    public function actionTest($id)
    {
        $object = Object::find()
            ->where(['or', ['id' => $id], ['sef' => $id]])
            ->andWhere([ 'visible' => 1])
            ->one();

        if (empty($object)) {
            throw new HttpException(405);
        }
        return $this->render('test', [
            'object' => $object,
        ]);
    }

    public function actionIframe($id)
    {
        $arr = explode('-', $id);
        $id = $arr[0];
        $color = isset($arr[1]) ? $arr[1] : false;
        $object = Object::find()
            ->where(['or', ['id' => $id], ['sef' => $id]])
            ->andWhere([ 'visible' => 1])
            ->one();

        if (empty($object)) {
            throw new HttpException(405);
        }

        $this->layout = 'clear';

        return $this->render('iframe', [
            'object' => $object,
            'color' => $color,
        ]);
    }

    public function actionEdit($id)
    {
        if ($id) {
            return $this->redirect(['/admin/edit-object-general/' . $id]);
        }else{
            return $this->goBack();
        }
    }
}
