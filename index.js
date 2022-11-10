const express = require('express');
const cors = require('cors');

const jwt = require('jsonwebtoken');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middle-wares
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jjkmnej.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db('photography').collection('services');

        const reviewCollection = client.db('photography').collection('reviews');

        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            // console.log(services);
            res.send(services);
        });

        app.get('/allservices', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            // console.log(services);
            res.send(services);
        });

        app.get('/allservices/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            // console.log(service);
            res.send(service);
        });

        app.post('/addService', async (req, res) => {
            // allservices
            const newservice = req.body;
            // console.log(newservice);
            const result = await serviceCollection.insertOne(newservice);
            // console.log(result);
            res.send(result);
        });

        // reviewsss

        app.get("/reviews", async (req, res) => {
            const name = req.query.serviceName;
            const query = { serviceName: name };
            const result = await reviewCollection.find(query).toArray();
            res.send(result);
        });

        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });

        app.get('/myReview', async (req, res) => {
            const email = req.query.email;
            // console.log(email);
            const query = { email }
            const result = await reviewCollection.find(query).toArray();
            res.send(result);

        })

    }

    finally {

    }

}

run().catch(err => console.error(err))


app.get('/', (req, res) => {
    res.send('Pixel-Flash server is running')
})

app.listen(port, () => {
    console.log(`Pixel-Flash server running on ${port}`);
})


