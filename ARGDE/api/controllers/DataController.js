var DataControllerInfo = {
	'model': 'data',
	'methods': {
		minute_wise: 'retrieveMinute',
		hour_wise: 'retrieveHour',
		day_wise: 'retrieveDay',
		label_wise: 'retrieveLabel',
		class_wise: 'retrieveClass',
		sentiment_wise: 'retrieveSentiment',
		damage_wise: 'retrieveDamage',
		all: 'retrieveAll',
	},
};
module.exports = {
	retrieveMinute: async function(req, res){
			await Minute_frequency.find({
				where: { code: req.param('collection'), },
				sort: { date: 1, hour: 1, minute: 1,},
				}).exec(function(err, records){
				if(err)
				{
					sails.log.error("Error name: "+err.name+"	"+"Error code: "+err.code);
					return res.serverError(err);
				}
				else
				{
					sails.log.info("Minute data retrieved, passing to view");
					res.send({minute_data: records});
				}
			});
	},
	retrieveHour: async function(req, res){
			await Hour_frequency.find({
				where: { code: req.param('collection'), },
				sort: { date: 1, hour: 1,},
			}).exec(function(err, records){
				if(err)
				{
					sails.log.error("Error name: "+err.name+"	"+"Error code: "+err.code);
					return res.serverError(err);
				}
				else
				{
					sails.log.info("Hour data retrieved, passing to view");
					res.send({hour_data: records});
				}
			});
	},
	retrieveDay: async function(req, res){
			await Day_frequency.find({
				where: { code: req.param('collection'), },
				sort: { date: 1, },
			}).exec(function(err, records){
				if(err)
				{
					sails.log.error("Error name: "+err.name+"	"+"Error code: "+err.code);
					return res.serverError(err);
				}
				else
				{
					sails.log.info("Day data retrieved, passing to view");
					res.send({day_data: records});
				}
			});
	},
	retrieveLabel: async function(req, res){
			await Label_frequency.find({
				where: { code: req.param('collection'), },
				sort: { date: 1, hour: 1, minute: 1,},
			}).exec(function(err, records){
				if(err)
				{
					sails.log.error("Error name: "+err.name+"	"+"Error code: "+err.code);
					return res.serverError(err);
				}
				else
				{
					sails.log.info("Label data retrieved, passing to view");
					res.send({label_data: records});
				}
			});
	},
	retrieveSentiment: function(req, res){
		Argde.query("select distinct "+Argde.attributes.sentiment.columnName+" from "
		+Argde.tableName+" where "+Argde.attributes.sentiment.columnName+" is not NULL;",
		function(err, sentiments){
				if(err)
				{
					sails.log.error("Error name: "+err.name+"	"+"Error code: "+err.code);
					return res.serverError(err);
				}
				else
				{
					var sentiment_values = [];
					sentiments.rows.forEach(function(sentiment){
						sentiment_values.push(String(sentiment['sentiment']));
					});

					var query = "select * from "+Label_frequency.tableName+" where (";

					for(i in sentiment_values)
					{
						if(i == (sentiment_values.length-1))
						{
							query = query + Label_frequency.attributes.class_label.columnName+"='"+sentiment_values[i]+"'";
						}
						else
						{
							query = query + Label_frequency.attributes.class_label.columnName+"='"+sentiment_values[i]+"' or ";
						}
					}
					query = query + ") and "+Label_frequency.attributes.code.columnName+"='"
					+req.param('collection')+"' order by "+Label_frequency.attributes.date.columnName+","
					+Label_frequency.attributes.hour.columnName+","
					+Label_frequency.attributes.minute.columnName+";";

					Label_frequency.query(query,function(err, records){
						if(err)
						{
							sails.log.error("Error name: "+err.name+"	"+"Error code: "+err.code);
							return res.serverError(err);
						}
						else
						{
							sails.log.info("Sentiment data retrieved, passing to view");
							res.send({sentiment_data: records.rows});
						}
					});
				}
			}
		);
	},
	retrieveClass: function(req, res){
		Argde.query("select distinct "+Argde.attributes.aidr_class_label.columnName+" from "
		+Argde.tableName+" where "+Argde.attributes.aidr_class_label.columnName+" is not NULL;",
		function(err, classes){
				if(err)
				{
					sails.log.error("Error name: "+err.name+"	"+"Error code: "+err.code);
					return res.serverError(err);
				}
				else
				{
					var class_values = [];
					classes.rows.forEach(function(eachclass){
						class_values.push(String(eachclass['aidr_class_label']));
					});

					var query = "select * from "+Label_frequency.tableName+" where (";

					for(i in class_values)
					{
						if(i == (class_values.length-1))
						{
							query = query + Label_frequency.attributes.class_label.columnName+"='"+class_values[i]+"'";
						}
						else
						{
							query = query + Label_frequency.attributes.class_label.columnName+"='"+class_values[i]+"' or ";
						}
					}
					query = query + ") and "+Label_frequency.attributes.code.columnName+"='"
					+req.param('collection')+"' order by "+Label_frequency.attributes.date.columnName+","
					+Label_frequency.attributes.hour.columnName+","
					+Label_frequency.attributes.minute.columnName+";";

					Label_frequency.query(query,function(err, records){
						if(err)
						{
							sails.log.error("Error name: "+err.name+"	"+"Error code: "+err.code);
							return res.serverError(err);
						}
						else
						{
							sails.log.info("Class data retrieved, passing to view");
							res.send({class_data: records.rows});
						}
					});
				}
			}
		);
	},
	retrieveDamage: function(req, res){
		Argde.query("select distinct "+Argde.attributes.image_damage_class.columnName+" from "
		+Argde.tableName+" where "+Argde.attributes.image_damage_class.columnName+" is not NULL;",
		function(err, damage_classes){
				if(err)
				{
					sails.log.error("Error name: "+err.name+"	"+"Error code: "+err.code);
					return res.serverError(err);
				}
				else
				{
					var damage_values = [];
					damage_classes.rows.forEach(function(eachclass){
						damage_values.push(String(eachclass['image_damage_class']));
					});

					var query = "select * from "+Label_frequency.tableName+" where (";

					for(i in damage_values)
					{
						if(i == (damage_values.length-1))
						{
							query = query + Label_frequency.attributes.class_label.columnName+"='"+damage_values[i]+"'";
						}
						else
						{
							query = query + Label_frequency.attributes.class_label.columnName+"='"+damage_values[i]+"' or ";
						}
					}
					query = query + ") and "+Label_frequency.attributes.code.columnName+"='"
					+req.param('collection')+"' order by "+Label_frequency.attributes.date.columnName+","
					+Label_frequency.attributes.hour.columnName+","
					+Label_frequency.attributes.minute.columnName+";";

					Label_frequency.query(query,function(err, records){
						if(err)
						{
							sails.log.error("Error name: "+err.name+"	"+"Error code: "+err.code);
							return res.serverError(err);
						}
						else
						{
							sails.log.info("Image Damage Class data retrieved, passing to view");
							res.send({damage_data: records.rows});
						}
					});
				}
			}
		);
	},
	retrieveAll: function(req, res){
		let collection;
		if(req.param('name') == undefined)
		{
			collection = req.param('collection');
		}
		else
		{
			collection = (_.invert(User.collectionNames))[req.param('name')];
		}
		var queries = {
		  minute: "/"+DataControllerInfo.model+"/"
		  +DataControllerInfo.methods['minute_wise']
	    +"?collection="+collection,

	    hour: "/"+DataControllerInfo.model+"/"
	    +DataControllerInfo.methods['hour_wise']
	    +"?collection="+collection,

	    day: "/"+DataControllerInfo.model+"/"
	    +DataControllerInfo.methods['day_wise']
	    +"?collection="+collection,

	    label: "/"+DataControllerInfo.model+"/"
	    +DataControllerInfo.methods['label_wise']
	    +"?collection="+collection,

	    class: "/"+DataControllerInfo.model+"/"
	    +DataControllerInfo.methods['class_wise']
	    +"?collection="+collection,

	    sentiment: "/"+DataControllerInfo.model+"/"
	    +DataControllerInfo.methods['sentiment_wise']
	    +"?collection="+collection,

	    damage: "/"+DataControllerInfo.model+"/"
	    +DataControllerInfo.methods['damage_wise']
	    +"?collection="+collection,
		};

		res.view('argde/mySocket', { queries: queries });
	},
};
