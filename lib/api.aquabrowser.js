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
var req = require('request');
var xml2js = require('xml2js');

var ConfigAPI = require('oae-config');
var log = require('oae-logger').logger('oae-doc');

var LibrarySearchModel = require('./model');
var LibrarySearchConfig = ConfigAPI.config('oae-librarysearch');

/**
 * Perform a search using the Aquabrowser API
 *
 * @param  {String}         tenantAlias             The tenantAlias
 * @param  {String}         query                   The query that will be passed to the Aquabrowser API
 * @param  {Function}       callback                Invoked when the process completes
 * @param  {Object}         callback.err            An error that occurred, if any
 * @param  {Object}         callback.results        The search result object
 */
var getAquabrowserResults = module.exports.getAquabrowserResults = function(tenantAlias, query, callback) {

    // Construct the url for the request
    var url = LibrarySearchConfig.getValue(tenantAlias, 'aquabrowser', 'endpoint') + 'operation=searchRetrieve&version=1.1&query=' + query + '&maximumRecords=20&recordSchema=dc';

    // Create an options object that can be submitted to the Aquabrowser API
    var options = {
        'url': url,
        'timeout': LibrarySearchConfig.getValue(tenantAlias, 'aquabrowser', 'timeout')
    };

    // Perform the request to the Aquabrowser API
    req(options, function(err, res, body) {

        if (err) {
            return callback({'code': 500, 'msg': 'An error occured while parsing Aquabrowser data'});
        } else {

            // Remove all the whitespace characters from the xml
            var xml = res.body.trim();

            // Create an options object for the JSON parsing
            var parseOpts = {
                'trim': true, 
                'mergeAttrs': true, 
                'explicitArray': false
            };

            // Parse the XML as a JSON string
            var jsonstring = xml2js.parseString(xml, parseOpts, function(err, res) {

                if (err) {
                    return callback({'code': 500, 'msg': 'An error occured while parsing Aquabrowser data'});
                }

                if (res) {

                    // Variable to store all the results from Aquabrowser
                    var aquabrowserResults = [];

                    var numRecords = res['srw:searchRetrieveResponse']['srw:numberOfRecords'];
                    var records = res['srw:searchRetrieveResponse']['srw:records']['srw:record'];

                    _.each(records, function(record) {

                        if (!record.error) {

                            var title = record['srw:recordData']['dc:title'];
                            var author = record['srw:recordData']['dc:creator'];
                            var date = record['srw:recordData']['dc:date'];
                            var link = record['srw:extraRecordData']['recordURL'];
                            var contentType = record['srw:recordData']['dc:format'];

                            var thumbnail = '';
                            if (record['srw:extraRecordData']['coverimageurl']) {
                                thumbnail = record['srw:extraRecordData']['coverimageurl'];
                            }

                            var publicationPlace = null;
                            var branch = record['srw:extraRecordData']['dc:branch'];

                            var result = new LibrarySearchModel.Result(title, author, date, link, contentType, thumbnail, publicationPlace, branch);
                            aquabrowserResults.push(result);
                        }
                    });

                    var results = new LibrarySearchModel.Results(numRecords, aquabrowserResults);
                    return callback(null, results);
                }
            });
        }
    });
};
