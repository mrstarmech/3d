<?php

use yii\db\Migration;

/**
 * Class m201108_212232_add_multilang_author_copyright_license
 */
class m201108_212232_add_multilang_author_copyright_license extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->addColumn('object_language', 'author', $this->string());
        $this->addColumn('object_language', 'copyright', $this->string());

        foreach((new \yii\db\Query)->from('object')->each() as $obj)
        {
            $this->update('object_language',['author' => $obj['author'], 'copyright' => $obj['copyright']],['object_id'=>$obj['id'],'locale' => 'ru']);
        }

        $this->dropColumn('object', 'author');
        $this->dropColumn('object', 'copyright');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->addColumn('object', 'author', $this->string());
        $this->addColumn('object', 'copyright', $this->string());

        foreach((new \yii\db\Query)->from('object_language')->where(['locale'=>'ru'])->each() as $obj)
        {
            $this->update('object',['author' => $obj['author'], 'copyright' => $obj['copyright']],['id'=>$obj['object_id']]);
        }

        $this->dropColumn('object_language', 'author');
        $this->dropColumn('object_language', 'copyright');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m201108_212232_add_multilang_author_copyright_license cannot be reverted.\n";

        return false;
    }
    */
}
