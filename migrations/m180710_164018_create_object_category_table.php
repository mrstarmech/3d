<?php

use yii\db\Migration;

/**
 * Handles the creation of table `object_category`.
 */
class m180710_164018_create_object_category_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('object_category', [
            'id' => $this->primaryKey(),
            'id_object' => $this->integer()->notNull(),
            'id_category' => $this->integer()->notNull(),
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('object_category');
    }
}
