(function() {

  "use strict";

  module("Unit: RouteParams");

  // you want to create a new router that emits some observables.
  // we want the url updating to be stubbable, such that
  // hash and pushState are both supported

  function unexpected() {
    debugger;
    ok(false, "this shouldn't have been called!");
  }

  function K() {}

  var timer = Rx.Observable.timer(100);

  asyncTest("an empty array of handlers yields empty pojo", function() {
    expect(1);

    var resolver = new RouteParams();

    resolver.resolve({
      handlers: []
    }).subscribe(function(obj) {
      deepEqual(obj, {});
    }, null, start);
  });

  asyncTest("a single handler", function() {
    expect(3);

    var watObj = {};

    function getHandler(handlerName) {
      equal(handlerName, 'wat');
      return Rx.Observable.just({
        reduce: function(agg) {
          deepEqual(agg, {});
          return watObj;
        }
      });
    }

    var resolver = new RouteParams(getHandler);

    resolver.resolve({
      handlers: [{
        handler: 'wat'
      }]
    }).subscribe(function(obj) {
      equal(obj, watObj, "the reduced value is the wat's reduce return");
    }, null, start);
  });

  asyncTest("getHandler can return an observable; all handlerNames eagerly invoked", function() {
    expect(2);

    var handlerNames = [];
    var count = 0;
    function getHandler(handlerName) {
      handlerNames.push(handlerName);
      return Rx.Observable.just({
        reduce: function() {
          return {};
        }
      }).delay(++count === 1 ? 50 : 10); // test reverse resolution
    }

    var resolver = new RouteParams(getHandler);

    resolver.resolve({
      handlers: [{
        handler: 'wat'
      }, {
        handler: 'lol'
      }]
    }).subscribe(function() {
      deepEqual(handlerNames, ['wat', 'lol'], "all handler names retrieved by the time mapping fn called");
    }, null, start);
  });

  function defaultGetHandler(handlers) {
    return function(name) {
      var handler = handlers[name];
      if (!handler.reduce) {
        handler.reduce = function() {
          return {};
        };
      }

      if (!handler.params) {
        handler.params = {};
      }
      return handler;
    };
  }

  asyncTest("handlers' reduce fns progressively build up a (render?) tree", function() {
    expect(1);

    var handlerNames = [];
    var getHandler = defaultGetHandler({
      wat: {
        reduce: function(tree) {
          return {
            wat: 'wat'
          };
        }
      },
      lol: {
        reduce: function(tree) {
          return {
            lol: 'lol'
          };
        }
      }
    });

    var resolver = new RouteParams(getHandler);

    resolver.resolve({
      handlers: [{ handler: 'wat' }, { handler: 'lol' }]
    }).toArray().subscribe(function(treeProgression) {
      deepEqual(treeProgression, [
        {
          wat: 'wat'
        },
        {
          lol: 'lol'
        }
      ]);
    }, null, start);
  });

  asyncTest("model hooks", function() {
    expect(3);

    var watModel = {};
    var lolModel = {};

    var getHandler = defaultGetHandler({
      wat: {
        model: function(params, context) {
          deepEqual(params, { wat_id: 123 });
          deepEqual(context, {
            //params: {
              //wat_id: 123,
              //lol_id: 456
            //},
            models: { }
          });
          return watModel;
        }
      },
      lol: {
        model: function(params, context) {
          deepEqual(params, { lol_id: 456 });
          // TODO: include params in the context var?
          // what about the shared parameter names between different routes in the hierarchy?
          //deepEqual(context.params, {
            //wat_id: 123,
            //lol_id: 456
          //});
          //return context.models.wat.map(function() {
            return lolModel;
          //});
        }
      }
    });

    var resolver = new RouteParams(getHandler);

    resolver.resolve({
      handlers: [{
        handler: 'wat',
        params: { wat_id: 123 }
      }, {
        handler: 'lol',
        params: { lol_id: 456 }
      }]
    }).subscribe(K, null, start);
  });
})();

