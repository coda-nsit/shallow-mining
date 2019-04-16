/* Section: Fetch Threads,  Author: Rahul */
var req = 1;
var LastLoadedRes = null;
var GetThreadsAPIUrl = "http://52.183.19.216:8080/threads/get-threads/";

function getThreads(){
  OnLoad();
  var url = GetThreadsAPIUrl;
  var req = '{"symptom":""}';
  $.ajax({
    type: "POST",
    url: url,
    contentType: "application/json",
    data: req,
    success: function(res) { LastLoadedRes = jQuery.extend(true, {}, res); loadData(res);},
    error: function(res) {"No server"},
    dataType: "json"
  });
}


function loadData(res) {
  var t = res;
  console.log(t);
  var related = t.related_symptoms;
  console.log(related);
  var i = 1;
  for (var a in related) {
    console.log(related[a]);
    if (related[a] == "") {
      continue;
    }
    $('#l'+i).show();
    $('#s'+i).show();
    $('#s'+i).text(related[a]);
    i++;
  }
  if (i >= 2) {
    $('#a').show();
  }
  FilterByTypeAndLoadDiscussionThreads(res);
}


function searchThreads(str){
  var url = GetThreadsAPIUrl;
  var req = '{"symptom":"'+str+'"}';
  $.ajax({
    type: "POST",
    url: url,
    contentType: "application/json",
    data: req,
    success: function(res) { LastLoadedRes = jQuery.extend(true, {}, res); ajaxData(res);},
    error: function(res) {"No server"},
    dataType: "json"
  });
}


function ajaxData(res) {
  $('#ah').hide();
  $('#bh').show();
  var k = 1;
  while (k <= 20) {
    $('#l'+k).hide();
    k++;
  }
  var t = res;
  console.log(t);
  var related = t.related_symptoms;
  console.log(related);
  var i = 1;
  for (var a in related) {
    console.log(related[a]);
    if (related[a] == "") {
      continue;
    }
    $('#l'+i).show();
    $('#s'+i).show();
    $('#s'+i).text(related[a]);
    i++;
  }
  if (i >= 2) {
    $('#a').show();
  }
  FilterByTypeAndLoadDiscussionThreads(res);
}



function discussionThreads(res) {
  var t = res;
  var threads = t.threads;
  var k = 1;

  var text = "";
  var pref = '<div class="chat_list active_chat"><div class="chat_people"><div class="chat_ib"><span class="th-title">';
  var midf = '</span><p class="post-message">';
  var mipf = '</p><button type="button" class="readmore-btn btn btn-primary" data-toggle="collapse" data-target="#t';
  var posf = '">+See Thread</button></div></div></div>';

  var repf = '<div id="t';
  var rtif = '" data-toggle="false" class="collapse">';
  var rprf = '<div class="chat_list"><div class="chat_people"><div class="chat_ib"><span class="th-title">RE: ';
  var rmif = '</span><p>';
  var rpof = '</p></div></div></div>';
  var rcdf = '</div>';



  for (var a in threads) {
    if (a == "") {
      continue;
    }

    for (var i in threads[a]) {

      var title = threads[a][i].title;
      var body = threads[a][i].body;
      text += pref + title + midf + body + mipf + k + posf + repf+ k + rtif;
      console.log(title);
      console.log(body);
      var replies = threads[a][i].replies;

      for (var j in replies) {
        console.log(replies[j]);
        text += rprf + title + rmif + replies[j] + rpof;
      }
      text += rcdf;
      k++;
    }
  }
  document.getElementById('loader').innerHTML = text;
  document.getElementById('loader').style.display = "block";

  HighLightRelatedSymptoms(res);
}

/* Section: Filter Threads,  Author: Kaushik */


function FilterByTypeAndLoadDiscussionThreads(resJSON){
  var t1="no", t2="no";
  var radios = document.getElementsByName('DiabetesType');
 //find filters selected
 for (var i = 0, length = radios.length; i < length; i++)
 {
 if (radios[i].checked)
 {
   if(radios[i].value == "t1")
   {
     t1="yes"; 
   }
   else if(radios[i].value == "t2")
   {
     t2="yes";
   }
   else if(radios[i].value == "tBoth")
   {
     t1="yes"; 
     t2="yes";
   }
 }
 }



 //Filter by type
 for(var s in Object.keys(resJSON.threads))
 {
   var symptomName = Object.keys(resJSON.threads)[s];
    
   if(symptomName!="")
   {
      var threads = [];
      for(var i in resJSON.threads[symptomName] ) 
      {
        var thread = resJSON.threads[symptomName][i];

        if(thread.type1==t1&&t1=="yes")
        {
           threads.push(thread);
        }
        else if(thread.type2==t2&&t2=="yes")
        {
         threads.push(thread);
        }
      }
      resJSON.threads[symptomName]  = threads;
   }
 }
 
 discussionThreads(resJSON);
}

function onFilterSelected() {
  var resJSON = jQuery.extend(true, {}, LastLoadedRes);
  FilterByTypeAndLoadDiscussionThreads(resJSON);
}

function HighLightRelatedSymptoms(resJSON){
  var HTMLReplaced = "";
  for(i=0;i<resJSON.related_symptoms.length-1;i++)
  {
    var Symptom = resJSON.related_symptoms[i];
    var SpanSymptom = ("<span class='"+$('#s'+(i+1)).attr('class')+"'>"+Symptom+"</span>");
    console.log("Span elem:" + SpanSymptom);
    HTMLReplaced = $(".inbox-chat-col").html().replace(new RegExp(Symptom,"g"), SpanSymptom ); //"<span class='"+$('#s'+i).attr('class')+"'>"+Symptom+"</span>" //"<span class='badge badge-success' >low blood sugar</span>"
    $(".inbox-chat-col").html(HTMLReplaced);
  }
 
}


function escapeRegExp(string) {
  var str = string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  console.log("-------");
  console.log(str);
  console.log("----------");
  return str;
}
//$(".inbox-chat-col").html( $(".inbox-chat-col").html().replace(/a/g, "Hello2") )
//$('#s'+i).attr('class')

$.urlParam = function(name){
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if(results!=null && results.length>0)
  return results[1];
  else
  return 0;
}

function OnLoad(){
var t = $.urlParam("t");
if(t!=0){
var radioBut = document.getElementById(t);
radioBut.checked = true;
}
}

