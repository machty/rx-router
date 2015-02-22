
function RouteParams(getHandler) {
  this.getHandler = getHandler;
}

RouteParams.prototype.resolve = function(allParams) {
  var initial = {};
  var getHandler = this.getHandler;

  var handlersObservable = Rx.Observable.fromArray(allParams.handlers);

  return handlersObservable
           .concatMap(function(desc) {
             return getHandler(desc.handler);
           })
           .zip(handlersObservable, function(handler, desc) {
             return {
               handlerName: desc.handler,
               handler: handler
               //params: desc.params
             };
           })
           .flatMap(function() {
             return Rx.Observable.just({});
           });

/*
  return Rx.Observable.fromArray(allParams.handlers)
           .scan(initial, function(acc, handlerDesc) {
             var handlerName = handlerDesc.handler;
             var handler = getHandler(handlerName);
             return handler.reduce(acc);
           });
           */
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

