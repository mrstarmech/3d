<?php

namespace app\controllers;

use app\models\Category;
use app\models\CategoryLanguage;
use app\models\ObjectCategory;
use app\models\ObjectLabel;
use app\models\ObjectLanguage;
use app\models\ObjectOption;
use app\models\ObjectSetting;
use Yii;
use yii\filters\AccessControl;
use yii\helpers\FileHelper;
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
                'rules' => [
                    [
                        'allow' => true,
                        'roles' => ['admin'],
                    ],
                ],
            ],
        ];
    }

    public function actionTest()
    {

        $objects = Object::find()->all();

        foreach ($objects as $object) {

//            $object->setting = str_replace("'", '"', $object->setting);
//            $object->setting = str_replace("name:", '"name":', $object->setting);
//            $object->setting = str_replace("texture:", '"texture":', $object->setting);
//            $object->setting = str_replace("mesh:", '"mesh":', $object->setting);
//            $object->setting = str_replace("ambient:", '"ambient":', $object->setting);
//            $object->setting = str_replace("color:", '"color":', $object->setting);
//            $object->setting = str_replace("specular:", '"specular":', $object->setting);
//            $object->setting = str_replace("shininess:", '"shininess":', $object->setting);
//            $object->setting = str_replace("mtl:", '"mtl":', $object->setting);
//
//            $object->option = preg_replace("/\t/", '', $object->option);
//            $object->option = preg_replace("/;$/", '', $object->option);
//            $object->option = str_replace('  ', '', $object->option);
//            $object->option = str_replace("'", '"', $object->option);
//            $object->option = str_replace("grid:", '"grid":', $object->option);
//            $object->option = str_replace("ruler:", '"ruler":', $object->option);
//            $object->option = str_replace("wireframe:", '"wireframe":', $object->option);
//            $object->option = str_replace("autorotate:", '"autorotate":', $object->option);
//            $object->option = str_replace("showgui:", '"showgui":', $object->option);
//            $object->option = str_replace("lights:", '"lights":', $object->option);
//            $object->option = str_replace("loader:", '"loader":', $object->option);
//            $object->option = str_replace("controls:", '"controls":', $object->option);
//            $object->option = str_replace("camera:", '"camera":', $object->option);
//            $object->option = str_replace("cameraDistanceMultiplier:", '"cameraDistanceMultiplier":', $object->option);
//            $object->option = str_replace("cameraCoords:", '"cameraCoords":', $object->option);
//            $object->option = str_replace("x:", '"x":', $object->option);
//            $object->option = str_replace("y:", '"y":', $object->option);
//            $object->option = str_replace("z:", '"z":', $object->option);
//            $object->option = str_replace("backgroundColor:", '"backgroundColor":', $object->option);
//
//            $object->option = str_replace("grid :", '"grid":', $object->option);
//            $object->option = str_replace("ruler :", '"ruler":', $object->option);
//            $object->option = str_replace("wireframe :", '"wireframe":', $object->option);
//            $object->option = str_replace("autorotate :", '"autorotate":', $object->option);
//            $object->option = str_replace("showgui :", '"showgui":', $object->option);
//            $object->option = str_replace("lights :", '"lights":', $object->option);
//            $object->option = str_replace("loader :", '"loader":', $object->option);
//            $object->option = str_replace("controls :", '"controls":', $object->option);
//            $object->option = str_replace("camera :", '"camera":', $object->option);
//            $object->option = str_replace("cameraDistanceMultiplier :", '"cameraDistanceMultiplier":', $object->option);
//            $object->option = str_replace("cameraCoords :", '"cameraCoords":', $object->option);
//            $object->option = str_replace("x :", '"x":', $object->option);
//            $object->option = str_replace("y :", '"y":', $object->option);
//            $object->option = str_replace("z :", '"z":', $object->option);
//            $object->option = str_replace("aturotateDisableByClick :", '"aturotateDisableByClick":', $object->option);
//
//
//            if (!json_decode($object->option) or !json_decode($object->setting)) {
//                var_dump($object->id);
//                var_dump($object->option);
//                var_dump($object->setting);
//                die;
//            } else {
//                $object->option = json_encode(json_decode($object->option));
//                $object->setting = json_encode(json_decode($object->setting));
//                $object->save();
//            }

//            if (!$object->image) {
//
//                $path_ = $_SERVER['DOCUMENT_ROOT'] . '/web/uploads/' . $object->id;
//                $path_img = $_SERVER['DOCUMENT_ROOT'] . '/web/preview/' . $object->id . '/' . $object->id . '.png';
//
//                if (!file_exists($path_img)) {
//                    var_dump($path_img);
//                    continue;
//                }
//
//                if (!file_exists($path_)) {
//                    mkdir($path_, 0777, true);
//                }
////
//                $newName = strtotime('now');
//                $object->image = $newName . '.png';
//
//                if(!copy($path_img, $path_ . '/' . $object->image)) {
//                    echo "error copy";
//                    die;
//                } else {
//                    $object->save();
//                }
//            }

//            $object->setting = str_replace('\/models\/', '\/objects\/', $object->setting);
//            $object->save();
        }
        die;
    }

    public function actionTest2()
    {
        $categories = Category::find()->all();

        $languages = Yii::$app->urlManager->languages;

        foreach ($categories as $category) {
            if (empty($category->lang)) {
                foreach ($languages as $language) {
                    $lang = new CategoryLanguage();
                    $lang->category_id = $category->id;
                    $lang->locale = $language;
                    $lang->name = $category->name;
                    $lang->description = $category->description;

                    if ($lang->validate()) {
                        $lang->save();
                    } else {
                        var_dump($lang->errors);
                        die;
                    }
                }
            }
        }
        die;
    }

    public function actionTest3()
    {
        $objects = Object::find()->all();

        $languages = Yii::$app->urlManager->languages;

        foreach ($objects as $object) {
            foreach ($languages as $language) {
                $lang = new ObjectLanguage();
                $lang->object_id = $object->id;
                $lang->locale = $language;
                $lang->name = $object->name;
                $lang->description = $object->description;

                if ($lang->validate()) {
                    $lang->save();
                } else {
                    var_dump($lang->errors);
                    die;
                }
            }
        }
        die;
    }

    public function actionTest4()
    {
        $objects = Object::find()->all();

        foreach ($objects as $object) {
            if (is_numeric($object->sef)) {
                var_dump($object->sef);
                $object->sef = null;
                $object->save();
            }
        }
        die;
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

                    
//СДЕЛАТЬ ОТДЕЛЬНЫМ МЕТОДОМ ЕСЛИ Предполагается использовать в разных местах
                        $pathFileObj = $object->pathFileWR . '/' . $object->obj;
                        //$drcName = $object->id.'.drc';
                        $drcName = stristr($object->obj, '.', true) . '.drc';
                        $pathFileDrc = $object->pathFileWR . '/' . $drcName;

                        $command = "draco_encoder -i $pathFileObj -o $pathFileDrc";
                        exec($command, $output, $return);

                        if ($return != 0) {
                            Yii::$app->session->setFlash('error', "Ошибка конвертации в DRACO: $command. " . print_r($output, 1));
                        } else {
                            $object->setSetting('mesh', "/".$object->pathFile."/".$object->id."/".$drcName);
                            $object->save();
                            Yii::$app->session->setFlash('success', "Конвертация в DRACO успешно выполнена");
                        }

//////////////////////////

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
            $pathFileObj = $object->pathFileWR . '/' . $object->obj;
            //$drcName = $object->id.'.drc';
            $drcName = stristr($object->obj, '.', true) . '.drc';
            $pathFileDrc = $object->pathFileWR . '/' . $drcName;

            $command = "draco_encoder -i $pathFileObj -o $pathFileDrc";
            exec($command, $output, $return);

            if ($return != 0) {
                Yii::$app->session->setFlash('error', "Ошибка конвертации в DRACO: $command. " . print_r($output, 1));
            } else {
                $object->setSetting('mesh', "/".$object->pathFile."/".$object->id."/".$drcName);
                $object->save();

                Yii::$app->session->setFlash('success', "Конвертация в DRACO успешно выполнена");
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
