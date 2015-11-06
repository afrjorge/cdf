/*!
 * Copyright 2002 - 2015 Webdetails, a Pentaho company. All rights reserved.
 *
 * This software was developed by Webdetails and is provided under the terms
 * of the Mozilla Public License, Version 2.0, or any later version. You may not use
 * this file except in compliance with the license. If you need a copy of the license,
 * please go to http://mozilla.org/MPL/2.0/. The Initial Developer is Webdetails.
 *
 * Software distributed under the Mozilla Public License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. Please refer to
 * the license for the specific language governing your rights and limitations.
 */

define([
  "cdf/Dashboard.Clean",
  "cdf/components/FilterComponent",
  "cdf/lib/jquery",
  "amd!cdf/lib/underscore"
], function(Dashboard, FilterComponent, $, _) {

  /**
   * ## The Filter Component
   */
  describe("The Filter Component #", function() {

    var dashboard, filterComponent, $htmlObject, testFilterDefaults;

    testFilterDefaults = {
      type: "FilterComponent",
      name: "render_singleFilter_simple",
      priority: 5,
      executeAtStart: true,
      htmlObject: "sampleObjectFilter",
      listeners: [],
      parameter: "singleSelectionParam_simple",
      parameters: [],
      options: function() { return {}; },
      queryDefinition: {},
      componentInput: {
        valueAsId: false,
        valuesArray: [[1.1,"One","Ones"],[1.2,"Two","Ones"],[1.3,"Three","Ones"],[1.4,"Four","Ones"],
                      [2.1,"One","Twos"],[2.2,"Two","Twos"],[2.3,"Three","Twos"],[2.4,"Four","Twos"]]
      },
      componentOutput: {
        outputFormat: "lowestID"
      },
      componentDefinition: {
        title: "Single Selection: multiSelect = False",
        alwaysExpanded: false,
        multiselect: false,
        showIcons: true,
        showButtonOnlyThis: true,
        useOverlay: false,
        showFilter: true
      },
      addIns: {
        postUpdate: [],
        renderRootHeader: [],
        renderRootSelection: [],
        renderRootFooter: [],
        renderGroupSelection: [],
        renderItemSelection: [],
        sortGroup: [],
        sortItem: []
      }
    };
    var getNewFilterComponent = function(options) {
      return new FilterComponent($.extend(true, {}, testFilterDefaults, options));
    }

    filterComponent = getNewFilterComponent();

    $htmlObject = $('<div />').attr('id', filterComponent.htmlObject);

    var getNewDashboard = function() {
      var dashboard = new Dashboard();
      dashboard.init();
      dashboard.addParameter("singleSelectionParam_simple",_.bind(function() {
        return [];
      }, {"dashboard": dashboard}));
      return dashboard;
    };

    var testMetadata = [
      {
        colIndex: 0,
        colType: "Numeric",
        colName: "group"
      },
      {
        colIndex: 1,
        colType: "String",
        colName: "type"
      },
      {
        colIndex: 2,
        colType: "String",
        colName: "empty"
      }
    ];

    var getCdaJson = function(resultset, metadata) {
      return {
        resultset: resultset,
        metadata: metadata,
        status: "success"
      };
    };

    beforeEach(function() {
      dashboard = getNewDashboard();
      $('body').append($htmlObject);
    });

    afterEach(function() {
      $htmlObject.remove();
    });

    /**
     * ## The Filter Component # allows a dashboard to execute update
     */
    it("allows a dashboard to execute update", function(done) {
      dashboard.addComponent(filterComponent);

      spyOn(filterComponent, 'update').and.callThrough();

      // listen to cdf:postExecution event
      filterComponent.once("cdf:postExecution", function() {
        expect(filterComponent.update).toHaveBeenCalled();
        done();
      });

      dashboard.update(filterComponent);
    });

    it('disables the "only" button when using the SingleSelect strategy', function() {
      expect(filterComponent.getConfiguration().component.selectionStrategy.type).toEqual("SingleSelect");
      expect(filterComponent.getConfiguration().component.Root.options.showButtonOnlyThis).toEqual(false);
      expect(filterComponent.getConfiguration().component.Group.options.showButtonOnlyThis).toEqual(false);
      expect(filterComponent.getConfiguration().component.Item.options.showButtonOnlyThis).toEqual(false);
    });

    ddescribe("Manager controller #", function() {
      it("sorts children according to an array of custom sorting functions", function(done) {
        dashboard.addDataSource("selectionDataSource", {
          dataAccessId: "testId",
          path: "/test.cda"
        });
        var filterComponent = getNewFilterComponent({
          queryDefinition: {dataSource: "selectionDataSource"},
          componentInput: {valuesArray: []},
          options: function() {
            return {
              component: {
                search: {serverSide: true},
                Root: {view: {scrollbar: {engine: "fake_engine"}}}
              }
            };
          },
          addIns: {sortItem: ["sortByValue", "sortByLabel"]}
        });
        dashboard.addComponent(filterComponent);

        spyOn($, 'ajax').and.callFake(function(params) {
          params.success(getCdaJson(
            [["One", "label1", null, null, 60],
             ["Three", "label3", null, null, 7],
             ["Two", "label2", null, null, 60],
             ["Four", "label1", null, null, 7],
             ["Five", "label4", null, null, 7]],
            [{colIndex: 0, colType: "String", colName: "id"},
             {colIndex: 1, colType: "String", colName: "name"},
             {colIndex: 4, colType: "Numeric", colName: "value"}]));
        });

        filterComponent.once("getData:success", function() {
          spyOn(filterComponent.manager, "renderSortedChildren").and.callFake(function() {
            var orderedChildren = this._detachChildren();
            //random order
            expect(orderedChildren[0].item.get('model').get('value')).toEqual(60);
            expect(orderedChildren[0].item.get('model').get('label')).toEqual("label1");
            expect(orderedChildren[1].item.get('model').get('value')).toEqual(7);
            expect(orderedChildren[1].item.get('model').get('label')).toEqual("label3");
            expect(orderedChildren[2].item.get('model').get('value')).toEqual(60);
            expect(orderedChildren[2].item.get('model').get('label')).toEqual("label2");
            expect(orderedChildren[3].item.get('model').get('value')).toEqual(7);
            expect(orderedChildren[3].item.get('model').get('label')).toEqual("label1");
            expect(orderedChildren[4].item.get('model').get('value')).toEqual(7);
            expect(orderedChildren[4].item.get('model').get('label')).toEqual("label4");
            //ascending order
            dashboard.setAddInDefaults('Filter', 'sortItem', 'sortByValue', {ascending: true});
            dashboard.setAddInDefaults('Filter', 'sortItem', 'sortByLabel', {ascending: true});
            orderedChildren = this.sortChildren(orderedChildren);
            expect(orderedChildren[0].item.get('model').get('value')).toEqual(7);
            expect(orderedChildren[0].item.get('model').get('label')).toEqual("label1");
            expect(orderedChildren[1].item.get('model').get('value')).toEqual(7);
            expect(orderedChildren[1].item.get('model').get('label')).toEqual("label3");
            expect(orderedChildren[2].item.get('model').get('value')).toEqual(7);
            expect(orderedChildren[2].item.get('model').get('label')).toEqual("label4");
            expect(orderedChildren[3].item.get('model').get('value')).toEqual(60);
            expect(orderedChildren[3].item.get('model').get('label')).toEqual("label1");
            expect(orderedChildren[4].item.get('model').get('value')).toEqual(60);
            expect(orderedChildren[4].item.get('model').get('label')).toEqual("label2");
            //descending order
            dashboard.setAddInDefaults('Filter', 'sortItem', 'sortByValue', {ascending: false});
            dashboard.setAddInDefaults('Filter', 'sortItem', 'sortByLabel', {ascending: false});
            orderedChildren = this.sortChildren(orderedChildren);
            expect(orderedChildren[0].item.get('model').get('value')).toEqual(60);
            expect(orderedChildren[0].item.get('model').get('label')).toEqual("label2");
            expect(orderedChildren[1].item.get('model').get('value')).toEqual(60);
            expect(orderedChildren[1].item.get('model').get('label')).toEqual("label1");
            expect(orderedChildren[2].item.get('model').get('value')).toEqual(7);
            expect(orderedChildren[2].item.get('model').get('label')).toEqual("label4");
            expect(orderedChildren[3].item.get('model').get('value')).toEqual(7);
            expect(orderedChildren[3].item.get('model').get('label')).toEqual("label3");
            expect(orderedChildren[4].item.get('model').get('value')).toEqual(7);
            expect(orderedChildren[4].item.get('model').get('label')).toEqual("label1");
            //mixed order
            dashboard.setAddInDefaults('Filter', 'sortItem', 'sortByValue', {ascending: false});
            dashboard.setAddInDefaults('Filter', 'sortItem', 'sortByLabel', {ascending: true});
            orderedChildren = this.sortChildren(orderedChildren);
            expect(orderedChildren[0].item.get('model').get('value')).toEqual(60);
            expect(orderedChildren[0].item.get('model').get('label')).toEqual("label1");
            expect(orderedChildren[1].item.get('model').get('value')).toEqual(60);
            expect(orderedChildren[1].item.get('model').get('label')).toEqual("label2");
            expect(orderedChildren[2].item.get('model').get('value')).toEqual(7);
            expect(orderedChildren[2].item.get('model').get('label')).toEqual("label1");
            expect(orderedChildren[3].item.get('model').get('value')).toEqual(7);
            expect(orderedChildren[3].item.get('model').get('label')).toEqual("label3");
            expect(orderedChildren[4].item.get('model').get('value')).toEqual(7);
            expect(orderedChildren[4].item.get('model').get('label')).toEqual("label4");
            dashboard.setAddInDefaults('Filter', 'sortItem', 'sortByValue', {ascending: true});
            dashboard.setAddInDefaults('Filter', 'sortItem', 'sortByLabel', {ascending: false});
            orderedChildren = this.sortChildren(orderedChildren);
            expect(orderedChildren[0].item.get('model').get('value')).toEqual(7);
            expect(orderedChildren[0].item.get('model').get('label')).toEqual("label4");
            expect(orderedChildren[1].item.get('model').get('value')).toEqual(7);
            expect(orderedChildren[1].item.get('model').get('label')).toEqual("label3");
            expect(orderedChildren[2].item.get('model').get('value')).toEqual(7);
            expect(orderedChildren[2].item.get('model').get('label')).toEqual("label1");
            expect(orderedChildren[3].item.get('model').get('value')).toEqual(60);
            expect(orderedChildren[3].item.get('model').get('label')).toEqual("label2");
            expect(orderedChildren[4].item.get('model').get('value')).toEqual(60);
            expect(orderedChildren[4].item.get('model').get('label')).toEqual("label1");
            done();
          });
        });

        dashboard.update(filterComponent);
      });
    });

    describe("RootCtrl controller #", function() {

      /**
       * ## The Filter Component # RootCtrl controller # clears search input if no match is found and component is being expanded
       */
      it("clears search input if no match is found and component is being expanded", function(done) {
        dashboard.addComponent(filterComponent);

        filterComponent.once("cdf:postExecution", function() {
          // simulate a search term that doesn't have any matches
          expect(filterComponent.model.root().get('isCollapsed')).toEqual(true);
          $('.filter-filter-input:eq(0)').val("fake_search_text");
          _.map(filterComponent.model.nodes().models, function(model) {
            model.set('isVisible', false);
          });

          spyOn(filterComponent.manager.get("view"), "onFilterClear").and.callThrough();
          filterComponent.manager.get("controller").onToggleCollapse(filterComponent.model);
          expect(filterComponent.manager.get("view").onFilterClear).toHaveBeenCalled();
          expect($('.filter-filter-input:eq(0)').val()).toEqual("");

          done();
        });

        dashboard.update(filterComponent);
      });

      it("updates the count of selected items when triggering onOnlyThis", function(done) {
        var selectionLimit = 5;
        filterComponent = getNewFilterComponent({
          componentDefinition: {
            multiselect: true,
            selectionLimit: selectionLimit
          }
        });

        dashboard.addComponent(filterComponent);

        filterComponent.once("cdf:postExecution", function() {
          var controller = filterComponent.manager.get('controller');
          var rootModel = filterComponent.model;
          var childrenModels = rootModel.children().models;
          expect(rootModel.get('numberOfSelectedItems')).toEqual(0);
          for(var i = 0; i < selectionLimit; i++) {
            controller.onSelection(childrenModels[i]);
          }
          expect(rootModel.get('numberOfSelectedItems')).toEqual(selectionLimit);
          controller.onOnlyThis(childrenModels[0]);
          expect(rootModel.get('numberOfSelectedItems')).toEqual(1);
          done();
        });

        dashboard.update(filterComponent);
      });
    });

    describe("Get Page Mechanism #", function() {

      var defaultCdaJson = getCdaJson([[1.1, "Default1", ""], [1.2, "Default2", ""]], testMetadata);
      var onFilterChangeCdaJson = getCdaJson([[1.3, "ServerSide", ""], [1.4, "PageSize", ""]], testMetadata);
      var testPageSize = 10;

      it("works with searchServerSide = true and pageSize > 0", function(done) {
        runGetPageMechanismTest(true, testPageSize, done);
      });

      it("works with searchServerSide = false and pageSize > 0", function(done) {
        runGetPageMechanismTest(false, testPageSize, done);
      });

      it("works with searchServerSide = true and pageSize = 0", function(done) {
        runGetPageMechanismTest(true, 0, done);
      });

      it("works with searchServerSide = false and pageSize = 0", function(done) {
        runGetPageMechanismTest(false, 0, done);
      });

      var runGetPageMechanismTest = function(serverSide, pageSize, done) {
        var dashboard = getNewDashboard();
        dashboard.addDataSource("testFilterComponentDataSource", {
          dataAccessId: "testId",
          path: "/test.cda"
        });

        var testFilterComponent = getTestFilterComponent(serverSide, pageSize);

        makeAjaxSpy();

        dashboard.addComponent(testFilterComponent);

        testFilterComponent.once("getData:success", function() {
          if(serverSide) {
            addEvaluateExpectationsAfterGetPage(testFilterComponent, serverSide, pageSize, done);
          } else {
            addEvaluateExpectationsInsteadOfFilter(testFilterComponent, serverSide, pageSize, done);
          }
          testFilterComponent.manager.onFilterChange('');
        });

        dashboard.update(testFilterComponent);
      };

      var getTestFilterComponent = function(serverSide, pageSize) {
        return getNewFilterComponent({
          queryDefinition: {
            dataSource: "testFilterComponentDataSource",
            // BaseQuery will not accept pageSize <= 0, it will default to it though
            pageSize: ((pageSize > 0) ? pageSize : null)
          },
          componentInput: {
            valuesArray: []
          },
          options: function() {
            return {
              component: {
                search: {
                  serverSide: serverSide
                },
                Root: {
                  view: { // preventing the scrollbar from being rendered, due to its implementation, it will sometimes break this test
                    scrollbar: {
                      engine: "fake_engine"
                    }
                  }
                }
              }
            };
          }
        });
      };

      var makeAjaxSpy = function() {
        var firstCallToServer = true;
        spyOn($, 'ajax').and.callFake(function(params) {
          if(firstCallToServer) {
            params.success(defaultCdaJson);
            firstCallToServer = false;
          } else {
            params.success(onFilterChangeCdaJson);
          }
        });
      };

      addEvaluateExpectationsAfterGetPage = function(component, serverSide, pageSize, done) {
        component.manager.get('configuration').pagination.getPage =
          (function(originalGetPage) {
            return function() {
              return originalGetPage.apply(component, arguments).then(function(json) {
                evaluateExpectations(serverSide, pageSize, component.manager.get("model").children().models,
                  component.manager.get('configuration'));
                done();
                return json;
              });
            };
          })(component.manager.get('configuration').pagination.getPage);
      };

      addEvaluateExpectationsInsteadOfFilter = function(component, serverSide, pageSize, done) {
        component.manager.filter = function() {
          evaluateExpectations(serverSide, pageSize, component.manager.get("model").children().models,
            component.manager.get('configuration'));
          done();
        };
      };

      var evaluateExpectations = function(serverSide, pageSize, models, configuration) {
        expect(models[0].get("label")).toEqual("Default1");
        expect(models[1].get("label")).toEqual("Default2");
        expect(configuration.search.serverSide).toEqual(serverSide);
        expect(configuration.pagination.pageSize).toEqual((pageSize > 0) ? pageSize : Infinity );
        if (serverSide) {
          expect(models.length).toEqual(4);
          expect(models[2].get("label")).toEqual("ServerSide");
          expect(models[3].get("label")).toEqual("PageSize");
        } else {
          expect(models.length).toEqual(2);
        }
      };
    });

    describe("Search Mechanism #", function() {
      var _Defer = _.defer;

      beforeEach(function() {
        // the component will use defer before the actual filtering
        // bypassing this behaviour when testing
        _.defer = function(func) {
          func.apply(null, []);
        };
      });

      afterEach(function() {
        _.defer = _Defer;
      });

      var getTestSearchFilterComponent = function(matcher) {
        return getNewFilterComponent({
          componentInput: {
            valuesArray:
            [[0, "Twenty-One", "Twenties"], [1, "Twenty-Two", "Twenties"], [2, "Twenty-Three", "Twenties"], [3, "Twenty-Four", "Twenties"],
             [4, "Fourty-Seven", "Fourties"], [5, "Fourty-Nine", "Fourties"], [6, "Fourty-Five", "Fourties"], [7, "Fourty-One", "Fourties"]]
          },
          options: function() {
            return {
              component: {
                search: {
                  matcher: matcher
                }
              }
            };
          }
        });
      };

      var testSearch = function(filterComponent, searchTerm, matchCount) {
        filterComponent.manager.onFilterChange(searchTerm);
        expect(_.filter(filterComponent.model.children().models, function(model) {
          return model.getVisibility();
        }).length).toEqual(matchCount);
      };

      var searchTerms = ["ve", "went", "our", "twenty-one"];

      it("works correctly", function(done) {
        var filterComponent = getTestSearchFilterComponent();
        dashboard.addComponent(filterComponent);
        var searchCount = [2, 4, 5, 1];
        filterComponent.once('getData:success', function() {
          // need to make sure the manager is already fully initialized
          filterComponent.manager.once('post:update:children', function() {
            for(var i = 0; i < searchTerms.length; i++) {
              testSearch(filterComponent, searchTerms[i], searchCount[i]);
            }
            done();
          });
        });
        dashboard.update(filterComponent);
      });

      it("allows defining a specific matcher", function(done) {
        // overriding the matcher, will filter the opposite of what is typed:
        // ex. "a"  yields ["b", "c"] in ["a", "b", "c"]
        var filterComponent = getTestSearchFilterComponent(function(entry, fragment) {
          return entry.toLowerCase().indexOf(fragment.toLowerCase()) == -1;
        });
        dashboard.addComponent(filterComponent);
        var searchCount = [6, 4, 3, 7];
        filterComponent.once('getData:success', function() {
          filterComponent.manager.once('post:update:children', function() {
            for(var i = 0; i < searchTerms.length; i++) {
              testSearch(filterComponent, searchTerms[i], searchCount[i]);
            }
            done();
          });
        });
        dashboard.update(filterComponent);
      });

      it("respects user input", function(done) {
        var filterComponent = getTestSearchFilterComponent();
        dashboard.addComponent(filterComponent);
        filterComponent.once('getData:success', function() {
          var userInput;
          filterComponent.manager.filter = function(text) {
            expect(text).toEqual(userInput);
          };

          userInput = "lowercase";
          filterComponent.manager.onFilterChange(userInput);
          userInput = "UPPERCASE";
          filterComponent.manager.onFilterChange(userInput);
          userInput = "mixedCase";
          filterComponent.manager.onFilterChange(userInput);
          userInput = "special \"#$%& Characters";
          filterComponent.manager.onFilterChange(userInput);

          done();
        });
        dashboard.update(filterComponent);
      });
    });

    describe("Selection Mechanism #", function() {

      var rootId = "TestRoot";

      var getSelectionFilterComponent = function(options) {
        return getNewFilterComponent($.extend(true, {
          componentDefinition: {
            multiselect: true
          },
          componentOutput: {
            outputFormat: "highestID"
          },
          options: function() {
            return {
              input: {
                root: {
                  id: rootId
                }
              }
            };
          }
        }, options));
      };

      var getSelectedModels = function(models) {
        return _.filter(models, function(model) {
            return model.getSelection();
          });
      };

      var expectSelections = function(controller, models, single) {
        for(var i = 0; i < models.length; i++) {
          controller.onSelection(models[i]);
          expect(getSelectedModels(models).length).toEqual(single ? 1 : (i + 1));
        }
      };

      var doSelectionTest = function(filterComponent, dashboard, options) {
        options = options || {};
        var childrenModels = filterComponent.model.children().models;
        expectSelections(filterComponent.manager.get("controller"), childrenModels, options.single);
        filterComponent.model.updateSelectedItems();
        expect(dashboard.getParameterValue(filterComponent.parameter).length).toEqual(
          (options.root || options.single) ? 1 : childrenModels.length);
        if(options.root) {
          expect(dashboard.getParameterValue(filterComponent.parameter)).toEqual([rootId]);
        }
      };

      it("works as intended in single select mode", function(done) {
        var filterComponent = getNewFilterComponent();
        dashboard.addComponent(filterComponent);

        filterComponent.once('getData:success', function() {
          doSelectionTest(filterComponent, dashboard, {single: true});
          done();
        });

        dashboard.update(filterComponent);
      });

      it("works as intended in multi select mode", function(done) {
        var filterComponent = getNewFilterComponent({
          componentDefinition: {
            multiselect: true
          }
        });
        dashboard.addComponent(filterComponent);

        filterComponent.once('getData:success', function() {
          doSelectionTest(filterComponent, dashboard);
          done();
        });

        dashboard.update(filterComponent);
      });

      it("works with valuesArray and a root.id defined", function(done) {
        var filterComponent = getSelectionFilterComponent();
        dashboard.addComponent(filterComponent);

        filterComponent.once('getData:success', function() {
          doSelectionTest(filterComponent, dashboard, {root: true});
          done();
        });

        dashboard.update(filterComponent);
      });

      it("works with dataSource and a root.id defined", function(done) {
        var filterComponent = getSelectionFilterComponent({
          queryDefinition: {
            dataSource: "selectionDataSource"
          },
          componentInput: {
            valuesArray: []
          }
        });

        dashboard.addComponent(filterComponent);
        dashboard.addDataSource("selectionDataSource", {
          dataAccessId: "testId",
          path: "/test.cda"
        });

        spyOn($, 'ajax').and.callFake(function(params) {
          params.success(getCdaJson(testFilterDefaults.componentInput.valuesArray, testMetadata));
        });

        filterComponent.once('getData:success', function() {
          doSelectionTest(filterComponent, dashboard, {root: true});
          done();
        });

        dashboard.update(filterComponent);
      });
    });
  });
});
