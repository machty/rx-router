var fnString = 'function';
function isObservable(obj) {
  return obj && typeof obj.subscribe === fnString;
}

function RouteParams(getHandler) {
  this.getHandler = getHandler;
}

RouteParams.prototype.resolve = function(allParams) {
  var initial = {};
  var getHandler = this.getHandler;

  var handlersObservable = Rx.Observable.fromArray(allParams.handlers);

  return handlersObservable
           .concatMap(function(desc) {
             var val = getHandler(desc.handler);
             return isObservable(val) ? val : Rx.Observable.just(val);
           })
           .zip(handlersObservable, function(handler, desc) {
             return {
               handlerName: desc.handler,
               handler: handler
               //params: desc.params
             };
           })
           //.flatMap(function() {
             //return Rx.Observable.just({});
           //});

           .scan(initial, function(acc, obj) {
             return obj.handler.reduce(acc);
           });
};











function createRouter(_source) {
  var source = _source || Rx.Observable.empty();
  return source;
}




//
//
//
//function Router() {
//}

//Router.prototype = {
  //transitionTo: function() {
    //return true;
  //}
//};

