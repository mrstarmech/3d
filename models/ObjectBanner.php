<?php

namespace app\models;

use yii\db\ActiveRecord;

class ObjectBanner extends ActiveRecord
{
    public function rules()
    {
        return [
            [['object_id'], 'required'],
            ['description', 'string'],
        ];
    }

    public function getObject()
    {
        return $this->hasOne(Object::className(), ['id' => 'object_id']);
    }
}
