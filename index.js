const express = require('express');
const cors = require('cors');

require('dotenv').config();

const jwt = require('jsonwebtoken');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


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

// function verifyJWT(req, res, next) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         res.status(401).send({ message: "unauthorize access" });
//     }
//     const token = authHeader.split(" ")[1];
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE, function (err, decoded) {
//         if (err) {
//             res.status(401).send({ message: "unauthorize access" });
//         }
//         req.decoded = decoded;
//         next();
//     });
// }

async function run() {
    try {
        const serviceCollection = client.db('photography').collection('services');

        const reviewCollection = client.db('photography').collection('reviews');

        // app.post("/jwt", (req, res) => {
        //     const user = req.body;
        //     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRETE, {
        //         expiresIn: "1d",
        //     });
        //     res.send({ token });
        // });


        // home three services get api
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query).sort({ _id: -1 });
            const services = await cursor.limit(3).toArray();
            // console.log(services);
            res.send(services);
        });

        // allservices get api
        app.get('/allservices', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            // console.log(services);
            res.send(services);
        });

        // allservices or single service by id 
        app.get('/allservices/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            // console.log(service);
            res.send(service);
        });

        // add service 
        app.post('/addService', async (req, res) => {
            // allservices
            const newservice = req.body;
            // console.log(newservice);
            const result = await serviceCollection.insertOne(newservice);
            // console.log(result);
            res.send(result);
        });

        // reviewsss

        //Review get Api - details page
        app.get("/reviews", async (req, res) => {
            const name = req.query.serviceName;
            const query = { serviceName: name };
            const result = await reviewCollection.find(query).sort({ _id: -1 }).toArray();
            res.send(result);

        });

        // add review post - details page
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        });

        // my review get - my review page
        app.get('/myReview', async (req, res) => {
            const email = req.query.email;
            // console.log(email);
            const query = { email }
            const result = await reviewCollection.find(query).sort({ _id: -1 }).toArray();
            res.send(result);

        });

        // my review get - single review for update - update form (my review) page
        app.get("/myReview/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const review = await reviewCollection.findOne(query);
            res.send(review);
        });

        //delete method
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })

        //update method
        app.put('/myReview/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const review = req.body;
            const option = { upsert: true };
            const updateReview = {
                $set: {
                    message: review.message,
                    rating: review.rating

                }
            }
            const result = await reviewCollection.updateOne(filter, updateReview, option);
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


