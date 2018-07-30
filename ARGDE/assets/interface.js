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
