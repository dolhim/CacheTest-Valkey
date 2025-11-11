import express, { Request, Response } from 'express';
import Valkey from 'iovalkey';

const app = express();
const port = 3000;

// Connect to Valkey
const valkey = new Valkey({
  host: '127.0.0.1',
  port: 6379,
});

valkey.on('connect', () => {
  console.log('Connected to Valkey!');
});

valkey.on('error', (err: any) => {
  console.error('Valkey connection error:', err);
});

app.use(express.json());

// API to set a value in Valkey
app.post('/set', async (req: Request, res: Response) => {
  const { key, value } = req.body;

  if (!key || !value) {
    return res.status(400).send('Key and value are required');
  }

  try {
    await valkey.set(key, value);
    res.status(200).send(`Set ${key} to ${value}`);
  } catch (error) {
    res.status(500).send('Error setting value in Valkey');
  }
});

// API to get a value from Valkey
app.get('/get/:key', async (req: Request, res: Response) => {
  const { key } = req.params;

  try {
    const value = await valkey.get(key);
    if (value === null) {
      return res.status(404).send('Key not found');
    }
    res.status(200).send({ key, value });
  } catch (error) {
    res.status(500).send('Error getting value from Valkey');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
