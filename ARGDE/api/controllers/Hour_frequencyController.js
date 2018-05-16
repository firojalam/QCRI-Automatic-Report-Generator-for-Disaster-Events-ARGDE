/**
 * Hour_frequencyController
 *
 * @description :: Server-side logic for managing hour_frequencies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
 var argdeController = require('./ArgdeController');
module.exports = {
	createPreHours: function(params){
		//params.forEach((elem)=>{console.log(elem);});
		//res.ok();
		//console.log(params);
		if(params['diff'].days!=undefined)
		{
			console.log("Hello World");
		}
		else
		{
			var year = params['min'].getFullYear();
			var month = params['min'].getMonth()+1;
			var day = params['min'].getDate();
			var _date_without_time = String(year)+"-"+String(month)+"-"+String(day);
			var _date = _date_without_time + " 00:00:00";
			var query_p1 = "select count(updated_at) from twitter_data_feed where updated_at >= timestamp '"+_date+"'+interval '";
			var query_p2 = " and updated_at< timestamp '"+_date+"'+interval '";
			for(let i=1; i<=24; i++)
			{
				sql_query = query_p1+(i-1)+" hours'"+query_p2+i+" hours';";
				console.log(sql_query);
				Argde.query(sql_query,function(err, result){
					if(err)
					{
						console.log("Error name: "+err.name);
						console.log("Error code: "+err.code);
					}
					let _hour = String(i-1) + ":00:00"
					Hour_frequency.query("insert into hour_frequency values('"+_date_without_time+"','"+_hour+"',"+result.rows[0].count+",'"+params['collection']+"');",function(err, retValue){
						if(err)
						{
							console.log(err);
							console.log("Error name: "+err.name);
							console.log("Error code: "+err.code);
						}
						else
						{
							console.log("OK. No errors.")
						}
					});
					//console.log((i-1)+": "+result.rows[0].count);
					//console.log("Current val: "+resultList[index]);
					//console.log(resultList);
				});
			}
		}
	},
		// console.log("MINIMUM:");
		// console.log(params['min']);
		// console.log("MAXIMUM:");
		// console.log(params['max'].getHours());
		// console.log(params['max'].getMinutes());
		// console.log(params['max'].getSeconds());
		// console.log("DIFFERENCE:");
		// console.log(params['diff']);
};
