<?php

use yii\db\Migration;

/**
 * Class m190125_094313_update_category
 */
class m190125_094313_update_category extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->addColumn('category', 'status', $this->smallInteger());
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropColumn('category', 'status');
    }
}
