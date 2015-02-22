(function() {

  "use strict";

  var router;

  module("Unit: Router", {
    teardown: function() {
    }
  });

  function unexpected() {
    debugger;
    ok(false, "this shouldn't have been called!");
  }

  function StubRouteParams() {
    this.resolve = function(allParams) {
      return Rx.Observable.just({

      });
    };
  }

  function K() {}

  test("initialization", function() {
    expect(1);

    function getHandler() {}
    function StubRouteParams(_getHandler) {
      equal(getHandler, _getHandler, "getHander passed through to RouteParams");
    }

    router = new Router({
      getHandler: getHandler,
      RouteParams: StubRouteParams
    });

    router.destroy();
  });

  asyncTest("it exposes a transitions observable", function() {
    expect(2);

    var paramsPayload = {};

    router = new Router({
      RouteParams: function StubRouteParams() {
        this.resolve = function(payload) {
          equal(payload, paramsPayload, "RouteParams is passed the params payload passed to transitionTo");
          return Rx.Observable.of(123, 456);
        };
      }
    });

    router.transitions
          .toArray()
          .subscribe(function(states) {
            deepEqual(states, [ 123, 456 ], "all render states were received");
          }, null, start);

    router.transitionTo(paramsPayload);

    setTimeout(function() {
      router.destroy();
    }, 5);
  });

  asyncTest("transitionTo returns a transition", function() {
    var renderTree = {};
    router = new Router({
      RouteParams: function StubRouteParams() {
        this.resolve = function(payload) {
          return Rx.Observable.of(renderTree).delay(10);
        };
      }
    });

    router.transitions
          .toArray()
          .subscribe(function(states) {
            deepEqual(states, [], "no render states were received");
          }, null, start);

    var transition = router.transitionTo({});
    transition.abort();

    setTimeout(function() {
      router.destroy();
    }, 50);
  });

  asyncTest("a new transition aborts a previously active transition", function() {
    var renderTree = {};
    var count = 0;

    router = new Router({
      RouteParams: function StubRouteParams() {
        this.resolve = function(payload) {
          count++;
          return Rx.Observable.timer(50, 50).take(2);
        };
      }
    });

    router.transitions
          .toArray()
          .subscribe(function(states) {
            deepEqual(states, [0, 0, 1], "no render states were received");
          }, null, start);

    router.transitionTo({});

    setTimeout(function() {
      router.transitionTo({});
    }, 70);

    //var firstTransition = router.transitionTo({});
    //var secondTransition = router.transitionTo({});
    //transition.abort();

    setTimeout(function() {
      equal(count, 2);
      router.destroy();
    }, 200);
  });


})();






