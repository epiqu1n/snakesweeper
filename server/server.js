import express from 'express';
import apiRouter from './routes/api.js';
import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const _config = JSON.parse(await fs.readFile('./config.json'));

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(path.resolve(__dirname, '../client')));

app.use('/api', apiRouter);

app.get('/', function(req, res) {
  res.status(200).sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(_config.port, () => {
  console.log(`Listening on port ${_config.port}`);
});