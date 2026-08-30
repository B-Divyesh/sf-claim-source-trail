# Claim Source Trail demo

- **URL:** `/?demo=1#workspace`
- **Sample:** two complete humanities research trails: a supporting source on public memorials and a counterevidence source on archival silence.
- **Storage:** demo trails and settings use the `demo:claim-source-trail:` localStorage namespace. They never read or write the real `claim-source-trail:` workspace namespace.
- **Reset:** use **Reset demo** in the persistent banner to discard edits and reseed the two samples.
- **Start for real:** use **Start for real** in the banner. It discards the demo namespace, returns to `/`, and leaves the real workspace untouched.
- **Offline:** after its first online visit, the service worker caches the demo shell and shipped sample generator. Reloading the demo while offline still renders both samples and exports.
