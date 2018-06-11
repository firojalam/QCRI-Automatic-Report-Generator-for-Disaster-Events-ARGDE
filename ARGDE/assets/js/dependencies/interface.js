var sockets = {
  minute: io.sails.connect(),
  hour: io.sails.connect(),
  day: io.sails.connect(),
  label: io.sails.connect(),
  class: io.sails.connect(),
  sentiment: io.sails.connect(),
  damage: io.sails.connect(),
};
var allData = {
  minute_data: null,
  hour_data: null,
  day_data: null,
  label_data: null,
  class_data: null,
  sentiment_data: null,
  damage_data: null,
};
var graphType = {
  class: 'stacked-bar',
  sentiment: 'stacked-bar',
};
var charts = {
  class_chart: null,
  sentiment_chart: null,
};
function data()
{
  sockets.minute.get(queries['minute'], function(data, json_obj){
    allData.minute_data = data['minute_data'];
  });
  sockets.hour.get(queries['hour'], function(data, json_obj){
    allData.hour_data = data['hour_data'];
  });
  sockets.day.get(queries['day'], function(data, json_obj){
    allData.day_data = data['day_data'];
  });
  sockets.label.get(queries['label'], function(data, json_obj){
    allData.label_data = data['label_data'];
  });
  sockets.class.get(queries['class'], function(data, json_obj){
    allData.class_data = data['class_data'];
    classGraph();
  });
  sockets.sentiment.get(queries['sentiment'],function(data, json_obj){
    allData.sentiment_data = data['sentiment_data'];
    sentimentGraph();
  });
  sockets.damage.get(queries['damage'],function(data, json_obj){
    allData.damage_data = data['damage_data'];
  });
}
function classGraph()
{
  var freqData = [];
  var clData = [];
  var minData = [];
  var hourData = [];
  var dateData = [];
  var monthData = [];
  var yearData = [];
  var data = [];
  var ldat;
  allData.class_data.forEach(function(entry){
    var fdat = (Number(entry.frequency));
    freqData = freqData.concat(fdat);
    ldat = String(entry.class_label);
    var class_str  = ldat.toString();
    clData = clData.concat(ldat);
    var mdat = String(entry.minute);
    minData = minData.concat(mdat);
    var hdat = String(entry.hour).substr(0,2);
    hourData = hourData.concat(hdat);
    var ddat = new Date(entry.date);
    var date = String(ddat.getDate());
    var year = String(ddat.getFullYear());
    var month = Number(ddat.getMonth());
    var newMonth = month + 1;
    var newMon = String(newMonth);
    dateData = dateData.concat(date);
    monthData = monthData.concat(newMon);
    yearData = yearData.concat(year);
   });

  for(i in freqData)
  {
    var timeStamp;
    if(minData[i]<10)
    {
      timeStamp = String(hourData[i]) + ":0" + String(minData[i]);
    }
    else
    {
      timeStamp = String(hourData[i]) + ":" + String(minData[i]);
    }
    var dateStamp = String(yearData[i])+"-"+String(Number(monthData[i]))+"-"+String(dateData[i]) +", "+timeStamp;
    var d = new Date(Number(yearData[i]), Number(monthData[i]), Number(dateData[i]));
    var formatFreq = Number(freqData[i]);
    if(clData[i] == "infrastructure_and_utilities_damage"){
      clData[i] =  "Infrastructure and Utilities Damage";
    } else if(clData[i] == "caution_and_advice"){
      clData[i] = "Caution and Advice";
    } else if(clData[i] == "displaced_and_evacuations"){
      clData[i] = "Displaced and Evacuations";
    } else if(clData[i] == "affected_individual"){
      clData[i] = "Affected Individuals";
    } else if(clData[i] == "donation_and_volunteering"){
      clData[i] = "Donation and Volunteering";
    } else if(clData[i] == "missing_and_found_people"){
      clData[i] = "Missing and Found People";
    } else if(clData[i] == "injured_or_dead_people"){
      clData[i] = "Injured or Dead People";
    } else if(clData[i] == "sympathy_and_support"){
      clData[i] = "Sympathy and Support";
    } else if(clData[i] == "relevant_information"){
      clData[i] = "Relevant Information";
    } else if(clData[i] == "not_related_or_irrelevant"){
      clData[i] = "Not Related or Irrelevant";
    } else if(clData[i] == "response_efforts"){
      clData[i] = "Response Efforts";
    } else if(clData[i] == "personal"){
      clData[i] = "Personal";
    }
    data[i] = {date: dateStamp, frequency: formatFreq ,label: clData[i]};
  };
  var class_graph_type = 'stacked-bar';
  charts.class_chart = new tauCharts.Chart({
      data: data,
      type: graphType['class'],
      x: 'date',
      y: 'frequency',
      color: 'label',
      guide: {
        y:{
          label: 'Frequency',
        },
        color: {
          brewer: {
            'Injured or Dead People': '#824d3b',
            'Donation and Volunteering': '#8e48a0',
            'Not Related or Irrelevant' : '#000000' ,
            'Response Efforts': '#8081d9',
            'Sympathy and Support': '#38ad01',
            'Personal': '#4289f4',
            'Relevant Information': '#bdf0fc',
            'Displaced and Evacuations': '#a5af33',
            'Caution and Advice': '#ffb600',
            'Affected Individuals': '#da96e8',
            'Infrastructure and Utilities Damage': '#b20000',
            'Missing and Found People': '#595959'
          }
        }
      },
      plugins: [
          tauCharts.api.plugins.get('tooltip')(),
          tauCharts.api.plugins.get('legend')({'position': 'left'}),
          tauCharts.api.plugins.get('floating-axes')(),
      ],
  });
  charts.class_chart.renderTo('#ClassChart',{width: 4500, height:600});
}

function sentimentGraph()
{
  var final_data = [];
  var obj;
  var date;
  var year;
  var month;
  var day;
  var hour;
  var minute;
  var time;
  allData.sentiment_data.forEach(function(sentiment)
  {
    obj = sentiment;
    date = new Date(obj.date);
    year = date.getFullYear();
    month = date.getMonth()+1;
    day = date.getDate();
    hour = obj.hour.substr(0,2);
    if(obj.minute < 10)
    {
      minute = "0"+String(obj.minute);
    }
    else
    {
      minute = obj.minute;
    }
    obj.sentiment = obj.class_label;
    obj.frequency = Number(obj.frequency);
    obj.compiled_time = String(year)+"-"+String(month)+"-"+String(day)+", "+hour+":"+String(minute);
    final_data.push(obj);
  });
  charts.sentiment_chart = new tauCharts.Chart({
              data: final_data,
              type: graphType['sentiment'],
              x: 'compiled_time',
              y: 'frequency',
              color: 'sentiment',
              guide:{
                x:{label: 'Minute'},
                y:{label: 'Frequency'},
                color:{
                  brewer:
                  {
                    'Very positive':'#0f0',
                    'Positive':'#00f',
                    'Neutral':'#666',
                    'Negative':'#fc8d59',
                    'Very negative':'#f00',
                  }
                },
              },
              plugins: [
                tauCharts.api.plugins.get('legend')({position: 'left'}),
                tauCharts.api.plugins.get('tooltip')({fields: ['compiled_time','frequency']}),
                tauCharts.api.plugins.get('floating-axes')(),
              ],
          });
  charts.sentiment_chart.renderTo('#SentimentChart',{width: 4500, height:600});
}

function toggle_graph_type(type, graph)
{
  switch(graph)
  {
    case 'class':
        graphType[graph] = type;
        charts.class_chart.destroy();
        classGraph();
        break;
    case 'sentiment':
        graphType[graph] = type;
        charts.sentiment_chart.destroy();
        sentimentGraph();
        break;
    default:
        window.alert("Graph does not exist!");
        break;
  }
}

function toggle_graph_res(res, graph)
{
  window.alert(res+"-wise");
}
