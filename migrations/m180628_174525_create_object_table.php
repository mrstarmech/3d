<?php

use yii\db\Migration;

/**
 * Handles the creation of table `object`.
 */
class m180628_174525_create_object_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('object', [
            'id' => $this->primaryKey(),
            'obj' => $this->string(),
            'mtl' => $this->string(),
            'texture' => $this->string(),
            'image' => $this->string(),
            'setting' => $this->text(),
            'option' => $this->text(),
            'visible' => $this->smallInteger(),
            'sef' => $this->string(50),
            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('object');
    }
}
