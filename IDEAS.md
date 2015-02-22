## Rx Router

Goals:

- embrace rx
- use observables to fix otherwise unsolvable router.js skeleltons
  due 

## Realizations

A transition should be hot. You shouldn't need to subscribe
to it for it to happen. Then again you should be able to subscribe
to it, but you don't want it to cancel if it falls through.

Maybe a transition is Hot and wraps a cold transitionAttempt

var ta = transitionAttempt('wat','bleh','snorlax');

a transitionAttempt is toooootally a descriptor for a transition.
Depending on the current state of the router, it might yield different
things. THIS is what you want to store to return to a previous route.

transition is a promise. it succeeded or it didn't. it is possible to
have a transitionAttempt without a transition, but it's probably an
internal thing. A transitionAttempt needs to have ALL of the params
to fully specify a route. A transition can partially specify, but at
construction time creates a transitionAttempt that is fully realized.
A TransitionIntent is partially specified. 

A Transition is a Promise; it either succeeds or it fails (maybe we
need finer granularity of fulfillment states?). 

To create a Transition, you need to provide a TransitionIntent, which is
partially or fully specified (do we want to allow partially specified?
probably, but it does lead to some refactoring ugliness once a link-to
is moved out of a dynamic parent route). 

The TransitionIntent combines with the current state of the router at
the time a Transition is created to produce a TransitionAttempt.
The Transition obj accepts a TransitionAttempt...?

Either it accepts a possibly-partially specified TransitionIntent,
or a fully-specified TransitionAttempt; doesn't really matter, since
everyone's going to be creating transitions through the router, which
can make this decision for us. 

Question: do we want it to be possible to have multiple transitions
going on at the same time? And if not, how do we model this in code
in a BEAUTIFUL manner? Probably some flatMapLatest

`transitionAttempts` is an observable, and we flatMapLatest that
shit into a Transition!

    var states = transitionAttempts.flatMapLatest((ta) => {
      return new InternalTransition();
    });

So this produces an observable of states. I suppose these could
include snapshots of shit while it's loading.



function Router() {

}


// TODO: generate this from constructor?
router.transitionTo = function(intent, shit) {
  var intent = createIntentFromArgs(arguments);

  
  var transitionSubject = new Subject();

  // transition needs to generate this internally. It
  // only gets activated when the router subscribes to it.

  var transitionObservable = Rx.Observable.create(function(observer) {
    // Someone subscribed! Can only be the router.
    // Start running hooks on handlers n stuff?


    return function() {
      // router unsubscribed from this transition.
      // check if it finished resolving all the hooks
      // and decide how to resolve the transition promise?
    };
  });


  // if we want to offer the ability to retry a transition...
  // we want to make it possible to retry the explicit state,
  // or to allow retrying the intent on whatever the current
  // router state is, falling back to the transitionState if necessary.
  return new Transition(transitionState, transitionAttempts);
}

transitionAttempts = userTransitions.merge(urlTransitions);











      // what does the route input? transitionIntents?
      // No the route inputs URL changes. Maybe a BehaviorSubject based
      // on pushState and hash

      // While a router is listening, events are attached to these shits.
      // God this is so fucking elegant.


      // the router should die when the app does...

      var mappings = routerDsl.map(mappingCallback);

      var router = new Router(urlStream, mappings);

      // this is what attaches pushState / hash
      //router.subscribe(function(state) {
        //app.setState(state);
      //});

      router.takeUntil(appDies).subscribe(function() {
        app.setState(state);
      });

      // Then we could use a router to be in charge of component
      // state. Then what are the inputs? Params?

      Component.extend({
        mountStateMachine: function() {
          var componentWasDestroyed = Rx.Observable.create((observer) => {
            this.destroy = function() {
              this._super.apply(this, arguments);
              observer.onNext(true);
            };
          });

          var router = new Router();
          router.takeUntil(componentWasDestroyed).subscribe((state) => {
            this.set('state', state);
          });
        }.on('init'),

        routes: function() {
          this.route('hello', function() {
            this.route('woot');
            this.route('foo');
            this.route('bar');
          });
        }
      });

      // do we want these to hook into the router in some way?
      // do we want components to have async model hooks?








      var stateMachine = new Router();

      // HORSE SHIT.



      // location:none just means no one has subscribed to url updates
      // the main thing to subscribe to are state changes. 


      //router.sub


      // emitted on every transition started.
      // emits an observable, since every trans is an observable
      // router.transitions

      // router.transitions.flatMapLatest(function(transition) {
      //   return transition;
      // }).subscribe(function(completedState) {
      // });

      // realization: you could think of Transition as a Promise or an Observable
      // - Observable: if it completed, fire an event and close.
      //               if it was interrupted, close without event
      // - Promise: it it completed, fulfill. if it was aborted, reject.
      //            if it was redirected, FOLLOW the redirect.


      //router.transitions.subscribe(function() {
      //});

      //rout


      //router.subscribe(function(state) {
        ////setState
      //});

      //router.transitionTo();



      //ok(router.transitionTo());
      //router.transitionTo

      // what is the router? is it a subscription?
      // is it a singleton that manages a singleton subscription?
      // the router is a subject. that you can subscribe to.
      //



      // promisesbDbDbbbb



## Inputs


The router should accept a normalized stream of transition attempts,
which it will merge with its own internal stream of transition retry()s.

Ember Router will create the following on startup:


var location = router.get('location'); // e.g. HashLocation, HistoryLocation

var urlTransitionParameters = location.urlsObservable.map((url) => {
  // NOTE: Ember would directly depend on RouteRecognizer rather
  // than RouteRecognizer being an internal dep of router.js

  // return parameters for the recognized route
  // TODO: do we also want to pass through an `initiator`?
  // so that we could notify a TransitionAttempt promise that
  // it failed?

  

  return routeRecognizer.recognize(url);
});


// ultimately you wanna be able to be like (and we support today):

router.transitionTo("/some/url");
router.transitionTo("wat.route");
router.transitionTo({
  handlers: [
    {
      handler: "application",
      params: { }
    },
    {
      handler: "wat",
      params: {
        "foo_id": "lol",
        "id": "hah"
      }
    }
  ],
  queryParams: {}
});

urls are detected by front slash and use `recognizer.recognize` as a mapping fn
route names are non-front-slashed and use `recognizer.generate`
or we could directly accept raw handlers and skip the recognizer

## Design issues

- What is a Transition object? When/how do we expose internal state?
  - A Transition could be started by 


We want to be able to track the progress of a transition, but there
are issues:

- A Transition needs to be notified whether it succeeded or failed.
  



## Appendix: Recognizer format

TODO: need to change the current recognizer format to look
as follows (today it hackishly stashes a property on the
handlers array).

{
  handlers: [
    {
      handler: "application",
      params: { }
    },
    {
      handler: "wat",
      params: {
        "foo_id": "lol",
        "id": "hah"
      }
    }
  ],
  queryParams: {}
}













What does the router do today?

- it transitions based on the following input:
  - transitionTo()
  - urlTransition()
    - really just a transitionTo where someone else has come
      along and translated some serialized state into a transition

- so really we just want a `transitionToHandlerInfos`
- what you pass into the router is a stream of transitionAttempts
- in ember, transitionAttempts could be 
  - transitionAttempts = manualTransitionTos.merge(urlTransitions)


## Fresh rethink (2/21/15)

- What does it mean to retry() a partially specified transition?
  e.g. within 'articles/1', you have a transitionTo('comments', 123)
- issues:
  - [retry() only captures previous router state if aborted](https://github.com/emberjs/ember.js/issues/5208)
  - you can't save a current router state and transition back to it
    without hacks....
  - solution: expose `Route#transitionDescriptor()`
    - can only be called "validly" while the route is active
    - zero arguments just grabs the current transition state
    - more args will compute the diffed state based on the 
      args you provided.
      - but will we actually error out if the args provided yield
        a pivot route deeper than the route you call
        `transitionDescriptor` on?
    - or `transitionDescriptor()` can just return a fn that closes
      over route state, and will compute the necessary route change
      based on the shit you provide.
        

route.transitionTo('blah', 'incomplete', 'params');



// TransitionableInterface
transitionTo: ()
replaceState: ()

// Example Transitionables

Router
- transition off of current state, or underway Transition

Route
- (convenience methods that forward to Router)

Transition
- 



transitionTo(routeState, 'additional', 'params');








// Router (Route's can continue to forward to Router)

    transitionTo: function() {
      return this.transitionDescriptor().transition();
    },

    replaceState: function() {
      return this.transitionDescriptor().replace();
    },

    transitionDescriptor: function(args) {


      // a Route is a Transitionabl

      {
        handlers: [
          {
            handler: "wat"
            params: {
              foo: "wat"
            }
          }
        ]
      }
    },



Fetch response:

- we should highlight deals in the store! We know ahead of time
  what the deals are, what they're called, etc.





transitionTo still returns a Transition object





    model(params) {
      return ajaxObservable("/wat/" + params.wat)
             .retry(5);
    }

    // internal router code

    var val = handler.model(params);
  
    // normalize into observable; 
    // - values turn into .just(value)
    // - promises turn into observables
    // - observables are kept the same

    // then we return the flatMap of that pig fucker.

    return params.flatMap((p) => {
      return castToObservable(handler.model(p));
    });













