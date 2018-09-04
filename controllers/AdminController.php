<?php

namespace app\controllers;

use app\models\Category;
use app\models\ObjectCategory;
use app\models\ObjectLabel;
use app\models\ObjectOption;
use app\models\ObjectSetting;
use Yii;
use yii\filters\AccessControl;
use yii\helpers\Url;
use yii\web\Controller;
use app\models\Object;
use yii\web\UploadedFile;
use yii\web\HttpException;
use yii\data\Pagination;

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
        $query = Object::find();
        $pages = new Pagination(['totalCount' => $query->count(), 'pageSize' => 12]);
        $objects = $query->offset($pages->offset)
            ->limit($pages->limit)
            ->orderBy(['created_at' => SORT_DESC])
            ->all();

        return $this->render('index', [
            'objects' => $objects,
            'pages' => $pages,
        ]);
    }

    public function actionAddObject()
    {
        $object = new Object();
        if ($object->load(Yii::$app->request->post())) {
            if ($object->validate() and $object->save()) {
                Yii::$app->session->setFlash('success', "Модель сохранена");
                return $this->redirect(['admin/edit-object/' . $object->id]);
            }
        }
        return $this->render('addObject', [
            'model' => $object,
        ]);
    }

    public function actionEditObjectGeneral($id)
    {
        $object = Object::findOne($id);

        if (empty($object)) {
            throw new HttpException(404);
        }

        if ($object->load(Yii::$app->request->post())) {
            $object->fileImage = UploadedFile::getInstance($object, 'fileImage');
            $object->fileObj = UploadedFile::getInstance($object, 'fileObj');
            $object->fileMtl = UploadedFile::getInstance($object, 'fileMtl');
            $object->fileTexture = UploadedFile::getInstance($object, 'fileTexture');
            if ($object->upload()) {
                $object->scenario = Object::SCENARIO_SAVE;
                if ($object->save()) {
                    Yii::$app->session->setFlash('success', "Модель сохранена");
                    return $this->refresh();
                }
            }
            Yii::$app->session->setFlash('danger', "Модель не сохранена. " . print_r($object->errors, 1));
        }

        $objectCategories = ObjectCategory::find()
            ->where(['id_object' => $object->id])
            ->all();
        $objectCategory = new ObjectCategory();

        if ($objectCategory->load(Yii::$app->request->post())) {
            if ($objectCategory->validate() and $objectCategory->save()) {
                Yii::$app->session->setFlash('success', "Категория добавлена");
                return $this->refresh();
            }
        }

        $categories = Category::find()->all();

        return $this->render('editObjectGeneral', [
            'model' => $object,
            'objectCategories' => $objectCategories,
            'categories' => $categories,
            'objectCategory' => $objectCategory,
        ]);
    }

    public function actionEditObjectCategory($id)
    {
        $object = Object::findOne($id);

        if (empty($object)) {
            throw new HttpException(404);
        }

        $objectCategories = ObjectCategory::find()
            ->where(['id_object' => $object->id])
            ->all();
        $objectCategory = new ObjectCategory();

        if ($objectCategory->load(Yii::$app->request->post())) {
            if ($objectCategory->validate() and $objectCategory->save()) {
                Yii::$app->session->setFlash('success', "Категория добавлена");
                return $this->refresh();
            }
        }

        $categories = Category::find()->all();

        return $this->render('editObjectcategory', [
            'model' => $object,
            'objectCategories' => $objectCategories,
            'categories' => $categories,
            'objectCategory' => $objectCategory,
        ]);
    }

    public function actionDeleteObject($id)
    {
        $object = Object::findOne($id);
        if (empty($object)) {
            throw new HttpException(404);
        }
        $object->delete();
        return $this->redirect(['admin/index']);
    }

    public function actionListCategory()
    {
        $categories = Category::find()->all();
        return $this->render('listCategories', [
            'categories' => $categories,
        ]);
    }

    public function actionAddCategory()
    {
        $category = new Category();

        if ($category->load(Yii::$app->request->post())) {
            if ($category->validate() and $category->save()) {
                Yii::$app->session->setFlash('success', "Категория добавлена");
                return $this->redirect(['admin/edit-category/' . $category->id]);
            }
        }

        return $this->render('addCategory', [
            'model' => $category,
        ]);
    }

    public function actionEditCategory($id)
    {
        $category = Category::findOne($id);

        if (empty($category)) {
            throw new HttpException(404);
        }

        if ($category->load(Yii::$app->request->post())) {
            if ($category->validate() and $category->save()) {
                Yii::$app->session->setFlash('success', "Категория сохранена");
                return $this->refresh();
            }
        }

        return $this->render('editCategory', [
            'model' => $category,
        ]);
    }

    public function actionDeleteCategory($id)
    {
        $сategory = Category::findOne($id);

        if (empty($сategory)) {
            throw new HttpException(404);
        }

        $сategory->delete();

        return $this->redirect(['admin/list-category']);
    }

    public function actionListObjectOption()
    {
        $listObjectOption = ObjectOption::find()->all();

        return $this->render('listObjectOption', [
            'listObjectOption' => $listObjectOption,
        ]);
    }

    public function actionAddObjectOption()
    {
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

    public function actionEditObjectOption($id)
    {
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

    public function actionListObjectSetting()
    {
        $listObjectSetting = ObjectSetting::find()->all();

        return $this->render('listObjectSetting', [
            'listObjectSetting' => $listObjectSetting,
        ]);
    }

    public function actionAddObjectSetting()
    {
        $objectSetting = new ObjectSetting();

        if ($objectSetting->load(Yii::$app->request->post())) {
            if ($objectSetting->validate() and $objectSetting->save()) {
                Yii::$app->session->setFlash('success', "Опция сохранена");
                return $this->redirect(['admin/list-object-setting']);
            }
        }

        return $this->render('addObjectSetting', [
            'model' => $objectSetting,
        ]);

    }

    public function actionEditObjectSetting($id)
    {
        $objectSetting = ObjectSetting::findOne($id);

        if ($objectSetting->load(Yii::$app->request->post())) {
            if ($objectSetting->validate() and $objectSetting->save()) {
                Yii::$app->session->setFlash('success', "Опция сохранена");
                return $this->redirect(['admin/list-object-setting']);
            }
        }

        return $this->render('editObjectSetting', [
            'model' => $objectSetting,
        ]);

    }

    public function actionEditObjectLabel($id)
    {
        $object = Object::findOne($id);

        if (empty($object)) {
            throw new HttpException(404);
        }

        $label = new ObjectLabel();
        $label->id_object = $object->id;

        if ($label->load(Yii::$app->request->post())) {
            if ($label->validate() and $label->save()) {
                Yii::$app->session->setFlash('success', "Метка сохранена");
                return $this->refresh();
            }
        }

        return $this->render('editObjectLabel', [
            'object' => $object,
            'label' => $label,
        ]);

    }

    public function actionDeleteObjectCategory($id)
    {
        $objectCategory = ObjectCategory::findOne($id);

        if (empty($objectCategory)) {
            throw new HttpException(404);
        }

        $object = $objectCategory->object;
        $objectCategory->delete();

        return $this->redirect(['admin/edit-object-category', 'id' => $object->id]);
    }

    public function actionEditFileMtl($id)
    {
        $object = Object::findOne($id);

        if (empty($object)) {
            throw new HttpException(404);
        }

        return $this->render('editFileMtl', [
            'object' => $object,
        ]);
    }

    public function actionEditFileObj($id)
    {
        $object = Object::findOne($id);

        if (empty($object)) {
            throw new HttpException(404);
        }

        return $this->render('editFileObj', [
            'object' => $object,
        ]);
    }

    public function actionProcessing($id)
    {
        $object = Object::findOne($id);

        if (empty($object)) {
            throw new HttpException(404);
        }

        if (Yii::$app->request->post('center') !== null) {
            $nameFileObj = $object->pathFileWR . '/' . $object->obj;
            $nameFileObj_ = $object->pathFileWR . '/temp.obj';
            rename($nameFileObj, $nameFileObj_);

            $command = "objnormalize $nameFileObj_ $nameFileObj";
            exec($command, $output, $return);

            if ($return != 0) {
                Yii::$app->session->setFlash('error', "Не удалось центрировать OBJ: $command. " . print_r($output, 1));
                rename($nameFileObj_, $nameFileObj);
            } else {
                Yii::$app->session->setFlash('success', "OBJ оцентрована");
                unlink($nameFileObj_);
            }

            return $this->refresh();
        }

        if (Yii::$app->request->post('convertJs') !== null) {
            $nameFileObj = $object->pathFileWR . '/' . $object->obj;
            $utf8 = $object->pathFileWR . '/' . $object->id . '.utf8';
            $utfjs = $object->pathFileWR . '/' . $object->id . '_utf.js';

            $command = "objcompress $nameFileObj $utf8 >$utfjs";
            exec($command, $output, $return);

            if ($return != 0) {
                Yii::$app->session->setFlash('error', "Ошибка конвертации в JS: $command. " . print_r($output, 1));
            } else {
                $object->setSetting('mesh', str_replace($object->pathFileWR, $object->pathFile, $nameFileObj));
                $object->save();

                Yii::$app->session->setFlash('success', "Конвертации в JS успешно выполнена");
            }

            return $this->refresh();
        }

        if (Yii::$app->request->post('convertWebp') !== null) {
            $nameFileTexture = $object->pathFileWR . '/' . $object->texture;

            if (pathinfo($nameFileTexture, PATHINFO_EXTENSION) == 'jpg') {

                $command = "convert $nameFileTexture quality 80 $nameFileTexture";
                exec($command, $output, $return);

                if ($return != 0) {
                    Yii::$app->session->setFlash('error', "Ошибка конвертации текстуры из jpg в jpg: $command. " . print_r($output, 1));

                    return $this->refresh();
                }
            } else {

                $command = "cjpeg -quality 80 -progressive -optimize $nameFileTexture >{$object->id}.jpg";
                exec($command, $output, $return);

                if ($return != 0) {
                    Yii::$app->session->setFlash('error', "Ошибка конвертации текстуры в jpg: $command. " . print_r($output, 1));

                    return $this->refresh();
                }
                $nameFileTexture = $object->pathFileWR . '/' . $object->id . '.jpg';
            }

            $command = "../../utils/cwebp $nameFileTexture -q 80 -o {$object->id}.webp";
            exec($command, $output, $return);

            if ($return != 0) {
                Yii::$app->session->setFlash('error', "Ошибка конвертации текстуры в webp: $command. " . print_r($output, 1));
            } else {
                $object->setSetting('texture', str_replace($object->pathFileWR, $object->pathFile, $nameFileTexture));
                $object->save();

                Yii::$app->session->setFlash('success', "Конвертации в WEBP успешно выполнена");
            }

            return $this->refresh();
        }

        return $this->render('processing', [
            'object' => $object,
        ]);
    }
}
