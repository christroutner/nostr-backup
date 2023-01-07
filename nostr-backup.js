/*
  This script connects to a public relay and downloads event data associated
  with a list of public keys. It then republishes those events to a local
  nostr relay.
*/

// Public npm libraries
const WebSocket = require('ws');
const { relayInit } = require('nostr-tools')
const { RelayPool } = require('nostr')

// Local libraries

// BEGIN CONSTANTS

// Relays
const wellOrder = 'wss://nostr-pub.wellorder.net'
const onsats = 'wss://nostr.onsats.org'
const relays = [wellOrder, onsats]

// pubkeys - must be in bech32 format
const trout = '39f70015a75d9b3edaff4164f84eba7abde8e57ee64b4e50d9e404979d4e378a'
const yunginter = '5fd693e61a7969ecf5c11dbf5ce20aedac1cea71721755b037955994bf6061bb'
// const pubkeys = [trout]
const pubkeys = [trout, yunginter]

// Local relay
const localRelayAddr = 'ws://localhost:8008'

// Config
const EVENTS_PER_RELAY = 20
// END CONSTANTS

async function start () {
  try {
    const localRelay = await connectToLocalRelay()

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
      // console.log('event: ', ev)

      const pub = localRelay.publish(ev)

      // pub.on('ok', (data) => {
      //   console.log(`local relay has accepted our event`)
      // })
      // pub.on('seen', () => {
      //   console.log(`we saw the event already?`)
      // })
      pub.on('failed', reason => {
        console.log(`failed to publish to local relay: ${reason}`)
      })

      console.log(`event ${ev.id} processed.`)
    })


  } catch (err) {
    console.error(err)
  }
}
start()

async function connectToLocalRelay() {
  const localRelay = relayInit(localRelayAddr, WebSocket)
  await localRelay.connect()

  localRelay.on('connect', () => {
    console.log(`connected to ${localRelay.url}`)
  })

  localRelay.on('error', () => {
    console.log(`failed to connect to ${localRelay.url}`)
  })

  return localRelay
}
