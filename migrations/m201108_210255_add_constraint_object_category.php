<?php

use yii\db\Migration;

/**
 * Class m201108_210255_add_constraint_object_category
 */
class m201108_210255_add_constraint_object_category extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->addForeignKey('fk_object_id', 'object_category', 'object_id', 'object', 'id');
        $this->addForeignKey('fk_category_id', 'object_category', 'category_id', 'category', 'id');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropForeignKey('fk_object_id', 'object_category');
        $this->dropForeignKey('fk_category_id', 'object_category');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m201108_210255_add_constraint_object_category cannot be reverted.\n";

        return false;
    }
    */
}
