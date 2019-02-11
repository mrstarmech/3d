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
            $object->setSetting('mesh', "/".$object->pathFile."/".$object->id."/".$drcName);
            $object->setOption('loader', 'dracoLoader');
            $object->save();
            Yii::$app->session->setFlash('success', "Конвертация в DRACO успешно выполнена");

            return true;
        }
    }
}
