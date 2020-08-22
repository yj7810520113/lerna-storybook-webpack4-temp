<template>
  <div>测试Vue组件及打包</div>
</template>

<script>
import { Engine } from 'json-rules-engine'
export default {
  data() {
    return {
    }
  },
  created() {
    console.log('1111111')
    this.testEngine1()
    this.testEngine2()
  },
  methods: {
    testEngine1() {
      let engine = new Engine()

      // define a rule for detecting the player has exceeded foul limits.  Foul out any player who:
      // (has committed 5 fouls AND game is 40 minutes) OR (has committed 6 fouls AND game is 48 minutes)
      engine.addRule({
        conditions: {
          any: [{
            all: [{
              fact: 'gameDuration',
              operator: 'equal',
              value: 40
            }, {
              fact: 'personalFoulCount',
              operator: 'greaterThanInclusive',
              value: 5
            }]
          }, {
            all: [{
              fact: 'gameDuration',
              operator: 'equal',
              value: 48
            }, {
              fact: 'personalFoulCount',
              operator: 'greaterThanInclusive',
              value: 6
            }]
          }]
        },
        event: { // define the event to fire when the conditions evaluate truthy
          type: 'fouledOut',
          params: {
            message: 'Player has fouled out!'
          }
        }
      })
      let facts = {
        personalFoulCount: 4,
        gameDuration: 40
      }

      // Run the engine to evaluate
      engine
        .run(facts)
        .then((events) => { // run() returns events with truthy conditions
          console.log(events)
          events.map((event) => console.log(event.params.message))
        })
    },
    testEngine2() {
      let engine = new Engine()
      // eslint-disable-next-line
      let apiClient = require('./account-api-client')
      let microsoftRule = {
        conditions: {
          all: [{
            fact: 'account-information',
            operator: 'equal',
            value: 'microsoft',
            path: '.company' // access the 'company' property of "account-information"
          }, {
            fact: 'account-information',
            operator: 'in',
            value: ['active', 'paid-leave'], // 'status'' can be active or paid-leave
            path: '.status' // access the 'status' property of "account-information"
          }, {
            fact: 'account-information',
            operator: 'contains',
            value: '2016-12-25',
            path: '.ptoDaysTaken' // access the 'ptoDaysTaken' property of "account-information"
          }]
        },
        event: {
          type: 'microsoft-christmas-pto',
          params: {
            message: 'current microsoft employee taking christmas day off'
          }
        }
      }
      engine.addRule(microsoftRule)

      engine.addFact('account-information', function(params, almanac) {
        console.log(this)
        console.log(params, almanac)
        return almanac.factValue('accountId')
          .then((accountId) => {
            console.log(this)
            return apiClient.getAccountInformation(accountId)
            // return {}
          })
      })

      // define fact(s) known at runtime
      let facts = { accountId: 'lincoln' }
      engine
        .run(facts)
        .then((events, almanac, ruleResult) => {
          console.log(events, almanac, ruleResult)
          if (!events.length) return
          console.log(facts.accountId + ' is a ' + events.map((event) => event.params.message))
        })
        .catch((err) => console.log(err.stack))
        // whenever rule is evaluated and the conditions pass, 'success' will trigger
      engine.on('microsoft-christmas-pto', function(event, almanac, ruleResult) {
        console.log(event, almanac, ruleResult) // { type: 'my-event', params: { id: 1 }
      })
    }
  }
}

</script>
<style lang='scss' scoped>
</style>
