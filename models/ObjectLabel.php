<?php

namespace app\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class ObjectLabel extends ActiveRecord
{
    public function rules()
    {
        return [
            [['id_object'], 'required'],
            [['position','description'], 'string'],
        ];
    }

    public function behaviors()
    {
        return [
            TimestampBehavior::className(),
        ];
    }
}
