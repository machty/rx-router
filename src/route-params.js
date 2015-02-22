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

  var modelObservables = {};
  return handlersObservable
           .concatMap(function(desc) {
             return castToObservable(getHandler(desc.handler));
           })
           .zip(handlersObservable, function(handler, desc) {
             return {
               handlerName: desc.handler,
               handler: handler,
               params: desc.params
             };
           })
           // now create model observables
           .concatMap(function(desc) {
             var obs = modelObservables[desc.handlerName] =
                 castToObservable(desc.handler.model ? desc.handler.model(desc.params, {
               models: {}
             }) : null);

             return obs.map(function(model) {
               // wat. mutability?
               desc.model = model;
               return desc;
             });
           })
           .scan(initial, function(acc, obj) {
             return obj.handler.reduce(acc);
           });
};

