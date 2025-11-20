require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.vcmcsxr.mongodb.net/?retryWrites=true&w=majority`;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    // Create Database
    const db = client.db('changemakersdb');
    // Create Collection
    const userCollection = db.collection("users");
    const eventCollection = db.collection("events");

    // Create API's
    app.post('/user', async (req, res) => {
      const data = req.body;
      try {
        const result = await userCollection.insertOne(data); 
        res.send({
          success: true,
          insertedId: result.insertedId
        });
      } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, error: err.message });
      }
    });

    // Create post API Event
    app.post('/event', async (req, res) => {
      const data = req.body;
      try {
        const result = await eventCollection.insertOne(data);
        res.send({ success: true, insertedId: result.insertedId });
      } catch (err) {
        console.error("Insert error:", err);
        res.status(500).send({ success: false, message: "Server error: " + err.message });
      }
    });

    // Get API for Upcoming Events
    app.get("/event", async (req, res) => {
      try {
        const events = await eventCollection
          .find()
          .sort({ eventDate: 1 }) 
          .toArray();              

        res.send({
          success: true,
          message: "Upcoming events fetched successfully",
          data: events,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to fetch events",
          error: error.message,
        });
      }
    });

    // Get API for Single Upcoming Event
    app.get("/event/:id", async (req, res) => {
      try {
        const id = req.params.id;

        const event = await eventCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!event) {
          return res.status(404).send({
            success: false,
            message: "Event not found",
          });
        }

        res.send({
          success: true,
          message: "Event fetched successfully",
          data: event,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to fetch event",
          error: error.message,
        });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close(); // Don't close connection if server should keep running
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send("Together, Make Bangladesh Great!");
});

app.listen(port, () => {
  console.log(`ChangeMakers Backend app listening on port ${port}`);
});