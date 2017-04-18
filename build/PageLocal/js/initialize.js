var app = angular.module('PAGENAME',['ui.router','pascalprecht.translate']);
app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
	"ngInject";
	$urlRouterProvider.otherwise('/PAGENAME');
	var baseUrl = '/PAGENAME';
	$stateProvider.state('Landing', {
		url: baseUrl,
		controller: "Landing",
		templateUrl: "/PAGENAME/page/Landing.html"
	});
	$locationProvider.html5Mode(true);
}).config(function ($translateProvider) {
	"ngInject";
	$translateProvider.translations('en', englishPack);
	$translateProvider.translations('ua', ukrainianPack);
	$translateProvider.translations('rus', russianPack);
	$translateProvider.preferredLanguage('en');
	$translateProvider.useSanitizeValueStrategy('sanitizeParameters');
});
