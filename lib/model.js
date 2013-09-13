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
 * visibilitys and limitations under the License.
 */

/**
 * A LibrarySearch API Result model
 *
 * @param  {Actor}      title           The title of the item
 * @return {Result}                     LibrarySearch Result model containing information about the item
 */
module.exports.Result = function(title) {
    var that = {};
    that.title = title;
    return that;
};

/**
 * A LibrarySearch API Results model
 *
 * @return {Results}                    LibrarySearch Results model containing results from the external API's
 */
module.exports.Results = function() {
    var that = {};
    return that;
};
