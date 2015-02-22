function Router(options) {

  var getHandler = options.getHandler;

  var RP = options.RouteParams || RouteParams;
  var routeParams = new RP(getHandler);

  var transitions = this.transitions = new Rx.Subject();

  this.transitionTo = function(paramsPayload) {
    routeParams.resolve(paramsPayload).subscribe(function (v) {
      // more idiomatic way to forward events to a subject?
      transitions.onNext(v);
    });
  };

  this.destroy = function() {
    transitions.onCompleted();
  };

}






