<?php

namespace app\models;

use yii\db\ActiveRecord;

class ObjectSetting extends ActiveRecord
{
    public function rules()
    {
        return [
            [['name'], 'required'],
            ['default_value', 'string'],
        ];
    }
}
