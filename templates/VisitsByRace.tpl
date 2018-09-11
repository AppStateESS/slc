<div class="row">
	<div class="col-md-4">
		<table class="table table-condensed table-striped">
		    <thead>
		        <tr>
		            <th>Race</th>
		            <th>Visits</th>
                            <th>Clients</th>
		        </tr>
		    </thead>
		    <tbody>
		    	
		    	<!-- BEGIN visits_by_race_repeat -->
		    	<tr> 
		    		<td>{RACE}</td> 
		    		<td><center>{VISIT_COUNT}</center></td> 
                                <td><center>{CLIENT_COUNT}</center></td> 
		    	</tr>
		    	<!-- END visits_by_race_repeat -->

		    	<tr> 
                            <td><strong>Total</strong></td> 
		    		<td><center>{VISIT_TOTAL}</center></td> 
                                <td><center>{CLIENT_TOTAL}</center></td> 
		    	</tr>
		    </tbody>
		</table>
	</div>
</div>

