<?php

namespace app\controllers;

use yii\rest\Controller;
use app\models\Object;
use yii\db\Query;

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
        $objectID = (new Query)
            ->select('id')
            ->from('object')
            ->where(['or', [Object::tableName() . '.id' => $id], ['sef' => $id]])
            ->one();
        
        $result = (new Query)
            ->select(['author','copyright'])
            ->from('object_language')
            ->where(['object_id'=>$objectID])
            ->andWhere(['locale'=>$lng])
            ->one();

        return json_encode($result);
    }
}