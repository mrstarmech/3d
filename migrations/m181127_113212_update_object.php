<?php

use yii\db\Migration;

/**
 * Class m181127_113212_update_object
 */
class m181127_113212_update_object extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->addColumn('object', 'tech_info', $this->text());
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropColumn('object', 'tech_info');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181127_113212_update_object cannot be reverted.\n";

        return false;
    }
    */
}
