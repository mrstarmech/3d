<?php

use yii\db\Migration;

/**
 * Handles the creation of table `object_option`.
 */
class m180710_163947_create_object_option_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('object_option', [
            'id' => $this->primaryKey(),
            'name' => $this->string()->notNull(),
            'default_value' => $this->string(),
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('object_option');
    }
}
