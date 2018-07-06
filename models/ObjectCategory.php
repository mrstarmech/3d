<?php

namespace app\models;

use yii\db\ActiveRecord;

class ObjectCategory extends ActiveRecord
{
    public function rules()
    {
        return [
            [['id_object','id_category'], 'required'],
        ];
    }

    public function getObject(){
        return $this->hasOne(Object::class, [ 'id' => 'id_object']);
    }

    public function getCategory(){
        return $this->hasOne(Category::class, [ 'id' => 'id_category']);
    }
}
