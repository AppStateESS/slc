<?php

namespace slc\reports;

use phpws2\Database;

class ReportVisitsByRace extends Report {

    public $content;
    public $startDate;
    public $endDate;

    public function __construct($startDate, $endDate) {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->execute();
    }

    public function execute() {

        $db = Database::getDB();
        $client_tbl = $db->addTable('slc_client');
        $visit_tbl = $db->addTable('slc_visit');
        $db->joinResources($client_tbl, $visit_tbl, $db->createConditional($client_tbl->getField('id'), $visit_tbl->getField('client_id')), 'inner');
        $start_condition = $db->createConditional('initial_date', $this->startDate, '>=');
        $end_condition = $db->createConditional('initial_date', $this->endDate, '<');
        $db->addConditional($start_condition, $end_condition, 'AND');
        $results = $db->select();

        if (\PHPWS_Error::logIfError($results)) {
            throw new \slc\exceptions\DatabaseException();
        }

        $race_counts = array(AMERICAN_INDIAN => array("client" => 0, "visit" => 0),
            ASIAN => array("client" => 0, "visit" => 0),
            BLACK => array("client" => 0, "visit" => 0),
            PACIFIC_ISLANDER => array("client" => 0, "visit" => 0),
            WHITE => array("client" => 0, "visit" => 0),
            MULTI_RACIAL => array("client" => 0, "visit" => 0));
        $clients = array();

        foreach ($results as $key => $value) {
            $race = explode(',', $value['race']);

            if (count($race) > 1) {
                $race_counts[MULTI_RACIAL]['visit'] ++;
                if (!in_array($value['client_id'], $clients)) {
                    $race_counts[MULTI_RACIAL]['client'] ++;
                    $clients[] = $value['client_id'];
                }
            } else {
                $r = array_pop($race);
                if (!empty($r)) {
                    $race_counts[$r]['visit'] ++;
                    if (!in_array($value['client_id'], $clients)) {
                        $race_counts[$r]['client'] ++;
                        $clients[] = $value['client_id'];
                    }
                }
            }
        }

        $content = array();

        $visit_total = 0;
        $client_total = 0;

        foreach ($race_counts as $key => $value) {
            $visit_count = $value['visit'];
            $client_count = $value['client'];
            $race = $this->decodeRace($key);
            $visit_total += $visit_count;
            $client_total += $client_count;
            $content['visits_by_race_repeat'][] = array('RACE' => $race, 'VISIT_COUNT' => $visit_count, 'CLIENT_COUNT' => $client_count);
        }

        // Add a final row with the totals
        $content['VISIT_TOTAL'] = $visit_total;
        $content['CLIENT_TOTAL'] = $client_total;

        $this->content = $content;
    }

    public function decodeRace($key) {
        switch ($key) {
            case 100:
                $race = "American Indian or Alaska Native";
                break;
            case 200:
                $race = "Asian";
                break;
            case 300:
                $race = "Black or African American";
                break;
            case 400:
                $race = "Native Hawaiian or Pacific Islander";
                break;
            case 500:
                $race = "White";
                break;
            case 600:
                $race = "Multiracial";
                break;
            default:
                $race = "Unknown";
        }
        return $race;
    }

    public function getHtmlView() {
        return \PHPWS_Template::process($this->content, 'slc', 'VisitsByRace.tpl');
    }

}
