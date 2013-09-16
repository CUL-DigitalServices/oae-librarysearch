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

var Fields = require('oae-config/lib/fields');

module.exports = {
    'title': 'OAE LibrarySearch Module',
    'librarysearch': {
        'name': 'LibrarySearch configuration',
        'description': 'LibrarySearch configuration',
        'elements': {
            'enabled': new Fields.Bool('LibrarySearch Enabled', 'LibrarySearch integration enabled for tenant', false, {'suppress': true})
        }
    },
    'aquabrowser': {
        'name': 'Aquabrowser API',
        'description': 'Aquabrowser API configuration',
        'elements': {
            'enabled': new Fields.Bool('Include Aquabrowser results', 'Include Aquabrowser results in LibrarySearch', false, {'suppress': true}),
            'timeout': new Fields.Text('Request timeout', 'The timeout for the request', 5000, {'suppress': true}),
            'endpoint': new Fields.Text('Aquabrowser API URL', 'The Aquabrowser API endpoint', 'http://search.lib.cam.ac.uk/sru.ashx?', {'suppress': true})
        }
    },
    'summon': {
        'name': 'Summon API',
        'description': 'Summon API configuration',
        'elements': {
            'enabled': new Fields.Bool('Include Summon results', 'Include Summon results in LibrarySearch', false, {'suppress': true}),
            'timeout': new Fields.Text('Request timeout', 'The timeout for the request', 10000, {'suppress': true}),
            'appid': new Fields.Text('Summon API App ID', 'The Summon app ID', 'cam', {'suppress': true}),
            'appsecret': new Fields.Text('Summon API App Secret', 'The Summon app Secret', 'n74nDv98EFz8hE1wVNoq3MgrU66a9r4M', {'suppress': true}),
            'endpoint': new Fields.Text('Summon API URL', 'The Summon API endpoint (without http(s)://)', 'api.summon.serialssolutions.com', {'suppress': true}),
            'version': new Fields.Text('Summon API Version', 'The Summon API version', '/2.0.0/search', {'suppress': true})
        }
    }
};
