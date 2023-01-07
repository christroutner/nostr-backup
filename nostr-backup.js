/*
  This script connects to a public relay and downloads event data associated
  with a list of public keys. It then republishes those events to a local
  nostr relay.
*/

// Public npm libraries
// import { relayInit } from 'nostr-tools'
const { RelayPool } = require('nostr')

// Local libraries

// BEGIN CONSTANTS

// Relays
const wellOrder = 'wss://nostr-pub.wellorder.net'
const onsats = 'wss://nostr.onsats.org'
const relays = [wellOrder, onsats]

// pubkeys - must be in bech32 format
// const trout = '39f70015a75d9b3edaff4164f84eba7abde8e57ee64b4e50d9e404979d4e378a'
const yunginter = '5fd693e61a7969ecf5c11dbf5ce20aedac1cea71721755b037955994bf6061bb'
// const pubkeys = [trout]
const pubkeys = [yunginter]

// Local relay
// const localRelay = 'ws://localhost:8008'

// Config
const EVENTS_PER_RELAY = 2
// END CONSTANTS

async function start () {
  try {
    const pool = RelayPool(relays)

    pool.on('open', relay => {
      // See this section for available filters:
      // https://github.com/nostr-protocol/nips/blob/master/01.md#communication-between-clients-and-relays
      relay.subscribe('subid', { limit: EVENTS_PER_RELAY, kinds: [1, 4], authors: pubkeys })
    })

    pool.on('eose', relay => {
      relay.close()
    })

    pool.on('event', (relay, subId, ev) => {
      console.log('event: ', ev)
    })
  } catch (err) {
    console.error(err)
  }
}
start()

// async function connectToLocalRelay() {
//   const localRelay =
// }
