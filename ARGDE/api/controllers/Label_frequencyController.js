module.exports = {
	createPreLabels: function(params){
		var class_names = ['caution_and_advice','injured_or_dead_people','affected_individual','personal',
		'missing_and_found_people','displaced_and_evacuations','not_related_or_irrelevant','relevant_information',
		'sympathy_and_support','response_efforts','donation_and_volunteering','infrastructure_and_utilities_damage'];
		var sentiment_values = ['Negative','Very negative','Positive','Neutral','Very positive'];
		var year = params['min'].getFullYear();
		var month = params['min'].getMonth()+1;
		var day = params['min'].getDate();
		var _date_without_time = String(year)+"-"+String(month)+"-"+String(day);
    var _date = _date_without_time + " 00:00:00";
    var date_val;
		var query_p1 = "select count("+Argde.attributes.updatedAt.columnName+") from "+Argde.tableName+" where "
		+Argde.attributes.updatedAt.columnName+" >= timestamp '"+_date+"'+interval '";
		var query_p2 = " and "+Argde.attributes.updatedAt.columnName+"< timestamp '"+_date+"'+interval '";
    var sql_query;
    for(let i=1; i<=1440*(params['diff']+1); i++)
    {
      sql_query = query_p1+(i-1)+" minutes'"+query_p2+i+" minutes' and "+Argde.attributes.code.columnName+"='"
			+params['collection']+"';";
      Argde.query(sql_query,function(err, result){
				if(err)
				{
					console.log("Error name: "+err.name);
					console.log("Error code: "+err.code);
				}
        else
        {
          date_val = _date;
					let query = "select date(date '"+_date_without_time+"'+interval '"+(i-1)+" minutes');";
          Argde.query(query, function(_err, newDate){
            if(err)
            {
              console.log("Error name: "+_err.name);
              console.log("Error code: "+_err.code);
            }
						else
						{
							let retDate = new Date(newDate.rows[0]['date']);
							let date_part = retDate.getDate();
							let month_part = retDate.getMonth()+1;
							let year_part = retDate.getFullYear();
							date_val = String(year_part)+"-"+String(month_part)+"-"+String(date_part);
							Argde.query("select timestamp '"+_date+"'+interval '"+(i-1)+" minutes';",function(errVal, newHour){
								if(errVal)
								{
									console.log("Error name: "+errVal.name);
		              console.log("Error code: "+errVal.code);
								}
								else
								{
									let newTime = new Date(newHour.rows[0]['?column?']);
									let _hour = newTime.getHours();
									let hour_string = String(_hour)+":00:00";
									let _minute = String((i-1)%60);
									let _minute_1 = String(i%60);
									class_names.forEach(function(class_name){
										Argde.query("select count("+Argde.attributes.aidr_class_label.columnName+") from "
										+Argde.tableName+" where "+Argde.attributes.aidr_class_label.columnName+"='"
										+class_name+"' and "+Argde.attributes.updatedAt.columnName+">=(timestamp '"
										+date_val+" "+_hour+":"+_minute+":00') and "+Argde.attributes.updatedAt.columnName
										+"<(timestamp '"+date_val+" "+_hour+":"+_minute+":00'+interval '1 minutes') and "
										+Argde.attributes.code.columnName+"='"+params['collection']+"';",
										function(err,count){
											if(err)
											{
												console.log("Error1 name: "+err.name);
												console.log("Error1 code: "+err.code);
											}
											else
											{
												let _freq = count.rows[0].count;
												Label_frequency.query("update "+Label_frequency.tableName+" set "
												+Label_frequency.attributes.frequency.columnName+"="+_freq+" where "
												+Label_frequency.attributes.date.columnName+"='"+date_val+"' and "
												+Label_frequency.attributes.hour.columnName+"='"+hour_string+"' and "
												+Label_frequency.attributes.minute.columnName+"="+_minute+" and "
												+Label_frequency.attributes.class_label.columnName+"='"+class_name+"' and "
												+Label_frequency.attributes.code.columnName+"='"+params['collection']+"';insert into "
												+Label_frequency.tableName+" select '"+date_val+"','"+hour_string+"',"+_minute+",(date '"
												+date_val+"'- date '"+String(params['min'].getDate())+"-"
												+String((params['min'].getMonth()+1))+"-"+String(params['min'].getFullYear())+"')+1,'"
												+class_name+"',"+_freq+",'"+params['collection']+"' where not exists(select 1 from "
												+Label_frequency.tableName+" where "
												+Label_frequency.attributes.date.columnName+"='"+date_val+"' and "
												+Label_frequency.attributes.hour.columnName+"='"+hour_string+"' and "
												+Label_frequency.attributes.minute.columnName+"="+_minute+" and "
												+Label_frequency.attributes.class_label.columnName+"='"+class_name+"' and "
												+Label_frequency.attributes.code.columnName+"='"+params['collection']+"');",
												function(err, retVal){
													if(err)
													{
														console.log("Error name: "+err.name);
														console.log("Error code: "+err.code);
													}
													else
													{
														console.log("Label-wise: OK. No errors.");
													}
												});
											}
										});
									});
									sentiment_values.forEach(function(value){
										Argde.query("select count("+Argde.attributes.sentiment.columnName+") from "
										+Argde.tableName+" where "+Argde.attributes.sentiment.columnName+"='"
										+value+"' and "+Argde.attributes.updatedAt.columnName+">=(timestamp '"
										+date_val+" "+_hour+":"+_minute+":00') and "+Argde.attributes.updatedAt.columnName
										+"<(timestamp '"+date_val+" "+_hour+":"+_minute+":00'+interval '1 minutes') and "
										+Argde.attributes.code.columnName+"='"+params['collection']+"';",
										function(err,count){
											if(err)
											{
												console.log("Error name: "+err.name);
												console.log("Error code: "+err.code);
											}
											else
											{
												let _freq = count.rows[0].count;
												Label_frequency.query("update "+Label_frequency.tableName+" set "
												+Label_frequency.attributes.frequency.columnName+"="+_freq+" where "
												+Label_frequency.attributes.date.columnName+"='"+date_val+"' and "
												+Label_frequency.attributes.hour.columnName+"='"+hour_string+"' and "
												+Label_frequency.attributes.minute.columnName+"="+_minute+" and "
												+Label_frequency.attributes.class_label.columnName+"='"+value+"' and "
												+Label_frequency.attributes.code.columnName+"='"+params['collection']+"';insert into "
												+Label_frequency.tableName+" select '"+date_val+"','"+hour_string+"',"+_minute+",(date '"
												+date_val+"'- date '"+String(params['min'].getDate())+"-"
												+String((params['min'].getMonth()+1))+"-"+String(params['min'].getFullYear())+"')+1,'"
												+value+"',"+_freq+",'"+params['collection']+"' where not exists(select 1 from "
												+Label_frequency.tableName+" where "
												+Label_frequency.attributes.date.columnName+"='"+date_val+"' and "
												+Label_frequency.attributes.hour.columnName+"='"+hour_string+"' and "
												+Label_frequency.attributes.minute.columnName+"="+_minute+" and "
												+Label_frequency.attributes.class_label.columnName+"='"+value+"' and "
												+Label_frequency.attributes.code.columnName+"='"+params['collection']+"');",
												function(err, retVal){
													if(err)
													{
														console.log("Error name: "+err.name);
														console.log("Error code: "+err.code);
													}
													else
													{
														console.log("Label-wise: OK. No errors.");
													}
												});
											}
										});
									});
								}
							});
						}
          });
        }
      });
    }
		// insert into relevency_frequency select date(updated_at),sentiment,date(updated_at)-date(min(updated_at))+1,
		//count(sentiment),code from twitter_data_feed where sentiment is not NULL group by date(updated_at),sentiment,
		//code;
		// insert into relevency_frequency select date(updated_at),aidr_class_label,
		//date(updated_at)-date(min(updated_at))+1,count(aidr_class_label),
		//code from twitter_data_feed where aidr_class_label is not NULL group by date(updated_at),
		//aidr_class_label,code;
	},
};
