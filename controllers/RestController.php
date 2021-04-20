<?php

namespace app\controllers;

use yii\rest\Controller;
use app\models\Object;
use yii\db\Query;
use Yii;

class RestController extends Controller
{
    static function getAllowedDomains()
    {
        return [
            '*'
        ];
    }

    public function behaviors()
    {
        $behaviors = parent::behaviors();
        // add CORS filter
        $behaviors['corsFilter'] = [
            'class' => \yii\filters\Cors::className(),
            'cors' => [
                'Origin' => $this->getAllowedDomains(),
                'Access-Control-Request-Method' => ['GET'],
            ]
        ];

        return $behaviors;
    }

    public function actionCopyright($id, $lng)
    {
        $object = Object::find()
            ->where(['or', [Object::tableName() . '.id' => $id], ['sef' => $id]])->one();
        
        $query = new Query;
        $query->select(['author','copyright'])
        ->from('object_language')
        ->where(['object_id'=>$object->id])
        ->andWhere(['locale'=>$lng]);
        $result = $query->one();

        return \json_encode([$result['author'],$result['copyright'],$object->license]);
    }
}