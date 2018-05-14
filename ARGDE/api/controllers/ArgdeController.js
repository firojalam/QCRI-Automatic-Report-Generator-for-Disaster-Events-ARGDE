/**
 * ArgdeController
 *
 * @description :: Server-side logic for managing argdes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	/*showAll: function(req, res){
		Argde.find({}).exec(function(err, result){
			if(err)
			{
				res.send(500, {error: 'Database Error'});
			}
			res.view('argde/showAll',{entries: result});
		})
	},*/
	showMany: async function(req, res){
		let records = await Argde.find({}).limit(req.param('limit'));
		if(records)
		{
			res.view('argde/show',{entries: records});
		}
		else
		{
			res.send(500, {error: 'Database Error'});
		}
	}
};
