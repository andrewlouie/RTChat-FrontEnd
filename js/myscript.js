$(function() {
	//event for changing profile picture
	$('#main').on('click','#profpic',function() {
	$('#fileinput').trigger('click'); 
	document.getElementById('fileinput').addEventListener('change', readSingleFile, false);
	});
	//override val() for textarea to include hard returns
	$.valHooks.textarea = {
		get: function(elem) {
			return elem.value.replace( /\r?\n/g, "\r\n" );
		}
	};
	//load login page - need a check here if they are already logged in
	$( window ).resize(function() {
		var cw = $('.fricircle').width();
		$('.fricircle').css({'height':cw+'px'});
	});
	//typing event
	$('#main').on('input propertychange','.mychat',function() {
		var string = ($(this).val().length > 3000 ? $(this).val().substring($(this).val().length-3000) : $(this).val());
		newmessages[$('#activechatid').val()] = string;
	});
	//mainly for debugging
	$('#statusmsg').click(function () {
		console.log($(this).html());
		$(this).empty();
		$('#pp1').parent().next('.newdot').show();
		$('#pp2').parent().next('.newdot').show();
		$('#pp3').parent().next('.newdot').show();
	});
	//load the login page
	$('#main').load('login.html .loginform');
	//if cookie is set, check if the session is still valid by doing a refresh.
	if ($.cookie("cookiestring") && $.cookie("userId")) {
	var data = JSON.stringify({ cookie : $.cookie("cookiestring"),userid: $.cookie("userId") });
			$('#spinny').show();
				$.ajax({
			url:url + "Relogin",
			type:"POST",crossDomain: true,dataType: "json",
			data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
			success: function(data){
				if (data.Error) {
					$("#statusmsg").html(errors[data.Error]);
					$('#spinny').hide();
				}
				//login as a registered user
				else if (!data.isGuest) {
						$("#valid2,#valid1").html("");
						$("#statusmsg").html("Successfully logged in");
						$('.hidesel').show();
						$('.hidelog').hide();
						$.cookie("cookiestring", data.CookieString);
						$.cookie("userId",data.Id);
						var profile = data.Profile;
						$('#main').load('loggedin.html #main2', function() {
							$('#mpname').val(profile.Name);
							$('#mptagline').val(profile.TagLine);
							$('#mpemail').val(profile.Email);
							$('#mpusername').val(profile.Username);
							if (profile.ProfilePic != null) $('#profpic').attr('src',"data:image;base64," + profile.ProfilePic);
							$('#mpautoaccept').prop('checked',profile.AutoJoinChats);
							navigate(3,true);
							$('#menudot').hide();
							$('#spinny').hide();
							recdata(data);							
								//start a refresh timer
							getandsend = setInterval(function() {
							SendAndReceive();
							}, 1000);
						});
				}
				//login as a guest
				else {
						$("#valid1").html("");
						$("#statusmsg").html("Successfully logged in");
						$('.hidesel').show();
						$('.hidelog').hide();
						$('.noguest').hide();
						$.cookie("cookiestring", data.CookieString);
						$.cookie("userId",data.Id);
						$('#main').load('loggedin.html #main2', function() {
							navigate(2);
							$('#spinny').hide();
							recdata(data);
							getandsend = setInterval(function() {
							SendAndReceive();
							}, 1000);
							
						});
				}
			},
			error: function(data, status, xhr) {
				$("#statusmsg").html('Error: ' + JSON.stringify(data));
				$('#spinny').hide();
			}
		});	
	}
	//hide other menu items
	$('.hidesel').hide();	
	//Register button on Login form
	$('#main').on("click",'#register',function() { 
		$('#main').load('register.html .loginform');
		$('#backlink').show().off().on('click',function(event) {
					$('#main').load("login.html .loginform");
					$(this).hide();
					event.preventDefault();
		});
	});
	//Login button
	$('#main').on("click",'#login-btn',function() { 
	var problem = false;
		if ($('#login').val() === "") { $('#valid1').html('Login is required'); problem = true; }
		else $('#valid1').html("");
		if ($('#password').val() === "") { $('#valid2').html('Password is required'); problem = true;}
		else $('#valid2').html("");	
		if (problem) return;
		var data = JSON.stringify({ username : $('#login').val(),password: $('#password').val(),stayloggedin: $('#stayloggedin').is(':checked') });
		$('#spinny').show();
			$.ajax({
				url:url + "Login",
				type:"POST",crossDomain: true,dataType: "json",
				data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
				success: function(data){
					if (data.Error) {
					if (data.Error == 6) $("#valid1").html(errors[6]);
					else if (data.Error == 7) $("#valid2").html(errors[7]);
					else $("#statusmsg").html(errors[data.Error]);
					}
					else {
						$("#valid2,#valid1").html("");
						$("#statusmsg").html("Successfully logged in");
						$('.hidesel').show();
						$('.hidelog').hide();
						$.cookie("cookiestring", data.CookieString);
						$.cookie("userId",data.Id);
						var profile = data.Profile;
						$('#main').load('loggedin.html #main2', function() {
							$('#mpname').val(profile.Name);
							$('#mptagline').val(profile.TagLine);
							$('#mpemail').val(profile.Email);
							$('#mpusername').val(profile.Username);
							if (profile.ProfilePic != null) $('#profpic').attr('src',"data:image;base64," + profile.ProfilePic);
							$('#mpautoaccept').prop('checked',profile.AutoJoinChats);
							$('#menudot').hide();
							navigate(3,true);
							recdata(data);							
							getandsend = setInterval(function() {
							SendAndReceive();
							}, 1000);
						});
					}
				$('#spinny').hide();
				},
				error: function(data, status, xhr) {
					$("#statusmsg").html('Error: ' + JSON.stringify(data));
					$('#spinny').hide();
				}
			});
	});
	//Guest Login button
	$('#main').on("click",'#guestlogin-btn',function() { 
		$('#valid2').html("");
		if ($('#login').val() === "") { $('#valid1').html('Login is required'); return; }
		else $('#valid1').html("");
		var data = JSON.stringify({ username : $('#login').val() });
				$('#spinny').show();
				$.ajax({
				url:url + "GuestLogin",
				type:"POST",crossDomain: true,dataType: "json",
				data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
				success: function(data){
					if (data.Error) {
					if (data.Error == 9) $("#valid1").html(errors[9]);
					if (data.Error == 8) $("#valid1").html(errors[8]);
					if (data.Error == 22) $("#valid1").html(errors[22]);
					}
					else {
						$("#valid1").html("");
						$("#statusmsg").html("Successfully logged in");
						$('.hidesel').show();
						$('.hidelog').hide();
						$('.noguest').hide();
						$.cookie("cookiestring", data.CookieString);
						$.cookie("userId",data.Id);
						$('#main').load('loggedin.html #main2', function() {
						navigate(2);
						recdata(data);							
							getandsend = setInterval(function() {
							SendAndReceive();
							}, 1000);
						});
					}
					$('#spinny').hide();
				},
				error: function(data, status, xhr) {
					$("#statusmsg").html('Error: ' + JSON.stringify(data));
					$('#spinny').hide();
				}
			});	
	});
	//Register button event
	$('#main').on("click",'#register-btn',function() { 
	//validation
		var patt1 = /^(?=[a-zA-Z])[-\w.]{0,23}$/;
		var patt2 = /^(?=[^\d_].*?\d)\w(\w|[!@#$%]){7,20}/;
		var patt3 = /^[a-zA-Z]+(([\'\,\.\- ][a-zA-Z ])?[a-zA-Z]*)*$/;
		var patt4 = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,6}$/;
		var val1 = $('#name').val();
		var val2 = $('#loginreg').val();
		var val3 = $('#password').val();
		var val4 = $('#email').val();
		var problem = false;
		if (val1 === "") { $('#valid1').html('Name is required'); problem = true; }
		else if (!patt3.test(val1)) { $('#valid1').html('Name is not valid'); problem = true; }
		else $('#valid1').html("");
		if (val2 === "") { $('#valid2').html('Username is required'); problem = true; }
		else if (!patt1.test(val2)) { $('#valid2').html('Username is not valid'); problem = true; }
		else $('#valid2').html("");
		if (val3 === "") { $('#valid3').html('Password is required'); problem = true; }
		else if (!patt2.test(val3)) { $('#valid3').html('Password is not valid. Must be between 8 and 20 characters and contain at least one digit'); problem = true; }
		else $('#valid3').html("");
		if (val4 === "") { $('#valid4').html('Email is required'); problem = true; }
		else if (!patt4.test(val4)) { $('#valid4').html('Email address is not valid'); problem = true; }
		else $('#valid4').html("");
		if (problem) return;
		var data = JSON.stringify({ name:val1,email:val4,username:val2,password:val3 });
				$('#spinny').show();
				$.ajax({
				url:url + "Register",
				type:"POST",crossDomain: true,dataType: "json",
				data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
				success: function(data){
					if (data.Error) {
						if (data.Error == 24) $("#valid1").html(errors[24]);
						if (data.Error == 22) $("#valid2").html(errors[22]);
						if (data.Error == 0) $("#valid2").html(errors[0]);
						if (data.Error == 19) $("#valid3").html(errors[19]);
						if (data.Error == 23) $("#valid4").html(errors[23]);
					}
					else {
						$("#valid1").html("");
						$("#statusmsg").html("Successfully logged in");
						$('.hidesel').show();
						$('.hidelog').hide();
						$.cookie("cookiestring", data.CookieString);
						$.cookie("userId",data.Id);
						var profile = data.Profile;
						$('#main').load('loggedin.html #main2', function() {
							$('#mpname').val(profile.Name);
							$('#mptagline').val(profile.TagLine);
							$('#mpemail').val(profile.Email);
							$('#mpusername').val(profile.Username);
							if (profile.ProfilePic != null) $('#profpic').attr('src',"data:image;base64," + profile.ProfilePic);
							$('#mpautoaccept').prop('checked',profile.AutoJoinChats);
							navigate(2);
							$('#menudot').hide();
							$('#nofriends').show();
							$('#nochats').show();
							getandsend = setInterval(function() {
							SendAndReceive();
							}, 1000);							
						});
						//you have logged in, go to another page
					}
					$('#spinny').hide();
				},
				error: function(data, status, xhr) {
					$("#statusmsg").html('Error: ' + JSON.stringify(data));
					$('#spinny').hide();
				}
			});	
		//ajax
	});
	//check username isn't taken when username field changed
	$('#main').on("change","#loginreg",function() {
		if ($('#loginreg').val() != "") { 
			var data = JSON.stringify({ username : $('#loginreg').val() });
					$.ajax({
				url:url + "CheckUserName",
				type:"POST",crossDomain: true,dataType: "json",
				data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
				success: function(data){
					if (data.InUse) $("#valid2").html("Sorry, username is taken");
					else $("#valid2").html("");
				},
				error: function(data, status, xhr) {
					$("#statusmsg").html('Error: ' + JSON.stringify(data));
				}
			});
		} 
		else $("#valid2").html(""); 
	});
	$('#main').on("click",'#forgotpw',function(event) {
		var loginname = $('#login').val();

		$('#main').load('forgotpw.html .loginform', function() {
		$('#resetlogin').val(loginname);
		});
		$('#backlink').show().off().on('click',function(event) {
					$('#main').load("login.html .loginform");
					$(this).hide();
					event.preventDefault();
		});
		event.preventDefault();
	});
	$('#main').on('click','#resetpw-btn',function() {
		$("#valid1").html(""); 
		if ($('#resetlogin').val() == "") { 
			$("#valid1").html("Enter your username");
			return;
		}
		var data = JSON.stringify({ username : $('#resetlogin').val() });
				$('#spinny').show();
				$.ajax({
			url:url + "ResetPassword",
			type:"POST",crossDomain: true,dataType: "json",
			data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
			success: function(data){
				if (data.Error && data.Error == 6) $("#valid1").html(errors[6]);
				else { 
					$('#statusmsg').html('Password has been reset');
					$('#resetpwform').html('<h2>A new password has been sent to your email</h2>');
				}
					$('#spinny').hide();
			},
			error: function(data, status, xhr) {
				$("#statusmsg").html('Error: ' + JSON.stringify(data));
					$('#spinny').hide();
			}
		});		
	});
	$('#main').on('keyup','#searchbox',function() {
		if ($("#searchbox").val() == "") { 	$('#results').html(""); return; }
		var data = JSON.stringify({ cookie : $.cookie("cookiestring"),userid: $.cookie("userId"),username : $('#searchbox').val() });
				$.ajax({
			url:url + "SearchUsers",
			type:"POST",crossDomain: true,dataType: "json",
			data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
			success: function(data) {
				if (data.Error && data.Error == 1) $("#statusmsg").html(errors[1]);
				else {
					$("#results").html(data.Count + " result" + (data.Count == 1 ? "" : "s") + " found<br>");
					var results = data.Results;
					for (i=0;i<results.length;i++) {
						$('#results').append(
						'<div class="result" data="' + results[i]._id + '"><div class="imgcont"><img src="' + (results[i].ProfilePic == null ? 'include/placeholder.png' : 'data:image;base64,' + results[i].ProfilePic) + '"></div><span class="name">' + results[i].UserName + '<br>' + results[i].Name + '</span></div>');
					}
				}
			},
			error: function(data, status, xhr) {
				$("#statusmsg").html('Error: ' + JSON.stringify(data));
			}
		});	
	});
	//clicking on a result in a search
	$('#main').on('click','.result',function() {
		if (inchat) {
			sendInvite($(this).attr('data'));
			navigate(4);
			return;
		}
		resultClick($(this).attr('data'),$(this).attr('data2'));
	});
	//add friend button
	$('#main').on('click','#addfriend-btn',function() {
		var data = JSON.stringify({ cookie : $.cookie("cookiestring"),userid: $.cookie("userId"),otheruserid : $('#idnum').val() });
			$('#spinny').show();
			$.ajax({
			url:url + "AddFriend",
			type:"POST",crossDomain: true,dataType: "json",
			data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
			success: function(data) {
				if (data.Error) {
					$("#statusmsg").html(errors[data.Error]);
				}
				else {
					navigate(3,true);
					$('#backlink').click();
					addFriend(data.Friend,false);
					$("#statusmsg").html("You now have them as a friend");
				}
			$('#spinny').hide();	
			},
			error: function(data, status, xhr) {
				$("#statusmsg").html('Error: ' + JSON.stringify(data));
				$('#spinny').hide();
			}
		});	
	});
	//open new chat
	$('#main').on('click','#newchat-btn',function() {
		var data = JSON.stringify({ cookie : $.cookie("cookiestring"),userid: $.cookie("userId"),adduser : $('#idnum').val() });
			$('#spinny').show();
		$.ajax({
			url:url + "OpenNewChat",
			type:"POST",crossDomain: true,dataType: "json",
			data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
			success: function(data) {
				if (data.Error) {
					$("#statusmsg").html(errors[data.Error]);
				}
				else {
					navigate(4);
					$('#backlink').click();
					processChat(data.Chat,false);
				}
			$('#spinny').hide();	
			},
			error: function(data, status, xhr) {
				$("#statusmsg").html('Error: ' + JSON.stringify(data));
				$('#spinny').hide();
			}
		});	
	});
	//save profile changes
	$('#main').on('click','#saveprofile-btn',function() {
		var patt1 = /^(?=[a-zA-Z])[-\w.]{0,23}$/;
		var patt3 = /^[a-zA-Z]+(([\'\,\.\- ][a-zA-Z ])?[a-zA-Z]*)*$/;
		var patt4 = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,6}$/;
		var val1 = $('#mpname').val();
		var val2 = $('#mpusername').val();
		var val4 = $('#mpemail').val();
		var problem = false;
		if (val1 === "") { $('#valid1').html('Name is required'); problem = true; }
		else if (!patt3.test(val1)) { $('#valid1').html('Name is not valid'); problem = true; }
		else $('#valid1').html("");
		if (val2 === "") { $('#valid2').html('Username is required'); problem = true; }
		else if (!patt1.test(val2)) { $('#valid2').html('Username is not valid'); problem = true; }
		else $('#valid2').html("");
		if (val4 === "") { $('#valid3').html('Email is required'); problem = true; }
		else if (!patt4.test(val4)) { $('#valid3').html('Email address is not valid'); problem = true; }
		else $('#valid4').html("");
		if (problem) return;
		var data = JSON.stringify({ cookie : $.cookie("cookiestring"),userid: $.cookie("userId"),name : $('#mpname').val(),email : $('#mpemail').val(),username : $('#mpusername').val(),tagline : $('#mptagline').val(),autojoinchats : $('#mpautoaccept').is(':checked') });
			$('#spinny').show();
		$.ajax({
			url:url + "UpdateProfile",
			type:"POST",crossDomain: true,dataType: "json",
			data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
			success: function(data) {
				if (data.Error) {
						if (data.Error == 22) $("#valid2").html(errors[22]);
						else if (data.Error == 23) $("#valid3").html(errors[23]);
						else if (data.Error == 24) $("#valid1").html(errors[24]);
						else $("#statusmsg").html(errors[data.Error]);
				}
				else {
					$("#statusmsg").html("Changes have been saved");
					$('#valid1,#valid2,#valid3,#valid4').html("");
				}
			$('#spinny').hide();	
			},
			error: function(data, status, xhr) {
				$("#statusmsg").html('Error: ' + JSON.stringify(data));
				$('#spinny').hide();
			}
		});
	});
	$('#main').on('click','#changepw-btn',function() {
		$('#changepwform').show();
		$('#profform').hide();
		$('#backlink').show();
		backtab4 = true;
	});
	$('#main').on('click','#blockedusers-btn',function() {
		$('#blockedusers').show();
		$('#profform').hide();
		$('#backlink').show();
		backtab4 = true;
	});
	$('#main').on('click','.unblock',function() {
		var data = JSON.stringify({ cookie : $.cookie("cookiestring"),userid: $.cookie("userId"),blockeduser: $(this).attr('data') });
			$('#spinny').show();
			var $bu = $(this);
		$.ajax({
			url:url + "Unblock",
			type:"POST",crossDomain: true,dataType: "json",
			data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
			success: function(data) {
			$('#spinny').hide();	
				if (data.Error) {
						$("#statusmsg").html(errors[data.Error]);
				}
				else {
					$bu.parent().slideUp("slow",function() { $bu.parent().remove(); if ($('.blockeduser').length == 0) $('#blockedusers').html("<h2>No blocked users</h2>"); });
				}	

			},
			error: function(data, status, xhr) {
				$("#statusmsg").html('Error: ' + JSON.stringify(data));
				$('#spinny').hide();
			}
		});
	});
	$('#main').on('click','#changepw-btn2',function() {
		var old = $('#mpoldpass').val();
		var new1 = $('#mpnewpass').val()
		var new2 = $('#mpnewpass2').val()
		var problems = false;
		if (old == "") { $('#pwvalid1').html("Old password is required"); problems = true; }
		else $('#pwvalid1').html("");
		if (new1 == "") { $('#pwvalid2').html("New password is required"); problems = true; }
		else $('#pwvalid2').html("");
		var patt2 = /^(?=[^\d_].*?\d)\w(\w|[!@#$%]){7,20}/;
		if (new2 === "") { $('#pwvalid3').html('Repeat password is required'); problems = true; }
		else if (new1 != new2) { $('#pwvalid3').html("Passwords do not match"); problems = true; }
		else if (!patt2.test(new2)) { $('#pwvalid3').html('Password is not valid. Must be between 8 and 20 characters and contain at least one digit'); problems = true; }
		else $('#pwvalid3').html("");
		if (problems) return;
		var data = JSON.stringify({ cookie : $.cookie("cookiestring"),userid: $.cookie("userId"),oldpassword : old,newpassword : new1 });
			$('#spinny').show();
		$.ajax({
			url:url + "ChangePassword",
			type:"POST",crossDomain: true,dataType: "json",
			data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
			success: function(data) {
				if (data.Error) {
						if (data.Error == 18) $("#pwvalid1").html(errors[18]);
						else if (data.Error == 19) $("#pwvalid3").html(errors[19]);
						else $("#statusmsg").html(errors[data.Error]);
				}
				else {
					$("#statusmsg").html("Password has been changed");
					$('#mpoldpass,#mpnewpass,#mpnewpass2').val("");
					$('#pwvalid1,#pwvalid2,#pwvalid3').html("");
				}
			$('#spinny').hide();	
			},
			error: function(data, status, xhr) {
				$("#statusmsg").html('Error: ' + JSON.stringify(data));
				$('#spinny').hide();
			}
		});

	});
	$('#main').on('click','.friendobj',function() { 
	if (inchat) {
		sendInvite($(this).attr('data'));
		navigate(4);
		return;	
		}
		var data = JSON.stringify({ cookie : $.cookie("cookiestring"),userid: $.cookie("userId"),friendid : $(this).attr('data') });
			$('#spinny').show();
			$.ajax({
			url:url + "GetFriendInfo",
			type:"POST",crossDomain: true,dataType: "json",
			data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
			success: function(data) {
				if (data.Error) {
					$("#statusmsg").html(errors[data.Error]);
					$('#spinny').hide();
				}
				else {
						$('#friprofname').html(data.Friend.Name);
						$('#friproftagline').html($('<div/>').text(data.Friend.TagLine).html());
						$('#friidnum').val(data.Friend._id);
						$('#friprofusername').html(data.Friend.UserName);
						$('#frionlinestatus').attr('fill',(data.Friend.OnlineStatus ? "green" : "red"));
						if (data.Friend.ProfilePic != null) $('#profpictab2').attr('src',"data:image;base64," + data.Friend.ProfilePic);
						else $('#profpictab1').attr('src','include/placeholder.png');
						$('#backlink').show();
						backtab2 = true;
						$('#profcover').show();
						$('#spinny').hide();
				}
			},
			error: function(data, status, xhr) {
				$("#statusmsg").html('Error: ' + JSON.stringify(data));
				$('#spinny').hide();
			}
		});
	});
	$('#main').on('click','#unfriend-btn',function() {
			var data = JSON.stringify({ cookie : $.cookie("cookiestring"),userid: $.cookie("userId"),otheruserid : $('#friidnum').val() });
			$('#spinny').show();
		$.ajax({
			url:url + "UnFriend",
			type:"POST",crossDomain: true,dataType: "json",
			data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
			success: function(data) {
				$('#spinny').hide();	
				if (data.Error) {
					$("#statusmsg").html(errors[data.Error]);
				}
				else {
					$('#backlink').click();
					$('#friend' + $('#friidnum').val()).slideUp("slow",function() { $(this).remove(); if ($('.friendobj').length == 0) $('#nofriends').show(); });	
				}
			},
			error: function(data, status, xhr) {
				$("#statusmsg").html('Error: ' + JSON.stringify(data));
				$('#spinny').hide();
			}
		});
	});
	$('#main').on('click','#frinewchat-btn',function() {
			var data = JSON.stringify({ cookie : $.cookie("cookiestring"),userid: $.cookie("userId"),adduser : $('#friidnum').val() });
			$('#spinny').show();
		$.ajax({
			url:url + "OpenNewChat",
			type:"POST",crossDomain: true,dataType: "json",
			data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
			success: function(data) {
				if (data.Error) {
					$("#statusmsg").html(errors[data.Error]);
				}
				else {
					navigate(4);
					$('#backlink').click();
					processChat(data.Chat,false);
				}
			$('#spinny').hide();	
			},
			error: function(data, status, xhr) {
				$("#statusmsg").html('Error: ' + JSON.stringify(data));
				$('#spinny').hide();
			}
		});
	});
	$('#main').on('click','#blockuser-btn',function() {
		var data = JSON.stringify({ cookie : $.cookie("cookiestring"),userid: $.cookie("userId"),blockuserid : $('#friidnum').val() });
			$('#spinny').show();
		$.ajax({
			url:url + "BlockUser",
			type:"POST",crossDomain: true,dataType: "json",
			data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
			success: function(data) {
				if (data.Error) {
					$("#statusmsg").html(errors[data.Error]);
				}
				else {
					$('#backlink').click();
					$('#statusmsg').html("User has been blocked");
					if (!$('.blockeduser').length) $('#blockedusers').empty();
					$('<div/>',{
						"class":"blockeduser",
						html: $('#friprofusername').html() + '<input type="button" class="btn btn-warning unblock" value="Unblock" data="' + $('#friidnum').val() + '">'
					}).appendTo("#blockedusers");
				}
			$('#spinny').hide();	
			},
			error: function(data, status, xhr) {
				$("#statusmsg").html('Error: ' + JSON.stringify(data));
				$('#spinny').hide();
			}
		});
	});
	$('#main').on('keyup','#friendsearchbox',function() {
		var searchstr = $(this).val();
		$('.friendobj').each(function() {
			if ($(this).attr('data2').indexOf(searchstr) == -1 && $(this).attr('data3').indexOf(searchstr) == -1)  $(this).hide();
			else $(this).show();
		});
	});
	$('#main').on('click','.chatobj',function() {
		$('#activechatid').val($(this).attr('data'));
		$('#invitedlist').html($(this).attr('data3').replaceAll(",","<br>"));
		$('#chatbar').show();
		$('#invchat').show();
		$('#chats').hide();
		$('#backlink').show();
		$('#indchat').show();
		$(this).find('.newdot').hide();
		$('.back-btn .newdot').hide();
		updateGuys();
		$('#c' + $(this).attr('data')).show();
		backtab3 = true;
	});
	$('#main').on('click','#leave',function() {
		var data = JSON.stringify({ cookie : $.cookie("cookiestring"),userid: $.cookie("userId"),chatid : $('#activechatid').val() });
			$('#spinny').show();
		$.ajax({
			url:url + "LeaveChat",
			type:"POST",crossDomain: true,dataType: "json",
			data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
			success: function(data) {
				if (data.Error) {
					$("#statusmsg").html(errors[data.Error]);
				}
				$('#backlink').click();
				$('#chatobj' + $('#activechatid').val()).slideUp("slow",function() { $(this).remove(); if ($('.chatobj,.inviteobj').length == 0) $('#nochats').show(); });
				$('#c' + $('#activechatid').val()).remove();
				$('#spinny').hide();	
				
			},
			error: function(data, status, xhr) {
				$("#statusmsg").html('Error: ' + JSON.stringify(data));
				$('#spinny').hide();
			}
		});
	});
	$('#main').on('click','.inviteobj',function () {
		$('#declineaccept').show();
		$('#adchatid').val($(this).attr('data'));
		$('#invitefrom').html($(this).attr('data2'));
		$('#backlink').show();
		backtab3 = true;
	});
	$('#main').on('click','#accept',function() {
		var data = JSON.stringify({ cookie : $.cookie("cookiestring"),userid: $.cookie("userId"),chatid : $('#adchatid').val() });
			$('#spinny').show();
		$.ajax({
			url:url + "AcceptInvite",
			type:"POST",crossDomain: true,dataType: "json",
			data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
			success: function(data) {
				$('#spinny').hide();
				if (data.Error) {
					if (data.Error == 4 || data.Error == 14 || data.Error == 13) {
						$('#declineaccept').hide();
						$('#backlink').hide();
						backtab3 = false;
						$('#chatobj' + $('#adchatid').val()).slideUp("slow",function() { $(this).remove(); });	
					}
					$("#statusmsg").html(errors[data.Error]);
				}
				else {
					$('#declineaccept').hide();
					$('#backlink').hide();
					backtab3 = false;
					$('#chatobj' + $('#adchatid').val()).slideUp("slow",function() { $(this).remove(); processChat(data.Chat,false); });		
				}
				
			},
			error: function(data, status, xhr) {
				$("#statusmsg").html('Error: ' + JSON.stringify(data));
				$('#spinny').hide();
			}
		});
		
	});
	$('#main').on('click','#decline',function() {
		var data = JSON.stringify({ cookie : $.cookie("cookiestring"),userid: $.cookie("userId"),chatid : $('#adchatid').val() });
			$('#spinny').show();
		$.ajax({
			url:url + "DeclineInvite",
			type:"POST",crossDomain: true,dataType: "json",
			data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
			success: function(data) {
				if (data.Error) {
					if (data.Error == 4 || data.Error == 14 || data.Error == 13) {
						$('#declineaccept').hide();
						$('#backlink').hide();
						backtab3 = false;
						$('#chatobj' + $('#adchatid').val()).slideUp("slow",function() { $(this).remove(); });	
					}
					$("#statusmsg").html(errors[data.Error]);
				}
				else {
					$('#declineaccept').hide();
					$('#backlink').hide();
					backtab3 = false;
					$('#chatobj' + $('#adchatid').val()).slideUp("slow",function() { $(this).remove(); if ($('.chatobj,.inviteobj').length == 0) $('#nochats').show(); });
				}
				$('#spinny').hide();	
				
			},
			error: function(data, status, xhr) {
				$("#statusmsg").html('Error: ' + JSON.stringify(data));
				$('#spinny').hide();
			}
		});
		
	});
	$('#main').on('click','#invitefri',function() {
		navigate(3,true);
		$('#backlink').click()
		$('#backlink').show().off().on('click',function(event) {
			event.preventDefault();
			navigate(4);
		});
		inchat = true;
	});
	$('#main').on('click','#inviteuser',function() {
		navigate(2);
		$('#backlink').click()
		$('#backlink').show().off().on('click',function() {
			event.preventDefault();
			navigate(4);
		});
		inchat = true;
	});
	$('#main').on('click','#viewinvites',function() {
		$('#invitedusers').toggle();
	});
	$('#main').on('click','#left',function () {
		if (showing > 0) showing -= 1;
		$('#pp1').attr('data',userArrayIds[showing]).attr('title',userArrayNames[showing]).attr('src',userArrayPics[showing]);
		$('#pp2').attr('data',userArrayIds[showing + 1]).attr('title',userArrayNames[showing + 1]).attr('src',userArrayPics[showing + 1]);
		$('#pp3').attr('data',userArrayIds[showing + 2]).attr('title',userArrayNames[showing + 2]).attr('src',userArrayPics[showing + 2]);
		updateDots();
	});
	$('#main').on('click','#right',function () {
		if (showing < userArrayNames.length - 3) showing += 1;
		$('#pp1').attr('data',userArrayIds[showing]).attr('title',userArrayNames[showing]).attr('src',userArrayPics[showing]);
		$('#pp2').attr('data',userArrayIds[showing + 1]).attr('title',userArrayNames[showing + 1]).attr('src',userArrayPics[showing + 1]);
		$('#pp3').attr('data',userArrayIds[showing + 2]).attr('title',userArrayNames[showing + 2]).attr('src',userArrayPics[showing + 2]);
		updateDots();
	});
	$('#main').on('click','.pp',function() {
		var $ml = $('#' + $(this).attr('data'));
		$ml.attr('dot',"0");
		updateDots();
		if ($ml.is(':visible')) {
			$ml.css('border','2px solid red');
			setTimeout(function() {
				$ml.css('border','1px solid white');
			}, 700);
		}
		else {
			var $c1 = $('#c' + $('#activechatid').val()).find('.onechat:eq(0)');
			if ($(window).width() < 768) {
				var tohide = $('#c' + $('#activechatid').val()).find('.onechat:eq(0)').attr('id');
				$ml.show();
				$c1.swapWith($ml);
				$('#' + tohide).hide();
				var $c1 = $('#c' + $('#activechatid').val()).find('.onechat:eq(0)');
			}
			else {
				var $c2 = $('#c' + $('#activechatid').val()).find('.onechat:eq(1)');
				var tohide = $('#c' + $('#activechatid').val()).find('.onechat:eq(2)').attr('id');
				$ml.show();
				$c1.swapWith($c2);
				var $c1 = $('#c' + $('#activechatid').val()).find('.onechat:eq(0)');
				var $c3 = $('#c' + $('#activechatid').val()).find('.onechat:eq(2)');
				$c3.swapWith($c1);
				var $c1 = $('#c' + $('#activechatid').val()).find('.onechat:eq(0)');
				$c1.swapWith($ml);
				$('#' + tohide).hide();
				var $c1 = $('#c' + $('#activechatid').val()).find('.onechat:eq(0)');
			}
			$c1.css('border','2px solid red');
			setTimeout(function() {
				$c1.css('border','1px solid white');
			}, 700);

		}
	});
	$('#main').on('click','.nametab',function() {
		navigate(2);
		$('#backlink').click();
		resultClick($(this).attr('data'),$(this).html())
		$('#backlink').show().off().on('click',function(event) {
			event.preventDefault();
			navigate(4);
		});
	});
});
function navigate(page,reloadfri) {
inchat = false;
$('li').removeClass('active');
$('#li' + page).addClass('active');	
$('#tab1,#tab2,#tab3,#tab4').hide()
switch (page) {
case 1: $('#main').load('login.html .loginform'); $('#spinny').hide(); $('#backlink').hide(); break;
case 2: $('#tab1').show(); if (backtab1) $('#backlink').show(); else { $('#backlink').hide(); $('#searchbox').select(); }
$('#backlink').off().on('click',function(event) {
	$(this).hide();	event.preventDefault();	$('#profilecover').hide(); backtab1 = false; $('#searchbox').select();
});
break;
case 3: 
	$('#tab2').show(); if (backtab2) $('#backlink').show(); else $('#backlink').hide();
	var cw = $('.fricircle').width();
	$('.fricircle').css({'height':cw+'px'});
	if (!reloadfri) reloadFriends();
	$('#backlink').off().on('click',function(event) {
		$(this).hide();	event.preventDefault();	$('#profcover').hide();	backtab2 = false;
	});
	break;
case 4: $('#tab3').show(); $('#menudot').hide(); if (backtab3) $('#backlink').show(); else $('#backlink').hide();
$('#backlink').off().on('click',function(event) {
	if ($('#invitedusers').is(":visible")) $('#invitedusers').hide();
	else {
		$('.back-btn .newdot').hide();
		$('#chatbar').hide();
		$('#invchat').hide();
		$('#chats').show();
		$(this).hide();
		backtab3 = false;
		$('#declineaccept').hide();
		$('#indchat').hide().find('.achat').hide();
	}
	event.preventDefault();
});
break;
case 5: $('#tab4').show(); if (backtab4) $('#backlink').show(); else $('#backlink').hide();
$('#backlink').off().on('click',function(event) {
	$(this).hide();	$('#blockedusers').hide(); backtab4 = false; event.preventDefault(); $('#changepwform').hide();	$('#profform').show();
});
break;
case 6: 
var data = JSON.stringify({ cookie : $.cookie("cookiestring"),userid: $.cookie("userId") });
window.clearInterval(getandsend);
$.removeCookie("cookiestring");
$.removeCookie("userId");
			$('#spinny').show();
			$.ajax({
				url:url + "Logout",
				type:"POST",crossDomain: true,dataType: "json",
				data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
				success: function(data){
						$('#spinny').hide();
						$('.hidesel').hide(); 
						$('.hidelog').show().addClass('active');
						$('#main').load('login.html .loginform');
						$("#statusmsg").html("Login to continue");
				},
				error: function(data, status, xhr) {
						$("#statusmsg").html('Error: ' + JSON.stringify(data));
						$('#spinny').hide();
						$('.hidesel').hide(); 
						$('.hidelog').show().addClass('active');
						$('#main').load('login.html .loginform');
				}
			});
			$('#backlink').hide();
 break;
}
$.sidr('close', 'sidr');
return false;
}
function recdata(data) {
	var friends = data.Profile.Friends;
	for (i=0;i<friends.length;i++){
		addFriend(friends[i],true);
	}
	if (friends.length == 0) $('#nofriends').show();
	else $('#nofriends').hide();
	var cw = $('.fricircle').width();
	$('.fricircle').css({'height':cw+'px'});
	var chats = data.Profile.Chats;
	var count = 0;
	for (j=0;j<chats.length;j++) {
		count += processChat(chats[j],true);
	}
	var blockedusers = data.Profile.BlockedUsers;
	if (blockedusers.length == 0) $('#blockedusers').html("<h2>No blocked users</h2>");
	else {
		$('#blockedusers').empty();
		for (m=0;m<blockedusers.length;m++) {
			$('<div/>',{
				"class":"blockeduser",
				html: blockedusers[m].UserName + '<input type="button" class="btn btn-warning unblock" value="Unblock" data="' + blockedusers[m]._id + '">'
			}).appendTo("#blockedusers");
		}
	}
	if (count == 0) $('#nochats').show();
	else $('#nochats').hide();
	var updates = data.Profile.Updates;
	for (l=0;l<updates.length;l++) {
		$mydiv = $("#c" + updates[l].ChatId + "u" + updates[l].FromUser).find('.actualtext');
		var newmsg = $('<div/>').text(updates[l].Message).html();
		$mydiv.html(newmsg.replaceAll("\r\n","<br>"));
		if (typeof $mydiv[0] !== 'undefined') $mydiv.scrollTop($mydiv[0].scrollHeight - $mydiv[0].clientHeight);
	}
}

function addFriend(friend,initial) {
	$('#nofriends').hide();
	var friendstring = '<div class="col-xs-4 col-md-3 col-lg-2 friendobj" id="friend' + friend._id + '" data="' + friend._id + '" data2="' + friend.UserName + '" data3="' + friend.Name + '"><div class="friimgcont"><div class="fricircle"><img src="' + (friend.ProfilePic == null ? 'include/placeholder.png' : "data:image;base64," + friend.ProfilePic) + '"></div></div><div class="friname"><span style="color:' + (friend.OnlineStatus ? 'green' : 'red') + '">●</span>' + friend.UserName + '</div></div>';

	$('#friends').prepend(friendstring);
	//size circles in friends page
	if (!initial) {
	var cw = $('.fricircle').width();
	$('.fricircle').css({'height':cw+'px'});
	$('#friend' + friend._id).hide().slideDown();
	}
}
function rearrangeChat(chat) {

	var usersInChat = chat.UsersInChat;
	if (usersInChat.length < 2) { 
		$('#c' + chat._id).empty();
	//you're the only person in the chat, nothing visible.
	}
	else if ($(window).width() < 768 || usersInChat.length == 2) { 
		var mychat = $('#c' + chat._id).find('textarea').val();
		$('#tempdiv').html($('#aa2chats .achat').html());
		z = 0;
		for (i=0;i<usersInChat.length;i++) {
			if (usersInChat[i]._id != $.cookie("userId")) {
			  if (z < 1) $('#tempdiv').find('.onechat:not([id])').first().replaceWith($('#c' + chat._id + 'u' + usersInChat[i]._id).show());
				else { 
					$('#c' + chat._id + 'u' + usersInChat[i]._id).hide().appendTo($('#tempdiv'));
				}
				z++;
			}
		}
		$('#c' + chat._id).html($('#tempdiv').html());
		$('#tempdiv').empty();
		$('#c' + chat._id).find('textarea').val(mychat);
	}
	else if (usersInChat.length == 3) {
		var mychat = $('#c' + chat._id).find('textarea').val();
		$('#tempdiv').html($('#aa3chats .achat').html());
		z = 0;
		for (i=0;i<usersInChat.length;i++) {
			if (usersInChat[i]._id != $.cookie("userId")) {
		  		$('#tempdiv').find('.onechat:not([id])').first().replaceWith($('#c' + chat._id + 'u' + usersInChat[i]._id).show());
				z++;
			}
		}
		$('#c' + chat._id).html($('#tempdiv').html());
		$('#tempdiv').empty();
		$('#c' + chat._id).find('textarea').val(mychat);
	}
	else {
		var mychat = $('#c' + chat._id).find('textarea').val();
		$('#tempdiv').html($('#aa4chats .achat').html());
		z = 0;
		for (i=0;i<usersInChat.length;i++) {
			if (usersInChat[i]._id != $.cookie("userId")) {
		  		if (z < 3) $('#tempdiv').find('.onechat:not([id])').first().replaceWith($('#c' + chat._id + 'u' + usersInChat[i]._id).show());
				else { 
					$('#c' + chat._id + 'u' + usersInChat[i]._id).hide().appendTo($('#tempdiv'));
				}
				z++;
			}
		}
		$('#c' + chat._id).html($('#tempdiv').html());
		$('#tempdiv').empty();
		$('#c' + chat._id).find('textarea').val(mychat);
	}
		
}
function sendInvite(userId) {
	var data = JSON.stringify({ cookie : $.cookie("cookiestring"),userid: $.cookie("userId"),adduser : userId,chatid : $('#activechatid').val() });
			$('#spinny').show();
			$.ajax({
			url:url + "SendInvite",
			type:"POST",crossDomain: true,dataType: "json",
			data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
			success: function(data) {
					$('#spinny').hide();
				if (data.Error) {
					$("#statusmsg").html(errors[data.Error]);
				}
				else {
					processChat(data.Chat,false);
				}
			},
			error: function(data, status, xhr) {
				$("#statusmsg").html('Error: ' + JSON.stringify(data));
				$('#spinny').hide();
			}
		});
}
function tog(v){return v?'addClass':'removeClass';} 
$(document).on('input', '.clearable', function(){
    $(this)[tog(this.value)]('x');
}).on('mousemove', '.x', function( e ){
    $(this)[tog(this.offsetWidth-18 < e.clientX-this.getBoundingClientRect().left)]('onX');
}).on('touchstart click', '.onX', function( ev ){
    ev.preventDefault();
    $(this).removeClass('x onX').val('').change().keyup();
});
function updateGuys() {
	//this will update the little pictures in the static row based on the divs in indchat
		userArrayNames = [];
		userArrayIds = [];	
		userArrayPics = [];
	$('#c' + $('#activechatid').val()).find('.onechat').each(function(index,element) {
		userArrayNames[index] = $(this).find('.nametab').html();
		userArrayIds[index] = $(this).attr('id');
		userArrayPics[index] = $(this).attr('picdata');
	});
	if (typeof userArrayIds[0] === 'undefined') $('#pp1').parent().hide(); else $('#pp1').attr('data',userArrayIds[0]).attr('title',userArrayNames[0]).attr('src',userArrayPics[0]).parent().show();
if (typeof userArrayIds[1] === 'undefined') $('#pp2').parent().hide(); else $('#pp2').attr('data',userArrayIds[1]).attr('title',userArrayNames[1]).attr('src',userArrayPics[1]).parent().show();
if (typeof userArrayIds[2] === 'undefined') $('#pp3').parent().hide(); else $('#pp3').attr('data',userArrayIds[2]).attr('title',userArrayNames[2]).attr('src',userArrayPics[2]).parent().show();
if(userArrayIds.length < 4) { $('#left').hide(); $('#right').hide(); } else { $('#left').show(); $('#right').show() }
updateDots();
}
jQuery.fn.swapWith = function(to) {
    return this.each(function() {
        var copy_to = $(to).clone(true);
        var copy_from = $(this).clone(true);
        $(to).replaceWith(copy_from);
        $(this).replaceWith(copy_to);
    });
};
function resultClick(id,un) {
		var data = JSON.stringify({ cookie : $.cookie("cookiestring"),userid: $.cookie("userId"),friendid : id });
			$('#spinny').show();
			$.ajax({
			url:url + "GetFriendInfo",
			type:"POST",crossDomain: true,dataType: "json",
			data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
			success: function(data) {
				if (data.Error) {
					$("#statusmsg").html(errors[data.Error]);
					$('#spinny').hide();
				}
				else {
						$('#profname').html(data.Friend.Name);
						$('#proftagline').html($('<div/>').text(data.Friend.TagLine).html());
						$('#idnum').val(data.Friend._id);
						$('#addfriend-btn').show();
						$('#profusername').html(data.Friend.UserName);
						if (data.Friend.ProfilePic != null) $('#profpictab1').attr('src',"data:image;base64," + data.Friend.ProfilePic);
						else $('#profpictab1').attr('src','include/placeholder.png');
						$('#onlinestatus').attr('fill',(data.Friend.OnlineStatus ? "green" : "red"));
						$('#backlink').show();
						backtab1 = true;
						$('#profilecover').show();
						$('#spinny').hide();
				}
			},
			error: function(data, status, xhr) {
				$("#statusmsg").html('Error: ' + JSON.stringify(data));
				$('#spinny').hide();
			}
		});		
}
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
function SendAndReceive() {
		var data = JSON.stringify({ cookie : $.cookie("cookiestring"),userid: $.cookie("userId"),messages : newmessages });
			newmessages = {};
			$.ajax({
			url:url + "SendAndReceive",
			type:"POST",crossDomain: true,dataType: "json",
			data : data,	jasonp: false, headers: {'content-type': "application/json; charset=utf-8"	},
			contentType: "application/json",
			success: function(data2) {
				if (data2.Error) {
					$("#statusmsg").html(errors[data2.Error]);
				}
				else {
					var updates = data2.Updates;
					for (i=0;i<updates.length;i++){
						if (updates[i].isChatUpdate) {
							processChat(updates[i].Chat,false);
						}
					else {
							if ($('#tab3').is(':hidden')) $('#menudot').show(); 
							if ($('#c' + updates[i].ChatId).is(':hidden')) {
								$('#chatobj' + updates[i].ChatId).find('.newdot').show();
								if ($('#tab3').is(':visible')) $('.back-btn .newdot').show();
							}
							$mydiv = $("#c" + updates[i].ChatId + "u" + updates[i].FromUser).find('.actualtext');
							var newmsg = $('<div/>').text(updates[i].Message).html();
							$mydiv.html(newmsg.replaceAll("\r\n","<br>"));
							if (typeof $mydiv !== 'undefined') $mydiv.scrollTop($mydiv[0].scrollHeight - $mydiv[0].clientHeight);
							if ($('#c' + updates[i].ChatId + 'u' + updates[i].FromUser).is(':hidden')) $('#c' + updates[i].ChatId + 'u' + updates[i].FromUser).attr('dot',1);
							updateDots();
						}
					}
				}
			},
			error: function(data, status, xhr) {
				$("#statusmsg").html('Error: ' + JSON.stringify(data));
			}
		});		
}
function ArrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);

    for (var xx = 0, len = bytes.byteLength; xx < len; ++xx) {
        binary += String.fromCharCode(bytes[xx]);
    }
    return window.btoa(binary);
}
  function readSingleFile(evt) {
    var f = evt.target.files[0]; 
    if (f) {
	  var r = new FileReader();
      r.onload = function(e) { 
	      var contents = e.target.result;
		  //check extention, filesize, type with f.type and f.size
		  if (f.size > 10485760) {
			  $('#statusmsg').html('Error: File is too big');
			return; 
		  }
		  if (f.type != "image/jpeg" && f.type != "image/gif" && f.type != "image/png") {
			$('#statusmsg').html('Error: Invalid image type.  Upload a jpg gif or png file');
			return;  
		  }
		var data = JSON.stringify({ cookie : $.cookie("cookiestring"),userid: $.cookie("userId"),file: ArrayBufferToBase64(e.target.result) });
			$('#spinny').show();
			$.ajax({
			url:url + "UpdatePicture",
			type:"POST",crossDomain: true,dataType: "json",
			data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
			success: function(data2) {
				$('#spinny').hide();
				if (data2.Error) {
					$("#statusmsg").html(errors[data2.Error]);
				}
				else {
					$('#profpic').attr('src',"data:image;base64," + data2.Picture);
				}
			},
			error: function(data2, status, xhr) {
				$("#statusmsg").html('Error: ' + JSON.stringify(data2));
				$('#spinny').hide();
			}
		});
	  }
	  r.readAsArrayBuffer(f);
    } else { 
      $("#statusmsg").html("Error: Failed to load file");
	}
  }
  function updateDots() {
	//if there aren't more than 4 people in the chat, return
	$('.userbuttons .newdot').hide();
	if ($('[id^=c' + $('#activechatid').val() + 'u]').length < 4) return;
	var pp1 = userArrayIds[showing];
	var pp2 = userArrayIds[showing + 1];
	var pp3 = userArrayIds[showing + 2];
	$('[id^=c' + $('#activechatid').val() + 'u]').each(function(index, element) {
		if ($(this).attr('dot') == 1) { 
			if ($(this).attr('id') == pp1) $('#nd2').show();
			else if ($(this).attr('id') == pp2) $('#nd3').show();
			else if ($(this).attr('id') == pp3) $('#nd4').show();
			else {
				var idInArray = 0;
				for (i=0;i<userArrayIds.length;i++) {
					if (userArrayIds[i] == $(this).attr('id')) idInArray = i;
				}
				if (idInArray < showing) $('#nd1').show();
				else $('#nd5').show();
			}
		}
	});
  }
  function processChat(chat,initial) {
//if it's a new invite
	var usersInChat = chat.UsersInChat;
	var invitedUsers = chat.InvitedUsers;
	var userstring = "";
	var invitestring = "";
	var isInvite = false;
	var pic = "";
	var me = 1;
	//make invite string, not used if it's an invite though
	for (i=0;i<invitedUsers.length;i++) {
		if (invitedUsers[i]._id == $.cookie("userId")) { isInvite = true; me -= 1; }
		invitestring += invitedUsers[i].UserName;
		if (i != invitedUsers.length - 1) invitestring += ", ";
	}	
	//make userstring, also set pic and check that I'm in the chat
	for (i=0;i<usersInChat.length;i++) {
		if (usersInChat[i]._id != $.cookie("userId")) {
			userstring += usersInChat[i].UserName;
			if (usersInChat.length == 2) pic = usersInChat[i].ProfilePic;
			if (i != usersInChat.length - 1 - me) userstring += ", ";
		}
		else me -= 1;
	}
	if  ($('c' + chat._id).length == 0 && usersInChat.length == 1 && invitedUsers.length == 0) return 0;
//also need to remove c+chatid
	if (isInvite) {
		var addto = "You have been invited to chat" + " with:<br>" + userstring;
		if (!$('#chatobj' + chat._id).length && usersInChat.length + invitedUsers.length > 1) {
			var invitestring = '<div class="inviteobj" id="chatobj' + chat._id + '" data="' + chat._id + '" data2="' + userstring + '"><div class="imgcont"><img src="include/invite.png"></div><div class="namescont"><span class="name">' + addto + '</span></div></div>';
			$('#chats').prepend(invitestring);
			$('#nochats').hide();
			if (!initial) $('#chatobj' + chat._id).hide().slideDown();
		}
//updated invite
		else {
			if (usersInChat.length + invitedUsers.length < 2) $('#chatobj' + chat._id).remove();
			else $('#chatobj' + chat._id).attr('data2',userstring).find('.name').html(addto);
		}
	}
//if it's a new chat
	else if (!$('#chatobj' + chat._id).length) {
		$('#nochats').hide();
		var chatstring = '<div class="chatobj" id="chatobj' + chat._id + '" data="' + chat._id + '" data2="' + userstring + '" data3="' + invitestring + '"><div class="imgcont"><img src="';

	chatstring += (usersInChat.length > 2 ? "include/group.png" : (pic == "" ? "include/invite.png" : (pic == null ? "include/placeholder.png" : "data:image;base64," + pic)));

	chatstring += '"></div><span class="name">' + userstring;
		if (invitestring.length > 0) chatstring += '<br>Invited: ' + invitestring;
	chatstring += '</span><span class="newdot" style="display:none">●</span></div>';
		$('#chats').prepend(chatstring);
		if (!initial) $('#chatobj' + chat._id).hide().slideDown();
		$("<div/>", {
			"class": "achat",
			"style": "display:none",
			"id": 'c' + chat._id
		 }).appendTo("#indchat");
		for (i=0;i<usersInChat.length;i++) {
			if (usersInChat[i]._id != $.cookie("userId")) {
				$("<div/>", {
					"class": "onechat",
					"picdata" : (usersInChat[i].ProfilePic == null ? 'include/placeholder.png' : "data:image;base64," + usersInChat[i].ProfilePic),
					"id": 'c' + chat._id + 'u' + usersInChat[i]._id,
					"dot": "0",
					html: '<div class="nametab" data="' + usersInChat[i]._id + '">' + usersInChat[i].UserName + '</div><div class="actualtext"></div>'
				 }).appendTo("#c" + chat._id);
			}
		}
		rearrangeChat(chat);
		return 1;
	}
//if it's an updated chat
	else {
		if (usersInChat.length + invitedUsers.length < 2) {
			$('#chatobj' + chat._id).remove();
			if ($('#c' + chat._id).is(':visible')) $('#backlink').click();
			$('#c' + chat._id).remove();
			$('#statusmsg').html('Chat removed, everyone has left');
			if ($('.chatobj,.inviteobj').length == 0) $('#nochats').show();
			return 0;
		}
		if ($('#activechatid').val() == chat._id) $('#invitedlist').html(invitestring.replaceAll(",","<br>"));
		$('#chatobj' + chat._id).attr('data2',userstring).attr('data3',invitestring).children('.name').html(userstring + (invitestring.length > 0 ? '<br>Invited: ' + invitestring : ""));
	$('#chatobj' + chat._id).children().children('img').attr('src',(usersInChat.length > 2 ? "include/group.png" : (pic == "" ? "include/invite.png" : "data:image;base64," + pic)));
	//add div for anyone who is new to the chat
		for (i=0;i<usersInChat.length;i++) {
			if (usersInChat[i]._id != $.cookie("userId")) {
				if (!$('#c' + chat._id + "u" + usersInChat[i]._id).length) {
					$("<div/>", {
						"class": "onechat",
						"picdata" : (usersInChat[i].ProfilePic == null ? 'include/placeholder.png' : "data:image;base64," + usersInChat[i].ProfilePic),
						"id": 'c' + chat._id + 'u' + usersInChat[i]._id,
						"dot": "0",
						html: '<div class="nametab" data="' + usersInChat[i]._id + '">' + usersInChat[i].UserName + '</div><div class="actualtext"></div>'
					 }).appendTo("#c" + chat._id);
				}
			}
		}
//remove divs for anyone who is no longer in the chat
		$('[id^=c' + chat._id + 'u]').each(function(index, element) {
			var found = false;
			for (p = 0;p < usersInChat.length;p++) {
				if ($(this).is('#c' + chat._id + 'u' + usersInChat[p]._id)) found = true;
			}
			if (!found) $(this).remove();
		});
		rearrangeChat(chat);
		updateGuys();
	}
}
function reloadFriends() {
	var data = JSON.stringify({ cookie : $.cookie("cookiestring"),userid: $.cookie("userId") });
	$.ajax({
	url:url + "ReloadFriends",
	type:"POST",crossDomain: true,dataType: "json",
	data : data,	headers: {'content-type': "application/json; charset=utf-8"	},
	success: function(data) {
		if (data.Error) {
			$("#statusmsg").html(errors[data.Error]);
		}
		else {
			var friends = data.Friends;
			for (i=0;i<friends.length;i++){
				var friend = friends[i];
				$('#nofriends').hide();
				if (!$('#friend' + friend._id).length) {
					var friendstring = '<div class="col-xs-4 col-md-3 col-lg-2 friendobj" id="friend' + friend._id + '" data="' + friend._id + '" data2="' + friend.UserName + '" data3="' + friend.Name + '"><div class="friimgcont"><div class="fricircle"><img src="' + (friend.ProfilePic == null ? 'include/placeholder.png' : "data:image;base64," + friend.ProfilePic) + '"></div></div><div class="friname"><span style="color:' + (friend.OnlineStatus ? 'green' : 'red') + '">●</span>' + friend.UserName + '</div></div>';
					$('#friends').prepend(friendstring);
					var cw = $('.fricircle').width();
					$('.fricircle').css({'height':cw+'px'});
					$('#friend' + friend._id).hide().slideDown();
				}
				else {
					var $fridiv = $('#friend' + friend._id);
					$fridiv.attr('data2',friend.UserName);
					$fridiv.attr('data3',friend.Name);
					$fridiv.find('.friname').html('<span style="color:' + (friend.OnlineStatus ? 'green' : 'red') + '">●</span>' + friend.UserName);
					$fridiv.find('img').attr('src',(friend.ProfilePic == null ? 'include/placeholder.png' : "data:image;base64," + friend.ProfilePic));
				}
			}
		}
	},
	error: function(data, status, xhr) {
		$("#statusmsg").html('Error: ' + JSON.stringify(data));
	}
	});
}