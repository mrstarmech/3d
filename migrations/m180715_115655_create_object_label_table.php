<?php

use yii\db\Migration;

/**
 * Handles the creation of table `object_label`.
 */
class m180715_115655_create_object_label_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('object_label', [
            'id' => $this->primaryKey(),
            'object_id' => $this->string()->notNull(),
            'position' => $this->text(),
            'description' => $this->text(),
            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('object_label');
    }
}
