<?php

use yii\helpers\Html;
use \yii\widgets\ActiveForm;

$this->registerJsFile('js/lib.tree.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/viewer.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/label.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);

$this->registerCssFile('css/loader.object.css', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/loader.object.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);

$this->registerCssFile('css/jquery.fancybox.min.css', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/jquery.fancybox.min.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);

$this->registerCssFile('css/colorpicker.css', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);
$this->registerJsFile('js/colorpicker.min.js', ['depends' => ['yii\bootstrap\BootstrapPluginAsset']]);


\dominus77\highlight\Plugin::register($this);

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

$host = Yii::$app->params['host'];
$labelsJson = json_encode($dataLabels);
$script = <<< JS
object = {
    id: $object->id,
    sef: '$object->link',
    option: $object->option,
    setting: $object->setting,
    labels: $labelsJson,
};
host = '$host';
object.option.preserveDrawingBuffer = true;
object.option.menuDisable = true;

start();

var strDownloadMime = "image/octet-stream";
$('#saveLink').click(function() {
  saveAsImage();
})
    function saveAsImage() {
        var imgData, imgNode;

        try {
            var strMime = "image/jpeg";
            imgData = t.renderer.domElement.toDataURL(strMime);
            // saveFile(imgData.replace(strMime, strDownloadMime), "$object->name.jpg");
            $('input[name=data]').val(imgData);
            $('input[name=coordinateX]').val(t.camera.position.x);
            $('input[name=coordinateY]').val(t.camera.position.y);
            $('input[name=coordinateZ]').val(t.camera.position.z);
            
//            var csrfToken = $('meta[name="csrf-token"]').attr("content");
//            $.ajax({
//               async: false,
//               type: "POST",
//               dataType: "json",
//               url: "/admin/shot/$object->id",
//               data: {data: imgData, _csrf: csrfToken},
//               cache: false,
//               success: function(response){
//                   console.log(response);
//               }
//           });

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
JS;

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
<div class="form-group">
    <?= Html::submitButton('Добавить', ['class' => 'btn btn-primary']) ?>
</div>

<?php ActiveForm::end(); ?>
