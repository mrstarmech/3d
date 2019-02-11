<?php

namespace app\controllers;

use app\models\Category;
use app\models\Object;
use app\models\ObjectCategory;
use app\models\ObjectLabel;
use app\models\ObjectOption;
use app\models\ObjectSetting;
use Yii;
use yii\data\Pagination;
use yii\web\HttpException;
use yii\web\UploadedFile;

class AdminController extends AdminDefaultController
{
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
                return $this->redirect(['admin/edit-object-general/' . $object->id]);
            }
        }
        return $this->render('addObject', [
            'model' => $object,
        ]);
    }

    public function actionEditObjectGeneral($id)
    {
        $object = Object::find()->multilingual()->where(['id' => $id])->one();

        if (empty($object)) {

            $object = Object::find()->multilingual()->where(['sef' => $id])->one();

            if (empty($object)) {
                throw new HttpException(500);
            }

            return $this->redirect(['/admin/edit-object-general', 'id' => $object->id]);
        }

        if ($object->load(Yii::$app->request->post())) {
            $object->fileImage = UploadedFile::getInstance($object, 'fileImage');
            $object->fileObj = UploadedFile::getInstance($object, 'fileObj');
            $object->fileMtl = UploadedFile::getInstance($object, 'fileMtl');
            $object->fileTexture = UploadedFile::getInstance($object, 'fileTexture');
            if ($object->upload()) {
                $object->scenario = Object::SCENARIO_SAVE;
//                var_dump(Yii::$app->request->post());
//                var_dump($object);
//                die;
                if ($object->save()) {
                    Yii::$app->session->setFlash('success', "Модель сохранена");
                    return $this->refresh();
                }
            }
            Yii::$app->session->setFlash('danger', "Модель не сохранена. " . print_r($object->errors, 1));
        }

        $objectCategories = ObjectCategory::find()
            ->where(['object_id' => $object->id])
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
            ->where(['object_id' => $object->id])
            ->all();
        $objectCategory = new ObjectCategory();

        if ($objectCategory->load(Yii::$app->request->post())) {
            if ($objectCategory->validate() and $objectCategory->save()) {
                Yii::$app->session->setFlash('success', "Категория добавлена");
                return $this->refresh();
            }
        }

        $categories = Category::find()->all();

        return $this->render('editObjectCategory', [
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
        $category = Category::find()->multilingual()->where(['id' => $id])->one();

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

    public function actionEditObjectLabel($id)
    {
        $object = Object::find()->multilingual()->where(['id' => $id])->one();

        if (empty($object)) {
            throw new HttpException(404);
        }

        $label_id = (int) Yii::$app->request->get('label_id');
        $label =  $label_id ? ObjectLabel::find()->multilingual()->where(['id' => $label_id])->one() : new ObjectLabel();

        if ($label->load(Yii::$app->request->post())) {
            $label->object_id = $object->id;
            if ($label->validate() and $label->save()) {
                Yii::$app->session->setFlash('success', "Метка сохранена");
                return $this->refresh();
            }
        }

        return $this->render('editObjectLabel', [
            'object' => $object,
            'model' => $label,
        ]);

    }

    public function actionDeleteObjectLabel($id)
    {
        $objectLabel = ObjectLabel::findOne($id);

        if (empty($objectLabel)) {
            throw new HttpException(403);
        }

        $object = $objectLabel->object;
        $objectLabel->delete();

        return $this->redirect(['admin/edit-object-label', 'id' => $object->id]);
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


        if ($data = Yii::$app->request->post('data')) {
            if(file_put_contents($object->pathFileWR . '/' . $object->mtl, $data)){
                Yii::$app->session->setFlash('success', 'Данные успешно внесены');
                return $this->refresh();
            } else {
                Yii::$app->session->setFlash('error', 'Не удалось внести данные');
            }
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

        $size = filesize($object->pathFileWR . '/' . $object->obj);

        $limit = 5000;

        if ($data = Yii::$app->request->post('data')) {

            if ($size > ($limit * 8)) {
                $data =  $data . mb_substr($object->getContentObj(), $limit, mb_strlen($object->getContentObj()));
            }

            if(file_put_contents($object->pathFileWR . '/' . $object->obj, $data)){
                Yii::$app->session->setFlash('success', 'Данные успешно внесены');
                return $this->refresh();
            } else {
                Yii::$app->session->setFlash('error', 'Не удалось внести данные');
            }
        }

        if ($size > ($limit * 8)) {
            $data =  mb_substr($object->getContentObj(), 0, $limit);
            Yii::$app->session->setFlash('info', "Размер файла большой и составляет " . number_format (($size / (1024 * 1024)), 2) . " МБ. Содержимое файла будет обрезано до $limit символов.");
        } else {
            $data =  $object->getContentObj();
        }

        return $this->render('editFileObj', [
            'object' => $object,
            'data' => $data,
        ]);
    }

    public function actionEditFileUtfJs($id)
    {
        $object = Object::findOne($id);

        if (empty($object)) {
            throw new HttpException(404);
        }

        return $this->render('editFileUtfJs', [
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

        if (Yii::$app->request->post('convertDraco') !== null) {
            self::convertDraco($id);
            return $this->refresh();
        }



        if (Yii::$app->request->post('convertWebp') !== null) {
            self::convertWebp($id);
            return $this->refresh();
        }

        return $this->render('processing', [
            'object' => $object,
        ]);
    }

    public function actionShot($id)
    {
        $object = Object::findOne($id);

        if (empty($object)) {
            throw new HttpException(403);
        }

        if ($data = Yii::$app->request->post('data')) {
//            return $data;
            $object->dataImage = $data;
            if ($object->upload()) {
                $object->scenario = Object::SCENARIO_SAVE;

                $object->setOption('cameraCoords', [
                    'x' => Yii::$app->request->post('coordinateX'),
                    'y' => Yii::$app->request->post('coordinateY'),
                    'z' => Yii::$app->request->post('coordinateZ'),
                ]);

                $object->setOption('camera', 'manual');

                if ($object->save()) {
//                    return json_encode(['success']);
                    Yii::$app->session->setFlash('success', "Модель сохранена");
                    return $this->refresh();
                }
            }
            Yii::$app->session->setFlash('danger', "Модель не сохранена. " . print_r($object->errors, 1));
//            return json_encode($object->errors);
        }

        return $this->render('shot', [
            'object' => $object,
        ]);
    }
}
