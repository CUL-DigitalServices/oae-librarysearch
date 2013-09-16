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
 * @param  {String}  title               The title of the item
 * @param  {String}  author              The author of the item
 * @param  {String}  date                The date of publication
 * @param  {String}  link                The url to the item
 * @param  {String}  contentType         The content type of the item (e.g. book, journal...)
 * @param  {String}  thumbnail           The url to the thumbnail of the item
 * @param  {String}  publicationPlace    The place of publication of the item
 * @param  {String}  branch              The branch where the item is stored (e.g. name of the college, library...)
 * @return {Result}                      LibrarySearch Result model containing information about the item
 */
module.exports.Result = function(title, author, date, link, contentType, thumbnail, publicationPlace, branch) {
    var that = {};
    that.title = title;
    that.author = author;
    that.date = date;
    that.link = link;
    that.contentType = contentType;
    that.thumbnail = thumbnail;
    that.publicationPlace = publicationPlace;
    that.branch = branch;
    return that;
};

/**
 * A LibrarySearch API Results model
 *
 * @param  {Number}    total             The total amount of items found
 * @param  {Result[]}  results           Collection of items
 * @return {Results}                     LibrarySearch Results model containing results the external API
 */
module.exports.Results = function(total, results) {
    var that = {};
    that.total = total;
    that.results = results;
    return that;
};
