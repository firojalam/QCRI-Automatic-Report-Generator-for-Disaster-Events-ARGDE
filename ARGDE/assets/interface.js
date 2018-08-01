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

var color_legend = {
  'Very positive':'#0f0',
  'Positive':'#00f',
  'Neutral':'#666',
  'Negative':'#fc8d59',
  'Very negative':'#f00',
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
  'Missing and Found People': '#595959',
  'Severe':'#ff0000',
  'Mild':'#f48c42',
  'None':'#4180f4',
  'True':'#4180f4',
  'False':'#ff0000'
};

function data(){
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

function getRandomColor() {
  var num = Math.round(0xffffff * Math.random());
  var r = num >> 16;
  var g = num >> 8 & 255;
  var b = num & 255;
  return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}

function unlabelize(str) {
  str = str.split(" ").join("_");
  return str.toLowerCase();
}

function toggle_graph_type(type, graph){
  graphType[graph] = type;
  $("#" + graph + "TypeButton").html($("#" + graphType[graph] + "." + graph + "Type").html()+" ");
  charts[graph].destroy();
  generate[graph](graphRes[graph]);
}

function toggle_graph_res(res, graph){
  graphRes[graph] = res;
  $("#" + graph + "ResButton").html($("#" + graphRes[graph] + "." + graph + "Res").html());
  charts[graph].destroy();
  generate[graph](graphRes[graph]);
}

function reset(graph){
  graphType[graph] = defaultGraphType[graph];
  $("#" + graph + "TypeButton").html($("#" + graphType[graph] + "." + graph + "Type").html());
  graphRes[graph] = defaultGraphRes[graph];
  $("#" + graph + "ResButton").html($("#" + graphRes[graph] + "." + graph + "Res").html());
  charts[graph].destroy();
  generate[graph](graphRes[graph]);
}

function findTwitterLink(tweet){
  var link_index = tweet.lastIndexOf('https://t.co');
  var tweet_words = tweet.substring(link_index);
  tweet_words = tweet_words.split(" ");
  var link = tweet_words[0].replace(/['"]+/g,'');
  if((link_index == -1)){
    return null;
  }
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

function displayInfoButton(tag, res_value, label){
  $("."+tag+"-data-button").empty();
  $("."+tag+"-data-button").text(labelize(label+' '+tag)+' Tweets for: '+res_value);
  $("."+tag+"-data-button").show();
}

function showTweets(id, tag, tweet_data){

  $('#'+tag+'_tweets_load').empty();
  $('#'+id+'_paginator').empty();
  $('#'+id+'_numinator').empty();

  let tweet_count = 1;
  let current_page = 0;
  let total_pages = 0;
  let limit = 200;

  for(i=0; i<tweet_data.length; i++)
  {
    if(i>=limit){
      break;
    }
    let tweet = tweet_data[i].text;
    let tLink = findTwitterLink(tweet);
    let time = tweet_data[i].time;

    if((tweet_count-1) % 20 == 0){
      current_page+=1;
      total_pages+=1;
      $('#'+tag+'_tweets_load').html($('#'+tag+'_tweets_load').html()
       +"<table class='table'"+"id='"+id+"_page"+current_page+"'>"
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
          +'<td id="tLink'+tweet_count+'"></td>'
        +'</tr>'
       + "</table>");

      let dom_id = "#"+id+"_page"+current_page;
      $(dom_id).hide();

    } else {
        let card_id = "#"+id+"_page"+current_page;
        $(card_id).html($(card_id).html()
          +'<tr>'
            +'<td>'+(tweet_count++)+'</td>'
            +'<td>'+tweet+'</td>'
            +'<td>'+new Date(time)+'</td>'
            + '<td id="tLink'+tweet_count+'"></td>'
            +'</tr>');
    }

    if(tLink!=null){
      $('#tLink'+tweet_count).html($('#tLink'+tweet_count).html()
        +'<a href="'+tLink+'" target="_blank"><button type="button" class="btn btn-primary">View Tweet</button></a>');
    } else{
      $('#tLink'+tweet_count).html($('#tLink'+tweet_count).html()
        +'<p style="text-align:center;">Broken Link</p>');
    }
  }


  let dom_id = "#"+id+"_page1";
  $(dom_id).show();

  let card_code = id;

  $('#'+id+'_paginator').html($('#'+id+'_paginator').html()
    + "<li class='page-item'>"
     +   "<a class='page-link' href='javascript:void(0)' tabindex='-1' id = '"+id+"_prev' onclick='switchPages("+total_pages+","+1+", \""+card_code+"\")'>Previous</a>"
    + "</li>" );

  for(i = 1; i <= total_pages; i++){
    $('#'+id+'_paginator').html($('#'+id+'_paginator').html()
    + "<li class='page-item'><a class='page-link' onclick='switchPages("+total_pages+","+(current_page = i)+", \""+card_code+"\")' href='javascript:void(0)'>"+i+"</a></li> ");
  }

  $('#'+id+'_paginator').html($('#'+id+'_paginator').html()
    + "<li class='page-item'>"
     +   "<a class='page-link' href='javascript:void(0)' id = '"+id+"_next' onclick='switchPages("+total_pages+","+2+", \""+card_code+"\")'>Next</a>"
    + "</li>");

  if(tweet_data.length >= limit){
    $('#'+id+'_numinator').html($('#'+id+'_numinator').html()
      +"Displaying <b>only</b> "+limit+" out of "+ tweet_data.length +" tweets.");
  } else {
     $('#'+id+'_numinator').html($('#'+id+'_numinator').html()
      +"Displaying "+ tweet_data.length +" tweets. ");
  }
}

function showImages(id, tag, image_data, tweet_data){

  //tag is the name of the category for eg. sentiment, class, damage, etc.
  //id is the name of the id given to this tag, for example 'si' for sentiment
  //images, 'di' for damage images, etc.

  let count = 0;
  let current_page = 0;
  let total_pages = 0;
  let limit = 60;

  $('#'+tag+'_images_load').empty();
  $('#'+id+'_paginator').empty();
  $('#'+id+'_numinator').empty();


  for(i in image_data)
  {
    if(count>=limit){
      break;
    }
    let image = '""';
    let error = String('\'http://www.sitindia.com/res/img/img-not-found.png\'');
    image = image_data[i].image;
    let time = new Date(image_data[i].time);
    let text = tweet_data[i].text;
    if(image != undefined && image!= null){
      if(image.indexOf("|")!=-1){image = image.substring(0, image.indexOf("|"));};
      if(count % 16 == 0){
        current_page +=1;
        total_pages+=1;
        $('#'+tag+'_images_load').html($('#'+tag+'_images_load').html()
        +'<div class="row" id= "'+id+'_page'+current_page+'" ></div>');
        let dom_id = '#'+id+'_page'+current_page;
        $(dom_id).hide();
      }
      $('#'+id+'_page'+current_page).html($('#'+id+'_page'+current_page).html()
      +'<div class = "column .col-4">'
      +'<a href= "'+findTwitterLink(text)+'" target="_blank">'
      +'<img width= "100%" src="'+image+'" alt="" onerror="javascript:this.src='+error+'"/>'
      +'</a>'
      +'</div>'
      );
      count+=1;
    }
  }
  let dom_id = '#'+id+'_page1';
  $(dom_id).show();

  let card_code = id;

  $('#'+card_code+'_paginator').html($('#'+card_code+'_paginator').html()
    + "<li class='page-item'>"
     +   "<a class='page-link' href='javascript:;' tabindex='-1' id = "+id+"_prev' onclick='switchPages("+total_pages+","+1+", \""+card_code+"\")'>Previous</a>"
    + "</li>" );

  for(i = 1; i <= total_pages; i++){
    $('#'+card_code+'_paginator').html($('#'+card_code+'_paginator').html()
    + "<li class='page-item'><a class='page-link' onclick='switchPages("+total_pages+","+(current_page = i)+", \""+card_code+"\")' href='javascript:;'>"+i+"</a></li> ");
  }

  $('#'+card_code+'_paginator').html($('#'+card_code+'_paginator').html()
    + "<li class='page-item'>"
     +   "<a class='page-link' href='javascript:;' id = '"+id+"_next' onclick='switchPages("+total_pages+","+2+", \""+card_code+"\")'>Next</a>"
    + "</li>");

  if(count >= limit){
    $('#'+card_code+'_numinator').html($('#'+card_code+'_numinator').html()
      +"Displaying <b>only</b> 60 images.");
  } else {
     $('#'+card_code+'_numinator').html($('#'+card_code+'_numinator').html()
      +"Displaying "+ count +" images. ");
  }
}
