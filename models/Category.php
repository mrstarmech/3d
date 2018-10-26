<?php

namespace app\models;

use omgdef\multilingual\MultilingualBehavior;
use omgdef\multilingual\MultilingualQuery;
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

    public function rules()
    {
        return [
            [['name'], 'required'],
            [['description'], 'string'],
        ];
    }
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
                'defaultLanguage' => 'ru',
                'langForeignKey' => 'category_id',
                'tableName' => "{{%category_language}}",
                'attributes' => [
                    'name', 'description',
                ]
            ],
            TimestampBehavior::className(),
        ];
    }

    public static function find()
    {
        return new MultilingualQuery(get_called_class());
    }

    public function attributeLabels()
    {
        return [
            'name' => 'Название',
            'name_en' => 'Название на английском',
            'description' => 'Описание',
            'description_en' => 'Описание на английском',
        ];
    }

    public function getObjects(){
        return $this->hasMany(ObjectCategory::className(), ['category_id' => 'id'])
            ->joinWith('object')
            ->where(['visible' => 1])
            ->andWhere(['category_id' => $this->id]);
    }
}
