function Transition(didAbort) {
  this.abort = function() {
    didAbort.onNext(true);
    didAbort.onCompleted();
  };
}

function Router(options) {

  var getHandler = options.getHandler;

  var RP = options.RouteParams || RouteParams;
  var routeParams = new RP(getHandler);

  var latestTransitions = new Rx.Subject();

  var didDestroy = new Rx.Subject();

  var transitions = this.transitions =
    latestTransitions.flatMapLatest(function(obs) {
      // cleaner way to do this without seemingly useless identity mapping fn?
      return obs;
    }).takeUntil(didDestroy);

  this.transitionTo = function(paramsPayload) {

    var didAbort = new Rx.Subject();
    var transition = new Transition(didAbort);

    var abort;
    var transitionObservable = Rx.Observable.create(function(observer) {
      var subscription = routeParams.resolve(paramsPayload).subscribe(function (v) {
        observer.next(v);
      });

      return function() {
        // onCompleted? or dispose?
        subscription.onCompleted();
      };
    }).takeUntil(didAbort);

    latestTransitions.onNext(transitionObservable);

    return transition;
  };

  this.destroy = function() {
    // TODO: more idiomatic pattern for marking destruction?
    // I tried calling onCompleted on `latestTransitions`, but
    // but this didn't cause `transitions` to complete... why?

    didDestroy.onNext(true);
    didDestroy.onCompleted();
  };
}

