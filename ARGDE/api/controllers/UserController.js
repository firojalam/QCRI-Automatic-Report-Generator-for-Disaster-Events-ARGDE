// module.exports = {
//
//   /**
//    * `UserController.login()`
//    */
//   login: function (req, res) {
//
//     // See `api/responses/login.js`
//     return res.login({
//       email: req.param('email'),
//       password: req.param('password'),
//       successRedirect: '/',
//       invalidRedirect: '/login'
//     });
//   },
//
//
//   /**
//    * `UserController.logout()`
//    */
//   logout: function (req, res) {
//
//     // "Forget" the user from the session.
//     // Subsequent requests from this user agent will NOT have `req.session.me`.
//     req.session.me = null;
//
//     // If this is not an HTML-wanting browser, e.g. AJAX/sockets/cURL/etc.,
//     // send a simple response letting the user agent know they were logged out
//     // successfully.
//     if (req.wantsJSON) {
//       return res.ok('Logged out successfully!');
//     }
//
//     // Otherwise if this is an HTML-wanting browser, do a redirect.
//     return res.redirect('/');
//   },
//
//
//   /**
//    * `UserController.signup()`
//    */
//   signup: function (req, res) {
//
//     // Attempt to signup a user using the provided parameters
//     User.signup({
//       name: req.param('name'),
//       email: req.param('email'),
//       password: req.param('password')
//     }, function (err, user) {
//       // res.negotiate() will determine if this is a validation error
//       // or some kind of unexpected server error, then call `res.badRequest()`
//       // or `res.serverError()` accordingly.
//       if (err) return res.negotiate(err);
//
//       // Go ahead and log this user in as well.
//       // We do this by "remembering" the user in the session.
//       // Subsequent requests from this user agent will have `req.session.me` set.
//       req.session.me = user.id;
//
//       // If this is not an HTML-wanting browser, e.g. AJAX/sockets/cURL/etc.,
//       // send a 200 response letting the user agent know the signup was successful.
//       if (req.wantsJSON) {
//         return res.ok('Signup successful!');
//       }
//
//       // Otherwise if this is an HTML-wanting browser, redirect to /welcome.
//       return res.redirect('/welcome');
//     });
//   }
// };
//
module.exports =  {
  home: function(req, res){
    return res.view('user/homepage');
  },
  allAdmins: function(req, res){
    if(req.session.authenticated == true || true)
    {
      User.find({select: ['name', 'username', 'email', 'super_admin'],}).exec(function(err, users){
        if(err)
        {
          sails.log.info("Error name: "+err.name+"	 "+"Error code: "+err.code);
          return res.serverError();
        }
        else if(users == undefined)
        {
          let noUsersFoundError = [{name: 'noUsersFound', message: 'No Admins Found'}];
          req.session.flash = {err: noUsersFoundError};
          return res.redirect('/allAdmins');
        }
        else
        {
          return res.view('admin/alladmins', {admins: users});
        }
      });
    }
  },
  get_addAdmin: function(req, res){
    if(req.session.User.super_admin)
    {
      return res.view('admin/addadmin', {pass: User.default_password});
    }
    else
    {
      return res.redirect('/');
    }
  },
  addAdmin: function(req, res){
    if(req.session.User.super_admin)
    {
      var super_admin_bool;
      if(req.param('super_admin') == 'on')
      {
        super_admin_bool = true;
      }
      else
      {
        super_admin_bool = false;
      }
      var password = User.default_password;
      if(req.param('password') != "")
      {
        password = req.param('password');
      }
      require('bcrypt').hash(password, 10, function passwordEncrypted(err, result){
        if(err)
        {
          return res.serverError();
        }
        else
        {
          User.create({
            name: req.param('name'),
            username: req.param('username'),
            email: req.param('email'),
            encryptedPassword: result,
            super_admin: super_admin_bool,
          }).exec(function(err, user){
            if(err)
            {
              sails.log.info("Error name: "+err.name+"	 "+"Error code: "+err.code);
              var notUniqueError = [{
                name: 'notUnique',
                message: "There was an error in the input data, try another username and make sure you aren't using an email that has been used before."
              }];
              req.session.flash = {err: notUniqueError,};
              return res.redirect('/add_admin');
            }
            else
            {
              return res.redirect('/allAdmins');
            }
          });
        }
      });
    }
    else
    {
      return res.redirect('/');
    }
  },
  search: function(req, res){
    let search = req.param('name').toLowerCase();
    Argde.query("select distinct "+Label_frequency.attributes.code.columnName+" from "
    +Label_frequency.tableName+" where "+Label_frequency.attributes.code.columnName+" like '%"
    +search+"%';", function(err, response){
      if(err)
      {
        sails.log.error("Error name: "+err.name+"	"+"Error code: "+err.code);
        return res.serverError(err);
      }
      else
      {
        let response_obj = [];
        response.rows.forEach(function(row){
          let temp = {
            code: row['code'],
          };
          response_obj.push(temp);
        });
        res.view('user/results',{collections: response_obj});
      }
    });
  },
  precompute: function(req, res){
    return res.view('admin/precomputation');
  },
  get_edit: function(req, res){
    if(req.session.User.username == req.param('username'))
    {
      return res.view('user/edit', {username: req.param('username')});
    }
    else
    {
      return res.redirect('/');
    }
  },
  edit: function(req, res){
    if(req.session.User.username == req.param('username'))
    {
      User.update({username: req.param('username')}, {
        name: req.param('name'),
        email: req.param('email'),
      }).exec(function(err, user){
        if(err)
        {
          sails.log.info("Error name: "+err.name+"	 "+"Error code: "+err.code);
          return res.serverError();
        }
        else
        {
            req.session.User = user[0];
            delete req.session.User.encryptedPassword;
            res.redirect('/');
        }
      });
    }
    else
    {
      return res.redirect('/');
    }
  },
  reset: function(req, res){
    if(!req.param('username'))
    {
      res.notFound();
    }
    else
    {
      var password = User.default_password;
      require('bcrypt').hash(password, 10, function passwordEncrypted(err, result){
        if(err)
        {
          return res.serverError();
        }
        else
        {
          User.update({username: req.param('username'),}, {encryptedPassword: result}).exec(function(err, user){
            if(err)
            {
              sails.log.info("Error name: "+err.name+"	 "+"Error code: "+err.code);
              return res.serverError();
            }
            else
            {
              if(req.param('username') == req.session.User.username)
              {
                return res.redirect('/logout');
              }
              else
              {
                return res.redirect('/allAdmins');
              }
            }
          });
        }
      });
    }
  },
  get_reset_manual: function(req, res){
    if(req.session.User.username == req.param('username'))
    {
      return res.view('user/reset_password', {username: req.param('username')});
    }
    else
    {
      return res.redirect('/');
    }
  },
  reset_manual: function(req, res){
    if(!req.param('username'))
    {
      return res.noFound();
    }
    else if(req.session.User.username == req.param('username'))
    {
      if(!req.param('oldpassword'))
      {
        var passwordRequiredError = [{name: 'passwordRequired', message: 'Old password required'}];
        req.session.flash = {err: passwordRequiredError,};
        return res.redirect('/resetpassword/'+req.session.User.username);
      }
      if(!req.param('newpassword'))
  		{
  			var passwordRequiredError = [{name: 'passwordRequired', message: 'New password required'}];
  			req.session.flash = {err: passwordRequiredError,};
  			return res.redirect('/resetpassword/'+req.session.User.username);
  		}
      if(!req.param('repeatpassword'))
      {
        var passwordRequiredError = [{name: 'passwordRequired', message: 'Reapeat password'}];
  			req.session.flash = {err: passwordRequiredError,};
  			return res.redirect('/resetpassword/'+req.session.User.username);
      }
      if(req.param('newpassword') != req.param('repeatpassword'))
      {
        var passwordMatchError = [{name: 'passwordMatch', message: 'New password and must match with your confirmed password'}];
  			req.session.flash = {err: passwordMatchError,};
  			return res.redirect('/resetpassword/'+req.session.User.username);
      }
  		User.findOne({username: req.param('username')}).exec(function(err, user){
  			if(err)
  			{
  				return res.serverError();
  			}
  			else if(user == undefined)
  			{
  				return res.notFound();
        }
  			else
  			{
  				require('bcrypt').compare(req.param('oldpassword'), user.encryptedPassword, function(err, valid){
  					if(err)
  					{
  						return res.serverError();
  					}
  					else if(!valid)
  					{
  						let usernamePasswordMismatchError = [{name: 'usernamePasswordMismatch', message: "Incorrect Old Password"}];
  						req.session.flash = {err: usernamePasswordMismatchError};
  						return res.redirect('/resetpassword/'+req.session.User.username);
  					}
  					else
  					{
              require('bcrypt').hash(req.param('newpassword'), 10, function passwordEncrypted(err, result){
                if(err)
                {
                  return res.serverError();
                }
                else
                {
                  User.update({username: req.param('username'),}, {encryptedPassword: result}).exec(function(err, user){
                    if(err)
                    {
                      sails.log.info("Error name: "+err.name+"	 "+"Error code: "+err.code);
                      return res.serverError();
                    }
                    else
                    {
                      return res.redirect('/logout');
                    }
                  });
                }
              });
  					}
  				});
  			}
  		});
    }
    else
    {
      return res.redirect('/');
    }
  },
  make_super: function(req, res){
    if(!req.param('username'))
    {
      res.notFound();
    }
    else if(req.session.User.super_admin)
    {
      User.update({username: req.param('username')}, {super_admin: true}).exec(function(err, user){
        if(err)
        {
          sails.log.info("Error name: "+err.name+"	 "+"Error code: "+err.code);
          return res.serverError();
        }
        else
        {
            req.session.User = user[0];
            delete req.session.User.encryptedPassword;
            res.redirect('/allAdmins');
        }
      });
    }
    else
    {
      return res.redirect('/');
    }
  },
  destroy: function(req, res){
    if(!req.param('username'))
    {
      return res.notFound();
    }
    else if(req.session.User.super_admin && req.param('username') != req.session.User.username)
    {
      User.findOne({username: req.param('username')}).exec(function(err, user){
        if(err)
        {
          sails.log.info("Error name: "+err.name+"	 "+"Error code: "+err.code);
          return res.serverError();
        }
        else if(user == undefined)
        {
          return res.notFound();
        }
        else
        {
          User.destroy({username: req.param('username')}).exec(function(err, deleteduser){
            if(err)
            {
              sails.log.info("Error name: "+err.name+"	 "+"Error code: "+err.code);
              return res.serverError();
            }
            else
            {
              return res.redirect('/allAdmins');
            }
          });
        }
      });
    }
    else
    {
      return res.redirect('/');
    }
  },
};
