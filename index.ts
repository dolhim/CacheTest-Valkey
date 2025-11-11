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

const COUNTER_KEY = 'counter';
const LIMIT = 100;

app.post('/reset', async (req: Request, res: Response) => {
  try {
    await valkey.set(COUNTER_KEY, '0');
    res.status(200).send('Counter reset to 0');
  } catch (error) {
    res.status(500).send('Error resetting counter');
  }
});

app.post('/increment-safe', async (req: Request, res: Response) => {
  let retries = 20; // Increase retries for very high contention
  const requestId = Math.random().toString(36).substring(7);

  while (retries > 0) {
    const client = valkey.duplicate(); // Use connection duplication instead of creating a new instance
    try {
      await client.watch(COUNTER_KEY);
      const currentValueStr = await client.get(COUNTER_KEY);
      const currentValue = parseInt(currentValueStr || '0', 10);

      if (currentValue < LIMIT) {
        const result = await client.multi()
          .set(COUNTER_KEY, (currentValue + 1).toString())
          .exec();

        if (result) {
          return res.status(200).send({ counter: currentValue + 1 });
        }
      } else {
        await client.unwatch();
        return res.status(400).send({ message: 'Limit reached', counter: currentValue });
      }
    } catch (error) {
      // Errors are expected during high contention, so we don't need to log them unless debugging
      // console.error(`[${requestId}] Transaction error:`, error);
    } finally {
      client.quit();
    }
    retries--;
    // Increase backoff time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
  }
  return res.status(500).send('Could not increment counter due to high contention');
});
