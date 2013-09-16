/*
 * Copyright 2013 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * visibilitys and limitations under the License.
 */

var _ = require('underscore');
var assert = require('assert');

var ConfigTestUtil = require('oae-config/lib/test/util');
var RestAPI = require('oae-rest');
var RestContext = require('oae-rest/lib/model').RestContext;
var TestsUtil = require('oae-tests');

var LibrarySearchConfig = require('oae-config').config('oae-librarysearch');

describe('LibrarySearchAPI', function() {

    // Rest context that can be used every time we need to make a request as a cam tenant admin
    var camAdminRestContext = null;

    /**
    * Initializes the admin REST contexts
    */
    before(function(callback) {
        callback();
    });

    /**
    * Disables LibrarySearch for the tenant after each test
    */
    afterEach(function(callback){
        ConfigTestUtil.updateConfigAndWait(camAdminRestContext, null, 'oae-librarysearch/librarysearch/enabled', false, function(err) {
            assert.ok(!err);
            callback();
        });
    });

    /**
     * Test that tests the connection between OAE and Aquabrowser
     */
    it('verify connection with Aquabrowser API', function(callback) {

        // First enable LRS since the default value is false
        ConfigTestUtil.updateConfigAndWait(camAdminRestContext, null, 'oae-librarysearch/librarysearch/enabled', false, function(err) {
            assert.ok(!err);
            callback();
        });
    });

    /**
     * Test that tests the connection between OAE and Summon
     */
    it('verify connection with Summon API', function(callback) {

        // First enable LRS since the default value is false
        ConfigTestUtil.updateConfigAndWait(camAdminRestContext, null, 'oae-librarysearch/librarysearch/enabled', false, function(err) {
            assert.ok(!err);
            callback();
        });
    });
});
