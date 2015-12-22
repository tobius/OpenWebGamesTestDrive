
var Module;

if (typeof Module === 'undefined') Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
 var loadPackage = function(metadata) {

    var PACKAGE_PATH;
    if (typeof window === 'object') {
      PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    } else if (typeof location !== 'undefined') {
      // worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
    } else {
      throw 'using preloaded data can only be done on a web page or in a web worker';
    }
    var PACKAGE_NAME = 'webgl_5_1_0_with_nthreads_fastest_opt_profilingfuncs.data';
    var REMOTE_PACKAGE_BASE = 'webgl_5_1_0_with_nthreads_fastest_opt_profilingfuncs.data';
    if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
      Module['locateFile'] = Module['locateFilePackage'];
      Module.printErr('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
    }
    var REMOTE_PACKAGE_NAME = typeof Module['locateFile'] === 'function' ?
                              Module['locateFile'](REMOTE_PACKAGE_BASE) :
                              ((Module['filePackagePrefixURL'] || '') + REMOTE_PACKAGE_BASE);
  
      var REMOTE_PACKAGE_SIZE = 35818527;
      var PACKAGE_UUID = 'a0af4140-62a3-403e-b41e-1854735549ab';
    
    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        var size = packageSize;
        if (event.total) size = event.total;
        if (event.loaded) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: size
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
          var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads/num);
          if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          if (Module['setStatus']) Module['setStatus']('Downloading data...');
        }
      };
      xhr.onload = function(event) {
        var packageData = xhr.response;
        callback(packageData);
      };
      xhr.send(null);
    };

    function handleError(error) {
      console.error('package error:', error);
    };
  
      var fetched = null, fetchedCallback = null;
      fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);
    
  function runWithFS() {

    function assert(check, msg) {
      if (!check) throw msg + new Error().stack;
    }
Module['FS_createPath']('/', 'Resources', true, true);

    function DataRequest(start, end, crunched, audio) {
      this.start = start;
      this.end = end;
      this.crunched = crunched;
      this.audio = audio;
    }
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.name = name;
        this.requests[name] = this;
        Module['addRunDependency']('fp ' + this.name);
      },
      send: function() {},
      onload: function() {
        var byteArray = this.byteArray.subarray(this.start, this.end);

          this.finish(byteArray);

      },
      finish: function(byteArray) {
        var that = this;
        Module['FS_createPreloadedFile'](this.name, null, byteArray, true, true, function() {
          Module['removeRunDependency']('fp ' + that.name);
        }, function() {
          if (that.audio) {
            Module['removeRunDependency']('fp ' + that.name); // workaround for chromium bug 124926 (still no audio with this, but at least we don't hang)
          } else {
            Module.printErr('Preloading file ' + that.name + ' failed');
          }
        }, false, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
        this.requests[this.name] = null;
      },
    };

      new DataRequest(0, 6752, 0, 0).open('GET', '/level0');
    new DataRequest(6752, 13596, 0, 0).open('GET', '/level1');
    new DataRequest(13596, 151604, 0, 0).open('GET', '/level10');
    new DataRequest(151604, 289612, 0, 0).open('GET', '/level11');
    new DataRequest(289612, 562764, 0, 0).open('GET', '/level12');
    new DataRequest(562764, 569752, 0, 0).open('GET', '/level2');
    new DataRequest(569752, 576852, 0, 0).open('GET', '/level3');
    new DataRequest(576852, 583668, 0, 0).open('GET', '/level4');
    new DataRequest(583668, 590748, 0, 0).open('GET', '/level5');
    new DataRequest(590748, 601228, 0, 0).open('GET', '/level6');
    new DataRequest(601228, 611268, 0, 0).open('GET', '/level7');
    new DataRequest(611268, 621308, 0, 0).open('GET', '/level8');
    new DataRequest(621308, 631348, 0, 0).open('GET', '/level9');
    new DataRequest(631348, 667368, 0, 0).open('GET', '/mainData');
    new DataRequest(667368, 667751, 0, 0).open('GET', '/methods_pointedto_by_uievents.xml');
    new DataRequest(667751, 4957471, 0, 0).open('GET', '/sharedassets0.assets');
    new DataRequest(4957471, 8199187, 0, 0).open('GET', '/sharedassets1.assets');
    new DataRequest(8199187, 8204131, 0, 0).open('GET', '/sharedassets10.assets');
    new DataRequest(8204131, 8520811, 0, 0).open('GET', '/sharedassets11.assets');
    new DataRequest(8520811, 8591427, 0, 0).open('GET', '/sharedassets12.assets');
    new DataRequest(8591427, 18161347, 0, 0).open('GET', '/sharedassets13.assets');
    new DataRequest(18161347, 18190755, 0, 0).open('GET', '/sharedassets2.assets');
    new DataRequest(18190755, 22374755, 0, 0).open('GET', '/sharedassets3.assets');
    new DataRequest(22374755, 22379175, 0, 0).open('GET', '/sharedassets4.assets');
    new DataRequest(22379175, 22409047, 0, 0).open('GET', '/sharedassets5.assets');
    new DataRequest(22409047, 24342183, 0, 0).open('GET', '/sharedassets6.assets');
    new DataRequest(24342183, 30173595, 0, 0).open('GET', '/sharedassets7.assets');
    new DataRequest(30173595, 33651883, 0, 0).open('GET', '/sharedassets8.assets');
    new DataRequest(33651883, 33656835, 0, 0).open('GET', '/sharedassets9.assets');
    new DataRequest(33656835, 35238423, 0, 0).open('GET', '/Resources/unity_default_resources');
    new DataRequest(35238423, 35818527, 0, 0).open('GET', '/Resources/unity_builtin_extra');

    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      
      // Reuse the bytearray from the XHR as the source for file reads.
      DataRequest.prototype.byteArray = byteArray;
          DataRequest.prototype.requests["/level0"].onload();
          DataRequest.prototype.requests["/level1"].onload();
          DataRequest.prototype.requests["/level10"].onload();
          DataRequest.prototype.requests["/level11"].onload();
          DataRequest.prototype.requests["/level12"].onload();
          DataRequest.prototype.requests["/level2"].onload();
          DataRequest.prototype.requests["/level3"].onload();
          DataRequest.prototype.requests["/level4"].onload();
          DataRequest.prototype.requests["/level5"].onload();
          DataRequest.prototype.requests["/level6"].onload();
          DataRequest.prototype.requests["/level7"].onload();
          DataRequest.prototype.requests["/level8"].onload();
          DataRequest.prototype.requests["/level9"].onload();
          DataRequest.prototype.requests["/mainData"].onload();
          DataRequest.prototype.requests["/methods_pointedto_by_uievents.xml"].onload();
          DataRequest.prototype.requests["/sharedassets0.assets"].onload();
          DataRequest.prototype.requests["/sharedassets1.assets"].onload();
          DataRequest.prototype.requests["/sharedassets10.assets"].onload();
          DataRequest.prototype.requests["/sharedassets11.assets"].onload();
          DataRequest.prototype.requests["/sharedassets12.assets"].onload();
          DataRequest.prototype.requests["/sharedassets13.assets"].onload();
          DataRequest.prototype.requests["/sharedassets2.assets"].onload();
          DataRequest.prototype.requests["/sharedassets3.assets"].onload();
          DataRequest.prototype.requests["/sharedassets4.assets"].onload();
          DataRequest.prototype.requests["/sharedassets5.assets"].onload();
          DataRequest.prototype.requests["/sharedassets6.assets"].onload();
          DataRequest.prototype.requests["/sharedassets7.assets"].onload();
          DataRequest.prototype.requests["/sharedassets8.assets"].onload();
          DataRequest.prototype.requests["/sharedassets9.assets"].onload();
          DataRequest.prototype.requests["/Resources/unity_default_resources"].onload();
          DataRequest.prototype.requests["/Resources/unity_builtin_extra"].onload();
          Module['removeRunDependency']('datafile_webgl_5_1_0_with_nthreads_fastest_opt_profilingfuncs.data');

    };
    Module['addRunDependency']('datafile_webgl_5_1_0_with_nthreads_fastest_opt_profilingfuncs.data');
  
    if (!Module.preloadResults) Module.preloadResults = {};
  
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }
    
  }
  if (Module['calledRun']) {
    runWithFS();
  } else {
    if (!Module['preRun']) Module['preRun'] = [];
    Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
  }

 }
 loadPackage();

})();
