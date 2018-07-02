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
		var collection_name = req.param('collection');
		var min_date;
		var max_date;
		var date_diff;
		var paramList;
		Argde.query("select min("+Argde.attributes.updatedAt.columnName+") from "+Argde.tableName+" where "
		+Argde.attributes.code+"='"+collection_name+"';",
		function(err, result){
			if(err)
			{
				sails.log.error("Error name: "+err.name+"	 "+"Error code: "+err.code);
				res.serverError(err);
			}
			min_date = new Date(result.rows[0].min);
			Argde.query("select max("+Argde.attributes.updatedAt.columnName+") from "+Argde.tableName+" where "
			+Argde.attributes.code+"='"+collection_name+"';",
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

					var interval = setInterval(function(){
						if(Argde.precomputation['day'] == true
						&&	Argde.precomputation['hour'] == true
						&& Argde.precomputation['minute'] == true
						&& Argde.precomputation['label'] == true
						&& Argde.precomputation['sentiment'] == true
						&& Argde.precomputation['damage'] == true
						&& Argde.precomputation['image_relevancy'] == true)
						{
							clearInterval(interval);
							return res.redirect('/complete/'+collection_name);
						}
					}, 100);
				});
			});
		});
	},
	precompute_done: function(req, res){
		var pre_url = sails.getBaseurl();
		var the_url_raw = sails.getUrlFor('DataController.retrieveAll');
		var the_url = the_url_raw.substr(0, the_url_raw.length - 5);
		var url = pre_url + the_url + req.param('collection');
		return res.view('admin/precomputation_complete', { graphs_url: url})
	},
};
