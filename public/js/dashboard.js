var SourceProviderModel = Backbone.Model.extend({
  idAttribute: 'name'
});
var SourceProviderCollection = Backbone.Collection.extend({
  model: SourceProviderModel
});

var RepoModel = Backbone.Model.extend({
  idAttribute: 'id',
  activationURL: function () {
    return '/repos/activate/' + this._URLSuffix();
  },
  deactivationURL: function () {
    return '/repos/deactivate/' + this._URLSuffix();
  },
  _URLSuffix: function () {
    return encodeURIComponent(this.get('sourceProviderName')) + '/' +
      encodeURIComponent(this.get('id'));
  }
});
var RepoCollection = Backbone.Collection.extend({
  model: RepoModel
});

var ServiceModel = Backbone.Model.extend({
  idAttribute: 'NAME',
  activationURL: function () {
    return '/services/activate/' + this._URLSuffix();
  },
  deactivationURL: function () {
    return '/services/deactivate/' + this._URLSuffix();
  },
  _URLSuffix: function () {
    return encodeURIComponent(this.get('sourceProviderName')) + '/' +
      encodeURIComponent(this.get('repoId')) + '/' +
      encodeURIComponent(this.get('NAME'));
  }
});
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
  },
  events: {
    'click .activate-service': function () {
      var self = this;
      var loadingAlertId = displayLoadingAlertMessage('Activating service...');
      $.post(this.model.activationURL(), function (response) {
        var succeeded = handleSentryResponse(response);
        if (succeeded) {
          self.model.set('active', true);
        }
      }).fail(handleAjaxError)
      .always(function () {
        hideLoadingAlertMessage(loadingAlertId);
      });
    },
    'click .deactivate-service': function () {
      var self = this;
      var loadingAlertId = displayLoadingAlertMessage('Deactivating service...');
      $.post(this.model.deactivationURL(), function (response) {
        var succeeded = handleSentryResponse(response);
        if (succeeded) {
          self.model.set('active', false);
        }
      }).fail(handleAjaxError)
      .always(function () {
        hideLoadingAlertMessage(loadingAlertId);
      });
    }
  }
});

var RepoView = Mn.CompositeView.extend({
  childView: ServiceView,
  childViewContainer: '.services-container',
  template: function (serializedModel) {
    var selector = serializedModel.active ? '#repo-template-active': '#repo-template-inactive';
    return _.template($(selector).html())(serializedModel);
  },
  modelEvents: {
    'change': 'render'
  },
  initialize: function () {
    this.collection = this.model.get('serviceCollection');
  },
  events: {
    'click .activate-repo': function () {
      var self = this;
      var loadingAlertId = displayLoadingAlertMessage('Activating repository...');
      $.post(this.model.activationURL(), function (response) {
        var succeeded = handleSentryResponse(response);
        if (succeeded) {
          var serviceCollection = marshalServiceCollection(response.services);
          self.collection = serviceCollection;
          self.model.set({
            serviceCollection: serviceCollection,
            active: true
          });
          self.render();
        }
      }).fail(handleAjaxError)
      .always(function () {
        hideLoadingAlertMessage(loadingAlertId);
      });
    },
    'click .deactivate-repo': function () {
      var self = this;
      var loadingAlertId = displayLoadingAlertMessage('Deactivating repository...');
      $.post(this.model.deactivationURL(), function (response) {
        var succeeded = handleSentryResponse(response);
        if (succeeded) {
          self.collection = undefined;
          self.model.set('active', false);
        }
      }).fail(handleAjaxError).always(function () {
        hideLoadingAlertMessage(loadingAlertId);
      });
    }
  }
});

var SourceProviderView = Mn.CompositeView.extend({
  childView: RepoView,
  childViewContainer: '.repo-list-container',
  template: function (serializedModel) {
    var selector = serializedModel.isAuthenticated ? '#source-provider-template-authenticated' : '#source-provider-template-unauthenticated';
    return _.template($(selector).html())(serializedModel);
  },
  initialize: function () {
    this.collection = this.model.get('repoCollection');
  }
});

var AppView = Mn.CollectionView.extend({
  childView: SourceProviderView
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

$(document).ready(function () {
  $.get('/dashboard/data', function (data) {
    App.start(data);
  }).fail(handleAjaxError);
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
      repoModel.set('serviceCollection', marshalServiceCollection(repoObject.services));
    }
    return repoModel;
  });
  return new RepoCollection(repoModels);
}

function marshalServiceCollection (services) {
  return new ServiceCollection(services);
}

function handleAjaxError (responseObject) {
  console.log(responseObject);
  var contentType = responseObject.getResponseHeader('content-type') || '';
  if (contentType.indexOf('json') > -1) {
    displayAlertMessage('danger', 'Error: ' + $.parseJSON(responseObject.responseText).message);
  } else {
    displayAlertMessage('danger', 'Error: ' + responseObject.status + ' ' + responseObject.statusText);
  }
}

function handleSentryResponse (response) {
  if (response.success) {
    displayAlertMessage('success', response.success);
    return true;
  } else {
    console.error(response);
    displayAlertMessage('danger', response.error || 'Unknown error');
    return false;
  }
}

function displayAlertMessage (type, text) {
  var htmlString =
    '<div class="col-sm-12 alert alert-dismissable">' +
    text +
    '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
    '<span aria-hidden="true">&times;</span>' +
    '</button>' +
    '</div>';
  var alertDiv = $.parseHTML(htmlString);
  $(alertDiv).addClass('alert-' + type).appendTo($('#alerts .row'));
}

function displayLoadingAlertMessage (text) {
  var id = _.uniqueId('alert-');
  var htmlString = '<span class="fa fa-cog fa-spin fa-2x" id="' + id + '"></span>&nbsp;&nbsp;' + text;
  displayAlertMessage('info', htmlString);
  return id;
}

function hideLoadingAlertMessage (id) {
  $('#' + id).parent('div.alert').remove();
}
