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
var request = require('request');

var ActivityAPI = require('oae-activity');
var AuthzUtil = require('oae-authz/lib/util');
var ConfigAPI = require('oae-config');
var log = require('oae-logger').logger('oae-doc');
var OaeUtil = require('oae-util/lib/util'); // TODO: Still needed?

var AquabrowserAPI = require('./api.aquabrowser');
var SummonAPI = require('./api.summon');

var LibrarySearchConfig = ConfigAPI.config('oae-librarysearch');

/**
 * Initialize the LibrarySearch API
 *
 * @return {Object}                  Object containing all the results from the LibrarySearch API
 */
var initializeLibrarySearchAPI = module.exports.initializeLibrarySearchAPI = function(callback) {

    // TEST THE SEARCH API
    ActivityAPI.on('deliveredActivities', function(routedActivities) {
        _.each(routedActivities, function(activities, route) {
            _.each(activities, function(activity) {
                var tenantAlias = AuthzUtil.getResourceFromId(activity.actor.user.id).tenantAlias;
                performLibrarySearch(tenantAlias, 'darddfdasdsfdasfdsdfwin', function(err, res) {
                    if (err) {
                        console.log(err);
                        console.log('- - - - - - - - - - -');
                    };

                    if (res) {
                        console.log(res);
                        console.log('- - - - - - - - - - -');
                    };
                });
            });
        });
    });

    callback();
};

/**
 * Perform a search to the LibrarySearch API
 *
 * @param  {String}         tenantAlias             The tenantAlias
 * @param  {String}         query                   The query that will be passed to the external API's
 * @param  {Function}       callback                Invoked when the process completes
 * @param  {Object}         callback.err            An error that occurred, if any
 * @param  {Object}         callback.results        The search result with separate objects for each external API
 */
var performLibrarySearch = module.exports.performLibrarySearch = function(tenantAlias, query, callback) {

    // Check if the LibrarySearch integration is enabled in the tenant
    if (!LibrarySearchConfig.getValue(tenantAlias, 'librarysearch', 'enabled')) {
        return callback({'code': 401, 'msg': 'LibrarySearch disabled in tenant'});
    }

    // Return an error message when an invalid query was entered
    if (!query) {
        return callback({'code': 400, 'msg': 'An invalid query was entered'});
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

    // Get Aquabrowser results if enabled
    if (LibrarySearchConfig.getValue(tenantAlias, 'aquabrowser', 'enabled')) {
        searchToComplete++;

        AquabrowserAPI.getAquabrowserResults(tenantAlias, query, function(err, _res) {

            if (err) {
                results['aquabrowser']['error'] = err;
            } else {
                results['aquabrowser'] = _res;
            }            

            searchComplete++;
            if (searchComplete === searchToComplete) {
                return callback(null, results);
            }
        });
    }

    // Get Summon results if enabled
    if (LibrarySearchConfig.getValue(tenantAlias, 'summon', 'enabled')) {
        searchToComplete++;

        SummonAPI.getSummonResults(tenantAlias, query, function(err, _res) {

            if (err) {
                results['summon']['error'] = err;
            } else {
                results['summon'] = _res;
            }

            searchComplete++;
            if (searchComplete === searchToComplete) {
                 return callback(null, results);
            }
        });
    }

    // Return an error message when all the external api's are disabled but LibrarySearch is enabled for the tenant
    if (searchComplete === searchToComplete) {
        return callback({'code': 401, 'msg': 'None of the external API\'s are enabled in tenant'});  
    }
};
