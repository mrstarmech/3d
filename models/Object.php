<?php

namespace app\models;

use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;
use yii\helpers\FileHelper;

class Object extends ActiveRecord
{
    const SCENARIO_SAVE = 'save';
    const SCENARIO_VIEW = 'view';

    public $pathImage = 'uploads';
    public $pathFile = 'objects';

    public $fileImage;
    public $fileObj;
    public $fileMtl;
    public $fileTexture;

    public function rules()
    {
        return [
            [['name'], 'required'],
            [['name','description','image','obj','mtl','texture'], 'string'],
            [['visible'], 'in', 'range' => [0,1]],
            [['fileImage'], 'file', 'skipOnEmpty' => true, 'extensions' => 'png, jpg'],
            [['fileObj'], 'file', 'skipOnEmpty' => true, 'checkExtensionByMimeType' => false, 'extensions' => 'obj'],
            [['fileMtl'], 'file', 'skipOnEmpty' => true, 'checkExtensionByMimeType' => false, 'extensions' => 'mtl'],
            [['fileTexture'], 'file', 'skipOnEmpty' => true, 'extensions' => 'png, jpg'],
        ];
    }

    public function attributeLabels()
    {
        return [
            'name' => 'Название',
            'description' => 'Описание',
            'image' => 'Постер',
            'visible' => 'Отображение',
            'fileTexture' => 'Файл постера',
            'fileImage' => 'Файл текстуры',
            'fileObj' => 'Файл формата obj',
            'fileMtl' => 'Файл формата mtl',
        ];
    }

    public function behaviors()
    {
        return [
            TimestampBehavior::className(),
        ];
    }

    public function scenarios()
    {
        $scenarios = parent::scenarios();
        $scenarios[self::SCENARIO_SAVE] = ['name','description','image','obj','mtl','texture','visible'];
        $scenarios[self::SCENARIO_VIEW] = ['name','description','image','obj','mtl','texture'];

        return $scenarios;
    }

    public function upload()
    {
        if ($this->validate()) {

            if($this->fileImage) {
                $path = $this->pathImage . '/' . $this->id;

                if(!empty($this->image) and file_exists($path . '/' . $this->image)){
                    unlink($path . '/' . $this->image);
                }

                FileHelper::createDirectory($path);

                $newName = strtotime('now');
                $this->fileImage->saveAs($path . '/' . $newName . '.' . $this->fileImage->extension);
                $this->image = $newName . '.' . $this->fileImage->extension;
            }

            if($this->fileObj) {
                $path = $this->pathFile . '/' . $this->id;

                if(!empty($this->obj) and file_exists($path . '/' . $this->obj)){
                    unlink($path . '/' . $this->obj);
                }

                FileHelper::createDirectory($path);
                $this->fileObj->saveAs($path . '/' . $this->fileObj->baseName . '.' . $this->fileObj->extension);
                $this->obj = $this->fileObj->baseName . '.' . $this->fileObj->extension;
            }

            if($this->fileMtl) {
                $path = $this->pathFile . '/' . $this->id;

                if(!empty($this->mtl) and file_exists($path . '/' . $this->mtl)){
                    unlink($path . '/' . $this->mtl);
                }

                FileHelper::createDirectory($path);
                $this->fileMtl->saveAs($path . '/' . $this->fileMtl->baseName . '.' . $this->fileMtl->extension);
                $this->mtl = $this->fileMtl->baseName . '.' . $this->fileMtl->extension;
            }

            if($this->fileTexture) {
                $path = $this->pathFile . '/' . $this->id;

                if(!empty($this->texture) and file_exists($path . '/' . $this->texture)){
                    unlink($path . '/' . $this->texture);
                }

                FileHelper::createDirectory($path);
                $this->fileTexture->saveAs($path . '/' . $this->fileTexture->baseName . '.' . $this->fileTexture->extension);
                $this->texture = $this->fileTexture->baseName . '.' . $this->fileTexture->extension;
            }

            return true;
        } else {
            return false;
        }
    }

    public function getLabels(){
        return $this->hasMany(ObjectLabel::className(), ['id_object' => 'id']);
    }

    public function beforeDelete()
    {
        $path = $this->pathImage . '/' . $this->id;

        if(!empty($this->image) and file_exists($path . '/' . $this->image)){
            unlink($path . '/' . $this->image);
        }
        if(is_dir($path)){
            rmdir($path);
        }


        $path = $this->pathFile . '/' . $this->id;

        if(!empty($this->obj) and file_exists($path . '/' . $this->obj)){
            unlink($path . '/' . $this->obj);
        }
        if(!empty($this->mtl) and file_exists($path . '/' . $this->mtl)){
            unlink($path . '/' . $this->mtl);
        }
        if(!empty($this->texture) and file_exists($path . '/' . $this->texture)){
            unlink($path . '/' . $this->texture);
        }
        if(is_dir($path)){
            rmdir($path);
        }

        return parent::beforeDelete();
    }
}
