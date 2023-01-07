# nostr-backup

This is an experiement is building a backup script for Nostr. Here is the idea behind this repo:

- I have a local nostr relay running on my computer.
- The code in this repository acts as a nostr client. It's provided with a list of relays and pubkeys.
- The client connects to the relays and retrieves events about pubkeys in the list. It then republishes those events to the local nostr relay.
- I can then connect a client (like astral.ninja) to my local relay, and have a very fast experience.

