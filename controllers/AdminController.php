<?php

namespace app\controllers;

use app\models\Category;
use app\models\ObjectCategory;
use app\models\ObjectLabel;
use app\models\ObjectOption;
use app\models\ObjectSetting;
use Yii;
use yii\filters\AccessControl;
use yii\web\Controller;
use app\models\Object;
use yii\web\UploadedFile;
use yii\web\HttpException;

class AdminController extends Controller
{
    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::className(),
//                'only' => ['create','edit'],
                'rules' => [
                    [
//                        'actions' => ['create'],
                        'allow' => true,
                        'roles' => ['admin'],
                    ],
                ],
            ],
        ];
    }

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

    public function actionListCategory(){
        $categories = Category::find()->all();
        return $this->render('listCategories',[
            'categories' => $categories,
        ]);
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

    public function actionListObjectOption(){
        $listObjectOption = ObjectOption::find()->all();
        return $this->render('listObjectOption',[
            'listObjectOption' => $listObjectOption,
        ]);
    }

    public function actionAddObjectOption(){
        $objectOption = new ObjectOption();
        if ($objectOption->load(Yii::$app->request->post())) {
            if ($objectOption->validate() and $objectOption->save()) {
                Yii::$app->session->setFlash('success', "Опция сохранена");
                $this->redirect(['admin/list-object-option']);
            }
        }
        return $this->render('addObjectOption', [
            'model' => $objectOption,
        ]);

    }

    public function actionEditObjectOption($id){
        $objectOption = ObjectOption::findOne($id);
        if ($objectOption->load(Yii::$app->request->post())) {
            if ($objectOption->validate() and $objectOption->save()) {
                Yii::$app->session->setFlash('success', "Опция сохранена");
                $this->redirect(['admin/list-object-option']);
            }
        }
        return $this->render('editObjectOption', [
            'model' => $objectOption,
        ]);

    }

    public function actionListObjectSetting(){
        $listObjectSetting = ObjectSetting::find()->all();
        return $this->render('listObjectSetting',[
            'listObjectSetting' => $listObjectSetting,
        ]);
    }

    public function actionAddObjectSetting(){
        $objectSetting = new ObjectSetting();
        if ($objectSetting->load(Yii::$app->request->post())) {
            if ($objectSetting->validate() and $objectSetting->save()) {
                Yii::$app->session->setFlash('success', "Опция сохранена");
                $this->redirect(['admin/list-object-setting']);
            }
        }
        return $this->render('addObjectSetting', [
            'model' => $objectSetting,
        ]);

    }

    public function actionEditObjectSetting($id){
        $objectSetting = ObjectSetting::findOne($id);
        if ($objectSetting->load(Yii::$app->request->post())) {
            if ($objectSetting->validate() and $objectSetting->save()) {
                Yii::$app->session->setFlash('success', "Опция сохранена");
                $this->redirect(['admin/list-object-setting']);
            }
        }
        return $this->render('editObjectSetting', [
            'model' => $objectSetting,
        ]);

    }

    public function actionEditObjectLabel($id){
        $object = Object::findOne($id);
        if(empty($object)){
            throw new HttpException(404);
        }
        $label = new ObjectLabel();
        $label->id_object = $object->id;

        if ($label->load(Yii::$app->request->post())) {
            if ($label->validate() and $label->save()) {
                Yii::$app->session->setFlash('success', "Метка сохранена");
                $this->refresh();
            }
        }

        return $this->render('editObjectLabel', [
            'object' => $object,
            'label' => $label,
        ]);

    }

}
