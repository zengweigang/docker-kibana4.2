define(function (require) {
  var _ = require('lodash');
  var numeral = require('numeral');
  var moment = require('moment');
  var module = require('ui/modules').get('marvel/directives', []);
  var React = require('react');
  var make = React.DOM;

  var SparkLines = require('plugins/marvel/directives/marvel_sparkline');


  var Table = require('plugins/marvel/directives/paginated_table/components/table');


  module.directive('marvelIndexListing', function () {
    function makeSampleData() {
      var sampleData = (function () {
        var arr = [];
        var length = 30;
        var now = (new Date()).getTime();
        for (var i = 0; i < length; i++) {
          arr.push({y: Math.random() * 100, x: (now - ((length - i) * 10))});
        }
        return arr;
      }());
      return sampleData;
    }
    function makeTdWithPropKey(dataKey, idx) {
      var rawValue = _.get(this.props, dataKey.key);
      var units;
      var innerMarkup = null;
      if (dataKey.key === 'name') {
        innerMarkup = this.state.exists ? make.a({ href: `#/index/${rawValue}` }, rawValue) : make.div(null, rawValue);
      }
      if (_.isObject(rawValue) && rawValue.metric) {
        if (rawValue.metric.units) units = ` ${rawValue.metric.units}`;
        innerMarkup = (rawValue.metric.format) ? numeral(rawValue.last).format(rawValue.metric.format) : rawValue.last;
        if (units) innerMarkup += units;
      }
      var chartData = _.get(this.props, dataKey.chart_data);
      var hasChart = !!dataKey.chart_data;
      return make.td({key: idx},
        (hasChart ? React.createElement(SparkLines, {data: chartData}) : null),
        make.div({className: (hasChart ? 'pull-right chart-val' : '')}, innerMarkup)
      );
    }
    var initialTableOptions = {
      title: 'Indices',
      searchPlaceholder: 'Filter Indices',
      columns: [{
        key: 'name',
        sort: 1,
        title: 'Name'
      }, {
        key: 'metrics.index_document_count',
        sortKey: 'metrics.index_document_count.last',
        sort: 0,
        title: 'Document Count'
      }, {
        key: 'metrics.index_size',
        sort: 0,
        sortKey: 'metrics.index_size.last',
        // chart_data: 'metrics.index_request_rate.data',
        title: 'Data'
      }, {
        key: 'metrics.index_request_rate',
        sort: 0,
        sortKey: 'metrics.index_request_rate.last',
        // chart_data: 'metrics.index_request_rate.data',
        title: 'Index Rate'
      }, {
        key: 'metrics.index_search_request_rate',
        sort: 0,
        sortKey: 'metrics.index_search_request_rate.last',
        // chart_data: 'metrics.index_search_request_rate.data',
        title: 'Search Rate'
      }]
    };
    return {
      restrict: 'E',
      scope: {
        data: '=',
        currCluster: '=',
        clusters: '='
      },
      link: function ($scope, $el) {
        var tableRowTemplate = React.createClass({
          getInitialState: function () {
            var index = $scope.indices[this.props.name];
            return {
              exists: !!index,
              status: !!index ? index.status : 'disabled'
            };
          },
          componentWillReceiveProps: function (nextProps) {
            if ($scope.indices) {
              var index = $scope.indices[this.props.name];
              this.setState({
                exists: !!index,
                status: !!index ? index.status : 'disabled'
              });
            }
          },
          render: function () {
            var boundTemplateFn = makeTdWithPropKey.bind(this);
            var dataProps = _.pluck(initialTableOptions.columns, 'key');
            var $tdsArr = initialTableOptions.columns.map(boundTemplateFn);
            var classes = [ this.state.status ];
            return make.tr({
              key: this.props.name,
              className: classes
            }, $tdsArr);
          }
        });

        var tableFactory = React.createFactory(Table);

        var table = React.render(tableFactory({
          scope: $scope,
          options: initialTableOptions,
          template: tableRowTemplate
        }), $el[0]);

        $scope.$watch('data', (data) => table.setData(data));
        $scope.$watch('clusters', (newClusters) => {
          $scope.indices = _.find(newClusters, {cluster_uuid: $scope.currCluster}).shardStats;
          table.render();
        });
      }
    };
  });
});

