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
 * @property string name
 * @property string description
 * @property int status
 * @property array lang
 * @property Object[] objects
 * @property int parent
 * @package app\models
 */
class Category extends ActiveRecord
{
    const NOT_AVAILABLE = 0;
    const AVAILABLE_MENU = 1;
    const AVAILABLE_REFERENCE = 2;

    /**
     * @return array
     */
    public function rules()
    {
        return [
            [['name'], 'required'],
            [['description'], 'string'],
            [['status'], 'number'],
            [['status'], 'in', 'range' => [self::NOT_AVAILABLE, self::AVAILABLE_MENU, self::AVAILABLE_REFERENCE]],
            [['status'], 'default', 'value' => self::NOT_AVAILABLE],
            [['parent'], 'number'],
            [['parent'], 'default', 'value' => 0],
        ];
    }

    /**
     * @return array
     */
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

    /**
     * @return MultilingualQuery|\yii\db\ActiveQuery
     */
    public static function find()
    {
        return new MultilingualQuery(get_called_class());
    }

    /**
     * @return array
     */
    public function attributeLabels()
    {
        return [
            'name' => 'Название',
            'name_en' => 'Название на английском',
            'description' => 'Описание',
            'description_en' => 'Описание на английском',
            'status' => 'Статус доступа',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getObjects()
    {
        return $this->hasMany(ObjectCategory::className(), ['category_id' => 'id'])
            ->joinWith('object')
            ->where(['visible' => 1])
            ->andWhere(['category_id' => $this->id])
            ->orderBy([new \yii\db\Expression('display_order IS NULL ASC, display_order ASC, id DESC')]);
    }
}
