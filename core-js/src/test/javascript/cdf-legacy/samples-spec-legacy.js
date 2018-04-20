/*!
 * Copyright 2002 - 2018 Webdetails, a Hitachi Vantara company. All rights reserved.
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

/**
 * ## Unmanaged Component Samples #
 */
describe("Unmanaged Component Samples #", function() {
  var myDashboard = _.extend({},Dashboards);

  var mhello = window.mhello = {
    name: "mhello",
    type: "HelloBase",
    testFlag: 0,
    htmlObject: 'mhello',
    executeAtStart: true,
    myFunction: function(){}
  };

  var uhello = window.uhello = {
    name: "uhello",
    type: "HelloUnmanaged",
    htmlObject: 'uhello',
    executeAtStart: true,
    myFunction: function(){}
  };

  var mquery = window.mquery = {
    name: "mquery",
    type: "HelloQueryBase",
    htmlObject: 'mquery',
    executeAtStart: true,
    queryDefinition: {
      path: "",
      dataAccessId: ""
    }
  };

  var uquery = window.uquery = {
    name: "uquery",
    type: "HelloQueryUnmanaged",
    htmlObject: 'uquery',
    executeAtStart: true,
    queryDefinition: {
      path: "",
      dataAccessId: ""
    }
  };

  var componentList = [
    window.mhello,
    window.uhello
    //mquery,
    //uquery
  ];

  myDashboard.addComponents(componentList);
  describe("dasda", function(){
    /**
     * ## Unmanaged Component Samples # updates components
     */
    it("Updates components",function(done){
      spyOn(mhello, 'myFunction');
      spyOn(uhello, 'myFunction');

      //update all components of this test 'mhello', 'uhelllo'
      myDashboard.update(componentList);

      //Data To Validate
      var dataToValidate = function() {
        expect(mhello.myFunction.calls.count()).toEqual(1);
        expect(uhello.myFunction.calls.count()).toEqual(1);
        done();
      }

      setTimeout(dataToValidate, 100);
    });
  });
});
