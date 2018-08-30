<?php

use yii\db\Migration;

/**
 * Handles the creation of table `object_setting`.
 */
class m180710_163924_create_object_setting_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('object_setting', [
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
        $this->dropTable('object_setting');
    }
}
