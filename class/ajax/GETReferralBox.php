<?php
namespace slc\ajax;

class GETReferralBox extends AJAX {
	private $_table = "referral";

	public function execute() {

        $db = \phpws2\Database::newDB();
        $pdo = $db->getPDO();

		$query = 'SELECT *
        		  FROM slc_referral_type';

        $sth = $pdo->prepare($query);
        $sth->execute();
        $results = $sth->fetchAll(\PDO::FETCH_ASSOC);

	$rTypes = array();
        foreach( $results as $r ) { // types
        	$rTypes[] = array("referral_id" => $r['id'], "name"=>$r['name']);
        }

	$this->addResult("referral_picker", $rTypes);
	}
}
