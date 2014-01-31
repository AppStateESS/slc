<?php 

require_once 'lib/Swift/lib/swift_required.php';

class POSTSendMail extends AJAX {

	public function execute(){
	
		if ( !isset($_REQUEST['client_id']) ) {
			throw new Exception('Client no longer in database.');
			return;
		}
				
		$banner = $_REQUEST['client_id'];
		
		$query = 'SELECT username FROM slc_student_data WHERE id =' . $banner;
		
		$db = new PHPWS_DB();
		$username = $db->select(null, $query);
		$username = $username[0]['username'];
		$content = 'Hello, this is the first email!';
		
		$message = Swift_Message::newInstance();

		$message->setSubject('Check-in Confirmation');
		$message->setFrom('jakerspollard@gmail.com');
		$message->setTo($username . '@appstate.edu');

		$message->setBody($content);
		
		$transport = Swift_SmtpTransport::newInstance('localhost');
		$mailer = Swift_Mailer::newInstance($transport);

		$mailer->send($message);
		
		//echo $username . '@appstate.edu';
		//exit;
				
	}
}

?>