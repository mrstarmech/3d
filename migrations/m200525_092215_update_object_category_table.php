<?php

use yii\db\Migration;

/**
 * Class m200525_092215_update_object_category_table
 */
class m200525_092215_update_object_category_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->addColumn('object_category', 'display_order', $this->smallInteger());
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropColumn('object_category', 'display_order');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m200525_092215_update_object_category_table cannot be reverted.\n";

        return false;
    }
    */
}
