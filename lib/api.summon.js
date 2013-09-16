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
var crypto = require('crypto');
var req = require('request');

var ConfigAPI = require('oae-config');
var log = require('oae-logger').logger('oae-doc');

var LibrarySearchModel = require('./model');
var LibrarySearchConfig = ConfigAPI.config('oae-librarysearch');

/**
 * Perform a search using the Summon API
 *
 * @param  {String}          tenantAlias             The tenantAlias
 * @param  {String}         query                   The query that will be passed to the Summon API
 * @param  {Function}       callback                Invoked when the process completes
 * @param  {Object}         callback.err            An error that occurred, if any
 * @param  {Object}         callback.results        The search result object
 */
var getSummonResults = module.exports.getSummonResults = function(tenantAlias, query, callback) {

    // Create the header object that will be sent to the Summon API
    var header = {
        'Accept': 'application/json',
        'x-summon-date': convertDate(new Date()),
        'Host': LibrarySearchConfig.getValue(tenantAlias, 'summon', 'endpoint'),
        'Version': LibrarySearchConfig.getValue(tenantAlias, 'summon', 'version'),
        'Query': 's.q=' + query
    };

    // Convert the header to a string to create a hash afterwards
    var headerString = constructHeaderString(header);

    // Create a hash from the application key and the headerString
    var sha1Digest = crypto.createHmac('sha1', LibrarySearchConfig.getValue(tenantAlias, 'summon', 'appsecret')).update(headerString).digest('base64');

    // Construct the header authentication string
    var authHeaderString = 'Summon ' + LibrarySearchConfig.getValue(tenantAlias, 'summon', 'appid') + ';' + sha1Digest;
    header['Authorization'] = authHeaderString;

    // Create an options object that can be submitted to the Summon API
    var options = {
        'method': 'GET',
        'url': 'http://' + header['Host'] + header['Version'] + '?' + header['Query'],
        'timeout': LibrarySearchConfig.getValue(tenantAlias, 'summon', 'timeout'),
        'headers': header
    };

    // Perform the request to the Summon API
    req(options, function(err, res, body) {

        if (err) {
            return callback({'code': 400, 'msg': 'An error occured while parsing Summon data'});
        } else {

            // Try parsing the JSON string as an object
            try {
                var response = JSON.parse(res.body);

                // Variable to store all the results from summon
                var summonResults = [];

                _.each(response.documents, function(item) {

                    var title = cleanUpValue(item['Title'][0]);

                    var author = null;
                    if (item['Publisher_xml']) {
                        author = item['Publisher_xml'][0]['name'];
                    }

                    var date = null;
                    if (item['PublicationDate'][0]) {
                        var date = item['PublicationDate'][0];
                    }

                    var link = cleanUpValue(item.link);
                    var contentType = cleanUpValue(item['ContentType'][0]);

                    var thumbnail = null;
                    if (item['thumbnail_s']) {
                        thumbnail = item['thumbnail_s'][0];
                    }

                    var publicationPlace = null;
                    if (item['PublicationPlace']) {
                        publicationPlace = item['PublicationPlace'][0];
                    }

                    var branch = null;

                    var result = new LibrarySearchModel.Result(title, author, date, link, contentType, thumbnail, publicationPlace, branch);
                    summonResults.push(result);
                });

                var results = new LibrarySearchModel.Results(response.recordCount, summonResults);
                return callback(null, results);

            // When the parsing of the Summon result failed
            } catch (e) {
                return callback({'code': 400, 'msg': 'An error occured while parsing Summon data'});
            }
        }
    });
};

/**
 * Converts the header object to a string, needed for the Summon authentication
 *
 * @param  {Object} header                          Object containing all the header information
 * @return {String}                                 String that will be used as a hash for the authentication
 * @api private
 */
var constructHeaderString = function(header) {
    var headerString = '';
    _.each(header, function(value, key) {
        headerString += value + '\n';
    });
    return headerString;
}

/**
 * Converts the date to the correct GMT
 *
 * @param  {Date}  date                             The date in a CEST format
 * @return {Date}                                   The date in a GMT format
 * @api private
 */
var convertDate = function(date) {
    var d = date;
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    var offset = 1;
    return new Date(utc + (3600000 * offset)).toUTCString();
};

/**
 * Strips the value down to a simple string
 *
 * @param  {String}  value                          The value thad needs to be stripped
 * @return {String}                                 The cleaned up value
 * @api private
 */
var cleanUpValue = function(value) {
    if (value) {
        var stripped = value.replace('<h>','').replace('</h>','');
        return stripped;
    }
    return;
};
