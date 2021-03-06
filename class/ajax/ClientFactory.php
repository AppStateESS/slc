<?php
namespace slc\ajax;
use \phpws2\Database;

class ClientFactory
{
	// Saves the client to the database
	public static function saveClient ($client)
	{
		$db = Database::newDB();
		$pdo = $db->getPDO();

        $values = array('id'=>$client->getId(),
						'fv'=>$client->getFirstVisit(),
						'classification'=>$client->getClassification(),
						'll'=>$client->getLivingLocation(),
						'major'=>$client->getMajor(),
						'referral'=>-1,
						'transfer'=>$client->getTransfer(),
						'international' => $client->getInternational(),
                                                'race' => $client->getRace());

        $query = 'INSERT INTO slc_client (id, first_visit, classification, living_location, major, referral, transfer, international,race)
        		  VALUES (:id, :fv, :classification,
        		  		  :ll, :major, :referral,
        		  		  :transfer, :international, :race)';

	  	$sth = $pdo->prepare($query);
		$sth->execute($values);
	}

	public static function updateClient ($client){
		$db = Database::newDB();
		$pdo = $db->getPDO();

        $values = array('id' 			=> $client->getId(),
        				'fv'			=> $client->getFirstVisit(),
						'classification'=> $client->getClassification(),
						'll'			=> $client->getLivingLocation(),
						'major'			=> $client->getMajor(),
						'referral'		=> $client->getReferral(),
						'transfer'		=> $client->getTransfer(),
						'international' => $client->getInternational(),
                                                'race' => $client->getRace());

        $query = 'UPDATE slc_client
        		  SET first_visit 	  = :fv,
        		  	  classification  = :classification,
        		  	  living_location = :ll,
        		  	  major 		  = :major,
        		  	  referral 		  = :referral,
        		  	  transfer 		  = :transfer,
        		  	  international   = :international,
                                  race            = :race  
        		  WHERE id = :id';

	  	$sth = $pdo->prepare($query);
		$sth->execute($values);
	}

	// Grabs the client from the database by their encrypted banner id.
	public static function getClientByEncryBanner($eBannerId, $fname, $lname, $fullName)
	{
		$db = Database::newDB();
		$pdo = $db->getPDO();

		$query = 'SELECT *
				  FROM slc_client
				  WHERE id = :eBannerId';

		$sth = $pdo->prepare($query);
		$sth->execute(array('eBannerId'=>$eBannerId));
		$client = $sth->fetchObject('\slc\ClientDB');

		// If the client is not in the database, return false.
		if ($client === false)
		{
			return null;
		}
		else
		{
			// Associate the client with their name here.
			$client->setFirstName($fname);
	   	 	$client->setLastName($lname);
	   	 	$client->setName($fullName);
		}

		return $client;

	}

	// Grabs the student data from the database
	// (Don't confuse a student with a client)
	public static function getClientByBannerId($bannerId)
	{
		$db = Database::newDB();
		$pdo = $db->getPDO();

		$query = "SELECT *
				  FROM slc_student_data
				  WHERE id = :bannerId";

		$sth = $pdo->prepare($query);
		$sth->execute(array('bannerId'=>$bannerId));
		$result = $sth->fetchObject('\slc\ClientDB');

		return $result;
	}

	// Grabs the referral type that the client has set up.
	public static function getReferralType($cReferral)
	{
		$db = Database::newDB();
		$pdo = $db->getPDO();

		$query = 'SELECT *
    			  FROM slc_referral_type
    			  WHERE id= :cReferral';

        $sth = $pdo->prepare($query);
		$sth->execute(array('cReferral'=>$cReferral));
		$result = $sth->fetchAll(\PDO::FETCH_ASSOC);

		return $result;
	}
}
