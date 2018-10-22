<?php

namespace app\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;
use yii\helpers\FileHelper;

/**
 * Class CategoryLanguage
 * @property int id
 * @property int category_id
 * @property string locale
 * @property string name
 * @property string description
 * @package app\models
 */
class CategoryLanguage extends ActiveRecord
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
