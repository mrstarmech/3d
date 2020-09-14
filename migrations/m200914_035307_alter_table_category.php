<?php

use yii\db\Migration;

/**
 * Class m200914_035307_alter_table_category
 */
class m200914_035307_alter_table_category extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->addColumn('category', 'parent', $this->integer()->defaultValue(0));
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropColumn('category', 'parent');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m200914_035307_alter_table_category cannot be reverted.\n";

        return false;
    }
    */
}
