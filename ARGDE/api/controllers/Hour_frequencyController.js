module.exports = {
	createPreHours: function(params){
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
    for(let i=1; i<=24*(params['diff']+1); i++)
    {
      sql_query = query_p1+(i-1)+" hours'"+query_p2+i+" hours' and "+Argde.attributes.code.columnName+"='"
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
          Argde.query("select date(date '"+_date_without_time+"'+interval '"+(i-1)+" hours');",
					function(_err, newDate){
            if(err)
            {
              console.log("Error name: "+_err.name);
              console.log("Error code: "+_err.code);
            }
            let _hour = String((i-1)%24) + ":00:00";
            date_val = newDate.rows[0]['?column?'];
						Hour_frequency.query("update "+Hour_frequency.tableName+" set "
						+Hour_frequency.attributes.frequency.columnName+"="+result.rows[0].count+" where "
						+Hour_frequency.attributes.date.columnName+"='"+_date_without_time+"' and "
						+Hour_frequency.attributes.hour.columnName+"='"+_hour+"' and "
						+Hour_frequency.attributes.code.columnName+"='"+params['collection']+"';insert into "
						+Hour_frequency.tableName+" select'"+_date_without_time+"','"+_hour+"',"+result.rows[0].count
						+",'"+params['collection']+"' where not exists(select 1 from "+Hour_frequency.tableName+" where "
						+Hour_frequency.attributes.date.columnName+"='"+_date_without_time+"' and "
						+Hour_frequency.attributes.hour.columnName+"='"+_hour+"' and "
						+Hour_frequency.attributes.code.columnName+"='"
						+params['collection']+"');",function(err, retValue){
	            flag = false;
	            if(err)
							{
								console.log("Error name: "+err.name);
								console.log("Error code: "+err.code);
							}
							else
							{
								console.log("Hour-wise: OK. No errors.");
							}
						});
          });
        }
      });
    }
	},
};
