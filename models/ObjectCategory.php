<?php

namespace app\models;

use yii\db\ActiveRecord;

class ObjectCategory extends ActiveRecord
{
    public function rules()
    {
        return [
            [['object_id','category_id'], 'required'],
        ];
    }

    public function getObject(){
        return $this->hasOne(Object::className(), [ 'id' => 'object_id']);
    }

    public function getCategory(){
        return $this->hasOne(Category::className(), [ 'id' => 'category_id']);
    }
}
