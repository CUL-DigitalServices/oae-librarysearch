/*!
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
 * permissions and limitations under the License.
 */

var _ = require('underscore');

var ConfigAPI = require('oae-config');

var AquabrowserAPI = require('./api.aquabrowser');
var SummonAPI = require('./api.summon');

var LibrarySearchAPIConfig = ConfigAPI.config('oae-librarysearch');
var LibrarySearchAPIConstants = require('./constants').LibrarySearchAPIConstants;

/*
 * Initializes the LibrarySearch API
 *
 * @param  {Function}       callback                Invoked when the process completes
 */
var initializeLibrarySearchAPI = module.exports.initializeLibrarySearchAPI = function(callback) {
    callback();
};

/**
 * Perform a search to the LibrarySearch API
 *
 * @param  {Context}        ctx                     Standard REST Context object that contains the current tenant URL and the current user credentials
 * @param  {String}         query                   The query that will be passed to the external API's
 * @param  {Function}       callback                Invoked when the process completes
 * @param  {Object}         callback.err            An error that occurred, if any
 * @param  {Object}         callback.results        The search result with separate objects for each external API
 */
var performLibrarySearch = module.exports.performLibrarySearch = function(ctx, query, callback) {

    // Store the tenantAlias
    var tenantAlias = ctx.tenant().alias;

    // Check if the LibrarySearch integration is enabled in the tenant
    if (!LibrarySearchAPIConfig.getValue(tenantAlias, 'librarysearch', 'enabled')) {
        return callback(LibrarySearchAPIConstants.errors.LIBRARYSEARCH_DISABLED);
    }

    // Return an error message when an invalid query was entered
    if (!query) {
        return callback(LibrarySearchAPIConstants.errors.INVALID_QUERY);
    }

    // Stores the results for each external api
    var results = {
        'aquabrowser': {},
        'summon': {}
    };

    // Stores how many external api's should be called
    var searchToComplete = 0;

    // Stores how many external api's have been called
    var searchComplete = 0;

    if (LibrarySearchAPIConfig.getValue(tenantAlias, 'aquabrowser', 'enabled')) {
        searchToComplete++;
    }

    if (LibrarySearchAPIConfig.getValue(tenantAlias, 'summon', 'enabled')) {
        searchToComplete++;
    }

    // Return an error message when all the external api's are disabled but LibrarySearch is enabled for the tenant
    if (searchComplete === searchToComplete) {
        return callback(LibrarySearchAPIConstants.errors.EXTERNAL_APIS_DISABLED);
    }

    // Get Aquabrowser results if enabled
    if (LibrarySearchAPIConfig.getValue(tenantAlias, 'aquabrowser', 'enabled')) {

        AquabrowserAPI.getAquabrowserResults(tenantAlias, query, function(err, _res) {
            searchComplete++;

            if (err) {
                results['aquabrowser']['error'] = err;
            } else {
                results['aquabrowser'] = _res;
            }

            if (searchComplete === searchToComplete) {
                return callback(null, results);
            }
        });
    }

    // Get Summon results if enabled
    if (LibrarySearchAPIConfig.getValue(tenantAlias, 'summon', 'enabled')) {

        SummonAPI.getSummonResults(tenantAlias, query, function(err, _res) {
            searchComplete++;

            if (err) {
                results['summon']['error'] = err;
            } else {
                results['summon'] = _res;
            }

            if (searchComplete === searchToComplete) {
                return callback(null, results);
            }
        });
    }
};
