<?php

use yii\db\Migration;

/**
 * Handles the creation of table `object_banner`.
 */
class m181102_091138_create_object_banner_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('object_banner', [
            'id' => $this->primaryKey(),
            'object_id' => $this->integer()->notNull(),
            'description' => $this->integer()->notNull(),
        ]);

        $this->addForeignKey(
            'fk-object_object_banner-object',
            'object_banner',
            'object_id',
            'object',
            'id',
            'CASCADE'
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropForeignKey(
            'fk-object_object_banner-object',
            'object_banner'
        );
        $this->dropTable('object_banner');
    }
}
