<?php

namespace app\models;

use omgdef\multilingual\MultilingualBehavior;
use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;
use yii\helpers\FileHelper;

/**
 * Class Category
 * @property int id
 * @property array lang
 * @property Object[] objects
 * @package app\models
 */
class Category extends ActiveRecord
{
    public function behaviors()
    {
        return [
            'ml' => [
                'class' => MultilingualBehavior::className(),
                'languages' => [
                    'ru' => 'Russian',
                    'en' => 'English',
                ],
                'languageField' => 'locale',
//                'defaultLanguage' => 'en',
                'langForeignKey' => 'category_id',
                'tableName' => "{{%category_language}}",
                'attributes' => [
                    'name', 'description',
                ]
            ],
            TimestampBehavior::className(),
        ];
    }

    public function getObjects(){
        return $this->hasMany(ObjectCategory::className(), ['category_id' => 'id'])
            ->joinWith('object')
            ->where(['visible' => 1])
            ->andWhere(['category_id' => $this->id]);
    }
}
