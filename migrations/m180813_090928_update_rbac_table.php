<?php

use yii\db\Migration;

/**
 * Class m180813_090928_update_auth_assignment_table
 */
class m180813_090928_update_rbac_table extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->insert('auth_item', ['name' => 'admin', 'type' => 1, 'description' => 'Админ']);
        $this->insert('auth_item', ['name' => 'user', 'type' => 1, 'description' => 'Юзер']);

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180813_090928_update_auth_assignment_table cannot be reverted.\n";

        return false;
    }
    */
}
