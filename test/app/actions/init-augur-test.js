import { describe, it, beforeEach, afterEach } from 'mocha'

import sinon from 'sinon'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import realStore from 'src/store'

import { initAugur, connectAugur, __RewireAPI__ as ReWireModule } from 'modules/app/actions/init-augur'

describe('init-augur', () => {
  const augurNodeWS = 'wss://some.web.socket.com'
  const ethereumNodeConnectionInfo = {
    http: 'http://some.eth.node.com',
    ws: 'wss://some.eth.ws.node.com',
  }
  const middleware = [thunk]
  const mockStore = configureMockStore(middleware)
  const mockEnv = {
    'augur-node': augurNodeWS,
    'ethereum-node': ethereumNodeConnectionInfo,
  }
  const realSetInterval = global.setInterval
  const store = mockStore({
    ...realStore.getState(),
    env: mockEnv,
  })
  const ACTIONS = {
    UPDATE_ENV: { type: 'UPDATE_ENV' },
    UPDATE_CONNECTION_STATUS: { type: 'UPDATE_CONNECTION_STATUS' },
    UPDATE_AUGUR_NODE_CONNECTION_STATUS: { type: 'UPDATE_AUGUR_NODE_CONNECTION_STATUS' },
    UPDATE_CONTRACT_ADDRESSES: { type: 'UPDATE_CONTRACT_ADDRESSES' },
    UPDATE_FUNCTIONS_API: { type: 'UPDATE_FUNCTIONS_API' },
    UPDATE_EVENTS_API: { type: 'UPDATE_EVENTS_API' },
    SET_LOGIN_ACCOUNT: { type: 'SET_LOGIN_ACCOUNT' },
    LOGOUT: { type: 'LOGOUT' },
    LOAD_UNIVERSE: { type: 'LOAD_UNIVERSE' },
    REGISTER_TRANSACTION_RELAY: { type: 'REGISTER_TRANSACTION_RELAY' },
    UPDATE_MODAL: { type: 'UPDATE_MODAL' },
    CLOSE_MODAL: { type: 'CLOSE_MODAL' },
  }

  ReWireModule.__Rewire__('updateEnv', () => ACTIONS.UPDATE_ENV)
  ReWireModule.__Rewire__('updateConnectionStatus', () => ACTIONS.UPDATE_CONNECTION_STATUS)
  ReWireModule.__Rewire__('updateContractAddresses', () => ACTIONS.UPDATE_CONTRACT_ADDRESSES)
  ReWireModule.__Rewire__('updateFunctionsAPI', () => ACTIONS.UPDATE_FUNCTIONS_API)
  ReWireModule.__Rewire__('updateEventsAPI', () => ACTIONS.UPDATE_EVENTS_API)
  ReWireModule.__Rewire__('updateAugurNodeConnectionStatus', () => ACTIONS.UPDATE_AUGUR_NODE_CONNECTION_STATUS)
  ReWireModule.__Rewire__('registerTransactionRelay', () => ACTIONS.REGISTER_TRANSACTION_RELAY)
  ReWireModule.__Rewire__('setLoginAccount', () => ACTIONS.SET_LOGIN_ACCOUNT)
  ReWireModule.__Rewire__('loadUniverse', () => ACTIONS.LOAD_UNIVERSE)
  ReWireModule.__Rewire__('verifyMatchingNetworkIds', callback => dispatch => callback(null, true))

  beforeEach(() => {
    global.XMLHttpRequest = sinon.useFakeXMLHttpRequest()
    global.requests = []

    global.XMLHttpRequest.onCreate = (xhr) => {
      global.requests.push(xhr)
    }

    global.setInterval = (f, interval) => {
      f()
    }

    store.clearActions()
  })

  afterEach(() => {
    global.XMLHttpRequest.restore()
    global.setInterval = realSetInterval
    store.clearActions()
  })

  describe('initAugur', () => {
    const test = t => it(t.description, done => t.assertions(done))

    test({
      description: 'Should InitAugur successfully, with logged in account',
      assertions: (done) => {
        ReWireModule.__Rewire__('AugurJS', {
          connect: (env, cb) => {
            cb(null, {
              ethereumNode: {
                ...ethereumNodeConnectionInfo,
                contracts: {},
                abi: {
                  functions: {},
                  events: {},
                },
              },
              augurNode: augurNodeWS,
            })
          },
          augur: {
            contracts: { addresses: { 4: { Universe: '0xb0b' } } },
            rpc: {
              getNetworkID: () => 4,
              eth: { accounts: cb => cb(null, ['0xa11ce']) },
            },
            api: { Controller: { stopped: () => {} } },
          },
        })

        store.dispatch(initAugur({}, (err, connInfo) => {
          assert.isUndefined(err, 'callback passed to initAugur had a first argument when expecting undefined.')
          assert.isUndefined(connInfo, 'callback passed to initAugur had a second argument when expecting undefined.')
          done()
        }))

        global.requests[0].respond(
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify(mockEnv),
        )

        const expected = [
          { type: 'UPDATE_ENV' },
          { type: 'UPDATE_CONNECTION_STATUS' },
          { type: 'UPDATE_CONTRACT_ADDRESSES' },
          { type: 'UPDATE_FUNCTIONS_API' },
          { type: 'UPDATE_EVENTS_API' },
          { type: 'UPDATE_AUGUR_NODE_CONNECTION_STATUS' },
          { type: 'REGISTER_TRANSACTION_RELAY' },
          { type: 'LOAD_UNIVERSE' },
          { type: 'CLOSE_MODAL' },
          { type: 'SET_LOGIN_ACCOUNT' },
        ]

        assert.deepEqual(store.getActions(), expected, `Didn't fire the expected actions`)
      },
    })
    test({
      description: 'Should InitAugur successfully, not logged in',
      assertions: (done) => {
        ReWireModule.__Rewire__('AugurJS', {
          connect: (env, cb) => {
            cb(null, {
              ethereumNode: {
                ...ethereumNodeConnectionInfo,
                contracts: {},
                abi: {
                  functions: {},
                  events: {},
                },
              },
              augurNode: augurNodeWS,
            })
          },
          augur: {
            contracts: { addresses: { 4: { Universe: '0xb0b' } } },
            rpc: {
              getNetworkID: () => 4,
              eth: { accounts: cb => cb(null, []) },
            },
            api: { Controller: { stopped: () => {} } },
          },
        })

        store.dispatch(initAugur({}, (err, connInfo) => {
          assert.isUndefined(err, 'callback passed to initAugur had a first argument when expecting undefined.')
          assert.isUndefined(connInfo, 'callback passed to initAugur had a second argument when expecting undefined.')
          done()
        }))

        global.requests[0].respond(
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify(mockEnv),
        )

        const expected = [
          { type: 'UPDATE_ENV' },
          { type: 'UPDATE_CONNECTION_STATUS' },
          { type: 'UPDATE_CONTRACT_ADDRESSES' },
          { type: 'UPDATE_FUNCTIONS_API' },
          { type: 'UPDATE_EVENTS_API' },
          { type: 'UPDATE_AUGUR_NODE_CONNECTION_STATUS' },
          { type: 'REGISTER_TRANSACTION_RELAY' },
          { type: 'LOAD_UNIVERSE' },
          { type: 'CLOSE_MODAL' },
          { type: 'LOGOUT' },
        ]

        assert.deepEqual(store.getActions(), expected, `Didn't fire the expected actions`)
      },
    })
    test({
      description: 'Should InitAugur successfully, not logged in, unexpectedNetworkId',
      assertions: (done) => {
        ReWireModule.__Rewire__('AugurJS', {
          connect: (env, cb) => {
            cb(null, {
              ethereumNode: {
                ...ethereumNodeConnectionInfo,
                contracts: {},
                abi: {
                  functions: {},
                  events: {},
                },
              },
              augurNode: augurNodeWS,
            })
          },
          augur: {
            contracts: {
              addresses: {
                4: { Universe: '0xb0b' },
                3: { Universe: '0xc41231e2' },
              },
            },
            rpc: {
              getNetworkID: () => 3,
              eth: { accounts: cb => cb(null, []) },
            },
            api: { Controller: { stopped: () => {} } },
          },
        })

        store.dispatch(initAugur({}, (err, connInfo) => {
          assert.isUndefined(err, 'callback passed to initAugur had a first argument when expecting undefined.')
          assert.isUndefined(connInfo, 'callback passed to initAugur had a second argument when expecting undefined.')
          done()
        }))

        global.requests[0].respond(
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify(mockEnv),
        )

        const expected = [
          { type: 'UPDATE_ENV' },
          { type: 'UPDATE_CONNECTION_STATUS' },
          { type: 'UPDATE_CONTRACT_ADDRESSES' },
          { type: 'UPDATE_FUNCTIONS_API' },
          { type: 'UPDATE_EVENTS_API' },
          { type: 'UPDATE_AUGUR_NODE_CONNECTION_STATUS' },
          { type: 'REGISTER_TRANSACTION_RELAY' },
          { type: 'LOAD_UNIVERSE' },
          { type: 'UPDATE_MODAL' },
          { type: 'LOGOUT' },
        ]

        assert.deepEqual(store.getActions(), expected, `Didn't fire the expected actions`)
      },
    })
    test({
      description: 'Should handle a http error',
      assertions: (done) => {
        ReWireModule.__Rewire__('AugurJS', {
          connect: (env, cb) => {
            cb(null, {
              ethereumNode: {
                ...ethereumNodeConnectionInfo,
                contracts: {},
                abi: {
                  functions: {},
                  events: {},
                },
              },
              augurNode: augurNodeWS,
            })
          },
          augur: {
            contracts: {
              addresses: {
                4: { Universe: '0xb0b' },
                3: { Universe: '0xc41231e2' },
              },
            },
            rpc: {
              getNetworkID: () => 3,
              eth: { accounts: cb => cb(null, []) },
            },
          },
        })

        store.dispatch(initAugur({}, (err, connInfo) => {
          assert.deepEqual(err, 'Not Found', `didn't send the expected status text to the initAugur callback.`)
          assert.isUndefined(connInfo, 'callback passed to initAugur had a second argument when expecting undefined.')
          done()
        }))
        global.requests[0].respond(404)

        const expected = []

        assert.deepEqual(store.getActions(), expected, `Didn't fire the expected actions`)
      },
    })
  })
  describe('connectAugur', () => {
    const test = t => it(t.description, done => t.assertions(done))

    test({
      description: 'Should connectAugur successfully as an initial connection, with logged in account',
      assertions: (done) => {
        ReWireModule.__Rewire__('AugurJS', {
          connect: (env, cb) => {
            cb(null, {
              ethereumNode: {
                ...ethereumNodeConnectionInfo,
                contracts: {},
                abi: {
                  functions: {},
                  events: {},
                },
              },
              augurNode: augurNodeWS,
            })
          },
          augur: {
            contracts: { addresses: { 4: { Universe: '0xb0b' } } },
            rpc: {
              getNetworkID: () => 4,
              eth: { accounts: cb => cb(null, ['0xa11ce']) },
            },
            api: { Controller: { stopped: () => {} } },
          },
        })

        store.dispatch(connectAugur({}, mockEnv, true, (err, connInfo) => {
          assert.isUndefined(err, 'callback passed to connectAugur had a first argument when expecting undefined.')
          assert.isUndefined(connInfo, 'callback passed to connectAugur had a second argument when expecting undefined.')
          done()
        }))

        const expected = [
          { type: 'UPDATE_CONNECTION_STATUS' },
          { type: 'UPDATE_CONTRACT_ADDRESSES' },
          { type: 'UPDATE_FUNCTIONS_API' },
          { type: 'UPDATE_EVENTS_API' },
          { type: 'UPDATE_AUGUR_NODE_CONNECTION_STATUS' },
          { type: 'REGISTER_TRANSACTION_RELAY' },
          { type: 'LOAD_UNIVERSE' },
          { type: 'CLOSE_MODAL' },
          { type: 'SET_LOGIN_ACCOUNT' },
        ]

        assert.deepEqual(store.getActions(), expected, `Didn't fire the expected actions`)
      },
    })
    test({
      description: 'Should connectAugur successfully as a reconnection',
      assertions: (done) => {
        ReWireModule.__Rewire__('AugurJS', {
          connect: (env, cb) => {
            cb(null, {
              ethereumNode: {
                ...ethereumNodeConnectionInfo,
                contracts: {},
                abi: {
                  functions: {},
                  events: {},
                },
              },
              augurNode: augurNodeWS,
            })
          },
          augur: {
            contracts: { addresses: { 4: { Universe: '0xb0b' } } },
            rpc: {
              getNetworkID: () => 4,
              eth: { accounts: cb => cb(null, []) },
            },
            api: { Controller: { stopped: () => {} } },
          },
        })

        store.dispatch(connectAugur({}, mockEnv, false, (err, connInfo) => {
          assert.isUndefined(err, 'callback passed to connectAguur had a first argument when expecting undefined.')
          assert.isUndefined(connInfo, 'callback passed to connectAguur had a second argument when expecting undefined.')
          done()
        }))
        const expected = [
          { type: 'UPDATE_ENV' },
          { type: 'UPDATE_CONNECTION_STATUS' },
          { type: 'UPDATE_CONTRACT_ADDRESSES' },
          { type: 'UPDATE_FUNCTIONS_API' },
          { type: 'UPDATE_EVENTS_API' },
          { type: 'UPDATE_AUGUR_NODE_CONNECTION_STATUS' },
          { type: 'REGISTER_TRANSACTION_RELAY' },
          { type: 'LOAD_UNIVERSE' },
        ]

        assert.deepEqual(store.getActions(), expected, `Didn't fire the expected actions`)
      },
    })
    test({
      description: 'Should handle a undefined augurNode from AugurJS.connect',
      assertions: (done) => {
        ReWireModule.__Rewire__('AugurJS', {
          connect: (env, cb) => {
            cb(null, {
              ethereumNode: {
                ...ethereumNodeConnectionInfo,
                contracts: {},
                abi: {
                  functions: {},
                  events: {},
                },
              },
              augurNode: undefined,
            })
          },
          augur: {
            contracts: {
              addresses: {
                4: { Universe: '0xb0b' },
                3: { Universe: '0xc41231e2' },
              },
            },
            rpc: {
              getNetworkID: () => 4,
              eth: { accounts: cb => cb(null, []) },
            },
          },
        })

        store.dispatch(connectAugur({}, mockEnv, false, (err, connInfo) => {
          assert.isNull(err, 'callback passed to connectAugur had a first argument when expecting null.')
          assert.deepEqual(connInfo, {
            ethereumNode: {
              ...ethereumNodeConnectionInfo,
              contracts: {},
              abi: {
                functions: {},
                events: {},
              },
            },
            augurNode: undefined,
          }, `Didn't return the expected connection info object on error.`)
          done()
        }))

        const expected = []

        assert.deepEqual(store.getActions(), expected, `Didn't fire the expected actions`)
      },
    })
    test({
      description: 'Should handle a undefined ethereumNode from AugurJS.connect',
      assertions: (done) => {
        ReWireModule.__Rewire__('AugurJS', {
          connect: (env, cb) => {
            cb(null, {
              ethereumNode: undefined,
              augurNode: augurNodeWS,
            })
          },
          augur: {
            contracts: {
              addresses: {
                4: { Universe: '0xb0b' },
                3: { Universe: '0xc41231e2' },
              },
            },
            rpc: {
              getNetworkID: () => 4,
              eth: { accounts: cb => cb(null, []) },
            },
          },
        })

        store.dispatch(connectAugur({}, mockEnv, false, (err, connInfo) => {
          assert.isNull(err, 'callback passed to connectAugur had a first argument when expecting null.')
          assert.deepEqual(connInfo, {
            ethereumNode: undefined,
            augurNode: augurNodeWS,
          }, `Didn't return the expected connection info object on error.`)
          done()
        }))

        const expected = []

        assert.deepEqual(store.getActions(), expected, `Didn't fire the expected actions`)
      },
    })
    test({
      description: 'Should handle a error object back from AugurJS.connect',
      assertions: (done) => {
        ReWireModule.__Rewire__('AugurJS', {
          connect: (env, cb) => {
            cb({ error: 2000, message: 'There was a mistake.' }, {
              ethereumNode: undefined,
              augurNode: undefined,
            })
          },
          augur: {
            contracts: {
              addresses: {
                4: { Universe: '0xb0b' },
                3: { Universe: '0xc41231e2' },
              },
            },
            rpc: {
              getNetworkID: () => 4,
              eth: { accounts: cb => cb(null, []) },
            },
          },
        })

        store.dispatch(connectAugur({}, mockEnv, false, (err, connInfo) => {
          assert.deepEqual(err, { error: 2000, message: 'There was a mistake.' }, `callback passed to connectAugur didn't recieve the expected error object.`)
          assert.deepEqual(connInfo, {
            ethereumNode: undefined,
            augurNode: undefined,
          }, `Didn't return the expected connection info object on error.`)
          done()
        }))

        const expected = []

        assert.deepEqual(store.getActions(), expected, `Didn't fire the expected actions`)
      },
    })
  })
})
