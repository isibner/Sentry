var SourceProviderModel = Backbone.Model.extend({});
var SourceProviderCollection = Backbone.Collection.extend({
  model: SourceProviderModel
});

var RepoModel = Backbone.Model.extend({});
var RepoCollection = Backbone.Collection.extend({
  model: RepoModel
});

var ServiceModel = Backbone.Model.extend({});
var ServiceCollection = Backbone.Collection.extend({
  model: ServiceModel
});

// TODO switch the other active/inactive model to use this pattern. Otherwise, the individual repos cannot rerender when activated - they'll have a different view class and the entire compositeview will need re-rendering.
var ServiceView = Mn.ItemView.extend({
  template: function (serializedModel) {
    var modelSelector = serializedModel.active ? '#service-template-active' : '#service-template-inactive';
    return _.template($(modelSelector).html())(serializedModel);
  },
  modelEvents: {
    'change': 'render'
  }
  // TODO add click event to AJAX and activate/deactivate repo
});

var ActiveRepoView = Mn.CompositeView.extend({
  childView: ServiceView,
  childViewContainer: '.services-container',
  template: '#repo-template-active',
  initialize: function () {
    this.collection = this.model.get('serviceCollection');
  }
});

var InactiveRepoView = Mn.ItemView.extend({
  template: '#repo-template-inactive'
})

var AuthenticatedSourceProviderView = Mn.CompositeView.extend({
  getChildView: function (repo) {
    if (repo.get('active')) {
      return ActiveRepoView;
    }
    return InactiveRepoView;
  },
  childViewContainer: '.repo-list-container',
  template: '#source-provider-template-authenticated',
  initialize: function () {
    this.collection = this.model.get('repoCollection');
  }
});

var UnauthenticatedSourceProviderView = Mn.ItemView.extend({
  template:'#source-provider-template-unauthenticated'
});

var AppView = Mn.CollectionView.extend({
  getChildView: function (sourceProvider) {
    return sourceProvider.get('isAuthenticated') ? AuthenticatedSourceProviderView : UnauthenticatedSourceProviderView;
  }
});

var App = new Mn.Application();

App.addRegions({
  mainRegion: '#accordion'
});

App.addInitializer(function (data) {
  var sourceProviderCollection = marshalSourceProviderCollection(data);
  var appView = new AppView({collection: sourceProviderCollection});
  App.mainRegion.show(appView);
});

function marshalSourceProviderCollection (data) {
  var sourceProviderModels = _.map(data, function (sourceProviderObject) {
    var sourceProviderModel = new SourceProviderModel(sourceProviderObject);
    if (sourceProviderObject.isAuthenticated) {
      sourceProviderModel.set('repoCollection', marshalRepoCollection(sourceProviderObject.repoList));
    }
    return sourceProviderModel;
  });
  return new SourceProviderCollection(sourceProviderModels);
}

function marshalRepoCollection (repoList) {
  var repoModels = _.map(repoList, function (repoObject) {
    var repoModel = new RepoModel(repoObject);
    if (repoObject.active) {
      repoModel.set('serviceCollection', new ServiceCollection(repoObject.services));
    }
    return repoModel;
  });
  return new RepoCollection(repoModels);
}

$(document).ready(function () {
  var fakeData = [
    {name: 'fake1', displayName: 'Fake Source 1', isAuthenticated: true, authEndpoint: 'fake1', iconURL: '/foo/bar/1', repoList: [
      {id: 'repo1', name: 'Repo 1', sourceProviderName: 'fake1', active: false},
      {id: 'repo2', name: 'Repo 2', sourceProviderName: 'fake2', active: true, services: [
        {sourceProviderName: 'fake2', id: 'repo2', NAME: 'service1', DISPLAY_NAME: 'service1', active: true},
        {sourceProviderName: 'fake2', id: 'repo2', NAME: 'service2', DISPLAY_NAME: 'service2', active: false},
      ]},
    ]},
    {name: 'fake2', displayName: 'Fake Source 2', isAuthenticated: false, authEndpoint: 'fake2', iconURL: '/foo/bar/2'}
  ];
  App.start(fakeData);
});


