/*
 * Ajaxer
 * Author: Benjamin Leffler <btleffler@gmail.com>
 * Date: 09/28/12
 * Uses: Cross-Browser XMLHttpRequest Creation by Joshua Eichorn <http://www.informit.com/articles/article.aspx?p=667416&seqNum=2>
 * Licence: MIT - <http://opensource.org/licenses/mit-license.php>
 */

(function setupAjaxer (w) {
  "use strict";
  var proto = {},
    s, h, p;

  /*
   * "Static" stuff
   */
  s = {
    "httpVerbs": [
      "HEAD", "GET", "POST", "PUT", "DELETE",
      "TRACE", "OPTIONS", "CONNECT", "PATCH"
    ],
    "useFormData": typeof w.FormData !== "undefined"
  };

  /*
   * Helper functions - save typing
   */
  h = {
    "error": function error (err) {
      throw new Error(err);
    },
    "warn": function warn (wrn) {
      // If there's no console, what's the point?
      if (window.console) {
        console.warn(wrn);
      }
    },
    /*
     * By Joshua Eichorn:
     * http://www.informit.com/articles/article.aspx?p=667416&seqNum=2
     * http://www.informit.com/authors/bio.aspx?a=29e0d4d6-2582-429f-b83b-ea27837fec4c
     */
    "getXMLHttp": function getXMLHttp () {
      var ids = [
          "MSXML2.XMLHTTP.5.0",
          "MSXML2.XMLHTTP.4.0",
          "MSXML2.XMLHTTP.3.0",
          "MSXML2.XMLHTTP",
          "Microsoft.XMLHTTP"
        ],
        len = ids.length,
        i = 0,
        obj;

      try {
        obj = new XMLHttpRequest();
        return obj;
      } catch (err1) {
        for (; i < len; i++) {
          try {
            obj = new ActiveXObject(ids[i]);
            return obj;
          } catch (err2) { /* Really don't even care */ }
        }

        // If it got all the way through the loop, there is no Ajax support
        h.error("Ajax is not supported.");
      }
    },
    "getHttpVerb": function getHttpVerb (method) {
      var verbs = s.httpVerbs,
        len = verbs.length,
        i = 0;

      method = method.trim().toUpperCase();

      for (; i < len; i++) {
        if (method === verbs[i])
          return method;
      }

      // Default to GET
      return "GET";
    },
    "useFormData": function useFormData (recheck) {
      if (recheck) {
        return s.useFormData = typeof w.FormData !== "undefined";
      }

      return s.useFormData;
    },
    "defaultCallbacks": function defaultCallbacks () {
      return { "before": [], "after": [] };
    },
    "parseJSON": function parseJSON (data) {
      if (window.JSON) {
        return JSON.parse(data);
      } else {
        return (new Function("return " + data))();
      }
    },
    "prepareData": function prepareData (data, recheck) {
      var out, p;

      if (h.useFormData(recheck)) {
        // Use FormData if we can
        out = new FormData();

        for (p in data) {
          if (data.hasOwnProperty(p) && p !== "hasOwnProperty") {
            out.append(p, data[p]);
          }
        }
      } else {
        // Otherwise, send it as a query string
        out = "";

        for (p in data) {
          if (data.hasOwnProperty(p) && p !== "hasOwnProperty") {
            out += (out.length ? '&' : '');
            out += encodeURIComponent(p) + '=' + encodeURIComponent(data[p]);
          }
        }
      }

      return out;
    }
  };

  /*
   * "Private" methods
   *  - Usually called on other objects
   */
  p = {
    "addCallbacks": function addCallbacks (callbacks, when) {
      var cb, len;

      if (typeof when === "undefined")
        when = "onComplete";

      if (typeof callbacks === "function") {
        this[when](callbacks);
      }

      if (!isNaN(parseInt(callbacks.length, 10))) {
        // Array
        len = callbacks.length;

        for(cb = 0; cb < len; cb++) {
          this[when](callbacks[cb]);
        }
      } else {
        // JSON object
        for (cb in callbacks) {
          if (callbacks.hasOwnProperty(cb) && cb !== "hasOwnProperty") {
            this[when](callbacks[cb]);
          }
        }
      }
    },
    "addCallback": function helperAddCallback (callback, when) {
      // Add a callback to before or after
      if (typeof callback === "function") {
        // If it's one function, great.
        this.callbacks[when].push(callback);
        return this;
      } else if (typeof callback !== "undefined") // Pass it on
        return this.addCallback({ when: callback });

        return this;
    },
    "callbacksOnComplete": function callbacksOnComplete (data) {
      var callbacks = this.callbacks.after,
        len = callbacks.length,
        i = 0;

      for (; i < len; i++) {
        if (callbacks[i].call(this, data) === false) {
          break;
        }
      }
    },
    "readyStateChange": function readyStateChange (ajaxer) {
      var self = this;

      return function () {
        var data;

        if (self.readyState === 4) {
          if (self.satus === 200) {
            ajaxer.responses.push(self.responseText);
            data = self.response || self.responseXML;

            if (!data)
              data = h.parseJSON(self.responseText);

            p.callbacksOnComplete.call(ajaxer, data);
          }
        }
      };
    },
    "setHeadersOnXhr": function setHeadersOnXhr (xhr, addXMLHTTPHeader) {
      var headers = this.headers,
        h;

      // Some things expect this header to be there, like it's there by default
      if (addXMLHTTPHeader)
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

      // Set any other user-specified header
      for (h in headers) {
        if (headers.hasOwnProperty(h) && h !== "hasOwnProperty") {
          xhr.setRequestHeader(h, headers[h]);
        }
      }
    }
  };

  /*
   * Ajaxer
   */
  function Ajaxer (options) {
    // Defaults
    this.options = options;
    this.url = "";
    this.data = {};
    this.method = "POST";
    this.headers = {};
    this.user = "";
    this.pass = "";
    this.responseType = "json";
    this.callbacks = h.defaultCallbacks();
    this.responses = [];
    this.requests = [];

    // I suppose this could change if there was a polyfil/shim for it
    if (!options.dontCheckForFormData)
      h.useFormData(true);

    // Set url
    if (typeof options.url === "string")
      this.url = options.url;

    // Set data
    if (typeof options.data !== "undefined")
      this.setData(options.data);

    // Set headers
    if (typeof options.headers === "object")
      this.setHeaders(options.headers);

    // Set user name and password
    if (typeof options.user === "string")
      this.user = options.user;

    if (typeof options.pass === "string")
      this.pass = options.pass;

    // Set response type
    if (typeof options.responseType === "string")
      this.responseType = options.responseType;

    // Set method
    if (typeof options.method === "string")
      this.method = h.getHttpVerb(options.method);

    // Set callbacks
    if (typeof options.callbacks !== "undefined")
      this.addCallback(options.callbacks);

    // Chain
    return this;
  }

  /*
   * Ajaxer prototype methods
   */
  proto.setData = function setData (data, reset) {
    var p, len;

    if (reset)
      this.data = {};

    if (typeof data !== "undefined") {
      if (typeof data.hasOwnProperty !== "undefined") {
        // JSON Object
        for (p in data) {
          if (data.hasOwnProperty(p) && p !== "hasOwnProperty") {
            this.data[p] = data[p];
          }
        }
      } else {
        // Array
        len = data.length;

        for(p = 0; p < len; p++) {
          this.data[p.toString()] = data[p];
        }
      }
    }

    // Chain
    return this;
  };

  proto.addData = proto.setData;

  proto.setHeaders = function setHeaders (header, reset) {
    var p;

    // Reset?
    if (reset)
      this.headers = {};

    for (p in header) {
      if (header.hasOwnProperty(p) && p !== "hasOwnProperty") {
        this.headers[p] = header[p];
      }
    }

    // Chain
    return this;
  };

  proto.addCallback = function addCallback (callbacks, reset) {
    var before, after;

    // Reset?
    if (reset)
      this.callbacks = h.defaultCallbacks();

    // Adding one callback?
    if (typeof callbacks === "function")
      this.onComplete(callbacks);

    // Are we adding before and after at the same time?
    if (typeof callbacks === "object") {
      before = callbacks.before;
      after = callbacks.after;

      if (typeof before !== "undefined")
        p.addCallbacks.call(this, before, "beforeSend");

      if (typeof after !== "undefined")
        p.addCallbacks.call(this, after, "onComplete");

      // Array/object of callbacks; Assume we want them called after
      if (typeof before === "undefined" && typeof after === "undefined")
        p.addCallbacks.call(this, callbacks, "onComplete");
    }

    // Chain
    return this;
  };

  proto.beforeSend = function beforeSend (callback) {
    return p.addCallback.call(this, callback, "before");
  };

  proto.onComplete = function onComplete (callback) {
    return p.addCallback.call(this, callback, "after");
  };

  proto.go = function go (callback) {
    var xhr = h.getXMLHttp(),
      callbacks = this.callbacks.before,
      len = callbacks.length,
      i = 0,
      data = h.prepareData(this.data);

    // Optionally add a callback
    if (typeof callback !== "undefined")
      this.addCallback(callback);

    // Call all the "before" callbacks
    for (; i < len; i++) {
      // If one returns (bool)false, don't continue
      if (false === callbacks[i].call(this, xhr)) {
        return;
      }
    }

    // Set up the event listeners on the xhr object
    xhr.addEventListener("readystatechange", p.readyStateChange(this));

    // Initialize request
    xhr.open(this.method, this.url, true, this.userName, this.password);

    // Set headers
    p.setHeadersOnXhr.call(this, xhr, true);

    // Send it on it's way
    xhr.send(data);

    // Save it for debugging
    this.requests.push(xhr);

    // Chain
    return this;
  };

  /*
   * Factory
   * - So you don't have to use "new" because it's
   *   weird looking in a scripting language I guess.
   */
  Ajaxer.createAjaxer = function createAjaxer (options) {
    return new Ajaxer(options);
  };

  /*
   * Setup prototype methods
   */
  Ajaxer.prototype = proto;

  /*
   * Export
   * - To the window, since this is in the browser
   */
  if (typeof w.Ajaxer === "undefined") {
    w.Ajaxer = Ajaxer;
  }
})(window);
