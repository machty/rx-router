module("RouteParams#resolve");

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
    debugger;
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

  // do we call getHandlers on an array ahead of time?
  // or do we call them sequentially?
  // are we sure this is useful?
  //
  // if we're at this point, we've already got mappings.
  // so there's two things: you lazy load a recogHandlers array
  // based on name: {{link-to 'wat'}} will do a getHandlers()
  // observable on wat and basically load the route
  //
  // ASSUMPTION: all the shit has been Router.map'd. we're assuming
  // that only the Route handlers are possibly still to be loaded...
  // but they are already named.
  //
  // this is a fair assumption because:
  // - you can't accidentally arrive at a URL
  // - the only other remaining lazy loading case is if you
  //   transitionTo or link-to another route.
  //
  //

  debugger;
  var vals = {};
  function getHandler(handlerName) {
    ok(!vals[handlerName]);
    vals[handlerName] = true;

    return Rx.Observable.just({
      reduce: function() {
        return {};
      }
    });
  }

  var resolver = new RouteParams(getHandler);

  resolver.resolve({
    handlers: [{
      handler: 'wat'
    }, {
      handler: 'lol'
    }]
  }).subscribe(K, null, start);
});

// these handlers have model hooks
// and mapData...
//
// do we still require that all the data is loaded
// ahead of time, separate from the render process?
//
// we can leave it flexible... if render is blocked
// on everything being totally loaded, it can
// return a flatMap on the whole transition's bullshit.
//
// the one guarantee we have to make is that parent
// always renders before child...

/*

test("it is an observable", function() {
  stop();
  expect(1);

  var router = createRouter();

  router.updates.subscribe((v) => {
    deepEqual(v, {
      // handlers will modify these shits.
      // from root to leaf.

      // this object is something we expect
      // to be produced by each array of handlers
      // [h1, h2, h3, h4]
      // each one has a chance to map...

      // so we know a transition will map to a
      // Handlers object that flatMaps to an object.
      // we expect this to be an object with handlers[]
      // and queryParams{}

      // for now we'll assume router tests are integration tests.

    });
  });


  //router.





  router.takeUntil(timer)
    .subscribe(unexpected, unexpected, function() {
      ok(true, "was unsubscribed");
      start();
    });
});

test("it subscribes to in external input", function() {
  stop();
  expect(1);

  var urls = Rx.Observable.just("/wat");
  var router = createRouter(urls);

  router.takeUntil(timer)
    .subscribe(function(val) {
      equal(val, "/wat");
    }, unexpected, start);
});

test("#transitionTo accepts handlers and params", function() {
  //stop();
  //expect(1);

  var router = createRouter({
    getHandler: () => {
      // this could return a promise/observable for the handler needed.
      // could be used for lazy routes?

      // because this is called all over the place. Where?
      // - when materializing a handler to call router hooks
      // - when materializing handlers to generate links...?
      //   - actually no, you just pass that shit to generate
      //   - getHandler is called with a string of a name already
      //     declared into the generator.
      //   - either way there's a lot of async stuff that could be
      //     moved into Ember land.
      //
      // So in summary:
      //
      // - {{link-to 'some-name'}}
      // - recognizer.generate('some-name', {})
      //   - '/some-name'
      //   - ERROR if it's unrecognized
      //     - we could catch this and debounce all failed generator
      //       requests into a single request
      // - voila, we have URLs
      //
      // What about `serialize`? We only need serialize if we assume
      // that everything is sync. If it's async, then we can query later.
      //
      //
      //
    }
  });

  // do you subscribe to a location handler?
  // you want to receive changes from it, but also
  // push to it as well?

  var transition = router.transitionTo({
    handlers: [
      {
        handler: 'application',
        params: { }
      }
    ],
    queryParams: {}
  });

  // ultimately we have some array hierarchy of routes,
  // and these progressively construct a view hierarchy.

  // ['application', 'foo', 'bar']

  // is the route hierarchy (along w their params), but ultimately,
  // those get converted into a view hierarchy like
  //
  // {
  //   main: {
  //     model: wat,
  //     component: 'borf',
  //     outlets: {
  //       main: {
  //         model: shit,
  //         component: 'blah'
  //       }
  //     }
  //   }
  // }
  //
  // ... based on the observables returned from render fns, etc.
  // the flat array hierarchy + query params turns into a render tree.
  // Why flat array hierarchy? Because URLs can map to those easily,
  // as can any serialization algorithm.
  //
  // This view hierarchy could be fed into many things:
  //
  // - Simple diffing render
  //   - diff the outlet state, decide what to remove from dom,
  //     perform those changes immediately
  // - Liquid Fire renderer
  //   - diff, but support (and possibly map to?) an intermediate
  //     tree based on pre-defined transitions
  //   - e.g. some outlet gets swapped for the contents of another;
  //     using the old and new state, check if the diff matches a
  //     transition, and if so, kick off a transition. This seems
  //     to make sense more than defining transitions between routes...
  //     you really just care about the transition between what's
  //     being rendered into an outlet.
  //
  // there's an outstanding question of when we'd want to actually
  // fire these view updates; we _could_ have them fire immediately
  // when the render hook is hit... or we could buffer them
  // according to some other parameters, either within router
  // or on the ember side.

  // handler hooks:
  // - model
  // - activate
  // - setupController
  // - renderTemplates


  //export function model(params) {
  //}

  export default Ember.Route.extend({
    model: function() {
    }
  });

  // or we could have getHandler do a module lookup
  // and construct a handler

  //router.takeUntil(timer)
    //.subscribe(unexpected, unexpected, function() {
      //ok(true, "was unsubscribed");
      //start();
    //});
});
*/














