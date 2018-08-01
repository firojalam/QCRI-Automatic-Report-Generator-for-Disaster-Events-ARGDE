var generate = {
  class: null,
  sentiment: null,
  frequency: null,
  relevancy: null,
  damage: null,
};

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

generate.frequency = function(res){
  let freqData = [];
  let minData = [];
  let hourData = [];
  let dateData = [];
  let monthData = [];
  let yearData = [];
  let data = [];
  let intervals = [];
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
      intervals.push(dateStamp);
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
          renderingTimeout: 500,
          syncRenderingDuration: 0,
          syncRenderingInterval: 50,
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

  intervals = Array.from(new Set(intervals));

  switch(res)
  {
    case 'minute':
      chartDimensions.frequency.width = intervals.length * 60;
      chartDimensions.frequency.height = 600;
      break;

    case 'hour':
      let hour_size = intervals.length * 60;
      if(hour_size<4500){hour_size *=10;}
      chartDimensions.frequency.width = hour_size;
      chartDimensions.frequency.height = 600;
      break;

    case 'day' :
      let day_size = intervals.length * 60;
      if(day_size<4500){day_size *=10;}
      chartDimensions.frequency.width = day_size;
      chartDimensions.frequency.height = 600;
      break;
  }

  charts.frequency.renderTo('#FrequencyChart',{width: chartDimensions.frequency.width, height: chartDimensions.frequency.height});
  charts.frequency.on('elementclick' , function (chartRef, e){
    if((Object.keys(e.data).length)/3 != 1){return;};
    let packet = {filter: 'frequency', resolution: res, code: e.data.code, res_value: e.data.date, value: "None"};
    sockets.tweets.get(queries['tweets']+'?filter='+packet['filter']+'&resolution='+packet['resolution']+'&code='+packet['code']+'&res_value='+packet['res_value']+'&value='+packet['value'], function(data, json_obj){
      tweet_texts.frequency = data['texts'];
      tweet_images.frequency = data['images'];

      displayInfoButton('frequency', packet['res_value'], '');
      showTweets('ft', 'frequency', tweet_texts.frequency);
      showImages('fi', 'frequency', tweet_images.frequency, tweet_texts.frequency);
    });
  });
}

generate.sentiment = function(res){
  let data = [];
  let datacopy;
  let obj;
  let date;
  let year;
  let month;
  let day;
  let hour;
  let minute;
  let time;
  let intervals = [];
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

    if(!color_legend.hasOwnProperty(obj.sentiment)){
      let new_color = getRandomColor();
      color_legend[obj.sentiment] = new_color;
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
          data.push(obj);
          intervals.push(obj.compiled_time);
          break;

      case 'hour':
          var flag = false;
          obj.compiled_time = String(year)+"-"+String(month)+"-"+String(day)+", "+hour+":00";
          obj.frequency = Number(obj.frequency);
          data = data.map(function(datum){
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
            data.push(obj);
            intervals.push(obj.compiled_time);
          }
          break;

      case 'day':
          var flag = false;
          obj.compiled_time = String(year)+"-"+String(month)+"-"+String(day);
          obj.frequency = Number(obj.frequency);
          data = data.map(function(datum){
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
            data.push(obj);
            intervals.push(obj.compiled_time);
          }
          break;

      default:
          break;
    }
  });

  charts.sentiment = new tauCharts.Chart({
      data: data,
      autoResize: false,
      type: graphType['sentiment'],
      x: 'compiled_time',
      y: 'frequency',
      color: 'sentiment',
      dimensions:{
        compiled_time:{

        },
        frequency:{
          type: 'measure'
        },
        sentiment:{
          order: ['Very positive', 'Positive', 'Neutral', 'Negative', 'Very Negative'],
        }
      },
      settings:{
        asyncRendering: true,
        renderingTimeout: 500,
        syncRenderingDuration: 0,
        syncRenderingInterval: 50,
      },
      guide:{
        x:{label: 'Minute'},
        y:{label: 'Frequency'},
        color:{
          brewer: color_legend
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

  intervals = Array.from(new Set(intervals));

  switch(res)
  {
    case 'minute':
      chartDimensions.sentiment.width = intervals.length * 60;
      chartDimensions.sentiment.height = 600;
      break;

    case 'hour':
      let hour_size = intervals.length * 60;
      if(hour_size<4500){hour_size *=10;}
      chartDimensions.sentiment.width = hour_size;
      chartDimensions.sentiment.height = 600;
      break;

    case 'day':
      let day_size = intervals.length * 60;
      if(day_size<4500){day_size *=10;}
      chartDimensions.sentiment.width = day_size;
      chartDimensions.sentiment.height = 600;
      break;
  }

  charts.sentiment.renderTo('#SentimentChart',{width: chartDimensions.sentiment.width, height:chartDimensions.sentiment.height});
  charts.sentiment.on('elementclick' , function (chartRef, e){
    if((Object.keys(e.data).length)/9 != 1){return;};
    let packet = {filter: 'sentiment', resolution: res, code: e.data.code, res_value: e.data.compiled_time, value: e.data.sentiment};
    sockets.tweets.get(queries['tweets']+'?filter='+packet['filter']+'&resolution='+packet['resolution']+'&code='+packet['code']+'&res_value='+packet['res_value']+'&value='+packet['value'], function(data, json_obj){
      tweet_texts.sentiment = data['texts'];
      tweet_images.sentiment = data['images'];

      displayInfoButton(packet['filter'],packet['res_value'],packet['value'])
      showTweets('st','sentiment', tweet_texts.sentiment);
      showImages('si', 'sentiment', tweet_images.sentiment, tweet_texts.sentiment);
    });
  });
}

generate.class = function(res){
  let freqData = [];
  let clData = [];
  let minData = [];
  let hourData = [];
  let dateData = [];
  let monthData = [];
  let yearData = [];
  let data = [];
  let day = [];
  let ldat;
  let code = [];
  let intervals = [];

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

    if(!color_legend.hasOwnProperty(niceLabel)){
      let new_color = getRandomColor();
      color_legend[niceLabel] = new_color;
    }

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
      intervals.push(dateStamp);
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
        renderingTimeout: 500,
        syncRenderingDuration: 0,
        syncRenderingInterval: 50,
      },
      guide: {
        x:{
          label: 'Minute'
        },
        y:{
          label: 'Frequency',
        },
        color: {
          brewer: color_legend
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

  intervals = Array.from(new Set(intervals));

  switch(res)
  {
    case 'minute':
      chartDimensions.class.width = intervals.length  * 60;
      chartDimensions.class.height = 600;
      break;

    case 'hour':
      let hour_size = intervals.length * 60;
      if(hour_size<4500){hour_size *=10;}
      chartDimensions.class.width = hour_size;
      chartDimensions.class.height = 600;
      break;

    case 'day' :
      let day_size = intervals.length * 60;
      if(day_size<4500){day_size *=10;}
      chartDimensions.class.width = day_size;
      chartDimensions.class.height = 600;
      break;
  }

  charts.class.renderTo('#ClassChart',{width: chartDimensions.class.width, height: chartDimensions.class.height});
  charts.class.on('elementclick' , function (chartRef, e){
    if((Object.keys(e.data).length)/4 != 1){return;};
    let packet = {filter: 'class', resolution: res, code: e.data.code, res_value: e.data.date, value: unlabelize(e.data.label)};
    sockets.tweets.get(queries['tweets']+'?filter='+packet['filter']+'&resolution='+packet['resolution']+'&code='+packet['code']+'&res_value='+packet['res_value']+'&value='+packet['value'], function(data, json_obj){
      tweet_texts.class = data['texts'];
      tweet_images.class = data['images'];

      displayInfoButton('class', packet['res_value'], packet['value']);
      showTweets('ct', 'class', tweet_texts.class);
      showImages('ci', 'class', tweet_images.class, tweet_texts.class);
    });
  });
}

generate.relevancy = function(res){
  let data = [];
  let datacopy;
  let obj;
  let date;
  let year;
  let month;
  let day;
  let hour;
  let minute;
  let time;
  let intervals = [];
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

    if(!color_legend.hasOwnProperty(obj.relevancy)){
      let new_color = getRandomColor();
      color_legend[obj.relevancy] = new_color;
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
          data.push(obj);
          intervals.push(obj.compiled_time);
          break;

      case 'hour':
          var flag = false;
          obj.compiled_time = String(year)+"-"+String(month)+"-"+String(day)+", "+hour+":00";
          obj.frequency = Number(obj.frequency);
          data = data.map(function(datum){
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
            intervals.push(obj.compiled_time);
            data.push(obj);
          }
          break;

      case 'day':
          var flag = false;
          obj.compiled_time = String(year)+"-"+String(month)+"-"+String(day);
          obj.frequency = Number(obj.frequency);
          data = data.map(function(datum){
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
            intervals.push(obj.compiled_time);
            data.push(obj);
          }
          break;

      default:
          break;
    }
  });

  charts.relevancy = new tauCharts.Chart({
      data: data,
      autoResize: false,
      type: graphType['relevancy'],
      x: 'compiled_time',
      y: 'frequency',
      color: 'relevancy',
      dimensions:{
        compiled_time:{

        },
        frequency:{
          type: 'measure'
        },
        relevancy:{
          order: ['True', 'False']
        }
      },
      settings:{
        asyncRendering: true,
        renderingTimeout: 500,
        syncRenderingDuration: 0,
        syncRenderingInterval: 50,
      },
      guide:{
        x:{label: 'Minute'},
        y:{label: 'Frequency'},
        color:{
          brewer: color_legend
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

  intervals = Array.from(new Set(intervals));

  switch(res)
  {
    case 'minute':
      chartDimensions.relevancy.width = intervals.length * 60;
      chartDimensions.relevancy.height = 600;
      break;

    case 'hour':
      let hour_size = intervals.length * 60;
      if(hour_size<4500){hour_size *=10;}
      chartDimensions.relevancy.width = hour_size;
      chartDimensions.relevancy.height = 600;
      break;

    case 'day':
      let day_size = intervals.length * 60;
      if(day_size<4500){day_size *=10;}
      chartDimensions.relevancy.width = day_size;
      chartDimensions.relevancy.height = 600;
      break;
  }

  charts.relevancy.renderTo('#RelevancyChart',{width: chartDimensions.relevancy.width, height:chartDimensions.relevancy.height});
  charts.relevancy.on('elementclick' , function (chartRef, e) {
    if((Object.keys(e.data).length)/9 != 1){return;}
    let packet = {filter: 'relevancy', resolution: res, code: e.data.code, res_value: e.data.compiled_time, value: e.data.relevancy.toLowerCase()};
    sockets.tweets.get(queries['tweets']+'?filter='+packet['filter']+'&resolution='+packet['resolution']+'&code='+packet['code']+'&res_value='+packet['res_value']+'&value='+packet['value'], function(data, json_obj){
      tweet_texts.relevancy = data['texts'];
      tweet_images.relevancy = data['images'];

      displayInfoButton('relevancy', packet['res_value'], packet['value']);
      showTweets('rt', 'relevancy', tweet_texts.relevancy);
      showImages('ri', 'relevancy', tweet_images.relevancy, tweet_texts.relevancy);
    });
  });
}

generate.damage = function(res){
  let data = [];
  let datacopy;
  let obj;
  let date;
  let year;
  let month;
  let day;
  let hour;
  let minute;
  let time;
  let intervals = [];
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

    if(!color_legend.hasOwnProperty(obj.damage)){
      let new_color = getRandomColor();
      color_legend[obj.damage] = new_color;
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
          data.push(obj);
          intervals.push(obj.compiled_time);
          break;

      case 'hour':
          var flag = false;
          obj.compiled_time = String(year)+"-"+String(month)+"-"+String(day)+", "+hour+":00";
          obj.frequency = Number(obj.frequency);
          data = data.map(function(datum){
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
            data.push(obj);
            intervals.push(obj.compiled_time);
          }
          break;

      case 'day':
          var flag = false;
          obj.compiled_time = String(year)+"-"+String(month)+"-"+String(day);
          obj.frequency = Number(obj.frequency);
          data = data.map(function(datum){
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
            intervals.push(obj.compiled_time);
            data.push(obj);
          }
          break;

      default:
          break;
    }
  });

  charts.damage = new tauCharts.Chart({
      data: data,
      autoResize: false,
      type: graphType['damage'],
      x: 'compiled_time',
      y: 'frequency',
      color: 'damage',
      dimensions: {
        compiled_time:{

        },
        frequency:{
          type: 'measure'
        },
        damage:{
          order: ['Severe', 'Mild', 'None']
        }
      },
      settings:{
        asyncRendering: true,
        renderingTimeout: 500,
        syncRenderingDuration: 0,
        syncRenderingInterval: 50,
      },
      guide:{
        x:{label: 'Minute'},
        y:{label: 'Frequency'},
        color:{
          brewer: color_legend
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

  intervals = Array.from(new Set(intervals));

  switch(res)
  {
    case 'minute':
      chartDimensions.damage.width = intervals.length * 60;
      chartDimensions.damage.height = 600;
      break;

    case 'hour':
      let hour_size = intervals.length * 60;
      if(hour_size<4500){hour_size *=10;}
      chartDimensions.damage.width = hour_size;
      chartDimensions.damage.height = 600;
      break;

    case 'day':
      let day_size = intervals.length * 60;
      if(day_size<4500){day_size *=10;}
      chartDimensions.damage.width = day_size;
      chartDimensions.damage.height = 600;
      break;
  }

  charts.damage.renderTo('#DamageChart',{width: chartDimensions.damage.width, height:chartDimensions.damage.height});
  charts.damage.on('elementclick' , function (chartRef, e) {
    if((Object.keys(e.data).length)/9 != 1){return;};
    let packet = {filter: 'damage', resolution: res, code: e.data.code, res_value: e.data.compiled_time, value: e.data.class_label};
    sockets.tweets.get(queries['tweets']+'?filter='+packet['filter']+'&resolution='+packet['resolution']+'&code='+packet['code']+'&res_value='+packet['res_value']+'&value='+packet['value'], function(data, json_obj){
      tweet_texts.damage = data['texts'];
      tweet_images.damage = data['images'];
      displayInfoButton('damage', packet['res_value'], packet['value']);
      showTweets('dt', 'damage', tweet_texts.damage);
      showImages('di', 'damage', tweet_images.damage, tweet_texts.damage);
    });
  });
}

$(window).resize(function() {
  clearTimeout(window.resizedFinished);
  window.resizedFinished = setTimeout(function(){
        charts.frequency.resize({width: chartDimensions.frequency.width, height:chartDimensions.frequency.height});
        charts.sentiment.resize({width: chartDimensions.sentiment.width, height:chartDimensions.sentiment.height});
        charts.class.resize({width: chartDimensions.class.width, height: chartDimensions.class.height});
        charts.relevancy.resize({width: chartDimensions.relevancy.width, height: chartDimensions.relevancy.height});
        charts.damage.resize({width: chartDimensions.damage.width, height: chartDimensions.damage.height});
        $(".frequency-data-button").hide();
        $(".sentiment-data-button").hide();
        $(".damage-data-button").hide();
        $(".class-data-button").hide();
        $(".relevancy-data-button").hide();
      }, 500);
});
