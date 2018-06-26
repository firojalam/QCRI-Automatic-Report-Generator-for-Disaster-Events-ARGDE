var sockets = {
  minute: io.sails.connect(),
  hour: io.sails.connect(),
  day: io.sails.connect(),
  label: io.sails.connect(),
  class: io.sails.connect(),
  sentiment: io.sails.connect(),
  relevancy: io.sails.connect(),
  damage: io.sails.connect(),
  tweets: io.sails.connect(),
};
var allData = {
  minute_data: null,
  hour_data: null,
  day_data: null,
  label_data: null,
  class_data: null,
  sentiment_data: null,
  relevancy_data: null,
  damage_data: null,
};
var tweet_texts = {
  class: null,
  sentiment: null,
  frequency: null,
  relevancy: null,
  damage: null,

};
var tweet_images = {
  class: null,
  sentiment: null,
  frequency: null,
  relevancy: null,
  damage: null,
};
var defaultGraphType = {
  class: 'stacked-bar',
  sentiment: 'stacked-bar',
  frequency: 'bar',
  relevancy: 'line',
  damage: 'stacked-bar',
};
var graphType = {
  class: 'stacked-bar',
  sentiment: 'stacked-bar',
  frequency: 'bar',
  relevancy: 'line',
  damage: 'stacked-bar',
};
var defaultGraphRes = {
  class: 'minute',
  sentiment: 'minute',
  frequency: 'minute',
  relevancy: 'minute',
  damage: 'minute',
}
var graphRes = {
  class: 'minute',
  sentiment: 'minute',
  frequency: 'minute',
  relevancy: 'minute',
  damage: 'minute',
}
var charts = {
  class: null,
  sentiment: null,
  frequency: null,
  relevancy: null,
  damage: null,
};
var chartDimensions = {
  class: { width: 4500, height: 600 },
  sentiment: { width: 4500, height: 600 },
  frequency: { width: 4500, height: 600 },
  relevancy: { width: 4500, height: 600 },
  damage: { width: 4500, height: 600 },
};
var generate = {
  class: null,
  sentiment: null,
  frequency: null,
  relevancy: null,
  damage: null,
};
function data()
{
  sockets.minute.get(queries['minute'], function(data, json_obj){
    allData.minute_data = data['minute_data'];
    generate.frequency(graphRes.frequency);
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
    generate.class(graphRes.class);
  });
  sockets.sentiment.get(queries['sentiment'],function(data, json_obj){
    allData.sentiment_data = data['sentiment_data'];
    generate.sentiment(graphRes.sentiment);
  });
  sockets.relevancy.get(queries['relevancy'],function(data, json_obj){
    allData.relevancy_data = data['relevancy_data'];
    generate.relevancy(graphRes.relevancy);
  });
  sockets.damage.get(queries['damage'],function(data, json_obj){
    allData.damage_data = data['damage_data'];
    generate.damage(graphRes.damage);
  });
}

generate.class = function(res)
{
  var freqData = [];
  var clData = [];
  var minData = [];
  var hourData = [];
  var dateData = [];
  var monthData = [];
  var yearData = [];
  var data = [];
  var day = [];
  var ldat;
  var code = [];

  allData.class_data.forEach(function(entry){
    var dayNum = (Number(entry.day));
    day = day.concat(dayNum);
    var fdat = (Number(entry.frequency));
    freqData = freqData.concat(fdat);
    ldat = String(entry.class_label);
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
    switch(res)
    {
      case 'minute':
            if(minData[i]<10)
            {
              timeStamp = String(hourData[i]) + ":0" + String(minData[i]);
            }
            else
            {
              timeStamp = String(hourData[i]) + ":" + String(minData[i]);
            }
            break;
      case 'hour':
            timeStamp = String(hourData[i]) + ":00";
            break;

      case 'day' :
            timeStamp = "Day: "+day[i];
            break;

      default:
            if(minData[i]<10)
            {
              timeStamp = String(hourData[i]) + ":0" + String(minData[i]);
            }
            else
            {
              timeStamp = String(hourData[i]) + ":" + String(minData[i]);
            }
            break;
    }
    var dateStamp = String(yearData[i])+"-"+String(Number(monthData[i]))+"-"+String(dateData[i]) +", "+timeStamp;
    var formatFreq = Number(freqData[i]);
    var niceLabel = labelize(clData[i]);
    var notNiceLabel = unlabelize(niceLabel);
    let temp = {date: dateStamp, frequency: formatFreq ,label: niceLabel};
    let flag = false;
    data = data.map(function(datum){
      if((temp.date == datum.date) && (temp.label == datum.label))
      {
        datum.frequency += temp.frequency;
        flag = true;
        return datum;
      }
      else
      {
        return datum;
      }
    });
    if(flag == false)
    {
      data.push(temp);
    }
  };

  for(i in data)
  {
    data[i].code = allData.class_data[0].code;
  }

  charts.class = new tauCharts.Chart({
      data: data,
      autoResize: false,
      type: graphType['class'],
      x: 'date',
      y: 'frequency',
      color: 'label',
      settings:{
        asyncRendering: true,
      },
      guide: {
        x:{
          label: 'Minute'
        },
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
          tauCharts.api.plugins.get('tooltip')({fields: ['date','frequency']}),
          tauCharts.api.plugins.get('exportTo')({
             cssPaths:['https://cdn.jsdelivr.net/taucharts/latest/tauCharts.min.css']
          }),
          tauCharts.api.plugins.get('legend')({'position': 'left'}),
          tauCharts.api.plugins.get('floating-axes')(),
      ],
  });

  switch(res)
  {
    case 'minute':
      chartDimensions.class.width = 4500;
      chartDimensions.class.height = 600;
      break;

    case 'hour':
      chartDimensions.class.width = 1550;
      chartDimensions.class.height = 600;
      break;

    case 'day' :
      chartDimensions.class.width = 1550;
      chartDimensions.class.height = 600;
      break;
  }

  charts.class.renderTo('#ClassChart',{width: chartDimensions.class.width, height: chartDimensions.class.height});
  charts.class.on('elementclick' , function (chartRef, e){
    let packet = {filter: 'class', resolution: res, code: e.data.code, res_value: e.data.date, value: e.data.label};
    sockets.tweets.get(queries['tweets'], function(data, json_obj){
      tweet_texts.class = data['texts'];
      tweet_images.class = data['images'];
    });
  });
}

generate.frequency = function(res)
{
  var freqData = [];
  var minData = [];
  var hourData = [];
  var dateData = [];
  var monthData = [];
  var yearData = [];
  var data = [];

  allData.minute_data.forEach(function(entry){
    freqData = freqData.concat(Number(entry.frequency));
    minData = minData.concat(String(entry.minute));
    hourData = hourData.concat(String(entry.hour).substr(0,2));
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
    switch(res)
    {
      case 'minute':
            if(minData[i]<10)
            {
              timeStamp = ", "+String(hourData[i]) + ":0" + String(minData[i]);
            }
            else
            {
              timeStamp = ", "+String(hourData[i]) + ":" + String(minData[i]);
            }
            break;
      case 'hour':
            timeStamp = ", "+String(hourData[i]) + ":00";
            break;

      case 'day' :
            timeStamp = "";
            break;

      default:
            if(minData[i]<10)
            {
              timeStamp = ", "+String(hourData[i]) + ":0" + String(minData[i]);
            }
            else
            {
              timeStamp = ", "+String(hourData[i]) + ":" + String(minData[i]);
            }
            break;
    }
    var dateStamp = String(yearData[i])+"-"+String(Number(monthData[i]))+"-"+String(dateData[i]) + timeStamp;
    var formatFreq = Number(freqData[i]);
    let temp = {date: dateStamp, frequency: formatFreq};
    let flag = false;
    data = data.map(function(datum){
      if((temp.date == datum.date))
      {
        datum.frequency += temp.frequency;
        flag = true;
        return datum;
      }
      else
      {
        return datum;
      }
    });
    if(flag == false)
    {
      data.push(temp);
    }
  };

  for(i in data)
  {
    data[i].code = allData.minute_data[0].code;
  }

  charts.frequency = new tauCharts.Chart({
      data: data,
      autoResize: false,
      type: graphType['frequency'],
      x: 'date',
      y: 'frequency',
      settings:{
          asyncRendering: true,
      },
      guide: {
        x:{
          label: 'Time'
        },
        y:{
          label: 'Frequency',
        },
        color:{
          brewer: ['#33aa33',],
        }
      },
      plugins: [
          tauCharts.api.plugins.get('tooltip')({fields: ['date','frequency']}),
          tauCharts.api.plugins.get('exportTo')({
             cssPaths:['https://cdn.jsdelivr.net/taucharts/latest/tauCharts.min.css']
          }),
          tauCharts.api.plugins.get('floating-axes')(),
          tauCharts.api.plugins.get('legend')({position: 'left'}),
      ],
  });

  switch(res)
  {
    case 'minute':
      chartDimensions.frequency.width = 4500;
      chartDimensions.frequency.height = 600;
      break;

    case 'hour':
      chartDimensions.frequency.width = 1550;
      chartDimensions.frequency.height = 600;
      break;

    case 'day' :
      chartDimensions.frequency.width = 1550;
      chartDimensions.frequency.height = 600;
      break;
  }

  charts.frequency.renderTo('#FrequencyChart',{width: chartDimensions.frequency.width, height: chartDimensions.frequency.height});
  charts.frequency.on('elementclick' , function (chartRef, e){
    let packet = {filter: 'frequency', resolution: res, code: e.data.code, res_value: e.data.date, value: "None"};
    sockets.tweets.get(queries['tweets'], function(data, json_obj){
      tweet_texts.frequency = data['texts'];
      tweet_images.frequency = data['images'];
    });
  });
}

generate.sentiment = function(res)
{
  let final_data = [];
  let datacopy;
  let obj;
  let date;
  let year;
  let month;
  let day;
  let hour;
  let minute;
  let time;
  datacopy = allData.sentiment_data.slice();
  datacopy.forEach(function(sentiment)
  {
    obj = Object.assign({},sentiment);
    date = new Date(obj.date);
    year = date.getFullYear();
    month = date.getMonth()+1;
    day = date.getDate();
    hour = obj.hour.substr(0,2);
    obj.sentiment = obj.class_label;
    switch(res)
    {
      case 'minute':
          if(obj.minute < 10)
          {
            minute = "0"+String(obj.minute);
          }
          else
          {
            minute = obj.minute;
          }
          obj.frequency = Number(obj.frequency);
          obj.compiled_time = String(year)+"-"+String(month)+"-"+String(day)+", "+hour+":"+String(minute);
          final_data.push(obj);
          break;

      case 'hour':
          var flag = false;
          obj.compiled_time = String(year)+"-"+String(month)+"-"+String(day)+", "+hour+":00";
          obj.frequency = Number(obj.frequency);
          final_data = final_data.map(function(datum){
            if((obj.compiled_time==datum.compiled_time) && (obj.sentiment==datum.sentiment))
            {
              datum.frequency += obj.frequency;
              flag = true;
              return datum;
            }
            else
            {
              return datum;
            }
          });
          if(flag == false)
          {
            final_data.push(obj);
          }
          break;

      case 'day':
          var flag = false;
          obj.compiled_time = String(year)+"-"+String(month)+"-"+String(day);
          obj.frequency = Number(obj.frequency);
          final_data = final_data.map(function(datum){
            if((obj.compiled_time==datum.compiled_time) && (obj.sentiment==datum.sentiment))
            {
              datum.frequency += obj.frequency;
              flag = true;
              return datum;
            }
            else
            {
              return datum;
            }
          });
          if(flag == false)
          {
            final_data.push(obj);
          }
          break;

      default:
          break;
    }
  });

  charts.sentiment = new tauCharts.Chart({
              data: final_data,
              autoResize: false,
              type: graphType['sentiment'],
              x: 'compiled_time',
              y: 'frequency',
              color: 'sentiment',
              settings:{
                asyncRendering: true,
              },
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
                tauCharts.api.plugins.get('exportTo')({
                   cssPaths:['https://cdn.jsdelivr.net/taucharts/latest/tauCharts.min.css']
                }),
                tauCharts.api.plugins.get('tooltip')({fields: ['compiled_time','frequency']}),
                tauCharts.api.plugins.get('floating-axes')(),
              ],
          });

  switch(res)
  {
    case 'minute':
      chartDimensions.sentiment.width = 4500;
      chartDimensions.sentiment.height = 600;
      break;

    case 'hour':
      chartDimensions.sentiment.width = 1550;
      chartDimensions.sentiment.height = 600;
      break;

    case 'day':
      chartDimensions.sentiment.width = 1550;
      chartDimensions.sentiment.height = 600;
      break;
  }

  charts.sentiment.renderTo('#SentimentChart',{width: chartDimensions.sentiment.width, height:chartDimensions.sentiment.height});
  charts.sentiment.on('elementclick' , function (chartRef, e){
    let packet = {filter: 'sentiment', resolution: res, code: e.data.code, res_value: e.data.compiled_time, value: e.data.relevancy};
    sockets.tweets.get(queries['tweets'], function(data, json_obj){
      tweet_texts.sentiment = data['texts'];
      tweet_images.sentiment = data['images'];
    });
  });
}

generate.damage = function(res)
{
  let final_data = [];
  let datacopy;
  let obj;
  let date;
  let year;
  let month;
  let day;
  let hour;
  let minute;
  let time;
  datacopy = allData.damage_data.slice();
  datacopy.forEach(function(damage)
  {
    obj = Object.assign({},damage);
    date = new Date(obj.date);
    year = date.getFullYear();
    month = date.getMonth()+1;
    day = date.getDate();
    hour = obj.hour.substr(0,2);
    obj.damage = obj.class_label;
    switch(res)
    {
      case 'minute':
          if(obj.minute < 10)
          {
            minute = "0"+String(obj.minute);
          }
          else
          {
            minute = obj.minute;
          }
          obj.frequency = Number(obj.frequency);
          obj.compiled_time = String(year)+"-"+String(month)+"-"+String(day)+", "+hour+":"+String(minute);
          final_data.push(obj);
          break;

      case 'hour':
          var flag = false;
          obj.compiled_time = String(year)+"-"+String(month)+"-"+String(day)+", "+hour+":00";
          obj.frequency = Number(obj.frequency);
          final_data = final_data.map(function(datum){
            if((obj.compiled_time==datum.compiled_time) && (obj.damage==datum.damage))
            {
              datum.frequency += obj.frequency;
              flag = true;
              return datum;
            }
            else
            {
              return datum;
            }
          });
          if(flag == false)
          {
            final_data.push(obj);
          }
          break;

      case 'day':
          var flag = false;
          obj.compiled_time = String(year)+"-"+String(month)+"-"+String(day);
          obj.frequency = Number(obj.frequency);
          final_data = final_data.map(function(datum){
            if((obj.compiled_time==datum.compiled_time) && (obj.damage==datum.damage))
            {
              datum.frequency += obj.frequency;
              flag = true;
              return datum;
            }
            else
            {
              return datum;
            }
          });
          if(flag == false)
          {
            final_data.push(obj);
          }
          break;

      default:
          break;
    }
  });

  charts.damage = new tauCharts.Chart({
              data: final_data,
              autoResize: false,
              type: graphType['damage'],
              x: 'compiled_time',
              y: 'frequency',
              color: 'damage',
              settings:{
                asyncRendering: true,
              },
              guide:{
                x:{label: 'Minute'},
                y:{label: 'Frequency'},
                color:{
                  brewer:
                  {
                    'Severe':'#ff0000',
                    'Mild':'#f48c42',
                    'None':'#4180f4',
                  }
                },
              },
              plugins: [
                tauCharts.api.plugins.get('legend')({position: 'left'}),
                tauCharts.api.plugins.get('exportTo')({
                   cssPaths:['https://cdn.jsdelivr.net/taucharts/latest/tauCharts.min.css']
                }),
                tauCharts.api.plugins.get('tooltip')({fields: ['compiled_time','frequency']}),
                tauCharts.api.plugins.get('floating-axes')(),
              ],
          });

  switch(res)
  {
    case 'minute':
      chartDimensions.damage.width = 4500;
      chartDimensions.damage.height = 600;
      break;

    case 'hour':
      chartDimensions.damage.width = 1550;
      chartDimensions.damage.height = 600;
      break;

    case 'day':
      chartDimensions.damage.width = 1550;
      chartDimensions.damage.height = 600;
      break;
  }

  charts.damage.renderTo('#DamageChart',{width: chartDimensions.damage.width, height:chartDimensions.damage.height});
  charts.damage.on('elementclick' , function (chartRef, e) {
    let packet = {filter: 'damage', resolution: res, code: e.data.code, res_value: e.data.compiled_time, value: e.data.class_label};
    sockets.tweets.get(queries['tweets'], function(data, json_obj){
      tweet_texts.damage = data['texts'];
      tweet_images.damage = data['images'];
    });
  });

}

generate.relevancy = function(res)
{
  let final_data = [];
  let datacopy;
  let obj;
  let date;
  let year;
  let month;
  let day;
  let hour;
  let minute;
  let time;
  datacopy = allData.relevancy_data.slice();
  datacopy.forEach(function(relevancy)
  {
    obj = Object.assign({},relevancy);
    date = new Date(obj.date);
    year = date.getFullYear();
    month = date.getMonth()+1;
    day = date.getDate();
    hour = obj.hour.substr(0,2);
    obj.relevancy = obj.class_label;
    switch(obj.class_label)
    {
      case 'ir_true':
          obj.relevancy = 'True';
          break;
      case 'ir_false':
          obj.relevancy = 'False';
    }
    switch(res)
    {
      case 'minute':
          if(obj.minute < 10)
          {
            minute = "0"+String(obj.minute);
          }
          else
          {
            minute = obj.minute;
          }
          obj.frequency = Number(obj.frequency);
          obj.compiled_time = String(year)+"-"+String(month)+"-"+String(day)+", "+hour+":"+String(minute);
          final_data.push(obj);
          break;

      case 'hour':
          var flag = false;
          obj.compiled_time = String(year)+"-"+String(month)+"-"+String(day)+", "+hour+":00";
          obj.frequency = Number(obj.frequency);
          final_data = final_data.map(function(datum){
            if((obj.compiled_time==datum.compiled_time) && (obj.relevancy==datum.relevancy))
            {
              datum.frequency += obj.frequency;
              flag = true;
              return datum;
            }
            else
            {
              return datum;
            }
          });
          if(flag == false)
          {
            final_data.push(obj);
          }
          break;

      case 'day':
          var flag = false;
          obj.compiled_time = String(year)+"-"+String(month)+"-"+String(day);
          obj.frequency = Number(obj.frequency);
          final_data = final_data.map(function(datum){
            if((obj.compiled_time==datum.compiled_time) && (obj.relevancy==datum.relevancy))
            {
              datum.frequency += obj.frequency;
              flag = true;
              return datum;
            }
            else
            {
              return datum;
            }
          });
          if(flag == false)
          {
            final_data.push(obj);
          }
          break;

      default:
          break;
    }
  });

  charts.relevancy = new tauCharts.Chart({
              data: final_data,
              autoResize: false,
              type: graphType['relevancy'],
              x: 'compiled_time',
              y: 'frequency',
              color: 'relevancy',
              settings:{
                asyncRendering: true,
              },
              guide:{
                x:{label: 'Minute'},
                y:{label: 'Frequency'},
                color:{
                  brewer:
                  {
                    'True':'#4180f4',
                    'False':'#ff0000',
                  }
                },
              },
              plugins: [
                tauCharts.api.plugins.get('legend')({position: 'left'}),
                tauCharts.api.plugins.get('exportTo')({
                   cssPaths:['https://cdn.jsdelivr.net/taucharts/latest/tauCharts.min.css']
                }),
                tauCharts.api.plugins.get('tooltip')({fields: ['compiled_time','frequency']}),
                tauCharts.api.plugins.get('floating-axes')(),
              ],
          });

  switch(res)
  {
    case 'minute':
      chartDimensions.relevancy.width = 4500;
      chartDimensions.relevancy.height = 600;
      break;

    case 'hour':
      chartDimensions.relevancy.width = 1550;
      chartDimensions.relevancy.height = 600;
      break;

    case 'day':
      chartDimensions.relevancy.width = 1550;
      chartDimensions.relevancy.height = 600;
      break;
  }

  charts.relevancy.renderTo('#RelevancyChart',{width: chartDimensions.relevancy.width, height:chartDimensions.relevancy.height});
  charts.relevancy.on('elementclick' , function (chartRef, e) {
    let packet = {filter: 'relevancy', resolution: res, code: e.data.code, res_value: e.data.compiled_time, value: e.data.relevancy};
    sockets.tweets.get(queries['tweets'], function(data, json_obj){
      tweet_texts.relevancy = data['texts'];
      tweet_images.relevancy = data['images'];
    });
  });
}




$(window).resize(function() {
  clearTimeout(window.resizedFinished);
  window.resizedFinished = setTimeout(function(){
        charts.frequency.resize({width: chartDimensions.sentiment.width, height:chartDimensions.sentiment.height});
        charts.sentiment.resize({width: chartDimensions.sentiment.width, height:chartDimensions.sentiment.height});
        charts.class.resize({width: chartDimensions.class.width, height: chartDimensions.class.height});
        charts.relevancy.resize({width: chartDimensions.relevancy.width, height: chartDimensions.relevancy.height});
        charts.damage.resize({width: chartDimensions.damage.width, height: chartDimensions.damage.height});
      }, 500);
});

function labelize(str) {
   str = str.split("_").join(" ");
   var splitStr = str.toLowerCase().split(" ");
   for (var i = 0; i < splitStr.length; i++) {
        if(splitStr[i] != "and" && splitStr[i] != "or"){
          splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }
   }
   return splitStr.join(' ');
}

function unlabelize(str) {
  str = str.split(" ").join("_");
  return str.toLowerCase();
}

function toggle_graph_type(type, graph)
{
  graphType[graph] = type;
  $("#" + graph + "TypeButton").html($("#" + graphType[graph] + "." + graph + "Type").html()+" ");
  charts[graph].destroy();
  generate[graph](graphRes[graph]);
}

function toggle_graph_res(res, graph)
{
  graphRes[graph] = res;
  $("#" + graph + "ResButton").html($("#" + graphRes[graph] + "." + graph + "Res").html());
  charts[graph].destroy();
  generate[graph](graphRes[graph]);
}

function reset(graph)
{
  graphType[graph] = defaultGraphType[graph];
  $("#" + graph + "TypeButton").html($("#" + graphType[graph] + "." + graph + "Type").html());
  graphRes[graph] = defaultGraphRes[graph];
  $("#" + graph + "ResButton").html($("#" + graphRes[graph] + "." + graph + "Res").html());
  charts[graph].destroy();
  generate[graph](graphRes[graph]);
}
