/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */
 module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  // Requests
  '/': {
    controller: 'UserController',
    action: 'home',
  },
  '/logout' : {
    controller: 'SessionController',
    action: 'logout',
  },
  '/visualize/:name': {
    controller: 'DataController',
    action: 'retrieveAll',
    locals: {
      layout: 'layouts/onload_layout'
    }
  },
  '/allAdmins': {
    controller: 'UserController',
    action: 'allAdmins',
  },
  // Data retrieval (Socket) Requests
  '/get_minute': {
    controller: 'DataController',
    action: 'retrieveMinute',
  },
  '/get_hour': {
    controller: 'DataController',
    action: 'retrieveHour',
  },
  '/get_day': {
    controller: 'DataController',
    action: 'retrieveDay',
  },
  '/get_label': {
    controller: 'DataController',
    action: 'retrieveLabel',
  },
  '/get_class': {
    controller: 'DataController',
    action: 'retrieveClass',
  },
  '/get_sentiment': {
    controller: 'DataController',
    action: 'retrieveSentiment',
  },
  '/get_damage': {
    controller: 'DataController',
    action: 'retrieveDamage',
  },
  '/get_relevancy': {
    controller: 'DataController',
    action: 'retrieveRelevancy',
  },
  '/get_tweets': {
    controller: 'DataController',
    action: 'retrieveTweets',
  },
  '/precomputation_progress': {
    controller: 'ArgdeController',
    action: 'precompute_done',
    locals: {
      layout: 'layouts/onload_layout'
    },
  },
  '/progress': {
    controller: 'ArgdeController',
    action: 'getProgress',
    locals: {
      layout: 'layouts/onload_layout'
    },

  },
  '/reset_password/:username': {
    controller: 'UserController',
    action: 'reset',
  },
  '/make_super/:username': {
    controller: 'UserController',
    action: 'make_super',
  },
  // GET requests
  'GET /search': {
    controller: 'UserController',
    action: 'search',
    locals: {
      layout: 'layouts/onload_layout'
    },
  },
  'GET /login': {
    controller: 'SessionController',
    action: 'get_login',
  },
  'GET /add_admin': {
    controller: 'UserController',
    action: 'get_addAdmin',
  },
  'GET /precompute': {
    controller: 'UserController',
    action: 'precompute',
  },
  'GET /edit/:username': {
    controller: 'UserController',
    action: 'get_edit',
  },
  'GET /resetpassword/:username': {
    controller: 'UserController',
    action: 'get_reset_manual',
  },
  // POST requests
  'POST /login': {
    controller: 'SessionController',
    action: 'login',
  },
  'POST /add_admin': {
    controller: 'UserController',
    action: 'addAdmin',
  },
  'POST /precompute': {
    controller: 'ArgdeController',
    action: 'precompute',
  },
  'POST /edit': {
    controller: 'UserController',
    action: 'edit',
  },
  'POST /resetpassword/:username': {
    controller: 'UserController',
    action: 'reset_manual',
  },
  'POST /delete_admin': {
    controller: 'UserController',
    action: 'destroy',
  },

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

};
