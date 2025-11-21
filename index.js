require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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
    const db = client.db("changemakersdb");
    // Create Collection
    const userCollection = db.collection("users");
    const eventCollection = db.collection("events");
    const joinedEventCollection = db.collection("joinedEvents");

    // Create API's
    app.post("/user", async (req, res) => {
      const data = req.body;
      try {
        const result = await userCollection.insertOne(data);
        res.send({
          success: true,
          insertedId: result.insertedId,
        });
      } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, error: err.message });
      }
    });

    // Create post API Event
    app.post("/event", async (req, res) => {
      const data = req.body;
      try {
        const result = await eventCollection.insertOne(data);
        res.send({ success: true, insertedId: result.insertedId });
      } catch (err) {
        console.error("Insert error:", err);
        res
          .status(500)
          .send({ success: false, message: "Server error: " + err.message });
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

    // Get API for Single Upcoming
    app.get("/event/:id", async (req, res) => {
      try {
        const id = req.params.id;

        const event = await eventCollection.findOne({
          _id: new ObjectId(id),
        });

        const creator = await userCollection.findOne({ userId: event.userId });

        if (!event) {
          return res.status(404).send({
            success: false,
            message: "Event not found",
          });
        }

        res.send({
          success: true,
          message: "Event fetched successfully",
          data: { ...event, creator },
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to fetch event",
          error: error.message,
        });
      }
    });

    // Get all events for a specific user
    app.get("/manage-event/:userId", async (req, res) => {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).send({
          success: false,
          message: "User ID is required",
        });
      }

      try {
        const events = await eventCollection
          .find({ userId })
          .sort({ eventDate: 1 })
          .toArray();

        res.send({
          success: true,
          message: "Events fetched successfully",
          data: events,
        });
      } catch (error) {
        console.error(error);
        res.status(500).send({
          success: false,
          message: "Failed to fetch events",
          error: error.message,
        });
      }
    });

    // Update API for Event
    app.put("/manage-event/:id", async (req, res) => {
      const { id } = req.params;

      if (!id) {
        return res.status(400).send({
          success: false,
          message: "Event ID is required",
        });
      }

      const updateData = req.body;

      try {
        const result = await eventCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.modifiedCount === 0) {
          return res.status(404).send({
            success: false,
            message: "No event found or no changes made",
          });
        }

        res.send({
          success: true,
          message: "Event updated successfully",
        });
      } catch (error) {
        console.error(error);
        res.status(500).send({
          success: false,
          message: "Failed to update event",
          error: error.message,
        });
      }
    });

    // Delete API for Event
    app.delete("/manage-event/:id", async (req, res) => {
      const { id } = req.params;

      if (!id) {
        return res.status(400).send({
          success: false,
          message: "Event ID is required",
        });
      }

      try {
        const result = await eventCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({
            success: false,
            message: "No event found with this ID",
          });
        }

        res.send({
          success: true,
          message: "Event deleted successfully",
        });
      } catch (error) {
        console.error("Delete error:", error);
        res.status(500).send({
          success: false,
          message: "Failed to delete event",
          error: error.message,
        });
      }
    });

    // Join Event API
    app.post("/join-event/:eventId", async (req, res) => {
      const { eventId } = req.params;
      const { userId } = req.body;

      if (!eventId || !userId) {
        return res.status(400).send({
          success: false,
          message: "eventId and userId are required",
        });
      }

      try {
        const result = await joinedEventCollection.updateOne(
          { eventId: eventId },
          {
            $addToSet: {
              joinedUsers: {
                userId,
                joinedAt: new Date(),
              },
            },
          },
          { upsert: true }
        );

        res.send({
          success: true,
          message: "User joined successfully",
          result,
        });
      } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, error: err.message });
      }
    });

    // Get joined users for an event
    app.get("/joined-event/:eventId", async (req, res) => {
      const { eventId } = req.params;

      if (!eventId) {
        return res
          .status(400)
          .send({ success: false, message: "eventId is required" });
      }

      try {
        const joinedEvent = await joinedEventCollection.findOne({ eventId });

        res.send({
          success: true,
          data: joinedEvent ? joinedEvent.joinedUsers : [],
        });
      } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, error: err.message });
      }
    });

    // Get all joined events for a user
    app.get("/joined-events/:userId", async (req, res) => {
      const { userId } = req.params;

      if (!userId) {
        return res
          .status(400)
          .send({ success: false, message: "User ID is required" });
      }

      try {
        const joinedDocs = await joinedEventCollection
          .find({ "joinedUsers.userId": userId })
          .toArray();

        const eventIds = joinedDocs.map((doc) => doc.eventId);
        const events = await eventCollection
          .find({ _id: { $in: eventIds.map((id) => new ObjectId(id)) } })
          .toArray();

        res.send({ success: true, data: events });
      } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, error: err.message });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close(); // Don't close connection if server should keep running
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Together, Make Bangladesh Great!");
});

app.listen(port, () => {
  console.log(`ChangeMakers Backend app listening on port ${port}`);
});
