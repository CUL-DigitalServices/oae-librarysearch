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

var ConfigAPI = require('oae-config');
var ConfigTestUtil = require('oae-config/lib/test/util');
var RestAPI = require('oae-rest');
var RestContext = require('oae-rest/lib/model').RestContext;
var TestsUtil = require('oae-tests');

var ActivityTestsUtil = require('oae-activity/lib/test/util');
var LibrarySearchAPIConfig = require('oae-config').config('oae-librarysearch');
var LibrarySearchAPIConstants = require('../lib/constants').LibrarySearchAPIConstants;

// Require the REST client for librarysearch. It will be made available on `RestAPI.LibrarySearch`
RestAPI.LibrarySearch = require('oae-librarysearch/lib/client');

describe('LibrarySearchAPI', function() {

    // Rest context that can be used every time we need to make a request as a cam tenant admin
    var camAdminRestContext = null;

    // The original correct endpoints for the external api's
    var originalAquabrowserEndpoint = null;
    var originalSummonEndpoint = null;

    /**
     * Initializes the admin REST contexts
     */
    before(function(callback) {

        // Fill up the cam admin rest context
        camAdminRestContext = TestsUtil.createTenantAdminRestContext(global.oaeTests.tenants.cam.host);

        // Fill up the original endpoints for the external api's
        originalAquabrowserEndpoint = LibrarySearchAPIConfig.getValue(global.oaeTests.tenants.cam.alias, 'aquabrowser', 'endpoint');
        originalSummonEndpoint = LibrarySearchAPIConfig.getValue(global.oaeTests.tenants.cam.alias, 'summon', 'endpoint');

        callback();
    });

    /**
     * Disables LibrarySearch, Aquabrowser and Summon for the tenant after each test
     */
    afterEach(function(callback){

        // Disable LibrarySearch for tenant
        ConfigTestUtil.updateConfigAndWait(camAdminRestContext, null, 'oae-librarysearch/librarysearch/enabled', false, function(err) {
            assert.ok(!err);

            // Disable Aquabrowser for tenant
            ConfigTestUtil.updateConfigAndWait(camAdminRestContext, null, 'oae-librarysearch/aquabrowser/enabled', false, function(err) {
                assert.ok(!err);

                // Disable Summon for tenant
                ConfigTestUtil.updateConfigAndWait(camAdminRestContext, null, 'oae-librarysearch/summon/enabled', false, function(err) {
                    assert.ok(!err);

                    // Restore the original endpoint for Aquabrowser
                    ConfigTestUtil.updateConfigAndWait(camAdminRestContext, null, 'oae-librarysearch/aquabrowser/endpoint', originalAquabrowserEndpoint, function(err) {
                        assert.ok(!err);
                    
                        // Restore the original endpoint for Summon
                        ConfigTestUtil.updateConfigAndWait(camAdminRestContext, null, 'oae-librarysearch/summon/endpoint', originalSummonEndpoint, function(err) {
                            assert.ok(!err);
                            callback();
                        });
                    });
                });
            });
        });
    });
    
    /**
     * Test that verifies that no requests can be send to Summon or Aquabrowser when LibrarySearch is disabled for tenant
     */
    it('verify LibrarySearch integration enabled', function(callback) {

        // Disable LibrarySearch for the tenant
        ConfigTestUtil.updateConfigAndWait(camAdminRestContext, null, 'oae-librarysearch/librarysearch/enabled', false, function(err) {
            assert.ok(!err);

            // Generate a test user
            TestsUtil.generateTestUsers(camAdminRestContext, 1, function(err, users) {
                assert.ok(!err);

                // Perform a search request
                var testUser = _.values(users)[0];
                RestAPI.LibrarySearch.search(testUser.restContext, 'darwin', function(err, data) {
                    assert.ok(err);
                    assert.deepEqual(err, LibrarySearchAPIConstants.errors.LIBRARYSEARCH_DISABLED);
                    callback();
                });
            });
        });
    });

    /**
     * Test that verifies that a valid query has been entered
     */
    it('verify query in params is not empty', function(callback) {

        // First enable LibrarySearch since the default value is false
        ConfigTestUtil.updateConfigAndWait(camAdminRestContext, null, 'oae-librarysearch/librarysearch/enabled', true, function(err) {
            assert.ok(!err);

            // Generate a test user
            TestsUtil.generateTestUsers(camAdminRestContext, 1, function(err, users) {
                assert.ok(!err);

                // Perform a search request with an empty query
                var testUser = _.values(users)[0];
                RestAPI.LibrarySearch.search(testUser.restContext, '', function(err, data) {
                    assert.ok(err);
                    assert.deepEqual(err, LibrarySearchAPIConstants.errors.INVALID_QUERY);
                    callback();
                });
            });
        });
    });

    /**
     * Test that verifies that no requests can be send when all the external API's are disabled for LibrarySearch
     */
    it('verify external API integration enabled', function(callback) {

        // First enable LibrarySearch since the default value is false
        ConfigTestUtil.updateConfigAndWait(camAdminRestContext, null, 'oae-librarysearch/librarysearch/enabled', true, function(err) {
            assert.ok(!err);

            // Generate a test user
            TestsUtil.generateTestUsers(camAdminRestContext, 1, function(err, users) {
                assert.ok(!err);

                // Perform a search request
                var testUser = _.values(users)[0];
                RestAPI.LibrarySearch.search(testUser.restContext, 'darwin', function(err, data) {
                    assert.ok(err);
                    assert.deepEqual(err, LibrarySearchAPIConstants.errors.EXTERNAL_APIS_DISABLED);
                    callback();
                });
            });
        });
    });

    /**
     * Test that verifies the connection between OAE and Aquabrowser API
     */
    it('verify connection with Aquabrowser API', function(callback) {

        // First enable LibrarySearch since the default value is false
        ConfigTestUtil.updateConfigAndWait(camAdminRestContext, null, 'oae-librarysearch/librarysearch/enabled', true, function(err) {
            assert.ok(!err);

            // Enable Aquabrowser for the tenant
            destroyExternalAPI('aquabrowser', function() {

                // Generate a test user
                TestsUtil.generateTestUsers(camAdminRestContext, 1, function(err, users) {
                    assert.ok(!err);

                    // Perform a search request
                    var testUser = _.values(users)[0];
                    RestAPI.LibrarySearch.search(testUser.restContext, 'darwin', function(err, data) {
                        assert.ok(!err);
                        assert.ok(data.aquabrowser.error);
                        callback();
                    });
                });
            });
        });
    });

    /**
     * Test that verifies the connection between OAE and Summon API
     */
    it('verify connection with Summon API', function(callback) {

        // First enable LibrarySearch since the default value is false
        ConfigTestUtil.updateConfigAndWait(camAdminRestContext, null, 'oae-librarysearch/librarysearch/enabled', true, function(err) {
            assert.ok(!err);

            // Enable Aquabrowser for the tenant
            destroyExternalAPI('summon', function() {

                // Generate a test user
                TestsUtil.generateTestUsers(camAdminRestContext, 1, function(err, users) {
                    assert.ok(!err);

                    // Perform a search request
                    var testUser = _.values(users)[0];
                    RestAPI.LibrarySearch.search(testUser.restContext, 'darwin', function(err, data) {
                        assert.ok(!err);
                        assert.ok(data.summon.error);
                        callback();
                    });
                });
            });
        });
    });

    /**
     * Test that verifies the result when an error is thrown for one of the external api's
     */
    it('verify result when Aquabrowser is valid and Summon is broken', function(callback) {

        // Store the tenantAlias
        var tenantAlias = global.oaeTests.tenants.cam.alias;

        // First enable LibrarySearch since the default value is false
        ConfigTestUtil.updateConfigAndWait(camAdminRestContext, null, 'oae-librarysearch/librarysearch/enabled', true, function(err) {
            assert.ok(!err);

            // Destroy Summon for tenant
            destroyExternalAPI('summon', function() {

                // Enable Aquabrowser for tenant
                ConfigTestUtil.updateConfigAndWait(camAdminRestContext, null, 'oae-librarysearch/aquabrowser/enabled', true, function(err) {
                    assert.ok(!err);

                    // Generate a test user
                    TestsUtil.generateTestUsers(camAdminRestContext, 1, function(err, users) {
                        assert.ok(!err);

                        // Perform a search request
                        var testUser = _.values(users)[0];
                        RestAPI.LibrarySearch.search(testUser.restContext, 'darwin', function(err, data) {
                            assert.ok(!err);
                            assert.ok(!data.aquabrowser.error);
                            assert.ok(data.aquabrowser.total);
                            assert.ok(data.aquabrowser.results);
                            assert.ok(data.summon.error);
                            callback();
                        });
                    });
                });
            });
        });
    });


    /**
     * Test that verifies the result when an error is thrown for one of the external api's
     */
    it('verify result when Summon is valid and Aquabrowser is broken', function(callback) {

        // Store the tenantAlias
        var tenantAlias = global.oaeTests.tenants.cam.alias;

        // First enable LibrarySearch since the default value is false
        ConfigTestUtil.updateConfigAndWait(camAdminRestContext, null, 'oae-librarysearch/librarysearch/enabled', true, function(err) {
            assert.ok(!err);

            // Destroy Summon for tenant
            destroyExternalAPI('aquabrowser', function() {

                // Enable Aquabrowser for tenant
                ConfigTestUtil.updateConfigAndWait(camAdminRestContext, null, 'oae-librarysearch/summon/enabled', true, function(err) {
                    assert.ok(!err);

                    // Generate a test user
                    TestsUtil.generateTestUsers(camAdminRestContext, 1, function(err, users) {
                        assert.ok(!err);

                        // Perform a search request
                        var testUser = _.values(users)[0];
                        RestAPI.LibrarySearch.search(testUser.restContext, 'darwin', function(err, data) {
                            assert.ok(!err);
                            assert.ok(!data.summon.error);
                            assert.ok(data.summon.total);
                            assert.ok(data.summon.results);
                            assert.ok(data.aquabrowser.error);
                            callback();
                        });
                    });
                });
            });
        });
    });

    /**
     * Whilst enabling an external API for LibrarySearch, use false information for its authentication to generate an error
     * 
     * @param  {String}          api                The name of the external API
     * @param  {Function(data)}  callback           Standard callback function
     */
    var destroyExternalAPI = function(api, callback) {

        // Enable Aquabrowser for the tenant
        ConfigTestUtil.updateConfigAndWait(camAdminRestContext, null, 'oae-librarysearch/' + api + '/enabled', true, function(err) {
            assert.ok(!err);

            // Change the Aquabrowser endpoint to a fake one so it will throw an error
            ConfigTestUtil.updateConfigAndWait(camAdminRestContext, null, 'oae-librarysearch/' + api + '/endpoint', 'fault', function(err) {
                assert.ok(!err);
                callback();
            });
        });
    };
});
