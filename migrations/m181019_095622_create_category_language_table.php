<?php

use yii\db\Migration;

/**
 * Handles the creation of table `category_language`.
 */
class m181019_095622_create_category_language_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('category_language', [
            'id' => $this->primaryKey(),
            'category_id' => $this->integer()->notNull(),
            'locale' => $this->string(10)->notNull(),
            'name' => $this->string(),
            'description' => $this->text(),
        ]);

        $this->addForeignKey(
            'fk-category_language-category',
            'category_language',
            'category_id',
            'category',
            'id',
            'CASCADE'
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('category_language');
    }
}
