<?php

use yii\db\Migration;

/**
 * Handles the creation of table `object_label_language`.
 */
class m181026_093621_create_object_label_language_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('object_label_language', [
            'id' => $this->primaryKey(),
            'object_label_id' => $this->integer()->notNull(),
            'locale' => $this->string(10)->notNull(),
            'description' => $this->text(),
        ]);

        $this->addForeignKey(
            'fk-object_label_language-object_label',
            'object_label_language',
            'object_label_id',
            'object_label',
            'id',
            'CASCADE'
        );

        $this->dropColumn('object_label', 'description');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropForeignKey(
            'fk-object_label_language-object_label',
            'object_label_language'
        );
        $this->dropTable('object_label_language');
    }
}
