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
		await Argde.find({}).limit(req.param('limit')).exec(function(err, records){
			if(err)
			{
				return res.serverError(err);
			}

			if(records.length==0)
			{
				return res.view('argde/noData');
			}
			return res.view('argde/show', {entries: records});
		});
	},
};
