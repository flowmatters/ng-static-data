# ng-static-data

Helpers for building references to static data - ie data that doesn't change during the life of an application session.

## Installation

```
bower install flowmatters/ng-static-data
```

## Usage

```
angular.module('yourApp',['ng-static-data']).service('yourService',function(staticData){
  var service = this;

  service.someStaticData = staticData.deferredGet(service,'static/someStaticData.json','_static');

  service.staticTable = staticData.deferredGet(service,'static/staticTable.csv','_table',d3.csv.parse);


}).service('someOtherService',function(yourService,staticData){
  var service = this;

  var combineData = function(sData,sTable){
    // ...
    return result;
  };

  service.combinedData = staticData.deferredCall(service,'_combinedData',
                                                 [yourService.someStaticData,yourService.staticTable],
                                                 combineData);
});
```
