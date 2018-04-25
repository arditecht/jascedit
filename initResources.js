// editor related---------------------------------------------------------------
var editor = ace.edit("editor");
var code, release_persist_lck = true;
editor.setOptions({
  fontSize: "12pt",
  highlightGutterLine: true,
  showFoldWidgets: true,
  highlightActiveLine: true,
});
editor.setTheme("ace/theme/ambiance");
editor.getSession().setMode("ace/mode/javascript");
editor.focus();

// DB related-------------------------------------------------------------------
var fdb = new ForerunnerDB();
var db = fdb.db("datastore");
var code_collection = db.collection("user_code",  {
  autoCreate: true,
  primaryKey: "code_index"
});
var DBview = db.view("dbview"); // used to view the DB
// populating editor if entry already exists
code_collection.load(function(err){
  if(!err){
    var precode = code_collection.find({
      code_index: {
        "$eeq": 123
      }
    });
    if(precode.length){
      pre_session_data = precode[0].code_data;
      editor.setValue(pre_session_data, 1);
    }
    else{
      code_collection.insert({
        code_index: 123,
        code_data: ""
      })
    }
  }
});
//------------------------------------------------------------------------------

// globals vars and locks
var real_console = window.console;
var pre_session_data = "";
var exec_lock = false;  // for locking the code running till one script is already being evaluated
