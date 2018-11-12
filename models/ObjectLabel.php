<?php

namespace app\models;

use omgdef\multilingual\MultilingualBehavior;
use omgdef\multilingual\MultilingualQuery;
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
            'ml' => [
                'class' => MultilingualBehavior::className(),
                'languages' => [
                    'ru' => 'Russian',
                    'en' => 'English',
                ],
                'languageField' => 'locale',
                'defaultLanguage' => 'ru',
                'dynamicLangClass' => true,
                'langForeignKey' => 'object_label_id',
                'tableName' => "{{%object_label_language}}",
                'attributes' => [
                    'description',
                ]
            ],
            TimestampBehavior::className(),
        ];
    }

    public function attributeLabels()
    {
        return [
            'position' => 'Координаты',
            'description' => 'Описание',
            'description_en' => 'Описание на английском',
        ];
    }

    public function getObject(){
        return $this->hasOne(Object::className(), [ 'id' => 'object_id']);
    }

    public static function find()
    {
        return new MultilingualQuery(get_called_class());
    }
}
