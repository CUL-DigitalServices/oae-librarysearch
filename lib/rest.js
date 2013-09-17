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

var OAE = require('oae-util/lib/oae');
var OaeUtil = require('oae-util/lib/util');

var LibrarySearchAPI = require('oae-librarysearch');

/**
 * Registers the API endpoint and performs a library search when triggered
 */
OAE.tenantServer.get('/api/librarysearch', function(req, res) {
    LibrarySearchAPI.performLibrarySearch(req.ctx, req.query.query, function(err, result) {
        if (err) {
            return res.send(err.code, err.msg);
        }
        res.send(200, result);
    });
});
