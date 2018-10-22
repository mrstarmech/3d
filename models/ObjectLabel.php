<?php

namespace app\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;

class ObjectLabel extends ActiveRecord
{
    public function rules()
    {
        return [
            [['object_id'], 'required'],
            [['position','description'], 'string'],
        ];
    }

    public function behaviors()
    {
        return [
            TimestampBehavior::className(),
        ];
    }

    public function attributeLabels()
    {
        return [
            'position' => 'Координаты',
            'description' => 'Описание',
        ];
    }
}
