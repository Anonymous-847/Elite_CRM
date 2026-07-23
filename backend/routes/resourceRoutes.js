const express = require('express');

/**
 * Builds a small REST router around a Mongoose model.
 *
 * Routes:
 *   GET    /            -> list all documents (plain objects, no _id/__v/timestamps)
 *   PUT    /             -> REPLACE the whole collection with the array sent in the body.
 *                          This mirrors the frontend's old localStorage.setItem(key, wholeArray)
 *                          behaviour, so the existing app logic (which always works with the
 *                          full in-memory array and re-saves it after every change) keeps working
 *                          with almost no changes on the frontend.
 *   POST   /             -> insert ONE new document
 *   PUT    /:id          -> update ONE document (matched by the frontend-generated "id" field)
 *   DELETE /:id          -> delete ONE document
 *   DELETE /             -> delete ALL documents in the collection
 */
function buildResourceRouter(Model) {
  const router = express.Router();

  const clean = (doc) => {
    const obj = doc.toObject ? doc.toObject() : doc;
    delete obj._id;
    delete obj.__v;
    delete obj.createdAt;
    delete obj.updatedAt;
    return obj;
  };

  // GET all
  router.get('/', async (req, res) => {
    try {
      const docs = await Model.find({}).sort({ createdAt: 1 }).lean();
      const cleaned = docs.map((d) => {
        const { _id, __v, createdAt, updatedAt, ...rest } = d;
        return rest;
      });
      res.json(cleaned);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch collection', detail: err.message });
    }
  });

  // REPLACE whole collection
  router.put('/', async (req, res) => {
    try {
      const items = Array.isArray(req.body) ? req.body : [];
      await Model.deleteMany({});
      if (items.length > 0) {
        await Model.insertMany(items, { ordered: false });
      }
      res.json({ ok: true, count: items.length });
    } catch (err) {
      res.status(500).json({ error: 'Failed to save collection', detail: err.message });
    }
  });

  // INSERT one
  router.post('/', async (req, res) => {
    try {
      const doc = await Model.create(req.body);
      res.status(201).json(clean(doc));
    } catch (err) {
      res.status(500).json({ error: 'Failed to create document', detail: err.message });
    }
  });

  // UPDATE one (by frontend id)
  router.put('/:id', async (req, res) => {
    try {
      const doc = await Model.findOneAndUpdate({ id: req.params.id }, req.body, {
        new: true,
        upsert: true,
      });
      res.json(clean(doc));
    } catch (err) {
      res.status(500).json({ error: 'Failed to update document', detail: err.message });
    }
  });

  // DELETE one (by frontend id)
  router.delete('/:id', async (req, res) => {
    try {
      await Model.deleteOne({ id: req.params.id });
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete document', detail: err.message });
    }
  });

  // DELETE all
  router.delete('/', async (req, res) => {
    try {
      await Model.deleteMany({});
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to clear collection', detail: err.message });
    }
  });

  return router;
}

module.exports = buildResourceRouter;
