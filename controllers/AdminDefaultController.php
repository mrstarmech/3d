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
use yii\filters\AccessControl;
use yii\web\Controller;
use yii\web\HttpException;
use yii\web\UploadedFile;

/**
 * parent controller
 *
 * Class AdminDefaultController
 * @package app\controllers
 */
class AdminDefaultController extends Controller
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


    /**
     * convert file Obj to Draco
     * Draco converter (draco_encoder) must be installed in the system
     *
     * @param $id
     * @return bool
     * @throws HttpException
     */
    protected function convertDraco($id)
    {
        $object = Object::findOne($id);

        if (empty($object)) {
            throw new HttpException(404);
        }

        $pathFileObj = $object->pathFileWR . '/' . $object->obj;
        $drcName = stristr($object->obj, '.', true) . '.drc';
        $pathFileDrc = $object->pathFileWR . '/' . $drcName;

        $command = "draco_encoder -i $pathFileObj -o $pathFileDrc";
        exec($command, $output, $return);

        if ($return != 0) {
            Yii::$app->session->setFlash('error', "Ошибка конвертации в DRACO: $command. " . print_r($output, 1));
            return false;
        } else {
            $object->setSetting('mesh', "/" . $object->pathFile . "/" . $object->id . "/" . $drcName);
            $object->setOption('loader', 'dracoLoader');
            $object->save();
            Yii::$app->session->setFlash('success', "Конвертация в DRACO успешно выполнена");
            return true;
        }
    }

    /**
     * convert Image to Webp
     * Webp converter must be installed in the system
     *
     * @param $id
     * @return bool
     * @throws HttpException
     */
    protected function convertWebp($id)
    {
        $object = Object::findOne($id);

        if (empty($object)) {
            throw new HttpException(404);
        }

        $tex_array = $object->getSettingArray()->texture;
        if(gettype($tex_array) == 'string'){
            $te = $tex_array;
            $tex_array = [];
            $tex_array[0] = $te;
        }
           
        $webp_array = [];
        $idx = 0;
        $ok_count = 0;
        
        foreach($tex_array as $tex){        
            $texture_extension = stristr($tex, '.');
            $webpFilename = stristr($tex, '.', true) . '.webp';
            $jpgFailename = stristr($tex, '.', true) . '.jpg';
            $texturePath = $object->pathFileWR . '/' . $object->pathTexture . '/' . $tex;
            $jpgPath = $object->pathFileWR . '/' .  $object->pathTexture . '/' . $jpgFailename;

            if ($texture_extension != "jpg") {
                $command = "convert $texturePath ".$jpgPath;
                exec($command, $output, $return);
                if ($return != 0) {
                    Yii::$app->session->setFlash('error', "Ошибка конвертации текстуры в jpeg: $command. " . print_r($output, 1));
                } else {
                    Yii::$app->session->setFlash('success', "Конвертации в jpeg успешно выполнена");
                }
            }
            $command = "cwebp $texturePath -q 80 -o ".$object->pathFileWR."/". $object->pathTexture . "/" .$webpFilename;
            exec($command, $output, $return);

            if($return !=0){
                $webp_array[$idx] = $tex;
                Yii::$app->session->setFlash('error', "Ошибка конвертации текстуры в webp: $command. " . print_r($output, 1));
            }
            else {
                $ok_count += 1;
                $webp_array[$idx] = $webpFilename;
            }
            $idx++;
        }

        $object->setSetting('texture', $webp_array);
        $object->save();
        Yii::$app->session->setFlash('success', "Конвертации в WEBP выполнена. Сконвертировано $ok_count из $idx изображений." );
        return true;
    }

    /**
     * convert file Obj to Utf8
     * Utf8 converter must be installed in the system
     *
     * @param $id
     * @return bool
     * @throws HttpException
     */
    protected function convertUtf8($id)
    {
        $object = Object::findOne($id);

        if (empty($object)) {
            throw new HttpException(404);
        }

        $nameFileObj = $object->pathFileWR . '/' . $object->obj;
        $utf8 = $object->pathFileWR . '/' . $object->id . '.utf8';
        $utfjs = $object->pathFileWR . '/' . $object->id . '_utf.js';

        $command = "objcompress $nameFileObj $utf8 >$utfjs";
        exec($command, $output, $return);

        if ($return != 0) {
            Yii::$app->session->setFlash('error', "Ошибка конвертации в JS: $command. " . print_r($output, 1));
            return false;
        } else {
            $object->setSetting('mesh', str_replace($object->pathFileWR, $object->pathFile, $nameFileObj));
            $object->save();

            Yii::$app->session->setFlash('success', "Конвертации в JS успешно выполнена");
            return true;
        }
    }

    /**
     * model centering
     * format OBJ
     *
     * @param $id
     * @throws HttpException
     */
    protected function centeringObj($id)
    {
        $object = Object::findOne($id);

        if (empty($object)) {
            throw new HttpException(404);
        }

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
    }
}
