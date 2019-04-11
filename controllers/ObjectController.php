<?php

namespace app\controllers;

use app\models\Object;
use app\models\ObjectBanner;
use app\models\ObjectLabel;
use app\models\User;
use Yii;
use yii\web\Controller;
use yii\web\HttpException;

class ObjectController extends Controller
{
    public function actionIndex()
    {
        return $this->render('index');
    }

    public function actionView($id, $categoryId = 0)
    {
        $query = Object::find()
            ->where(['or', [Object::tableName() . '.id' => $id], ['sef' => $id]]);

        if (!Yii::$app->user->can(User::ROLE_ADMINISTRATOR)) {
            $query->andWhere([ 'visible' => 1]);
        }

        if ($categoryId) {
            $query->joinWith('objectCategory')->andWhere(['category_id' => $categoryId]);
        }

        $object = $query->one();

        if (empty($object)) {
            throw new HttpException(404);
        }

        $objectPrev = null;
        $objectNext = null;
        if ($categoryId) {
            $objectPrev = Object::find()
                ->where(['>', Object::tableName() . '.id', $object->id])
                ->andWhere([ 'visible' => 1])
                ->joinWith('objectCategory')
                ->andWhere(['category_id' => $categoryId])
                ->orderBy([Object::tableName() . '.id' => SORT_ASC])
                ->limit(1)
                ->one();
            $objectNext = Object::find()
                ->where(['<', Object::tableName() . '.id', $object->id])
                ->andWhere([ 'visible' => 1])
                ->joinWith('objectCategory')
                ->andWhere(['category_id' => $categoryId])
                ->orderBy([Object::tableName() . '.id' => SORT_DESC])
                ->limit(1)
                ->one();
        }

        return $this->render('view', [
            'object' => $object,
            'categoryId' => $categoryId,
            'objectPrev' => $objectPrev,
            'objectNext' => $objectNext,
        ]);
    }

    public function actionBanner()
    {
        $banners = ObjectBanner::find()->all();

        $banner = $banners[array_rand($banners)];
        if (empty($banner)) {
            throw new HttpException(405);
        }

        $this->layout = 'clear';
        return $this->render('banner', [
            'banner' => $banner,
        ]);
    }

    public function actionPoster($id)
    {
        $query = Object::find()
            ->where(['or', [Object::tableName() . '.id' => $id], ['sef' => $id]]);

        if (!Yii::$app->user->can(User::ROLE_ADMINISTRATOR)) {
            $query->andWhere([ 'visible' => 1]);
        }
        $object = $query->one();

        if (empty($object)) {
            throw new HttpException(404);
        }
        // Следует решить как хранить превью к модели (должно оно совпадать с постером или нет, если нет - сделать интерфейс загрузки)
        if (empty($object->image)) {
            if (empty(json_decode($object->setting)->poster)) {
                $backgroundUrl = '/img/poster.none.jpg';
            } else $backgroundUrl = json_decode($object->setting)->poster;
        } else $backgroundUrl = '/' . $object->pathImage . '/' . $object->id . '/' . $object->image;
        //echo $backgroundUrl;
        header("Location: " . $backgroundUrl); exit;
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
