// console outputs override for user code---------------------------------------
var result
var console = {
  log: function(str){
    if(str instanceof Object){
      try{
        str = JSON.stringify(str);
      }
      catch(e){}
    }

  },
  error: function(str){
    if(str instanceof Object){
      try{
        str = JSON.stringify(str);
      }
      catch(e){}
    }
    
  }
};
