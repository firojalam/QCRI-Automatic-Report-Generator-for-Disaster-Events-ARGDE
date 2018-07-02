var bcrypt = require('bcrypt');
module.exports = {
	get_login: function(req, res){
    return res.view('user/login');
  },
	login: function(req, res){
		if(!req.param('username') || !req.param('password'))
		{
			var usernamePasswordRequiredError = [{name: 'usernamePasswordRequired', message: 'Username and Password required'}];
			req.session.flash = {err: usernamePasswordRequiredError,};
			return res.redirect('/login');
		}
		User.findOne({username: req.param('username')}).exec(function(err, user){
			if(err)
			{
				return res.serverError();
			}
			else if(user == undefined)
			{
				let noAccountError = [{name: 'noAccount', message: 'Incorrect username'}];
				req.session.flash = {err: noAccountError};
				return res.redirect('/login');
			}
			else
			{
				bcrypt.compare(req.param('password'), user.encryptedPassword, function(err, valid){
					if(err)
					{
						return res.serverError();
					}
					else if(!valid)
					{
						let usernamePasswordMismatchError = [{name: 'usernamePasswordMismatch', message: "Incorrect Password"}];
						req.session.flash = {err: usernamePasswordMismatchError};
						return res.redirect('/login');
					}
					else
					{
						let now_date = new Date();
					  let expiry_date = new Date(now_date.getTime() + 600000);
					  req.session.cookie.expires = expiry_date;
						req.session.authenticated = true;
						req.session.User = user;
						delete req.session.User.encryptedPassword;
						let next_page = req.session.next_url?req.session.next_url : '/';
						delete req.session.next_page;
						res.redirect(next_page);
					}
				});
			}
		});
	},
	logout: function(req, res){
		req.session.destroy();
		res.redirect('/');
	},
};
