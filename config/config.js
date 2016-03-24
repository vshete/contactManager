module.exports = {
	templateEngine: 'swig',

	sessionSecret: 'contactManager',
	// The session cookie settings
	sessionCookie: {
	    path: '/',
	    httpOnly: true,
	    // If secure is set to true then it will cause the cookie to be set
	    // only when SSL-enabled (HTTPS) is used, and otherwise it won't
	    // set a cookie. 'true' is recommended yet it requires the above
	    // mentioned pre-requisite.
	    secure: false,
	    // Only set the maxAge to null if the cookie shouldn't be expired
	    // at all. The cookie will expunge when the browser is closed.
	    maxAge: null
	},
	sessionName: 'connect.sid'
}
