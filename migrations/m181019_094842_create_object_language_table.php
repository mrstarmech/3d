<?php

use yii\db\Migration;

/**
 * Handles the creation of table `object_language`.
 */
class m181019_094842_create_object_language_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('object_language', [
            'id' => $this->primaryKey(),
            'object_id' => $this->integer()->notNull(),
            'locale' => $this->string(10)->notNull(),
            'name' => $this->string(),
            'description' => $this->text(),
        ]);

        $this->addForeignKey(
            'fk-object_language-object',
            'object_language',
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
        $this->dropTable('object_language');
    }
}
