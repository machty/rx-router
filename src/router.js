var fnString = 'function';
function isObservable(obj) {
  return obj && typeof obj.subscribe === fnString;
}

function castToObservable(obj) {
  return isObservable(obj) ? obj : Rx.Observable.just(obj);
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
             return castToObservable(getHandler(desc.handler));
           })
           .zip(handlersObservable, function(handler, desc) {
             return {
               handlerName: desc.handler,
               handler: handler
             };
           })
           .scan(initial, function(acc, obj) {
             return obj.handler.reduce(acc);
           });
};











function createRouter(_source) {
  var source = _source || Rx.Observable.empty();
  return source;
}



