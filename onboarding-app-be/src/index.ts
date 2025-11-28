import express from 'express';
import helloRouter from './routes/hello.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/hello', helloRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
