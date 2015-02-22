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
          return Rx.Observable.of({
            render: 1
          }, {
            render: 2
          });
        };
      }
    });

    router.transitions
          .toArray()
          .subscribe(function(states) {
            deepEqual(states, [
              { render: 1 },
              { render: 2 }
            ], "all render states were received");
          }, null, start);

    router.transitionTo(paramsPayload);

    setTimeout(function() {
      router.destroy();
    }, 5);
  });

})();






