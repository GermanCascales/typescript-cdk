import express from 'express';
import path from 'path';
import axios from 'axios';

// Environment variables that need to get passed in
const port = process.env.SERVER_PORT;
const apiBase = process.env.API_BASE;

const app = express();
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
  const documents = await getDocuments()
  res.render('index', {
    documents: documents
  });
});

app.listen(port, () => {
  console.log(`Document Management Web Server Started.  Port: port`);
});

// Call our deployed API
const getDocuments = async () => {
  const { data: results } = await axios.get(`${apiBase}/documents`)
  return results
}
