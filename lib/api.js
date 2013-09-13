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

var AuthzUtil = require('oae-authz/lib/util');
var ConfigAPI = require('oae-config');
var log = require('oae-logger').logger('oae-doc');

var LibrarySearchModel = require('./model');
var LibrarySearchConfig = ConfigAPI.config('oae-tincanapi');

var config = null;

/**
 * Initializes the LibrarySearch API integration. 
 *
 * @param  {Object}    config       Configuration for the LibrarySearch API module
 * @param  {Function}  callback     Standard callback function
 */
var initializeLibrarySearchAPI = module.exports.initializeLibrarySearchAPI = function(_config, callback) {

    // Store the configuration values
    config = _config;

	// Check if the LibrarySearch integration is enabled for the tenant
	/*
    if (LibrarySearchConfig.getValue(tenantAlias, 'lrs', 'enabled')) {
    	console.log('LibrarySearch enabled for tenant');
    } else {
    	console.log('LibrarySearch DISABLED for tenant');
    }
    */

    callback();
};
