<?php

namespace app\models;

use omgdef\multilingual\MultilingualBehavior;
use omgdef\multilingual\MultilingualQuery;
use yii\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;
use yii\helpers\FileHelper;
use yii\helpers\Url;

/**
 * Class Object
 *
 * @property int id
 * @property int visible
 * @property string name
 * @property string description
 * @property string image
 * @property string obj
 * @property string mtl
 * @property string texture
 * @property string option
 * @property string setting
 * @property string sef
 * @property array labels
 * @property array labelsArray
 *
 * @package app\models
 */
class Object extends ActiveRecord
{
    const SCENARIO_SAVE = 'save';
    const SCENARIO_VIEW = 'view';

    const LOADER_OBJ = 'objLoader';
    const LOADER_UTF8 = 'utf8Loader';

    const PATH_IMAGE = 'uploads';
    const PATH_FILE = 'objects';

    public $pathImage = 'uploads';
    public $pathFile = 'objects';

    public $defaultOption = [
        "grid" => false,
        "ruler" => false,
        "wireframe" => false,
        "autorotate" => false,
        "showgui" => false,
        "lights" => "Cameralight",
        "loader" => "objLoader",
        "controls" => "OrbitControls",
        "camera" => "auto",
        "cameraDistanceMultiplier" => 1,
        "cameraCoords" => [
            "x" => 0,
            "y" => 0,
            "z" => 0
        ]
    ];
    public $defaultSetting = [
        "name" => "",
        "texture" => "",
        "mesh" => "",
        "ambient" => "",
        "color" => "",
        "specular" => "",
        "shininess" => ""
    ];

    public $fileImage;
    public $dataImage;
    public $fileObj;
    public $fileMtl;
    public $fileTexture;

    public function rules()
    {
        return [
            [['name'], 'required'],
            [['name', 'description', 'image', 'obj', 'mtl', 'texture', 'option', 'setting', 'tech_info'], 'string'],
            [['visible'], 'in', 'range' => [0, 1]],
            [['fileImage'], 'file', 'skipOnEmpty' => true, 'extensions' => 'png, jpg'],
            [['fileObj'], 'file', 'skipOnEmpty' => true, 'checkExtensionByMimeType' => false, 'extensions' => 'obj, gltf, glb'],
            [['fileMtl'], 'file', 'skipOnEmpty' => true, 'checkExtensionByMimeType' => false, 'extensions' => 'mtl'],
            [['fileTexture'], 'file', 'skipOnEmpty' => true, 'extensions' => 'png, jpg, bin'],
            ['sef', 'match', 'pattern' => '/^[a-z0-9\-]*$/iu', 'message' => 'Допустима латиница, числа и -'],
        ];
    }

    public function attributeLabels()
    {
        return [
            'name' => 'Название',
            'name_en' => 'Название на английском',
            'description' => 'Описание',
            'description_en' => 'Описание на английском',
            'image' => 'Постер',
            'visible' => 'Отображение',
            'fileImage' => 'Файл постера',
            'fileTexture' => 'Файл текстуры',
            'fileObj' => 'Файл формата obj',
            'fileMtl' => 'Файл формата mtl',
            'option' => 'Опции',
            'setting' => 'Настройки',
            'sef' => 'ЧПУ',
            'tech_info' => 'Техническая информация'
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
                'langForeignKey' => 'object_id',
                'tableName' => "{{%object_language}}",
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

    public function scenarios()
    {
        $scenarios = parent::scenarios();
        $scenarios[self::SCENARIO_SAVE] = ['name', 'description', 'image', 'obj', 'mtl', 'texture', 'visible', 'option', 'setting'];
        $scenarios[self::SCENARIO_VIEW] = ['name', 'description', 'image', 'obj', 'mtl', 'texture', 'option', 'setting'];

        return $scenarios;
    }

    public function upload()
    {
        if ($this->validate()) {

            if (empty($this->option) or empty($this->optionArray)) {
                $this->option = json_encode($this->defaultOption);
            }

            if (empty($this->setting)) {
                $this->setting = json_encode($this->defaultSetting);
                $this->setSetting('name', $this->name);
            }

            if ($this->fileImage) {
                $path = $this->pathImage . '/' . $this->id;

                if (!empty($this->image) and file_exists($path . '/' . $this->image)) {
                    unlink($path . '/' . $this->image);
                }

                FileHelper::createDirectory($path);

                $newName = strtotime('now');
                $this->fileImage->saveAs($path . '/' . $newName . '.' . $this->fileImage->extension);
                $this->image = $newName . '.' . $this->fileImage->extension;
            }

            if ($this->fileObj) {
                $path = $this->pathFile . '/' . $this->id;

                if (!empty($this->obj) and file_exists($path . '/' . $this->obj)) {
                    unlink($path . '/' . $this->obj);
                }

                FileHelper::createDirectory($path);
                $this->fileObj->saveAs($path . '/' . $this->fileObj->baseName . '.' . $this->fileObj->extension);
                $this->obj = $this->fileObj->baseName . '.' . $this->fileObj->extension;

                if (isset($this->optionArray->loader) and $this->optionArray->loader == Object::LOADER_OBJ) {
                    $this->setSetting('mesh', '/' . $path . '/' . $this->obj);
                }
            }

            if ($this->fileMtl) {
                $path = $this->pathFile . '/' . $this->id;

                if (!empty($this->mtl) and file_exists($path . '/' . $this->mtl)) {
                    unlink($path . '/' . $this->mtl);
                }

                FileHelper::createDirectory($path);
                $this->fileMtl->saveAs($path . '/' . $this->fileMtl->baseName . '.' . $this->fileMtl->extension);
                $this->mtl = $this->fileMtl->baseName . '.' . $this->fileMtl->extension;
            }

            if ($this->fileTexture) {
                $path = $this->pathFile . '/' . $this->id;

                if (!empty($this->texture) and file_exists($path . '/' . $this->texture)) {
                    unlink($path . '/' . $this->texture);
                }

                FileHelper::createDirectory($path);
                $this->fileTexture->saveAs($path . '/' . $this->fileTexture->baseName . '.' . $this->fileTexture->extension);
                $this->texture = $this->fileTexture->baseName . '.' . $this->fileTexture->extension;

                $this->setSetting('texture', '/' . $path . '/' . $this->texture);
            }

            if ($this->dataImage) {
                $path = self::PATH_IMAGE . '/' . $this->id;
//                $option = $this->getOptionArray();

//                if (!empty($option->poster) and file_exists($option->poster)) {
//                    unlink($option->poster);
//                }

                $newName = strtotime('now');
                list($type, $data) = explode(';', $this->dataImage);
                list(, $data) = explode(',', $data);
                $data = base64_decode($data);
                file_put_contents($path . '/' . $newName . '.jpg', $data);
                $this->setSetting('poster', '/' . $path . '/' . $newName . '.jpg');
            }

            return true;
        } else {
            return false;
        }
    }

    public function getLabels()
    {
        return $this->hasMany(ObjectLabel::className(), ['object_id' => 'id']);
    }

    public function getLabelsArray()
    {
        return $this->hasMany(ObjectLabel::className(), ['object_id' => 'id'])
            ->asArray();
    }

    public function getOptionArray()
    {
        return json_decode($this->option);
    }

    public function getSettingArray()
    {
        return json_decode($this->setting);
    }

    public function setOption($field, $value)
    {
        $option = $this->getOptionArray();
        $option->$field = $value;
        $this->option = json_encode($option);
    }

    public function setSetting($field, $value)
    {
        $setting = $this->getSettingArray();
        $setting->$field = $value;
        $this->setting = json_encode($setting);
    }

    public function getContentMtl()
    {
        if ($this->mtl and file_exists($this->pathFileWR . '/' . $this->mtl)) {
            return file_get_contents($this->pathFileWR . '/' . $this->mtl);
        }
        return false;
    }

    public function getContentObj()
    {
        if ($this->obj and file_exists($this->pathFileWR . '/' . $this->obj)) {
            return file_get_contents($this->pathFileWR . '/' . $this->obj);
        }
        return false;
    }

    public function getContentUtfJs()
    {
        if (!empty($this->contentObj)) {
            $withoutExt = preg_replace('/\\.[^.\\s]{3,4}$/', '', $this->obj);

            return file_get_contents($this->pathFileWR . '/' . $withoutExt . '_utf.js');
        }
        return false;
    }

    public function getPathFileWR()
    {
        if ($this->id) {
            return Url::to('@webroot/' . $this->pathFile . '/' . $this->id);
        }
        return false;
    }

    public function beforeDelete()
    {
        $path = $this->pathImage . '/' . $this->id;

        if (is_dir($path)) {
            self::deleteDir($path);
        }

        $path = $this->pathFile . '/' . $this->id;

        if (is_dir($path)) {
            self::deleteDir($path);
        }

        return parent::beforeDelete();
    }

    public function getObjectCategory()
    {
        return $this->hasMany(ObjectCategory::className(), ['object_id' => 'id']);
    }

    public function getObjectBanner()
    {
        return $this->hasOne(ObjectBanner::className(), ['object_id' => 'id']);
    }

    public function getLink()
    {
        return empty($this->sef) ? $this->id : $this->sef;
    }

    public static function deleteDir($dirPath)
    {
        if (!is_dir($dirPath)) {
            throw new InvalidArgumentException("$dirPath must be a directory");
        }
        if (substr($dirPath, strlen($dirPath) - 1, 1) != '/') {
            $dirPath .= '/';
        }
        $files = glob($dirPath . '*', GLOB_MARK);
        foreach ($files as $file) {
            if (is_dir($file)) {
                self::deleteDir($file);
            } else {
                unlink($file);
            }
        }
        $files = glob($dirPath . '.*', GLOB_MARK);
        foreach ($files as $file) {
            if ($file == $dirPath . '.\\' or $file == $dirPath . '..\\') {
                continue;
            }

            if (is_dir($file)) {
                self::deleteDir($file);
            } else {
                unlink($file);
            }
        }
        rmdir($dirPath);
    }
}
