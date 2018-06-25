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
					let interval = setInterval(function(){
						if(Argde.precomputation['day'] == true
						&& Argde.precomputation['hour'] == true
						&& Argde.precomputation['minute'] == true
						&& Argde.precomputation['label'] == true
						&& Argde.precomputation['sentiment'] == true
						&& Argde.precomputation['damage'] == true
						&& Argde.precomputation['image_relevancy'] == true)
						{
							res.redirect('/pre_complete');
							clearInterval(interval);
						}
					}, 500);
				});
			});
		});
	},
	precomputationComplete: function(req, res){
		sails.log.info("All precompuations complete");
		Argde.precomputation['day'] = false;
		Argde.precomputation['hour'] = false;
		Argde.precomputation['minute'] = false;
		Argde.precomputation['label'] = false;
		Argde.precomputation['sentiment'] = false;
		Argde.precomputation['damage'] = false;
		Argde.precomputation['image_relevancy'] = false;
		res.view('argde/complete_pre');
	},
};
