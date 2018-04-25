// takes care of web workers boilerplating
(function() {

  // -------------------------------------------------------------------------//
  function get_str_as_error(str){
    return ("<em style='color: red'>" + str + "</em>");
  }
  // instead of postMessaging eval result, accumulate all console logs done by
  // user and post the resultant string instead. So, a way to print for a user
  var console_result = "";
  var console = {
    log: function(str){
      if(typeof str === 'undefined'){
        str = "";
      }
      if(str instanceof Object){
        try{
          str = JSON.stringify(str);
        }
        catch(e){}
      }
      console_result += str+"</br>";
    },
    error: function(str){
      if(str instanceof Object){
        try{
          str = JSON.stringify(str);
        }
        catch(e){}
      }
      console_result += get_str_as_error(str)+"</br>";
    }
  };
  // -------------------------------------------------------------------------//


  function Lemming(script) {
    this.script = script;
  }

  Lemming.options = {
    fileName: 'webWorkerRigged.js',
    timeout: 3000,
    scripts: [],
    enableXHR: false
  };

  Lemming.prototype.run = function(options) {
    options = objectWithDefaults(options, Lemming.options);

    var lemming = this,
        worker  = new Worker(options.fileName),
        handle  = setTimeout(function() {

          worker.terminate();
          lemming.handleTimeout();
          lemming.handleCompleted();

        }, options.timeout);

    worker.addEventListener('message', function(e) {
      clearTimeout(handle);
      lemming.handleResult(e.data);
      lemming.handleCompleted();
    });

    worker.addEventListener('error', function(e) {
      clearTimeout(handle);
      lemming.handleError(e.message || e);
      lemming.handleCompleted();
    });

    var message = JSON.stringify({
      source: this.script,
      scripts: options.scripts,
      enableXHR: options.enableXHR
    });

    worker.postMessage(message);
  };

  Lemming.prototype.onResult = function(callback) {
    this.handleResult = callback;
  };

  Lemming.prototype.onTimeout = function(callback) {
    this.handleTimeout = callback;
  };

  Lemming.prototype.onError = function(callback) {
    this.handleError = callback;
  };

  Lemming.prototype.onCompleted = function(callback) {
    this.handleCompleted = callback;
  };

  Lemming.prototype.handleResult =
  Lemming.prototype.handleTimeout =
  Lemming.prototype.handleError =
  Lemming.prototype.handleCompleted = function() {};

  function objectWithDefaults(properties, defaults) {
    var object = {};
    for (var p in properties) {
      object[p] = properties[p];
    }
    for (var d in defaults) {
      if (!object[d]) {
        object[d] = defaults[d];
      }
    }
    return object;
  }

  if (typeof WorkerGlobalScope !== 'undefined' && this instanceof WorkerGlobalScope) {
    this.onmessage = function onmessage(e) {
      var data = JSON.parse(e.data);

      importScripts.apply(this, data.scripts);

      if (!data.enableXHR) {
        delete this.XMLHttpRequest;
      }

      eval(data.source);
      this.postMessage(console_result);
    };
  }

  this.Lemming = Lemming;

}).call(this);
