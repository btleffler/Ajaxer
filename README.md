# Ajaxer
## Another `XMLHttpRequest` abstraction

If you've ever been stuck using an outdated javascript library without the possiblility of upgrading it, you've probably had trouble with the library's built in ajax helpers. _Trouble no more!_ `Ajaxer` is made to be a simple to use, browser friendly, `XMLHttpRequest` abstraction. It supports different request methods, username and password authentication, custom headers, and custom callbacks.

### Sample Usage
Make sure that you've loaded `Ajaxer.js` or `Ajaxer.min.js`. There are no other requirements.

```js
var my_ajax = new Ajaxer({
  "url": "/my_ajax/action",
  "method": "PUT",  // Defaults to POST
  "headers": { // "X-Requested-With: XMLHttpRequest" is in the headers by default
    "Super-Secret": "Keyboard Cat"
  },
  "user": "btleffler",
  "pass": "alsoKeyboardCat",
  "responseType": "text", // Defaults to json
  "data": { // defaults to {}, can also be an array
    "just": "a",
    "simple": "hash"
  },
  "callbacks": {
    "before": [
      function firstBeforeCallback (xhr) {
        // xhr is the actual XMLHttpRequest object being used for the request
        // 'this' is the instance of Ajaxer that's performing the request
      },
      function secondBeforeCallback (xhr) {
        // Same as firstBeforeCallback, but called directly after
      }
    ],
    "after": [
      function firstAfterCallback (data) {
        // Data is the parsed data that comes from the response if there is any
        // It tries to default to whatever the responseType is set to
        // 'this' is the instance of the Ajaxer that performed the request
      },
      function secondAfterCallback (data) {
        // Same as above. Called directly after firstAfterCallback
      }
    ]
  }
});

/*
 * Do some more stuff in preparation...
 */

// Set it loose!
my_ajax.go();
```

### Documentation
All methods are chainable. There's no need to put everything on a separate line, unless you want to.

#### createAjaxer([(hash)options])
If you don't like to use the "new" keyword, or want to chain directly from start, you can use `Ajaxer.createAjaxer()`.

```js
var options = {
  // Same as the example above...
};

Ajaxer.createAjaxer(options).go();
```

### setData([(mixed)data][, (boolean)reset]) & addData([(mixed)data][, (boolean)reset])
Add data to the `Ajaxer` instance after it's been constructed. `setData` and `addData` are aliases of the same function.

```js
my_ajax.setData({ "some": "data" }).addData([ "more", "data" ]);
```

There is an optional second parameter to reset the data in the `Ajaxer` instance back to `{}`.

```js
my_ajax.setData({ "this": "is", "all": "the", "data": "now" }, true);
```

### setHeaders([(hash)headers][, reset])
Add to the headers of the request. Works the same as `setData` and `addData`, except that it only accepts a hash.

```js
my_ajax.setHeaders({
  "X-Requested-With": "Not XMLHttpRequest because I'm sneaky."
});
```

### Callbacks
There are two times callbacks are called with `Ajaxer`, just before the request is sent, and just after we get a response.

#### addCallback([(mixed) callback])
`addCallback()` allows you to add "before" and "after" callbacks at the same time. If you don't specify before or after, it will default to "after."

```js
/*
 * Assume 'func1-10', etc are actual functions
 */

// Add both
my_ajax.addCallback({
  "before": [
    func1,
    func2,
    func3
  ],
  "after": [
    func4,
    func5,
    func6
  ]
});

// Only add for "after"
my_ajax.addCallback([ func7, func8, func9 ]);
my_ajax.addCallback(func10);
```

#### beforeSend([(mixed) callback])
Add a callback, or multiple callbacks to be called before the request is sent.

```js
my_ajax.beforeSend([
  doThisBefore,
  alsoDoThis
]);

my_ajax.beforeSend(dontForgetThisToo);
```

#### onComplete([(mixed) callback])
Same as `beforeSend()` but for callbacks that are called after we get a response.

```js
my_ajax.onComplete([
  doStuffWithData,
  doMoreWork
]);

my_ajax.onComplete(thereIsStillMoreWork);
```

### go([(mixed) callback])
Initiates and sends the request and calls the callbacks. `go()` can also take an optional parameter of callbacks the same way `addCallback()` works.

```js
my_ajax.go({
  "before": [ almostForgotToDoThis ],
  "after": [ weCantForgetAboutThisEither ]
});
```

## Uses
[Cross-Browser `XMLHttpRequest` Creation](http://www.informit.com/articles/article.aspx?p=667416&seqNum=2) by [Joshua Eichorn](http://www.informit.com/authors/bio.aspx?a=29e0d4d6-2582-429f-b83b-ea27837fec4c)

## Licence - MIT
Copyright (c) 2012 Benjamin Leffler

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
