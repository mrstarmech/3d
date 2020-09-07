<?php

use yii\helpers\Html;
use \yii\widgets\ActiveForm;
use app\assets\View3dAsset;

$dataLabels = [];
$labels = $object->labels;
if (!empty($labels)) {
    foreach ($labels as $label) {
        $dataLabels[] = [
            'id' => $label->id,
            'position' => json_decode($label->position),
            'description' => $label->description,
        ];
    }
}

$host = Yii::$app->urlManager->createAbsoluteUrl(['/']);
$labelsJson = json_encode($dataLabels);
$script = <<< JS
object = {
    id: $object->id,
    sef: '$object->link',
    option: $object->option,
    setting: $object->setting,
};

host = '$host';
object.option.preserveDrawingBuffer = true;
object.option.menuDisable = false;
object.option.autorotate = false;

start(true);

var strDownloadMime = "image/octet-stream";
$('#saveLink').click(function() {
  saveAsImage();
})
    function saveAsImage() {
        var imgData, imgNode;

        try {
            disableMenu();
            t.switchEnv('scale-ruler', false);
            t.render();
            var strMime = "image/jpeg";
            imgData = t.renderer.domElement.toDataURL(strMime);
            // saveFile(imgData.replace(strMime, strDownloadMime), "$object->name.jpg");
            $('input[name=data]').val(imgData);
            $('input[name=coordinateX]').val(t.camera.position.x);
            $('input[name=coordinateY]').val(t.camera.position.y);
            $('input[name=coordinateZ]').val(t.camera.position.z);
            $('input[name=fov]').val(t.camera.fov);
            var layers = [];
            if (Array.isArray(drawings)){
                for (var i = 0; i < drawings.length; i++){
                    layers.push({alpha : drawings[i].alpha, color : drawings[i].color})
                }
                $('input[name=layers]').val(JSON.stringify(layers));
            }
            enableMenu();
            t.switchEnv('scale-ruler', true);
        } catch (e) {
            console.log(e);
            return;
        }
        return false;

    }
    var saveFile = function (strData, filename) {
        var link = document.createElement('a');
        if (typeof link.download === 'string') {
            document.body.appendChild(link); //Firefox requires the link to be in the body
            link.download = filename;
            link.href = strData;
            link.click();
            document.body.removeChild(link); //remove the link when done
        } else {
            location.replace(uri);
        }
    }

$('#orthoLink').click(function() {
    window.t.switchEnv('shot', $('select[name=res]').val())});

$('#wback').change(function () {
    
    window.t.switchEnv('white-back', $("input[type=checkbox][name=wback]").is(":checked"))
});

$('#drawingLink').click(function() {
    var layers = [];
    if (Array.isArray(drawings) && drawings.length > 0){
        for (var i = 0; i < drawings.length; i++){
            layers.push({alpha : drawings[i].alpha, color : drawings[i].color})
        }
        layersParamsToggle(`<a href='javascript:layers=` + JSON.stringify(layers) + `;for (var i = 0; i < drawings.length; i++){drawings[i].alpha = layers[i].alpha;drawings[i].color = layers[i].color;}t.redrawTexture();'>Параметры слоев</a>`);
    }
    else
    {
        layersParamsToggle("Слои отсутствуют!");
    }
});
JS;

View3dAsset::register($this);
\dominus77\highlight\Plugin::register($this);
$this->registerJs($script, yii\web\View::POS_READY);

$this->title = $object->name;
$this->params['breadcrumbs'][] = $this->title;

echo $this->render('_header_object', ['object' => $object]);
?>
<div class="col-xs-12 col-md-6 tree-object">
    <div class="container-object" data-state="static">
        <div class="canvas-object"></div>
    </div>
</div>
<h1><?= $this->title ?></h1>

<div class="form-group">
    <button id="saveLink" class="btn btn-primary">
        Сохранить
    </button>
</div>

<?php $form = ActiveForm::begin(); ?>
    <input type="hidden" name="data">
    <input type="hidden" name="coordinateX">
    <input type="hidden" name="coordinateY">
    <input type="hidden" name="coordinateZ">
    <input type="hidden" name="layers">
    <input type="hidden" name="fov">
<div class="form-group">
    <?= Html::submitButton('Добавить', ['class' => 'btn btn-primary']) ?>
</div>

<?php ActiveForm::end(); ?>

<div class="form-group">
    <button id="orthoLink" class="btn btn-primary">
        Ортофото
    </button>
    <select id="resolution" name="res">
        <option value="1024">1024</option>
        <option value="2048">2048</option>
        <option value="4096">4096</option>
    </select>
    <input type="checkbox" id="wback" name="wback">
    <label for="wback">Белый фон</label>
</div>



<div class="form-group">
    <button id="drawingLink" class="btn btn-primary">
        Копировать параметры слоев
    </button>
</div>

<?= $object->description ?>