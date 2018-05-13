/**
 * ArgdeController
 *
 * @description :: Server-side logic for managing argdes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	showAll: function(req, res){
		Argde.find({}).exec(function(err, result){
			if(err)
			{
				res.send(500, {error: 'Database Error'});
			}
			res.view('argde/showAll',{entries: result});
		})
	}

};
