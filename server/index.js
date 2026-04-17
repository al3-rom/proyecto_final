const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'EcoNight Pass API funcionando' });
});

app.listen(PORT, () => {
  console.log(`Server corriendo en http://localhost:${PORT}`);
});
