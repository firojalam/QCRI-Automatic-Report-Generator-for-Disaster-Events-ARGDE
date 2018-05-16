/**
 * ArgdeController
 *
 * @description :: Server-side logic for managing argdes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
 var hourController = require('./Hour_frequencyController');

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
	day_wise: async function(req, res){
		await Argde.count({updatedAt: {'>': req.param('start'),'<': req.param('end')}}).exec(function(err, sum){
			if(err)
			{
				return res.serverError(err);
			}
			// console.log(req.param('start'));
			res.redirect(302,'/day_frequency/createDay?date='+req.param('start').substring(0,10)+'&frequency='+sum);
		});
	},
	showExtreme: function(req, res){
		var min_date;
		var max_date;
		var date_diff;
		var paramList;
		Argde.query('select min(updated_at) from twitter_data_feed;',function(err, result){
			if(err)
			{
				res.serverError(err);
			}
			min_date = new Date(result.rows[0].min);
			// console.log('MIN START');
			// console.log(min_date.getHours());
			// console.log(min_date.getMinutes());
			// console.log(min_date.getSeconds());
			// console.log(min_date.getFullYear());
			// console.log(min_date.getMonth()+1); //1 is added because returned values start from 0
			// console.log(min_date.getDate());
			// console.log('MIN END');


			//var date_obj = String(year)+"-"+String(month)+"-"+String(day);
			//console.log(date_obj);

			/*command to count the number of entries in a given date:
			select count(updated_at) from twitter_data_feed where updated_at::date = '2018-05-07 00:00:00.000'::date;
			*/

			/*command to count the number of entries in a given hour:
			select count(updated_at) from twitter_data_feed where updated_at >= timestamp '2018-05-08 14:00:00.000' and updated_at< timestamp '2018-05-08 14:00:00.000'+interval '1 hour';
			*/

			//res.redirect(302,'/day_frequency/createDay?date='+date_obj+'&frequency='+1);
			Argde.query('select max(updated_at) from twitter_data_feed;',function(err, result){
				max_date = new Date(result.rows[0].max);
				// console.log('MAX START');
				// console.log(max_date.getHours());
				// console.log(max_date.getMinutes());
				// console.log(max_date.getSeconds());
				// console.log(max_date.getFullYear());
				// console.log(max_date.getMonth()+1); //1 is added because returned values start from 0
				// console.log(max_date.getDate());
				// console.log('MAX END');
				// console.log('DIFF:');
				// console.log(max_date-min_date);
				Argde.query("select max(updated_at)-min(updated_at) from twitter_data_feed where code='"+req.param('collection')+"';",function(err, result){

					// console.log('DIFFERENCE START');
					// console.log(result);
					//console.log(result.rows[0]['?column?']);
					date_diff = result.rows[0]['?column?'];
					// console.log('DIFFERENCE END');
					paramList={'min':min_date, 'max':max_date, 'diff':date_diff, 'collection': req.param('collection')};
					//paramList['0']=min_date;//, max_date, date_diff];
					// console.log("The type: ");
					// console.log(typeof(paramList));
					// console.log('The values:');
					// console.log(paramList);

					hourController.createPreHours(paramList);
				});
			});
		});



	}
};
