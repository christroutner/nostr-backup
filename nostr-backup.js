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
const cameri = '00000000827ffaa94bfea288c3dfce4422c794fbb96625b6b31e9049f729d700'
const brockm = 'b9003833fabff271d0782e030be61b7ec38ce7d45a1b9a869fbdb34b9e2d2000'
const unclebob = '2ef93f01cd2493e04235a6b87b10d3c4a74e2a7eb7c3caf168268f6af73314b5'
const hutch = 'f677f7b3574d3c1265074a653771e38e54f58fc4f9e53da19c41b8315f11b4f7'
const zquest = '1038d6f710c72efffcd858ac667b446ffa29e19209d12c54b7ae372e0538983a'
const komi = '81d38469313088cce52b8a860711c21e7408860286bb3834a4d74fab717cde2e'
const stoyan = '8a49fdde8bd75871b1f1b082aceec40dc3dc82941a57d3611f7bf1b0ae6ad82a'
const jack = '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2'
// const pubkeys = [trout]
const pubkeys = [trout, yunginter, cameri, brockm, unclebob, hutch, zquest, komi, stoyan, jack]

// Local relay
const localRelayAddr = 'ws://localhost:8008'

// Config
const EVENTS_PER_RELAY = 2000
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
