function get_str_as_error(str){
  return ("<em style='color: red'>" + str + "</em>");
}

function new_output(str){
  if(str instanceof Object){
    try{
      str = JSON.stringify(str);
    }
    catch(e){}
  }
  jQuery("#outputContent").html(str + "</br>");
}
console.log("The scripts have been refreshed");
// console outputs override-----------------------------------------------------
window.console = {
  log: function(str){
    if(str instanceof Object){
      try{
        str = JSON.stringify(str);
      }
      catch(e){}
    }
    var node = jQuery("#outputContent");
    node.append(str + "</br>");
  },
  error: function(str){
    if(str instanceof Object){
      try{
        str = JSON.stringify(str);
      }
      catch(e){}
    }
    var node = jQuery("#outputContent");
    node.append(get_str_as_error(str) + "</br>");
  }
};


/*
// Caution : this version executes actual console level instructions (rights same as user).
//           Basically, can disrupt entire root document as it uses 'eval'
//           use the run console version which uses the execute_usercode() to handle user code safely
$(document).keydown(function(evt){  // run console instructions
    if (evt.keyCode==82 && (evt.ctrlKey)){
        evt.preventDefault();
        code = editor.getValue();
        jQuery("#outputContent").empty();

        var editor_annots = editor.getSession().getAnnotations();
        var error_there = false;
        for(var i=0; i<editor_annots.length; i++){
          if(editor_annots[i].type && editor_annots[i].type == "error"){
            error_there = true;
            console.log("Error >> row-" + editor_annots[i].row + " : " + editor_annots[i].text);
          }
        }
        if(error_there){
          console.error("syntax error(s) found.");
        }
        else{
          jQuery("#outputContent").text(eval(code));
        }
    }
});
*/

function execute_usercode(code){
  // The daemons are unleashed in here. Pun totally intended.
  if(exec_lock){
    new_output(get_str_as_error("Previous run not yet finished. Please wait..."));
    return;
  }
  exec_lock = true; // getting lock
  var lemming = new Lemming(code);
  lemming.onTimeout(function() {
    new_output(get_str_as_error("Timeout occured while running code! (t>10 secs)"));
  });
  lemming.onResult(function(result) {
    new_output(result);
  });
  lemming.onError(function(error) {
    new_output(get_str_as_error("Error(s) >> " + error));
  });
  lemming.onCompleted(function() {
    exec_lock = false;
  });
  lemming.run({
    timeout: 10000,  // 10 seconds before time out
    //Lemming.options.scripts : [] // any external script(non-vanilla) dependency
  });
}

$(document).keydown(function(evt){  // run console instructions
    if (evt.keyCode==13 && (evt.ctrlKey)){
        evt.preventDefault();
        code = editor.getValue();
        jQuery("#outputContent").empty();
        var editor_annots = editor.getSession().getAnnotations();
        var error_there = false;
        for(var i=0; i<editor_annots.length; i++){
          if(editor_annots[i].type && editor_annots[i].type == "error"){
            error_there = true;
            console.log("Error >> row-" + editor_annots[i].row + " : " + editor_annots[i].text);
          }
        }
        if(error_there){
          console.error("Syntax error(s) found.");
        }
        else{
          // implementation involving web workers -> much safer & also async
          execute_usercode(code);
        }
    }
});

$(document).keydown(function(evt){  // save to disk
    if (evt.keyCode==66 && (evt.ctrlKey)){
        evt.preventDefault();
        var filename = "JaScEdit_"+Math.floor(Date.now() / 1000);
        var elData = editor.getValue();
        var mimeType = 'text/javascript';
        // auto download link
        var link = document.createElement('a');
        link.setAttribute('download', filename);
        link.setAttribute('href', 'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(elData));
        link.click();
        link.remove();
    }
});

$(document).keydown(function(evt){  // insert console.log statement
    if (evt.keyCode==81 && (evt.ctrlKey)){
        evt.preventDefault();
        var text = "console.log()";
        editor.session.insert(editor.getCursorPosition(), text);
    }
});

// DB persistence
function persist_editor_data(){ // save editor data
  if(!release_persist_lck){
    return;
  }
  release_persist_lck = false;
  code = editor.getValue();
  //real_console.log(JSON.stringify(code_collection.find()));
  code_collection.updateById(123, {code_data: code});
  code_collection.save(function(err){
    release_persist_lck = true;
  });
}

function blink_the_blinkers(){
  jQuery(".blinker").toggle();
}

window.setInterval(persist_editor_data, 1000);
window.setInterval(blink_the_blinkers, 700);
//real_console.log(JSON.stringify(code_collection.find()));


// registering the serviceWorker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/serviceWork.js').then(function(registration) {
      // Registration was successful
      real_console.log('ServiceWorker registration successful with scope: ', registration.scope);
      //alert("Great! We have enabled your site to run offline");
    }, function(err) {
      // registration failed :(
      //console.log('ServiceWorker registration failed: ', err);
    });
  });
}
