<?php

use yii\db\Migration;

/**
 * Class m201224_121845_remove_name_description_from_object
 */
class m201224_121845_remove_name_description_from_object extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->dropColumn('object', 'name');
        $this->dropColumn('object', 'description');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->addColumn('object', 'name', $this->string());
        $this->addColumn('object', 'description', $this->string());
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m201224_122749_remove_name_description_from_object cannot be reverted.\n";

        return false;
    }
    */
}