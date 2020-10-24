<?php

use yii\db\Migration;

/**
 * Class m201022_080600_object_add_author_copyright_license
 */
class m201022_080600_object_add_author_copyright_license extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->addColumn('object', 'author', $this->string());
        $this->addColumn('object', 'copyright', $this->string());
        $this->addColumn('object', 'license', $this->string());
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropColumn('object', 'author');
        $this->dropColumn('object', 'copyright');
        $this->dropColumn('object', 'license');
        return true;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m201022_080600_object_add_author_copyright_license cannot be reverted.\n";

        return false;
    }
    */
}
