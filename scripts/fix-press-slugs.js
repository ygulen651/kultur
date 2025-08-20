const mongoose = require("mongoose");
const slugify = require("slugify");
const Press = require("../src/models/Press").default;
const { connectDB } = require("../src/lib/db");

async function run() {
  await connectDB();

  const items = await Press.find({ $or: [{ slug: null }, { slug: "" }, { slug: { $exists: false } }] });

  for (const doc of items) {
    let base = slugify(doc.title || `press-${doc._id}`, { lower: true, strict: true });
    if (!base) base = `press-${doc._id}`;
    let candidate = base;
    let i = 2;
    while (await Press.exists({ slug: candidate, _id: { $ne: doc._id } })) {
      candidate = `${base}-${i++}`;
    }
    doc.slug = candidate;
    await doc.save();
    console.log(`Fixed slug for ${doc._id}: ${doc.slug}`);
  }

  // index'i güvenceye al
  try { await Press.collection.dropIndex("slug_1"); } catch(e) {}
  await Press.collection.createIndex(
    { slug: 1 },
    { unique: true, partialFilterExpression: { slug: { $type: "string", $ne: "" } } }
  );

  await mongoose.connection.close();
  console.log("Done.");
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
