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
      User.find({select: ['name', 'username', 'email'],}).exec(function(err, users){
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
    return res.view('admin/addadmin');
  },
  addAdmin: function(req, res){
    require('bcrypt').hash(req.param('password'), 10, function passwordEncrypted(err, result){
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
        }).exec(function(err, user){
          if(err)
          {
            sails.log.info("Error name: "+err.name+"	 "+"Error code: "+err.code);
            req.session.flash = {err: "There was an error in the input data, make sure the username and email are ones that haven't been used before.",};
            return res.redirect('/add_admin');
          }
          else
          {
            return res.redirect('/allAdmins');
          }
        });
      }
    });
  },
  search: function(req, res){
    let search = req.param('name').toLowerCase();
    Argde.query("select distinct "+Argde.attributes.code.columnName+" from "
    +Label_frequency.tableName+" where "+Argde.attributes.code.columnName+" like '%"
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
            pretty: User.collectionPretty[row['code']],
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
};
