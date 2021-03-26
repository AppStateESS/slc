<?php
namespace slc\ajax;

class POSTSendMail extends AJAX {

	public function execute(){
		$banner = $_REQUEST['banner_id'];

		$query = 'SELECT * FROM slc_student_data WHERE id =' . $banner;

		$db = new \PHPWS_DB();
		$student = $db->select(null, $query);
		$username = $student[0]['username'];
        $preferred_name = $student[0]['preferred_name'];
        $last_name = $student[0]['lname'];
        $first_name = $student[0]['fname'];
        $name = $first_name." ".$last_name;
        
        if(!empty($preferred_name)){
            $name = $preferred_name." ".$last_name;
        }

        $template = array("cName" => $name);
        $content = \PHPWS_Template::process($template, 'slc', 'studentSurveyEmail.tpl');
        var_dump($content);exit;
		$message = \Swift_Message::newInstance();

		$message->setSubject('How was your experience with Student Legal Clinic?');
		$message->setFrom('dos@appstate.edu');
		$message->setTo($username . '@appstate.edu');

		$message->setBody($content);

		$transport = \Swift_SmtpTransport::newInstance('localhost');
		$mailer = \Swift_Mailer::newInstance($transport);

		$mailer->send($message);
	}
}
