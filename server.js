require('dotenv').config()
const express = require('express')
const path = require('path')
const cors = require('cors')
const { MongoClient } = require('mongodb')
const app = express()
app.use(cors())
app.use(express.json())
app.use('dist', express.static(path.join(__dirname, '/')));

const fullPath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, 'dist', 'estrutura-dados', 'index.html')
  : path.join(__dirname, 'dist', 'index.html')

app.get('/', (req, res) => {
  console.log(path.join(__dirname, 'src', 'index.html'))
  res.sendFile(path.join(__dirname, 'src', 'index.html'))
});

app.get('/fila', async (req, res) => {
  const uri = process.env.URI
  const client = new MongoClient(uri);
  try {
    async function run() {
      try {
        await client.connect();
        const database = client.db("luizaCode");
        const fila = database.collection("compradores");
        const query = { status: 1 };
        const options = {
          sort: { position: 1 },
          projection: { _id: 1, name: 1, status: 1, position: 1 },
        };
        let results = await fila.find(query, options)
        results = await results.toArray()
        return res.status(200).json({ compradores: results })
      } catch(err) {
        console.log('catch', err)
        await client.close();
      }
    }
    run().catch(console.dir);

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
})

app.post('/fila', async (req, res) => {
  const { body } = req
  const uri = process.env.URI
  const client = new MongoClient(uri);
  let result = null

  try {
    async function run() {
      try {
        await client.connect();
        const database = client.db("luizaCode");
        const compradores = database.collection("compradores");

        result = await compradores.insertOne({ name: body.name, position: body.position, status: 1 })
        return res.status(201).json({ created: true, result })
      } catch(err) {
        console.log('catch', err)
        await client.close();
      }
    }
    run().catch(console.dir);

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
})

app.put('/fila', async (req, res) => {
  const { body } = req
  const uri = process.env.URI
  const client = new MongoClient(uri);
  let result = null

  try {
    async function run() {
      try {
        await client.connect();
        const database = client.db("luizaCode");
        const compradores = database.collection("compradores");
        const query = { status: 1, position: body.position }
        const updateDocument = {
          $set: {
            status: 0,
          },
        }

        result = await compradores.updateOne(query, updateDocument)
        return res.status(200).json({ result })
      } catch(err) {
        console.log('catch', err)
        await client.close();
      }
    }
    run().catch(console.dir);

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
})


app.listen(process.env.PORT || 3000, () => console.log('Server created at localhost:3000'))
