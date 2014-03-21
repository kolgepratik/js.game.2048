var _fb = {
	MY_USER_ID: '775864302439529',
	SDK_LOADED: false,
	USER_LOGGED_IN: false,
	APP_DOMAIN: 'kolgepratik.com',
	ACCESS_CODE_COOKIE_NAME: 'fbAccessCode',
};

$(document).ready(function() {
  $.getScript('//connect.facebook.net/en_UK/all.js', function(){
    
	_fb.SDK_LOADED = true;
	  
	FB.init({
      appId: '775864302439529',
      status     : false,
      cookie     : true,
      xfbml      : true
    });     
    
    FB.Event.subscribe('auth.authResponseChange', function(response) {
        if (response.status === 'connected') {
          fbUpdateConnectionStatus(true);
        } else if (response.status === 'not_authorized') {
          fbLogin();
        } else {
          fbLogin();
        }
      });
  });
});

function fbUpdateConnectionStatus(connected) {
	if (connected) {	
		_fb.USER_LOGGED_IN = true;	
	} else {
		_fb.USER_LOGGED_IN = false;
	}
}

function fbLogin() {
	if (SDK_LOADED) {		
		FB.login(fbLoginHandler);
	}
}


function fbLoginHandler(response) {
    if (response.authResponse) {
    	$.cookie(_fb.ACCESS_CODE_COOKIE_NAME, response.authResponse.accessToken, { path: '/', domain: _fb.APP_DOMAIN });
    } 
}
