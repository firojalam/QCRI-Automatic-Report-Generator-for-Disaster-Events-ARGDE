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

		if(!collection_name)
		{
			let noCollectionNameError = [{name: 'noCollectionName', message: 'Please enter a collection code.'}];
			req.session.flash = {err: noCollectionNameError};
			return res.redirect('/precompute');
		}

		Argde.query("select min("+Argde.attributes.updatedAt.columnName+") from "+Argde.tableName+" where "
			+Argde.attributes.code.columnName+"='"+collection_name+"';",
			function(err, result){
				if(err)
				{
					sails.log.error("Error name: "+err.name+"	 "+"Error code: "+err.code);
					return res.serverError(err);
				}
				else if(result.rows[0].min == null)
				{
					let invalidCollectionNameError = [{name: 'invalidCollectionName', message: 'Invalid code entered. Please enter a valid collection code.'}];
					req.session.flash = {err: invalidCollectionNameError};
					return res.redirect('/precompute');
				}
				else
				{
					min_date = new Date(result.rows[0].min);
					Argde.query("select max("+Argde.attributes.updatedAt.columnName+") from "+Argde.tableName+" where "
						+Argde.attributes.code.columnName+"='"+collection_name+"';",
						function(err, result){
							if(err)
							{
								sails.log.error("Error name: "+err.name+"	 "+"Error code: "+err.code);
								return res.serverError(err);
							}
							else
							{
								max_date = new Date(result.rows[0].max);
								Argde.query("select date(max("+Argde.attributes.updatedAt.columnName+"))-date(min("
									+Argde.attributes.updatedAt.columnName
									+")) from "+Argde.tableName+" where "+Argde.attributes.code.columnName+"='"+req.param('collection')
									+"';",function(err, result){
										if(err)
										{
											sails.log.error("Error name: "+err.name+"	 "+"Error code: "+err.code);
											return res.serverError(err);
										}
										else
										{
											date_diff = result.rows[0]['?column?'];
											paramList={'min':min_date, 'max':max_date, 'diff':date_diff, 'collection': req.param('collection')};
											minuteController.createPreMinutes(paramList);
											labelController.createPreLabels(paramList);
											hourController.createPreHours(paramList);
											dayController.createPreDays(paramList);
										}
									});
							}
						});
				}
			});
		req.session.collection = collection_name;
		res.redirect('/precomputation_progress');
	},
	precompute_done: function(req, res){
		if(req.session.collection)
		{
			var collection = req.session.collection;
			delete req.session.collection;
			var pre_url = sails.getBaseurl();
			var the_url_raw = sails.getUrlFor('DataController.retrieveAll');
			var the_url = the_url_raw.substr(0, the_url_raw.length - 5);
			var url = pre_url + the_url + collection;
			return res.view('admin/precomputation_complete', { graphs_url: url});
		}
		else
		{
			var noComputationInitiatedError = [{name: 'noComputationInitiated', message: 'Please initiate precomputation to obtain URL for visualization for the corresponding collection.'}];
			req.session.flash = {err: noComputationInitiatedError};
			return res.redirect('/precompute');
		}
	},
	getProgress: function(req, res){
		var count = 0;
		var progress = 0;
		if(Argde.precomputation['day'] == true)
		{
			count += 1;
		}
		if(Argde.precomputation['hour'] == true)
		{
			count += 1;
		}
		if(Argde.precomputation['minute'] == true)
		{
			count += 1;
		}
		if(Argde.precomputation['label'] == true)
		{
			count += 1;
		}
		if(Argde.precomputation['sentiment'] == true)
		{
			count += 1;
		}
		if(Argde.precomputation['damage'] == true)
		{
			count += 1;
		}
		if(Argde.precomputation['image_relevancy'] == true)
		{
			count += 1;
		}
		progress = (count/7)*100;
		sails.log.info('Sending progress data');

		return res.send({progress: progress});
	},
};
