const express = require('express');
const app = express();
const port = 3000;

// Servir archivos estáticos desde el directorio actual
app.use(express.static('./'));

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
}); 