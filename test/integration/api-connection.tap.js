'use strict';

var path         = require('path')
  , test         = require('tap').test
  , logger       = require(path.join(__dirname, '..', '..',
                                     'lib', 'logger')).child({component : 'TEST'})
  , configurator = require(path.join(__dirname, '..', '..', 'lib', 'config'))
  , Agent        = require(path.join(__dirname, '..', '..', 'lib', 'agent'))
  , CollectorAPI = require(path.join(__dirname, '..', '..', 'lib', 'collector', 'api.js'))
  ;

test("Collector API should connect to staging-collector.newrelic.com", function (t) {
  var config = configurator.initialize(logger, {
        'config' : {
          'app_name'    : 'node.js Tests',
          'license_key' : 'd67afc830dab717fd163bfcb0b8b88423e9a1a3b',
          'host'        : 'staging-collector.newrelic.com',
          'port'        : 80,
          'logging'     : {
            'level' : 'trace'
          }
        }
      })
    , agent = new Agent(config)
    , api   = new CollectorAPI(agent)
    ;

  api.connect(function (error, returned) {
    t.notOk(error, "connected without error");
    t.ok(returned, "got boot configuration");
    t.ok(returned.agent_run_id, "got run ID");

    // FIXME: the agent will eventually have its own way of managing this
    agent.config.run_id = returned.agent_run_id;

    api.shutdown(function (error, returned, json) {
      t.notOk(error, "should have shut down without issue");
      t.equal(returned, null, "collector explicitly returns null");
      t.deepEqual(json, {return_value : null}, "raw message looks right");

      t.end();
    });
  });
});
