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

describe('pen-shim enviroment', function () {
  it('is defined', function () {
    expect(pen).toBeDefined();
    expect(pen.define).toBeDefined();
    expect(pen.require).toBeDefined();
  });
});

describe('pen-shim resolves a module if the dependencies', function () {

  beforeEach(function () {
    pen._loadedModulesById = {};
  });

  it('are defined by an absolute path', function () {
    pen.define('some/long/path', [], function () {
      return 'Resistance';
    });
    pen.define('my/module/file', ['some/long/path'], function (dep) {
      return dep + ' is futile';
    });
    pen.require(['my/module/file'], function (result) {
      expect(result).toBe('Resistance is futile');
    });
  });

  it('reside in the same folder', function () {
    pen.define('my/module/another/file', [], function () {
      return 'Resistance';
    });
    pen.define('my/module/file', ['./another/file'], function (dep) {
      return dep + ' is futile';
    });
    pen.require(['my/module/file'], function (result) {
      expect(result).toBe('Resistance is futile');
    });
  });

  it('are defined by a relative path', function () {
    pen.define('my/another/file', [], function () {
      return 'Resistance';
    });
    pen.define('my/module/file', ['../another/file'], function (dep) {
      return dep + ' is futile';
    });
    pen.require(['my/module/file'], function (result) {
      expect(result).toBe('Resistance is futile');
    });
  });

  it('exist at the root', function () {
    pen.define('xpto', [], function () {
      return 'Resistance';
    });
    pen.define('my/module/file', ['../../xpto'], function (dep) {
      return dep + ' is futile';
    });
    pen.require(['my/module/file'], function (result) {
      expect(result).toBe('Resistance is futile');
    });
  });

  it('do not refer to a module below the root', function () {
    pen.define('xpto', [], function () {
      return 'Resistance';
    });
    pen.define('my/module/file', ['../../../xpto'], function (dep) {
      if (dep === undefined) {
        return 'unresolved';
      }
      return dep + ' is futile';
    });
    pen.require(['my/module/file'], function (result) {
      expect(result).toBe('unresolved');
    });
  });
});
