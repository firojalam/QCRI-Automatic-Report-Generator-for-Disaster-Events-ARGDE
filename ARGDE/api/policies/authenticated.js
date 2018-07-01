module.exports = function(req, res, ok){
  if(req.session.authenticated)
  {
    return ok();
  }
  else
  {
    var requireLoginError = [{name: 'requireLogin', message: 'You must be logged in to perform this action.'}];
    req.session.flash = {err: requireLoginError};
    req.session.next_url = req.path;
    return res.redirect('/login');
  }
};
