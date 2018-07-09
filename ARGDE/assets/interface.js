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
    let packet = {filter: 'class', resolution: res, code: e.data.code, res_value: e.data.date, value: unlabelize(e.data.label)};
    sockets.tweets.get(queries['tweets']+'?filter='+packet['filter']+'&resolution='+packet['resolution']+'&code='+packet['code']+'&res_value='+packet['res_value']+'&value='+packet['value'], function(data, json_obj){
      tweet_texts.class = data['texts'];
      tweet_images.class = data['images'];
      function show_tweets()
      {
        $(".class-data-button").empty();
        $(".class-data-button").text('Tweets Data : '+packet['res_value']);
        $(".class-data-button").show();
        var tweet_count = 1;
        var current_page = 0;
        var total_pages = 0;
        var limit = 200;
        $('#class_tweets_load').empty();
        $('#ct_paginator').empty();
        $('#ct_numinator').empty();
      
        for(i=0; i<tweet_texts.class.length; i++)
        {
          if(i>=limit){
            break;
          }
      
          if((tweet_count-1) % 20 == 0){
            current_page+=1;
            total_pages+=1;
            let tweet = tweet_texts.class[i].text;
            let tLink = findTwitterLink(tweet);
            let time = tweet_texts.class[i].time;
            $('#class_tweets_load').html($('#class_tweets_load').html()
             +"<table class='table'"+"id='ct_page"+current_page+"'>"
              +'<tr>'
                +'<th>#</th>'
                +'<th>Tweet Text</th>'
                +'<th>Time</th>'
                +'<th></th>'
              +'</tr>'
              +'<tr>'
                +'<td>'+(tweet_count++)+'</td>'
                +'<td>'+tweet+'</td>'
                +'<td>'+new Date(time)+'</td>'
                +'<td><a href="'+tLink+'" target="_blank"><button type="button" class="btn btn-primary">View Tweet</button></a></td>'
              +'</tr>'
            + "</table>");
      
            let dom_id = "#ct_page"+current_page;
            $(dom_id).hide();
      
          } else {
              let tweet = tweet_texts.class[i].text;
              let time = tweet_texts.class[i].time;
              let tLink = findTwitterLink(tweet);
              let card_id = "#ct_page"+current_page;
              $(card_id).html($(card_id).html()
                 +'<tr>'
                  +'<td>'+(tweet_count++)+'</td>'
                  +'<td>'+tweet+'</td>'
                  +'<td>'+new Date(time)+'</td>'
                  +'<td><a href="'+tLink+'" target="_blank"><button type="button" class="btn btn-primary">View Tweet</button></a></td>'
                +'</tr>');
          }
        }
      
      
        let dom_id = "#ct_page1";
        $(dom_id).show();
      
        let card_code = "ct";
      
        $('#ct_paginator').html($('#ct_paginator').html()
          + "<li class='page-item'>"
           +   "<a class='page-link' href='javascript:void(0)' tabindex='-1' id = 'ct_prev' onclick='switchPages("+total_pages+","+1+", \""+card_code+"\")'>Previous</a>"
          + "</li>" );
      
        for(i = 1; i <= total_pages; i++){
          $('#ct_paginator').html($('#ct_paginator').html()
          + "<li class='page-item'><a class='page-link' onclick='switchPages("+total_pages+","+(current_page = i)+", \""+card_code+"\")' href='javascript:void(0)'>"+i+"</a></li> ");
        }
      
        $('#ct_paginator').html($('#ct_paginator').html()
          + "<li class='page-item'>"
           +   "<a class='page-link' href='javascript:void(0)' id = 'ct_next' onclick='switchPages("+total_pages+","+2+", \""+card_code+"\")'>Next</a>"
          + "</li>");
      
        if(tweet_texts.class.length >= limit){
          $('#ct_numinator').html($('#ct_numinator').html()
            +"Displaying <b>only</b> 150 out of "+ tweet_texts.class.length +" tweets.");
        } else {
           $('#ct_numinator').html($('#ct_numinator').html()
            +"Displaying "+ tweet_texts.class.length +" tweets. ");
        }
      }


      function show_images()
      {
        var count = 0;
        $('#class_images_indicator').empty();
        $('#class_images_carousel').empty();
        var indicators ='';
        var images ='';
        for(i in tweet_images.class)
        {
          let image = '""';
          if(tweet_images.class[i] != undefined)
          {
            image = tweet_images.class[i].image;
          }
          let time = new Date(tweet_images.class[i].time);
          if(count == 0)
          {
            indicators = '<li data-target="#class_images_indicator"'
            +' data-slide-to="'+count+'" class="active"></li>';
            images = '<div class="carousel-item active">'
            +'<img class="d-block w-100" src="'+image+'" alt="Tweet Image at '+time+'">'
            +'<div class="carousel-caption d-none d-md-block">'
            +'<h5>Tweet '+(count+1)+'</h5>'
            +'<p>'+tweet_texts.class[i].text+'<br>'
            +'<small><em>'+time+'</em></small></p>'
            +'</div>'
            +'</div>';
          }
          else
          {
            indicators += '<li data-target="#class_images_indicators" data-slide-to="'+count+'"></li>'
            images += '<div class="carousel-item">'
            +'<img class="d-block w-100" src="'+image+'" alt="Tweet Image at '+time+'">'
            +'<div class="carousel-caption d-none d-md-block">'
            +'<h5>Tweet '+(count+1)+'</h5>'
            +'<p>'+tweet_texts.class[i].text+'<br>'
            +'<small><em>'+time+'</em></small></p>'
            +'</div>'
            +'</div>';
          }
          count+=1;
        }
        $('#class_images_indicator').html(indicators);
        $('#class_images_carousel').html(images);
      }
      show_tweets();
      show_images();
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
    sockets.tweets.get(queries['tweets']+'?filter='+packet['filter']+'&resolution='+packet['resolution']+'&code='+packet['code']+'&res_value='+packet['res_value']+'&value='+packet['value'], function(data, json_obj){
      tweet_texts.frequency = data['texts'];
      tweet_images.frequency = data['images'];
      function show_tweets()
      {
        $(".frequency-data-button").empty();
        $(".frequency-data-button").text('Tweets Data : '+packet['res_value']);
        $(".frequency-data-button").show();

        var tweet_count = 1;
        var current_page = 0;
        var total_pages = 0;
        var limit = 200;
        $('#frequency_tweets_load').empty();
        $('#ft_paginator').empty();
        $('#ft_numinator').empty();
      
        for(i=0; i<tweet_texts.frequency.length; i++)
        {
          if(i>=limit){
            break;
          }
      
          if((tweet_count-1) % 20 == 0){
            current_page+=1;
            total_pages+=1;
            let tweet = tweet_texts.frequency[i].text;
            let tLink = findTwitterLink(tweet);
            let time = tweet_texts.frequency[i].time;
            $('#frequency_tweets_load').html($('#frequency_tweets_load').html()
             +"<table class='table'"+"id='ft_page"+current_page+"'>"
              +'<tr >'
                +'<th>#</th>'
                +'<th>Tweet Text</th>'
                +'<th>Time</th>'
                +'<th></th>'
              +'</tr>'
              +'<tr>'
                +'<td>'+(tweet_count++)+'</td>'
                +'<td>'+tweet+'</td>'
                +'<td>'+new Date(time)+'</td>'
                +'<td><a href="'+tLink+'" target="_blank"><button type="button" class="btn btn-primary">View Tweet</button></a></td>'
              +'</tr>'
            + "</table>");
      
            let dom_id = "#ft_page"+current_page;
            $(dom_id).hide();
      
          } else {
              let tweet = tweet_texts.frequency[i].text;
              let time = tweet_texts.frequency[i].time;
              let tLink = findTwitterLink(tweet);
              let card_id = "#ft_page"+current_page;
              $(card_id).html($(card_id).html()
                 +'<tr>'
                  +'<td>'+(tweet_count++)+'</td>'
                  +'<td>'+tweet+'</td>'
                  +'<td>'+new Date(time)+'</td>'
                  +'<td><a href="'+tLink+'" target="_blank"><button type="button" class="btn btn-primary">View Tweet</button></a></td>'
                +'</tr>');
          }
        }
      
      
        let dom_id = "#ft_page1";
        $(dom_id).show();
      
        let card_code = "ft";
      
        $('#ft_paginator').html($('#ft_paginator').html()
          + "<li class='page-item'>"
           +   "<a class='page-link' href='javascript:void(0)' tabindex='-1' id = 'ft_prev' onclick='switchPages("+total_pages+","+1+", \""+card_code+"\")'>Previous</a>"
          + "</li>" );
      
        for(i = 1; i <= total_pages; i++){
          $('#ft_paginator').html($('#ft_paginator').html()
          + "<li class='page-item'><a class='page-link' onclick='switchPages("+total_pages+","+(current_page = i)+", \""+card_code+"\")' href='javascript:void(0)'>"+i+"</a></li> ");
        }
      
        $('#ft_paginator').html($('#ft_paginator').html()
          + "<li class='page-item'>"
           +   "<a class='page-link' href='javascript:void(0)' id = 'ft_next' onclick='switchPages("+total_pages+","+2+", \""+card_code+"\")'>Next</a>"
          + "</li>");
      
        if(tweet_texts.frequency.length >= limit){
          $('#ft_numinator').html($('#ft_numinator').html()
            +"Displaying <b>only</b> 150 out of "+ tweet_texts.frequency.length +" tweets.");
        } else {
           $('#ft_numinator').html($('#ft_numinator').html()
            +"Displaying "+ tweet_texts.frequency.length +" tweets. ");
        }
      }


      function show_images()
      {
        var count = 0;
        $('#frequency_images_indicator').empty();
        $('#frequency_images_carousel').empty();
        var indicators ='';
        var images ='';
        for(i in tweet_images.frequency)
        {
          let image = '""';
          if(tweet_images.frequency[i] != undefined)
          {
            image = tweet_images.frequency[i].image;
          }
          let time = new Date(tweet_images.frequency[i].time);
          if(count == 0)
          {
            indicators = '<li data-target="#frequency_images_indicator"'
            +' data-slide-to="'+count+'" class="active"></li>';
            images = '<div class="carousel-item active">'
            +'<img class="d-block w-100" src="'+image+'" alt="Tweet Image at '+time+'">'
            +'<div class="carousel-caption d-none d-md-block">'
            +'<h5>Tweet '+(count+1)+'</h5>'
            +'<p>'+tweet_texts.frequency[i].text+'<br>'
            +'<small><em>'+time+'</em></small></p>'
            +'</div>'
            +'</div>';
          }
          else
          {
            indicators += '<li data-target="#frequency_images_indicators" data-slide-to="'+count+'"></li>'
            images += '<div class="carousel-item">'
            +'<img class="d-block w-100" src="'+image+'" alt="Tweet Image at '+time+'">'
            +'<div class="carousel-caption d-none d-md-block">'
            +'<h5>Tweet '+(count+1)+'</h5>'
            +'<p>'+tweet_texts.frequency[i].text+'<br>'
            +'<small><em>'+time+'</em></small></p>'
            +'</div>'
            +'</div>';
          }
          count+=1;
        }
        $('#frequency_images_indicator').html(indicators);
        $('#frequency_images_carousel').html(images);
      }
      show_tweets();
      show_images();
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
    let packet = {filter: 'sentiment', resolution: res, code: e.data.code, res_value: e.data.compiled_time, value: e.data.sentiment};
    sockets.tweets.get(queries['tweets']+'?filter='+packet['filter']+'&resolution='+packet['resolution']+'&code='+packet['code']+'&res_value='+packet['res_value']+'&value='+packet['value'], function(data, json_obj){
      tweet_texts.sentiment = data['texts'];
      tweet_images.sentiment = data['images'];
      function show_tweets()
      {  
        $(".sentiment-data-button").empty();
        $(".sentiment-data-button").text('Tweets Data : '+packet['res_value']);
        $(".sentiment-data-button").show();
        var tweet_count = 1;
        var current_page = 0;
        var total_pages = 0;
        var limit = 200;
        $('#sentiment_tweets_load').empty();
        $('#st_paginator').empty();
        $('#st_numinator').empty();
      
        for(i=0; i<tweet_texts.sentiment.length; i++)
        {
          if(i>=limit){
            break;
          }
      
          if((tweet_count-1) % 20 == 0){
            current_page+=1;
            total_pages+=1;
            let tweet = tweet_texts.sentiment[i].text;
            let tLink = findTwitterLink(tweet);
            let time = tweet_texts.sentiment[i].time;
            $('#sentiment_tweets_load').html($('#sentiment_tweets_load').html()
             +"<table class='table'"+"id='st_page"+current_page+"'>"
              +'<tr>'
                +'<th>#</th>'
                +'<th>Tweet Text</th>'
                +'<th>Time</th>'
                +'<th></th>'
              +'</tr>'
              +'<tr>'
                +'<td>'+(tweet_count++)+'</td>'
                +'<td>'+tweet+'</td>'
                +'<td>'+new Date(time)+'</td>'
                +'<td><a href="'+tLink+'" target="_blank"><button type="button" class="btn btn-primary">View Tweet</button></a></td>'
              +'</tr>'
            + "</table>");
      
            let dom_id = "#st_page"+current_page;
            $(dom_id).hide();
      
          } else {
              let tweet = tweet_texts.sentiment[i].text;
              let time = tweet_texts.sentiment[i].time;
              let tLink = findTwitterLink(tweet);
              let card_id = "#st_page"+current_page;
              $(card_id).html($(card_id).html()
                 +'<tr>'
                  +'<td>'+(tweet_count++)+'</td>'
                  +'<td>'+tweet+'</td>'
                  +'<td>'+new Date(time)+'</td>'
                  +'<td><a href="'+tLink+'" target="_blank"><button type="button" class="btn btn-primary">View Tweet</button></a></td>'
                +'</tr>');
          }
        }
      
      
        let dom_id = "#st_page1";
        $(dom_id).show();
      
        let card_code = "st";
      
        $('#st_paginator').html($('#st_paginator').html()
          + "<li class='page-item'>"
           +   "<a class='page-link' href='javascript:void(0)' tabindex='-1' id = 'st_prev' onclick='switchPages("+total_pages+","+1+", \""+card_code+"\")'>Previous</a>"
          + "</li>" );
      
        for(i = 1; i <= total_pages; i++){
          $('#st_paginator').html($('#st_paginator').html()
          + "<li class='page-item'><a class='page-link' onclick='switchPages("+total_pages+","+(current_page = i)+", \""+card_code+"\")' href='javascript:void(0)'>"+i+"</a></li> ");
        }
      
        $('#st_paginator').html($('#st_paginator').html()
          + "<li class='page-item'>"
           +   "<a class='page-link' href='javascript:void(0)' id = 'st_next' onclick='switchPages("+total_pages+","+2+", \""+card_code+"\")'>Next</a>"
          + "</li>");
      
        if(tweet_texts.sentiment.length >= limit){
          $('#st_numinator').html($('#st_numinator').html()
            +"Displaying <b>only</b> 150 out of "+ tweet_texts.sentiment.length +" tweets.");
        } else {
           $('#st_numinator').html($('#st_numinator').html()
            +"Displaying "+ tweet_texts.sentiment.length +" tweets. ");
        }
      }


      function show_images()
      {
        var count = 0;
        $('#sentiment_images_indicator').empty();
        $('#sentiment_images_carousel').empty();
        var indicators ='';
        var images ='';
        for(i in tweet_images.sentiment)
        {
          let image = '""';
          if(tweet_images.sentiment[i] != undefined)
          {
            image = tweet_images.sentiment[i].image;
          }
          let time = new Date(tweet_images.sentiment[i].time);
          if(count == 0)
          {
            indicators = '<li data-target="#sentiment_images_indicator"'
            +' data-slide-to="'+count+'" class="active"></li>';
            images = '<div class="carousel-item active">'
            +'<img class="d-block w-100" src="'+image+'" alt="Tweet Image at '+time+'">'
            +'<div class="carousel-caption d-none d-md-block">'
            +'<h5>Tweet '+(count+1)+'</h5>'
            +'<p>'+tweet_texts.sentiment[i].text+'<br>'
            +'<small><em>'+time+'</em></small></p>'
            +'</div>'
            +'</div>';
          }
          else
          {
            indicators += '<li data-target="#sentiment_images_indicators" data-slide-to="'+count+'"></li>'
            images += '<div class="carousel-item">'
            +'<img class="d-block w-100" src="'+image+'" alt="Tweet Image at '+time+'">'
            +'<div class="carousel-caption d-none d-md-block">'
            +'<h5>Tweet '+(count+1)+'</h5>'
            +'<p>'+tweet_texts.sentiment[i].text+'<br>'
            +'<small><em>'+time+'</em></small></p>'
            +'</div>'
            +'</div>';
          }
          count+=1;
        }
        $('#sentiment_images_indicator').html(indicators);
        $('#sentiment_images_carousel').html(images);
      }
      show_tweets();
      show_images();
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
    sockets.tweets.get(queries['tweets']+'?filter='+packet['filter']+'&resolution='+packet['resolution']+'&code='+packet['code']+'&res_value='+packet['res_value']+'&value='+packet['value'], function(data, json_obj){
      tweet_texts.damage = data['texts'];
      tweet_images.damage = data['images'];
      function show_tweets()
      {
        $(".damage-data-button").empty();
        $(".damage-data-button").text('Tweets Data : '+packet['res_value']);
        $(".damage-data-button").show();
        var tweet_count = 1;
        var current_page = 0;
        var total_pages = 0;
        var limit = 200;
        $('#damage_tweets_load').empty();
        $('#dt_paginator').empty();
        $('#dt_numinator').empty();
      
        for(i=0; i<tweet_texts.damage.length; i++)
        {
          if(i>=limit){
            break;
          }
      
          if((tweet_count-1) % 20 == 0){
            current_page+=1;
            total_pages+=1;
            let tweet = tweet_texts.damage[i].text;
            let tLink = findTwitterLink(tweet);
            let time = tweet_texts.damage[i].time;
            $('#damage_tweets_load').html($('#damage_tweets_load').html()
             +"<table class='table'"+"id='dt_page"+current_page+"'>"
              +'<tr>'
                +'<th>#</th>'
                +'<th>Tweet Text</th>'
                +'<th>Time</th>'
                +'<th></th>'
              +'</tr>'
              +'<tr>'
                +'<td>'+(tweet_count++)+'</td>'
                +'<td>'+tweet+'</td>'
                +'<td>'+new Date(time)+'</td>'
                +'<td><a href="'+tLink+'" target="_blank"><button type="button" class="btn btn-primary">View Tweet</button></a></td>'
              +'</tr>'
            + "</table>");
      
            let dom_id = "#dt_page"+current_page;
            $(dom_id).hide();
      
          } else {
              let tweet = tweet_texts.damage[i].text;
              let time = tweet_texts.damage[i].time;
              let tLink = findTwitterLink(tweet);
              let card_id = "#dt_page"+current_page;
              $(card_id).html($(card_id).html()
                 +'<tr>'
                  +'<td>'+(tweet_count++)+'</td>'
                  +'<td>'+tweet+'</td>'
                  +'<td>'+new Date(time)+'</td>'
                  +'<td><a href="'+tLink+'" target="_blank"><button type="button" class="btn btn-primary">View Tweet</button></a></td>'
                +'</tr>');
          }
        }
      
      
        let dom_id = "#dt_page1";
        $(dom_id).show();
      
        let card_code = "dt";
      
        $('#dt_paginator').html($('#dt_paginator').html()
          + "<li class='page-item'>"
           +   "<a class='page-link' href='javascript:void(0)' tabindex='-1' id = 'dt_prev' onclick='switchPages("+total_pages+","+1+", \""+card_code+"\")'>Previous</a>"
          + "</li>" );
      
        for(i = 1; i <= total_pages; i++){
          $('#dt_paginator').html($('#dt_paginator').html()
          + "<li class='page-item'><a class='page-link' onclick='switchPages("+total_pages+","+(current_page = i)+", \""+card_code+"\")' href='javascript:void(0)'>"+i+"</a></li> ");
        }
      
        $('#dt_paginator').html($('#dt_paginator').html()
          + "<li class='page-item'>"
           +   "<a class='page-link' href='javascript:void(0)' id = 'dt_next' onclick='switchPages("+total_pages+","+2+", \""+card_code+"\")'>Next</a>"
          + "</li>");
      
        if(tweet_texts.damage.length >= limit){
          $('#dt_numinator').html($('#dt_numinator').html()
            +"Displaying <b>only</b> 150 out of "+ tweet_texts.damage.length +" tweets.");
        } else {
           $('#dt_numinator').html($('#dt_numinator').html()
            +"Displaying "+ tweet_texts.damage.length +" tweets. ");
        }
      }


      function show_images()
      {
        var count = 0;
        $('#damage_images_indicator').empty();
        $('#damage_images_carousel').empty();
        var indicators ='';
        var images ='';
        for(i in tweet_images.damage)
        {
          let image = '""';
          if(tweet_images.damage[i] != undefined)
          {
            image = tweet_images.damage[i].image;
          }
          let time = new Date(tweet_images.damage[i].time);
          if(count == 0)
          {
            indicators = '<li data-target="#damage_images_indicator"'
            +' data-slide-to="'+count+'" class="active"></li>';
            images = '<div class="carousel-item active">'
            +'<img class="d-block w-100" src="'+image+'" alt="Tweet Image at '+time+'">'
            +'<div class="carousel-caption d-none d-md-block">'
            +'<h5>Tweet '+(count+1)+'</h5>'
            +'<p>'+tweet_texts.damage[i].text+'<br>'
            +'<small><em>'+time+'</em></small></p>'
            +'</div>'
            +'</div>';
          }
          else
          {
            indicators += '<li data-target="#damage_images_indicators" data-slide-to="'+count+'"></li>'
            images += '<div class="carousel-item">'
            +'<img class="d-block w-100" src="'+image+'" alt="Tweet Image at '+time+'">'
            +'<div class="carousel-caption d-none d-md-block">'
            +'<h5>Tweet '+(count+1)+'</h5>'
            +'<p>'+tweet_texts.damage[i].text+'<br>'
            +'<small><em>'+time+'</em></small></p>'
            +'</div>'
            +'</div>';
          }
          count+=1;
        }
        $('#damage_images_indicator').html(indicators);
        $('#damage_images_carousel').html(images);
      }
      show_tweets();
      show_images();
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
    let packet = {filter: 'relevancy', resolution: res, code: e.data.code, res_value: e.data.compiled_time, value: e.data.relevancy.toLowerCase()};
    sockets.tweets.get(queries['tweets']+'?filter='+packet['filter']+'&resolution='+packet['resolution']+'&code='+packet['code']+'&res_value='+packet['res_value']+'&value='+packet['value'], function(data, json_obj){
      tweet_texts.relevancy = data['texts'];
      tweet_images.relevancy = data['images'];
      function show_tweets()
      {
        $(".relevancy-data-button").empty();
        $(".relevancy-data-button").text('Tweets Data : '+packet['res_value']);
        $(".relevancy-data-button").show();
        var tweet_count = 1;
        var current_page = 0;
        var total_pages = 0;
        var limit = 200;
        $('#relevancy_tweets_load').empty();
        $('#rt_paginator').empty();
        $('#rt_numinator').empty();
      
        for(i=0; i<tweet_texts.relevancy.length; i++)
        {
          if(i>=limit){
            break;
          }
      
          if((tweet_count-1) % 20 == 0){
            current_page+=1;
            total_pages+=1;
            let tweet = tweet_texts.relevancy[i].text;
            let tLink = findTwitterLink(tweet);
            let time = tweet_texts.relevancy[i].time;
            $('#relevancy_tweets_load').html($('#relevancy_tweets_load').html()
             +"<table class='table'"+"id='rt_page"+current_page+"'>"
              +'<tr>'
                +'<th>#</th>'
                +'<th>Tweet Text</th>'
                +'<th>Time</th>'
                +'<th></th>'
              +'</tr>'
              +'<tr>'
                +'<td>'+(tweet_count++)+'</td>'
                +'<td>'+tweet+'</td>'
                +'<td>'+new Date(time)+'</td>'
                +'<td><a href="'+tLink+'" target="_blank"><button type="button" class="btn btn-primary">View Tweet</button></a></td>'
              +'</tr>'
            + "</table>");
      
            let dom_id = "#rt_page"+current_page;
            $(dom_id).hide();
      
          } else {
              let tweet = tweet_texts.relevancy[i].text;
              let time = tweet_texts.relevancy[i].time;
              let tLink = findTwitterLink(tweet);
              let card_id = "#rt_page"+current_page;
              $(card_id).html($(card_id).html()
                 +'<tr>'
                  +'<td>'+(tweet_count++)+'</td>'
                  +'<td>'+tweet+'</td>'
                  +'<td>'+new Date(time)+'</td>'
                  +'<td><a href="'+tLink+'" target="_blank"><button type="button" class="btn btn-primary">View Tweet</button></a></td>'
                +'</tr>');
          }
        }
      
      
        let dom_id = "#rt_page1";
        $(dom_id).show();
      
        let card_code = "rt";
      
        $('#rt_paginator').html($('#rt_paginator').html()
          + "<li class='page-item'>"
           +   "<a class='page-link' href='javascript:void(0)' tabindex='-1' id = 'rt_prev' onclick='switchPages("+total_pages+","+1+", \""+card_code+"\")'>Previous</a>"
          + "</li>" );
      
        for(i = 1; i <= total_pages; i++){
          $('#rt_paginator').html($('#rt_paginator').html()
          + "<li class='page-item'><a class='page-link' onclick='switchPages("+total_pages+","+(current_page = i)+", \""+card_code+"\")' href='javascript:void(0)'>"+i+"</a></li> ");
        }
      
        $('#rt_paginator').html($('#rt_paginator').html()
          + "<li class='page-item'>"
           +   "<a class='page-link' href='javascript:void(0)' id = 'rt_next' onclick='switchPages("+total_pages+","+2+", \""+card_code+"\")'>Next</a>"
          + "</li>");
      
        if(tweet_texts.relevancy.length >= limit){
          $('#rt_numinator').html($('#rt_numinator').html()
            +"Displaying <b>only</b> 150 out of "+ tweet_texts.relevancy.length +" tweets.");
        } else {
           $('#rt_numinator').html($('#rt_numinator').html()
            +"Displaying "+ tweet_texts.relevancy.length +" tweets. ");
        }
      }


      function show_images()
      {
        var count = 0;
        $('#relevancy_images_indicator').empty();
        $('#relevancy_images_carousel').empty();
        var indicators ='';
        var images ='';
        for(i in tweet_images.relevancy)
        {
          let image = '""';
          if(tweet_images.relevancy[i] != undefined)
          {
            image = tweet_images.relevancy[i].image;
          }
          let time = new Date(tweet_images.relevancy[i].time);
          if(count == 0)
          {
            indicators = '<li data-target="#relevancy_images_indicator"'
            +' data-slide-to="'+count+'" class="active"></li>';
            images = '<div class="carousel-item active">'
            +'<img class="d-block w-100" src="'+image+'" alt="Tweet Image at '+time+'">'
            +'<div class="carousel-caption d-none d-md-block">'
            +'<h5>Tweet '+(count+1)+'</h5>'
            +'<p>'+tweet_texts.relevancy[i].text+'<br>'
            +'<small><em>'+time+'</em></small></p>'
            +'</div>'
            +'</div>';
          }
          else
          {
            indicators += '<li data-target="#relevancy_images_indicators" data-slide-to="'+count+'"></li>'
            images += '<div class="carousel-item">'
            +'<img class="d-block w-100" src="'+image+'" alt="Tweet Image at '+time+'">'
            +'<div class="carousel-caption d-none d-md-block">'
            +'<h5>Tweet '+(count+1)+'</h5>'
            +'<p>'+tweet_texts.relevancy[i].text+'<br>'
            +'<small><em>'+time+'</em></small></p>'
            +'</div>'
            +'</div>';
          }
          count+=1;
        }
        $('#relevancy_images_indicator').html(indicators);
        $('#relevancy_images_carousel').html(images);
      }
      show_tweets();
      show_images();
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

function findTwitterLink(tweet){
  var link_index = tweet.lastIndexOf('https://');
  var tweet_words = tweet.substring(link_index);
  tweet_words = tweet_words.split(" ");
  var link = tweet_words[0].replace(/['"]+/g,'');
  return link;
}

function switchPages(pages, id, card_code){

    if(id == 0){
      id = 1;
    } else if (id == (pages + 1)){
      id = pages;
    }

    for(var i=1; i<=pages; i++){

        if (document.getElementById(card_code+'_page'+i)) {
            let dom_id = "#"+card_code+"_page"+i;
            $(dom_id).hide();
        }

    }
        if (document.getElementById(card_code+'_page'+id)) {
            let dom_id = "#"+card_code+"_page"+id;
            $(dom_id).show();
        }

        let next_id = "#"+card_code+"_next";
        let prev_id = "#"+card_code+"_prev";
        $(next_id).attr("onclick","switchPages("+pages+","+(id+1)+", \""+card_code+"\")");
        $(prev_id).attr("onclick","switchPages("+pages+","+(id-1)+", \""+card_code+"\")");
};
