'use strict';

var app = angular.module('app', ['ui.router', 'ui.bootstrap']);

// Define front end routes here
app.config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: '/templates/home.html',
      authenticate: true
    })
    .state('contactform', {
      url: '/contactform',
      templateUrl: '/templates/contactform.html'
    });
});

app.factory('$contacts', function($http) {
  var obj = {};
  
  obj.set = function(contacts) {
      for(var i = 0; i < contacts.length; i++) {
        contacts[i]['idx'] = i + 1;
      }
      sessionStorage.contacts = angular.toJson(contacts);
  };

  obj.push = function(contact) {
    var contacts = angular.fromJson(sessionStorage.contacts);
    if(contacts) {
      contact.idx = contacts.length + 1;
      contacts.push(contact);
      sessionStorage.contacts = angular.toJson(contacts);  
    } else {
      contacts = [];
      contact.idx = 1;
      contacts.push(contact);
      sessionStorage.contacts = angular.toJson(contacts);
    }
  };
  
  obj.get = function() {
    if(!sessionStorage.contacts) sessionStorage.contacts = [];
    return angular.fromJson(sessionStorage.contacts);
  };

  obj.fetch = function() {
    $http({
      method: 'GET',
      url: '/javascripts/data.json'
    })
    .then(function successCallback(response) {
      obj.set(response.data.contacts);
    }, function errorCallback(response) {
        obj.set([]);
    });
  };

  obj.paginate = function(perPage) {
    var pages = [];
    if(!sessionStorage.contacts) return pages;
    var contacts = angular.fromJson(sessionStorage.contacts);
    var c = [];
    for (var i = 0; i < contacts.length; i++) {
      if(i % perPage != 0 || i == 0) {
        c.push(contacts[i]);
      } else {
        pages.push(c);
        c = [];
        c.push(contacts[i]);
      }
      if(i == contacts.length - 1) pages.push(c);
    };
    return pages;
  };
  return obj;
});

app.run(function($rootScope, $location, $sce, $contacts) {
  $contacts.fetch();
  // For including the header template
  $rootScope.headerUrl = $sce.trustAsResourceUrl('/templates/header.html');
});

app.controller('MainController', function($rootScope) {
  // Controller for main content
});

app.controller('HomeController', function($scope, $http, $contacts) {
    $scope.query = '';      
    $scope.perPage = 3;
    $scope.contacts = $contacts.get();
    $scope.pages = $contacts.paginate($scope.perPage);;
    $scope.currentPage = 0;

    $scope.turnPage = function(idx) {
      if(idx < 0 || idx >= $scope.pages.length) return false;
      $scope.currentPage = idx;
    }

    $scope.find = function() {
      $scope.results = [];
      var q = $scope.query.trim();
      if(q.length == 0) return false;
      for (var i = 0; i < $scope.contacts.length; i++) {
        
        var name = $scope.contacts[i].firstName + ' ' + $scope.contacts[i].lastName;
        var emails = $scope.contacts[i].emails;
        var contacts = $scope.contacts[i].contacts;
        
        // Check for matching name
        if(name.indexOf(q) > -1 || name.toLowerCase().replace(' ', '').indexOf(q.toLowerCase()) > -1) {
          $scope.results.push($scope.contacts[i]);
          continue;
        }

        var added = false;
        // check for matching email
        angular.forEach(emails, function(val, key) {
          if(val.email.indexOf(q) > -1 && !added) {
            $scope.results.push($scope.contacts[i]);
            added = true;
          }
          
          var splitEmail = val.email.split('@')[0].replace('-', '').replace('_', '');
          var domain = val.email.split('@')[1];
          
          if(splitEmail.toLowerCase().indexOf(q.toLowerCase()) > -1 && !added) {
            $scope.results.push($scope.contacts[i]);
            added = true;
          }
        });

        if(added) continue;

        angular.forEach(contacts, function(val, key) {
          if(!added && (val.contact.indexOf(q) > -1 || val.contact.replace('-', '').replace(' ', '').indexOf(q) > -1)) {
            $scope.results.push($scope.contacts[i]);
            added = true;
          }
        });
      };
    };
});

app.controller('HeaderController', function($scope) {
});

app.controller('ContactController', function($scope, $contacts, $state, $compile) {
  
  $scope.contacts = $contacts.get();
  $scope.contact = {
    firstName: '',
    lastName: '',
    emails: [],
    contacts: []
  };

  $scope.emailCount = 0;
  $scope.contactCount = 0;
  
  $scope.add = function(entitiy) {
    var parent = angular.element(document.querySelector('#' + entitiy + '-container'));
    var el = angular.element(document.querySelector('.' + entitiy + '-sample')).clone().addClass(entitiy).removeClass(entitiy + '-sample');
    if(entitiy == 'email') {
      angular.element(el.children()[0]).attr('ng-model', 'contact.emails[' + $scope.emailCount + ']["type"]');
      angular.element(el.children()[1]).attr('ng-model', 'contact.emails[' + $scope.emailCount + ']["email"]');
      $scope.emailCount++;
    } else {
      angular.element(el.children()[0]).attr('ng-model', 'contact.contacts[' + $scope.contactCount + ']["type"]');
      angular.element(el.children()[1]).attr('ng-model', 'contact.contacts[' + $scope.contactCount + ']["contact"]');
      $scope.contactCount++;
    }
    parent.append(el);
    
    // Compilation required for dynamically added elements
    $compile(el)($scope);
  };

  $scope.remove = function(e) {
    angular.element(e.target).parent().remove();
  };

  $scope.save = function() {
    $contacts.push($scope.contact);
    $state.go('home', {}, {reload: false});
  };
});
