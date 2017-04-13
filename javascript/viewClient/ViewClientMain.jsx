// !!The banner_id variable is important!!

// It's being used as a global variable from the head.js.
// It determine's which banner id is being used so it can grab the client data.




var ViewClientMain = React.createClass({
    getInitialState: function() {
        return {
            clientData: null,
            issueTreeData: null,
            referralData: null,
            msgNotification: '',
            msgType: '',
            notificationData: null,
            showModal: false
        };
    },
    componentWillMount: function(){
        this.getClientData();
        this.getReferralData();
    },
    componentDidMount: function(){
        this.getIssueData();
    },
    closeModal: function() {
        this.setState({ showModal: false });
    },
    openModal: function() {
        this.setState({ showModal: true });
    },
    getClientData: function(){
        $.ajax({
            url: 'index.php?module=slc&action=GETStudentClientData&banner_id=' + banner_id,
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                this.setState({clientData: data});
            }.bind(this),
            error: function(xhr, status, err) {
                alert("Failed to grab client data."+err.toString());
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    getIssueData: function() {
        $.ajax({
            url: 'index.php?module=slc&action=GETNewIssue',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                var landlordTypes = data.tree;
                var landlords = data.landlords;

                // Adds a -1 value to be used later in the
                // dropdowns in the Modal form.
                for (var type in landlordTypes)
                {
                    landlordTypes[type].unshift({problem_id:-1, name:"Select an Issue"});
                }

                landlords.unshift({id:-1, name:"Select a Landlord"});

                this.setState({issueTreeData: data});
            }.bind(this),
            error: function(xhr, status, err) {
                alert("Failed to grab client data.")
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    getReferralData: function() {
        $.ajax({
            url: 'index.php?module=slc&action=GETReferralBox',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                var referral = data.referral_picker;
                // Adds a -1 value to be used in the referral dropdown.
                referral.unshift({referral_id:-1, name:"Select a Referral"});
                this.setState({referralData: data});
            }.bind(this),
            error: function(xhr, status, err) {
                alert("Failed to grab referral data.")
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    newVisit: function(issueData){
        var visitIssueData = JSON.stringify(issueData);
        $.ajax({
            url: 'index.php?module=slc&action=POSTNewVisit&banner_id=' + this.state.clientData.client.id,
            type: 'POST',
            data: visitIssueData,
            dataType: 'json',
            success: function(msg) {
                // Grabs the client data for re-render of new visit.
                this.getClientData();
                // Determines the notification message.
                var key = Object.keys(msg);
                this.setState({msgNotification: msg[key],
                               msgType: key,
                               notificationData: issueData});
            }.bind(this),
            error: function(xhr, status, err) {
                alert("Failed to go to new visit.")
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    postReferral: function(r_id) {
        $.ajax({
            url: 'index.php?module=slc&action=POSTReferralType&banner_id=' + this.state.clientData.client.id + '&referral_type=' + r_id,
            type: 'POST',
            dataType: 'json',
            success: function(data) {
                // Grabs the client data for re-render of the new Referral.
                this.getClientData();
                // Sets notification message for successful referral change.
                this.setState({msgNotification: "Successfully changed the referral type.",
                                msgType: "success",
                                notificationData: null});
            }.bind(this),
            error: function(xhr, status, err) {
                // Sets notification message for failed referral change.
                this.setState({msgNotification: "Failed to change the referral type. " + err.toString(),
                               msgType: "error",
                               notificationData: null});
            }.bind(this)
        });
    },
    postEmail: function() {
        if (this.refs.surveyBlock.isChecked()){
            $.ajax({
                url: 'index.php?module=slc&action=POSTSendMail&banner_id=' + banner_id + '&name=' + this.state.clientData.client.name,
                type: 'POST',
                dataType: 'json',
                success: function() {
                }.bind(this),
                error: function(xhr, status, err) {
                    console.error(this.props.url, status, err.toString());
                }.bind(this)
            });
        }
    },
    postTransfer: function(tChecked) {
        var client = this.state.clientData.client;
        var tData = { id      : client.id,
                      fname   : client.fname,
                      lname   : client.lname,
                      fullName: client.name,
                      checked : tChecked,
                      sType   : 'transfer' };

        var transferData = JSON.stringify(tData);

        $.ajax({
            url: 'index.php?module=slc&action=POSTTransferInternat',
            type: 'POST',
            data: transferData,
            dataType: 'json',
            success: function() {
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    postInternational: function(iChecked) {
        var client = this.state.clientData.client;
        var iData = { id      : client.id,
                      fname   : client.fname,
                      lname   : client.lname,
                      fullName: client.name,
                      checked : iChecked,
                      sType   : 'international' };

        var internationalData = JSON.stringify(iData);

        $.ajax({
            url: 'index.php?module=slc&action=POSTTransferInternat',
            type: 'POST',
            data: internationalData,
            dataType: 'json',
            success: function() {
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    render: function() {
        if (this.state.clientData == null)
        {
            var client = null;
            // While the server is waiting for the data, display
            // a spinning loading wheel.
            return (<div style={{top:"50%", left: "50%", position:"absolute"}}>
                        <i className="fa fa-spinner fa-pulse fa-5x"></i>
                    </div>);
        }
        else
        {
            var client = this.state.clientData.client;
            var visit = this.state.clientData.visit;
            var newIssue = this.newIssue;
            var getClient = this.getClientData;
            var postEmail = this.postEmail;

            // Displays all available visits for a given client.
            var visits = visit.map(function (data) {
                return (
                    <ViewVisits key         = {data.id}
                                id          = {data.id}
                                init_date   = {data.initial_date}
                                issues      = {data.issues}
                                getClient   = {getClient}
                                newIssue    = {newIssue}
                                client      = {client}
                                postEmail   = {postEmail} />
                );
            });
        }

        if (this.state.referralData == null)
        {
            // Display nothing until the referral request passes.
            var referral = null;
            return (<div></div>);
        }
        else
        {
            var referral =  <ReferralStatus referralData = {this.state.referralData.referral_picker}
                                referralString = {client.referralString}
                                postReferral = {this.postReferral} />
        }

        var modalForm;
        if(this.state.issueTreeData != null)
        {
            modalForm = (<ModalForm show             = {this.state.showModal}
                                    close            = {this.closeModal}
                                    issueTreeData    = {this.state.issueTreeData}
                                    newVisit         = {this.newVisit}
                                    sendEmail        = {this.postEmail} />);
        }
        else
        {
            modalForm = (<div></div>);
        }
        return (
            <div>
                <div id="CLIENT_ID" style={{display:"none"}}>{client.id}</div>

                <Notifications msg = {this.state.msgNotification}
                               msgType = {this.state.msgType}
                               notificationData = {this.state.notificationData} />

                <div className="row">
                    <div className="col-md-6">
                        <h1 id="client_name">{client.name}</h1>
                        <h3 id="client_info">{client.classification} - {client.major}</h3>
                    </div>
                    <div className="col-md-6">
                        <span id="first_visit" className="pull-right">First Visit: {client.first_visit}</span>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-3">
                        <TransferInternCheck tChecked           = {client.transfer} 
                                             iChecked           = {client.international} 
                                             postTransfer       = {this.postTransfer}
                                             postInternational  = {this.postInternational} />
                        
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-3">
                        {referral}
                    </div>

                    <div className="col-md-3 pull-right">
                        <EmailSurvey ref="surveyBlock" />
                    </div>
                </div>


                <div className="row" style={{borderTop: "1px solid #CCC", marginTop: "1em"}}>
                    <div className="col-md-6" style={{marginTop: "1em"}}>
                        <span className="pull-left">Visits:</span>
                    </div>

                    <div className="col-md-6" style={{marginTop: "1em"}}>
                        {modalForm}
                        <a href="javascript:;" onClick={this.openModal} className="btn btn-primary pull-right"><i className="fa fa-plus"></i> New Visit</a>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        {visits}
                    </div>
                </div>
            </div>
        );
    }
});


/**
    Notification component used with a successful visit or
    referral change.
**/
var Notifications = React.createClass({
    render: function(){
        var notification;
        // Determine if the screen should render a notification.
        if (this.props.msg != '')
        {
            if (this.props.msgType == 'success')
            {
                // Used for visits.
                if (this.props.notificationData != null)
                {
                    notification = <div className="alert alert-success" role="alert">
                                    <strong>{this.props.msg} </strong>
                                    <br />

                                    <ul>
                                        {this.props.notificationData.map(function (key) {
                                            return (
                                                <ListIssues key    = {key.name}
                                                            name   = {key.name}
                                                            llID   = {key.llID}
                                                            id     = {key.id}
                                                            llName = {key.llName} />
                                            );
                                        })}
                                    </ul>
                                </div>
                }
                else // Used for referrals.
                {
                    notification = <div className="alert alert-success" role="alert">
                                    <strong>{this.props.msg}</strong>
                                    <br />
                                </div>
                }
            }
            else if (this.props.msgType == 'error')
            {
                notification = <div className="alert alert-danger" role="alert">
                                    <strong>Error: </strong>
                                    <br />
                                    {this.props.msg}
                                </div>
            }
        }
        else
        {
            notification = '';
        }
        return (
            <div>{notification}</div>
        );
    }
});


/**
    Component that lists all the issues for a given visit.
**/
var ListIssues = React.createClass({
    render: function(){
        if (this.props.llID != null)
        {
            conditions = <span>{this.props.name} <em> with </em> {this.props.llName}</span>;
        }
        else
        {
            conditions = <span>{this.props.name} </span>;
        }
        return (

            <li>{conditions}</li>
        );
    }
});

/**
    Component that determines the referral status of the client.
**/
var ReferralStatus = React.createClass({
    handleReferral: function(e){
        // Grabs the value from the referral dropdown box.
        var r_id = e.target.value;
        this.props.postReferral(r_id);
    },
    render: function(){
        var referralData = this.props.referralData;
        var referralString = this.props.referralString;
        var referralNotice;

        if (referralString == null)
        {
            // Tells the user with a small yellow icon to choose a referral type.
            referralNotice = <abbr title="Please select a referral">
                                <span className="pull-right">
                                    <i className="fa fa-exclamation-triangle" style={{color: "gold"}}></i>
                                </span>
                            </abbr>
        }
        else
        {
            referralNotice = <div></div>
        }
        return (
            
            <form className="form-horizontal" role="form">
                Referral: {referralNotice}

                <select className="form-control" onChange={this.handleReferral}>
                    {referralData.map(function (key) {
                        return (
                            <ProblemList key            = {key.name}
                                         name           = {key.name}
                                         id             = {key.referral_id}
                                         referralString = {referralString} />
                        );
                    })}
                </select>
            </form>
        );
    }
});

/**
    Component that helps view the visits for a given user.
**/
var ViewVisits = React.createClass({
    render: function() {
        var getClient = this.props.getClient;
        var postEmail = this.props.postEmail;
        var issues = this.props.issues.map(function (data) {
            return (
                <ViewIssues key             = {data.name+data.id}
                            id              = {data.id}
                            counter         = {data.counter}
                            landlord_name   = {data.landlord_name}
                            getClient       = {getClient}
                            name            = {data.name}
                            postEmail       = {postEmail} />
            );
        });
        return (
            <div style={{marginBottom: "1.5em"}}>
                <div className="row" style={{marginBottom: "1em"}}>
                    <div className="col-md-12" style={{borderBottom: "1px solid #CCC", marginBottom: "1em"}}>
                        <span style={{"fontSize": 18, "fontWeight":'bold'}}>{this.props.init_date}</span>
                    </div>
                </div>
                {issues}
            </div>
        );
    }
});

/**
    Component that creates and controls each issue within a visit.
    This also creates the followup button with its given event handler.
**/
var ViewIssues = React.createClass({
    handleFollowUp: function() {
        var issueId = this.props.id;
        $.ajax({
            url: 'index.php?module=slc&action=POSTIncrementVisit&issue_id='+issueId,
            type: 'POST',
            dataType: 'json',
            success: function() {
                // Rerender the screen for added changes to the follow-up.
                this.props.getClient();
            }.bind(this),
            error: function(xhr, status, err) {
                alert("Failed to increment.")
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });

        // Send an email after a followup.
        this.props.postEmail();
    },
    render: function() {
        return (
            <div className="row" style={{marginBottom: "1.5em"}}>
                <div className="col-md-7" >
                    {this.props.name}<span style={{'fontStyle':'italic'}}> with </span>{this.props.landlord_name}

                    <br />

                    <div style={{borderBottom: "1px solid #CCC"}} />
                </div>

                <div className="col-md-2">
                    <span className="pull-left">{this.props.counter} follow up(s)</span>
                </div>

                <div className="col-md-1 col-md-offset-2">
                    <button type="button" className="btn btn-default btn-sm pull-right" onClick={this.handleFollowUp}><i className="fa fa-plus"></i> Follow Up</button>
                </div>
            </div>
        );
    }
});

/**
    Component used by the notification and dropdown components
    Helps create option tags.
**/
var ProblemList = React.createClass({
  render: function() {
    var list = '';

    if (this.props.referralString != null)
    {
        if (this.props.name == this.props.referralString)
        {
            // Selects a pre-chosen value already given by the database.
            list = <option value={this.props.id} selected>{this.props.name}</option>
        }
        else
        {
            list = <option value={this.props.id}>{this.props.name}</option>
        }

    }
    else
    {
        // Used by the notification/issue dropdowns
        list = <option value={this.props.id}>{this.props.name}</option>
    }
    return (
        list
    )
  }
});


// Component is used to determine whether to send a follow-up survey.
var EmailSurvey = React.createClass({
    getInitialState: function(){
        return {
            isChecked: true
        };
    },
    handleSurvey: function(e){
        // Determine if the checkbox is checked.
        this.setState({ isChecked: e.target.checked });
    },
    isChecked: function(){
        return this.state.isChecked;
    },
    render: function() {
        return(
            <div className="checkbox pull-right">
                <label>
                    <input type="checkbox" value="" checked={this.state.isChecked} onChange={this.handleSurvey} /> Send Follow Up Survey
                </label>
            </div>
        )
    }
});

var TransferInternCheck = React.createClass({
    getInitialState: function(){
        return { isTChecked: null,
                 isIChecked: null };
    },
    componentWillMount: function(){
        // this.props.checked comes back as a string, must
        // convert to int for boolean expression.

        var tChecked = parseInt(this.props.tChecked);
        var iChecked = parseInt(this.props.iChecked);

        this.setState({ isTChecked: tChecked,
                        isIChecked: iChecked });
    },
    handleTCheck: function(e){
        // Determine if the checkbox is checked.
        this.setState({ isTChecked: e.target.checked });
        this.props.postTransfer(e.target.checked);
    },
    handleICheck: function(e){
        // Determine if the checkbox is checked.
        this.setState({ isIChecked: e.target.checked });
        this.props.postInternational(e.target.checked);
    },
    render: function() {
        var iChecked = this.state.isIChecked;
        var tChecked = this.state.isTChecked;
        if(iChecked == 1) {
            return(
                <div> 
                    <label className="checkbox-inline disabled">
                        <input type="checkbox" value="" disabled checked={this.state.isTChecked} onChange={this.handleTCheck}/> Transfer      
                    </label>

                    <label className="checkbox-inline">
                        <input type="checkbox" value="" checked={this.state.isIChecked} onChange={this.handleICheck}/> International      
                    </label>
                </div>
            )
        } else if(tChecked == 1) {
            return(
                <div> 
                    <label className="checkbox-inline">
                        <input type="checkbox" value="" checked={this.state.isTChecked} onChange={this.handleTCheck}/> Transfer      
                    </label>

                    <label className="checkbox-inline disabled">
                        <input type="checkbox" value="" disabled checked={this.state.isIChecked} onChange={this.handleICheck}/> International      
                    </label>
                </div>
            )
        } else {
            return(
                <div> 
                    <label className="checkbox-inline">
                        <input type="checkbox" value="" checked={this.state.isTChecked} onChange={this.handleTCheck}/> Transfer      
                    </label>

                    <label className="checkbox-inline">
                        <input type="checkbox"  value="" checked={this.state.isIChecked} onChange={this.handleICheck}/> International      
                    </label>
                </div>
            )
        }
        
    }
});

React.render(
    <ViewClientMain />,
    document.getElementById('clientviews')
);


/*
    if(this.props.name == "Transfer" && this.props.iChecked > 0){
        return(
            <label className="checkbox-inline disabled">
                <input type="checkbox" value="" checked={this.state.isChecked} disabled/> {this.props.name}      
            </label>
        )
    } else if(this.props.name == "International" && this.props.tChecked > 0){
        return(
            <label className="checkbox-inline disabled">
                <input type="checkbox" value="" checked={this.state.isChecked} disabled/> {this.props.name}      
            </label>
        )
    } else {
        return(
            <label className="checkbox-inline">
                <input type="checkbox" value="" checked={this.state.isChecked} onChange={this.handleCheck}/> {this.props.name}      
            </label>
        )
    }
*/