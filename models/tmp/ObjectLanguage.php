<?php

namespace app\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;
use yii\helpers\FileHelper;

/**
 * Class ObjectLanguage
 * @property int id
 * @property int object_id
 * @property string locale
 * @property string name
 * @property string description
 * @package app\models
 */
class ObjectLanguage extends ActiveRecord
{
    public function rules()
    {
        return [
            [['locale', 'name'], 'required'],
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
}
