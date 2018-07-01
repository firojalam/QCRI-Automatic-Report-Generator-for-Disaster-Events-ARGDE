var hourController = require('./Hour_frequencyController');
var dayController = require('./Day_frequencyController');
var minuteController = require('./Minute_frequencyController');
var labelController = require('./Label_frequencyController');
module.exports = {
	precompute: function(req, res){
		Argde.precomputation['day'] = false;
		Argde.precomputation['hour'] = false;
		Argde.precomputation['minute'] = false;
		Argde.precomputation['label'] = false;
		Argde.precomputation['sentiment'] = false;
		Argde.precomputation['damage'] = false;
		Argde.precomputation['image_relevancy'] = false;
		var min_date;
		var max_date;
		var date_diff;
		var paramList;
		Argde.query("select min("+Argde.attributes.updatedAt.columnName+") from "+Argde.tableName+";",
		function(err, result){
			if(err)
			{
				sails.log.error("Error name: "+err.name+"	 "+"Error code: "+err.code);
				res.serverError(err);
			}
			min_date = new Date(result.rows[0].min);
			Argde.query("select max("+Argde.attributes.updatedAt.columnName+") from "+Argde.tableName+";",
			function(err, result){
				max_date = new Date(result.rows[0].max);
				Argde.query("select date(max("+Argde.attributes.updatedAt.columnName+"))-date(min("
				+Argde.attributes.updatedAt.columnName
				+")) from "+Argde.tableName+" where "+Argde.attributes.code.columnName+"='"+req.param('collection')
				+"';",function(err, result){
					date_diff = result.rows[0]['?column?'];
					paramList={'min':min_date, 'max':max_date, 'diff':date_diff, 'collection': req.param('collection')};
					minuteController.createPreMinutes(paramList);
					labelController.createPreLabels(paramList);
					hourController.createPreHours(paramList);
					dayController.createPreDays(paramList);
				});
			});
		});
	},
};
