/**
 * Day_frequencyController
 *
 * @description :: Server-side logic for managing day_frequencies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	createDay: async function(req, res){
		await Day_frequency.findOrCreate({date: req.param('date'),frequency: Number(req.param('frequency'))}).exec(function(err, result){
			if(err)
			{
				return res.serverError(err);
			}
			return res.ok();
		})
	}
};
