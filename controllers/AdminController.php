<?php

namespace app\controllers;

use app\models\Category;
use app\models\ObjectCategory;
use Yii;
use yii\web\Controller;
use app\models\Object;
use yii\web\UploadedFile;
use yii\web\HttpException;

class AdminController extends Controller
{
    public function actionIndex()
    {
        $objects = Object::find()->all();
        return $this->render('index',[
            'objects' => $objects,
        ]);
    }

    public function actionAddObject(){
        $object = new Object();
        if ($object->load(Yii::$app->request->post())) {
            if ($object->validate() and $object->save()) {
                Yii::$app->session->setFlash('success', "Модель сохранена");
                $this->redirect(['admin/edit-object/' . $object->id]);
            }
        }
        return $this->render('addObject', [
            'model' => $object,
        ]);
    }

    public function actionEditObject($id){
        $object = Object::findOne($id);
        if(empty($object)){
            throw new HttpException(404);
        }
        if ($object->load(Yii::$app->request->post())) {
            $object->fileImage = UploadedFile::getInstance($object, 'fileImage');
            $object->fileObj = UploadedFile::getInstance($object, 'fileObj');
            $object->fileMtl = UploadedFile::getInstance($object, 'fileMtl');
            $object->fileTexture = UploadedFile::getInstance($object, 'fileTexture');
            if ($object->upload()) {
                $object->scenario = Object::SCENARIO_SAVE;
                if($object->save()) {
                    Yii::$app->session->setFlash('success', "Модель сохранена");
                    $this->redirect(['admin/edit-object/' . $object->id]);
                }
            }
            Yii::$app->session->setFlash('danger', "Модель не сохранена");
        }

        $objectCategories = ObjectCategory::find()
            ->where(['id_object' => $object->id])
            ->all();
        $objectCategory = new ObjectCategory();
        if ($objectCategory->load(Yii::$app->request->post())) {
            if ($objectCategory->validate() and $objectCategory->save()) {
                Yii::$app->session->setFlash('success', "Категория добавлена");
                $this->redirect(['admin/edit-object/' . $object->id]);
            }
        }

        $categories = Category::find()->all();

        return $this->render('editObject', [
            'model' => $object,
            'objectCategories' => $objectCategories,
            'categories' => $categories,
            'objectCategory' => $objectCategory,
        ]);
    }

    public function actionDeleteObject($id){
        $object = Object::findOne($id);
        if(empty($object)){
            throw new HttpException(404);
        }
        $object->delete();
        $this->redirect(['admin/index']);
    }

    public function actionAddCategory(){
        $category = new Category();
        if ($category->load(Yii::$app->request->post())) {
            if ($category->validate() and $category->save()) {
                Yii::$app->session->setFlash('success', "Категория сохранена");
                $this->redirect(['admin/edit-category/' . $category->id]);
            }
        }
        return $this->render('addCategory', [
            'model' => $category,
        ]);
    }

    public function actionEditCategory($id){
        $category = Category::findOne($id);
        if(empty($category)){
            throw new HttpException(404);
        }
        if ($category->load(Yii::$app->request->post())) {
            if ($category->validate() and $category->save()) {
                Yii::$app->session->setFlash('success', "Категория сохранена");
                $this->redirect(['admin/edit-category/' . $category->id]);
            }
        }
        return $this->render('editCategory', [
            'model' => $category,
        ]);
    }

}
