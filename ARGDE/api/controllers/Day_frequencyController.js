module.exports = {
	createPreDays: function(params){
		var year = params['min'].getFullYear();
		var month = params['min'].getMonth()+1;
		var day = params['min'].getDate();
		var _date_without_time = String(year)+"-"+String(month)+"-"+String(day);
		var _date = _date_without_time + " 00:00:00";
		for(let i=1; i<=(params['diff']+1); i++)
		{
			Argde.query("select count("+Argde.attributes.updatedAt.columnName+") from "+Argde.tableName+" where "
			+Argde.attributes.updatedAt.columnName+">=date '"+_date_without_time+"'+interval '"+(i-1)+" days' and "
			+Argde.attributes.updatedAt.columnName+"<date '"+_date_without_time+"'+interval '"+i+" days' and "
			+Argde.attributes.code.columnName+"='"+params['collection']+"';",function(err, result){
				if(err)
				{
					console.log("Error name: "+err.name);
					console.log("Error code: "+err.code);
				}
				else
				{
					Day_frequency.query("update "+Day_frequency.tableName+" set "
					+Day_frequency.attributes.frequency.columnName+"="+result.rows[0].count+" where "
					+Day_frequency.attributes.date.columnName+"='"+_date_without_time+"' and "
					+Day_frequency.attributes.code.columnName+"='"+params['collection']+"';	insert into "
					+Day_frequency.tableName+" select '"+_date_without_time+"',"+result.rows[0].count+",'"
					+params['collection']+"' where not exists(select 1 from "+Day_frequency.tableName+" where "
					+Day_frequency.attributes.date.columnName+"='"+_date_without_time+"' and "
					+Day_frequency.attributes.code.columnName+"='"+params['collection']+"');",function(err, retVal){
						if(err)
						{
							console.log("Error name: "+err.name);
							console.log("Error code: "+err.code);
						}
						else
						{
							console.log("Day-wise: OK. No errors.");
						}
					});
				}
			});
		}
	}
};
