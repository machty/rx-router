module("Unit: Route");

function unexpected() {
  debugger;
  ok(false, "this shouldn't have been called!");
}

function K() {}

test("it exists", function() {
  ok(Router);
});

