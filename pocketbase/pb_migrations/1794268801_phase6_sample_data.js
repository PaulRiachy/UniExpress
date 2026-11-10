// Versioned synthetic fixtures; keep these v1 JSON files immutable after release.
migrate((app) => {
  for (const file of ['catalog', 'campus', 'pricing']) {
    const data = require('./seed/' + file + '.json');
    for (const collectionName of Object.keys(data)) {
      const collection = app.findCollectionByNameOrId(collectionName);
      for (const row of data[collectionName]) {
        // Never silently replace an existing record, even one with a seed ID.
        let exists = false;
        try { app.findRecordById(collectionName, row.id); exists = true; } catch {}
        if (exists) throw new Error('Seed ID conflict in ' + collectionName + ': ' + row.id);
        const record = new Record(collection);
        record.load(row);
        app.save(record);
      }
    }
  }
}, () => {
  throw new Error('Sample data rollback is disabled to preserve local records. Restore a reviewed backup.');
});

