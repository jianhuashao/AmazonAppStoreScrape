var mail_opts = require('./mail_opts.js');
var nodemailer = require("nodemailer");
var myutil = require('./myutil.js');
var sprintf = require('util').format;

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: mail_opts.smtp_server_user,
        pass: mail_opts.smtp_server_pass
    }
});


function send_email(subject, text, body, callback){
    var mailOptions = {
	from: mail_opts.from_email, // sender address
	to: mail_opts.to_email, // list of receivers
	subject: subject, // Subject line
	text: text, // plaintext body
	html: body // html body
    }
    smtpTransport.sendMail(mailOptions, function(error, response){
	if(error){
            console.log(error);
	}else{
            console.log("== Email Message sent: " + response.message);
	}

    // if you don't want to use this transport object anymore, uncomment following line
	smtpTransport.close(); // shut down the connection pool, no more messages
	callback();
    });
}

function my_test(){
    var subject = "error AmazonAppStore Scrapting";
    var text = 'no jobs, probally client is shut down';
    var body = '<p>check client if shut down<p>';
    send_email(subject, text, body, function(){});
}


////////////////////////////
var old_read_done_i = 0;
var ec2_addr = 'http://ec2-176-34-208-178.eu-west-1.compute.amazonaws.com';

function response_process_get(callback, vars, response, body){
    var ms = body;
    ms = JSON.parse(ms);
    read_done_i = ms.read_done;
    read_assigned_i = ms.read_assigned;
    console.log(old_read_done_i, read_done_i, new Date());
    if (read_done_i == undefined){
	callback();
    } else {
	/*
	old_read_done_i = read_done_i;
	var subject = 'error in AmazonAppStore scrapting';
	var text = sprintf('old_read_done_i:%s read_done_i:%s read_assigned:%s date:%s', old_read_done_i, read_done_i, read_assigned_i, new Date().toString());
	var body = sprintf('<p>old_read_done_i:%s</p><p>read_done_i:%s</p><p>read_assigned:%s</p><p>date:%s</p>', old_read_done_i, read_done_i, read_assigned_i, new Date().toString());
	send_email(subject, text, body, callback);
	*/
	
	if (old_read_done_i != read_done_i) {
	    old_read_done_i = read_done_i;
	    callback();
	} else {
	    var subject = 'error in AmazonAppStore scrapting';
	    var text = sprintf('old_read_done_i:%s read_done_i:%s read_assigned:%s date:%s', old_read_done_i, read_done_i, read_assigned_i, new Date().toString());
	    var body = sprintf('<p>old_read_done_i:%s</p><p>read_done_i:%s</p><p>read_assigned:%s</p><p>date:%s</p>', old_read_done_i, read_done_i, read_assigned_i, new Date().toString());
	    send_email(subject, text, body, callback);
	}
    }
}

function check_server_app_web(){
    var uri = ec2_addr+':8080/jobs_view?c_aim=app_web';
    vars = {uri:uri};
    myutil.request_ec2(check_server_app_web_timeout, response_process_get, vars);
}

function check_server_app_web_timeout(){
    var t= 1000 * 6 * 30;
    console.log(t)
    setTimeout(check_server_app_web, t);
}


////////////////////////////
var old_read_done_i_app_review = 0;

function response_process_get_app_review(callback, vars, response, body){
    var ms = body;
    ms = JSON.parse(ms);
    read_done_i = ms.read_done;
    read_assigned_i = ms.read_assigned;
    console.log(old_read_done_i_app_review, read_done_i, new Date());
    var subject = 'AmazonAppStore app review ['+old_read_done_i_app_review+'|'+read_done_i+']';
    var text = sprintf('old_read_done_i:%s read_done_i:%s read_assigned:%s date:%s', old_read_done_i_app_review, read_done_i, read_assigned_i, new Date().toString());
    old_read_done_i_app_review = read_done_i;
    //console.log(subject, text, body)
    send_email(subject, text, body, callback);

}

function check_server_app_review(){
    var uri = ec2_addr+':8080/jobs_view?c_aim=app_review';
    vars = {uri:uri};
    myutil.request_ec2(check_server_app_review_timeout, response_process_get_app_review, vars);
}

function check_server_app_review_timeout(){
    var t= 1000 * 60 * 60 * 12;
    //console.log(t)
    setTimeout(check_server_app_review, t);
}

//check_server_app_web();
check_server_app_review();

module.exports.send_email = send_email;