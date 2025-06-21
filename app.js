const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  const version = process.env.APP_VERSION || "1.0.0";
  res.send(`Hello from our container! Version: ${version}. Deployed automatically!`);
});

app.listen(PORT, () => {
  console.log(`Server running on <http://localhost>:${PORT}`);
});
