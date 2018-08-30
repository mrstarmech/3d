<?php

namespace app\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;
use yii\helpers\FileHelper;

class Category extends ActiveRecord
{
    public function rules()
    {
        return [
            [['name'], 'required'],
            [['description'], 'string'],
        ];
    }

    public function attributeLabels()
    {
        return [
            'name' => 'Название',
            'description' => 'Описание',
        ];
    }

    public function behaviors()
    {
        return [
            TimestampBehavior::className(),
        ];
    }

    public function getObjects(){
        return $this->hasMany(ObjectCategory::className(), ['id_category' => 'id'])
            ->joinWith('object')
            ->where(['visible' => 1]);
    }
}
