require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());



const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.qeddfku.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const productsCollection = client.db('amazonDB').collection('products');


        app.get('/products', async (req, res) => {
            console.log(req.query);

            const page = parseInt(req.query.page) || 0;
            const limit = parseInt(req.query.limit) || 10; // Default limit is 10, you can change it as needed

            // Calculate the skip value based on the page and limit
            const skip = page * limit;

            const result = await productsCollection.find().skip(skip).limit(limit).toArray();
            res.send(result);
        });

        app.get('/totalProducts', async (req, res) => {
            const result = await productsCollection.estimatedDocumentCount();
            res.send({ totalProducts: result });
        })

        app.post('/productsById', async (req, res) => {
            const ids = req.body;
            const objectIds = ids.map(id => new ObjectId(id));

            const query = { _id: { $in: objectIds } };

            const result = await productsCollection.find(query).toArray();
            res.send(result);
            // console.log(objectIds);/

        })





        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('amazon server running');
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});