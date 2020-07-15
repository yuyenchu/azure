function items(data){
  var str ='' ;
  Object.keys(data).forEach(element =>{
    str +='<p>'+element+':  <span style="color:';
    if(data[element] == "Disconnected"){
      str += 'red">Disconnected</span>';
    } else {
      str += 'green">Connected</span>';
    }
    str += '</p><button onclick="toggle(\''+element+'\')">More Info</button><div id='+element+' class="canvas" style="display: none;">'
    str += twinInfo(element)+'</div>';
    });
  return str;
}

function twinInfo(id){
  var str ='';
  var twin_xhr = new XMLHttpRequest();
  twin_xhr.open("GET","/router/twin/"+id,false);
  twin_xhr.send(null);
  var twin = JSON.parse(JSON.parse(twin_xhr.responseText));
  Object.keys(twin).forEach(element =>{
    str += element+": "+JSON.stringify(twin[element])+"<br>";
  });
  return str;
}

var checkConn = function() {
  $.ajax({
    url: "/router/devices",
    success: function (data) {
      // console.log("data type: "+typeof(data));
      // console.log("data: "+data);
      // console.log("stringify data: "+JSON.stringify(data));
      postMessage(items(JSON.parse(JSON.stringify(data))));
    },
    complete: function () {
      // Schedule the next
      setTimeout(doAjax, 1000);
    }
  });
};

checkConn();