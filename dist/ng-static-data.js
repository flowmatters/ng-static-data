(function (angular) {

  // Create all modules and define dependencies to make sure they exist
  // and are loaded in the correct order to satisfy dependency injection
  // before all nested files are concatenated by Gulp

  // Config
  angular.module('ng-static-data.config', [])
      .value('ng-static-data.config', {
          debug: true
      });

  // Modules
  
  
  
  angular.module('ng-static-data.services', []);
  
  
  angular.module('ng-static-data',
      [
        'ng-static-data.config',
        'ng-static-data.services'
      ]);

})(angular);

/**
 * Created by coichedid on 21/04/15.
 */
'use strict';

/**
 * @ngdoc service
 * @name ng-static-data.staticData
 * @description
 * Helpers for building references to static data - ie data
 * that doesn't change during the life of an application session.
 * Service in the awraApp.
 */
angular.module('ng-static-data').service('staticData',function($http,$q) {
    var service = this;

    /**
     * @ngdoc method
     * @name deferredGet
     * @methodOf ng-static-data.staticData
     * @description
     * Abstract the process of retrieving a read only resource with HTTP/GET
     * ensuring that the GET is only invoked once
     *
     * @param {object} (Service) object to cache the result/promise
     * @param {string} URL of resource
     * @param {string} Name of cache property (added to s)
     * @param {function} Optional function to transform the returned data to a Javascript object
     * @returns {function} A parameterless function that performs the GET on first call and
     * returns a promise for the parsed data on first and subsequent calls.
     */
    service.deferredGet = function(s,url,attr,parser) {
      var result = function() {
        var deferred = $q.defer();

        if(s[attr]) {
          $q.when(s[attr]).then(function(nestedResult){
            deferred.resolve(nestedResult);
          });
        } else {
          s[attr] = deferred.promise;
          $http.get(url).
            success(function(data) {
              if(parser) {
                s[attr] = parser(data);
              } else {
                s[attr] = data;
              }
              deferred.resolve(s[attr]);
            }).error(deferred.reject);
        }
        return deferred.promise;
      };
      return result;
    };

    /**
     * @ngdoc method
     * @name deferredCall
     * @methodOf ng-static-data.staticData
     * @description
     * Abstract the process of performing a series of transformations that only need to happen
     * once in the life of an (angular-js) application.
     *
     * @param {object} (Service) object to cache the result/promise
     * @param {string} Name of cache property (added to s)
     * @param {array[function]} Array of functions (each taking no parameters and typically returning a promise)
     * @param {function} Optional function to be called with the result of all asynchronous calls
     * @returns {function} A parameterless function that calls all the asynchronous functions,
     * followed by the synchronouse function on first call, returning a promise for the resulting data on
     * first and subsequent calls.
     */
    service.deferredCall = function(s,attr,asyncCalls,syncCall) {
      var result = function() {
        var deferred = $q.defer();

        if(s[attr]) {
          $q.when(s[attr]).then(function(nestedResult){
            deferred.resolve(nestedResult);
          });
        } else {
          s[attr] = deferred.promise;
          var promises = asyncCalls.map(function(a){return a();});
          $q.all(promises)
            .then(function(allResults) {
              if(syncCall) {
                s[attr] = syncCall.apply(s,allResults);
              } else {
                s[attr] = allResults[0];
              }
              deferred.resolve(s[attr]);
            },function(){deferred.reject();});
        }
        return deferred.promise;
      };
      return result;
    };

    /**
     * @ngdoc method
     * @name unwrap
     * @methodOf ng-static-data.staticData
     * @description
     * Automatically unwrap the result of a promise and assign to a field
     *
     * @param {object} Target object
     * @param {string} Name of attribute to assign on target
     * @param {function} Promise returning function
     */
    service.unwrap = function(target,attr,promise){
      $q.when(promise()).then(function(result){
        target[attr] = result;
      });
    };
  });
