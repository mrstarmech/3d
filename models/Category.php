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
            'name' => 'Name',
            'description' => 'Description',
        ];
    }

    public function behaviors()
    {
        return [
            TimestampBehavior::class,
        ];
    }
}
