const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');

// Importar modelos
const Usuario = require('./models/Usuario');
const Producto = require('./models/Producto');
const Pedido = require('./models/Pedido');
const Local = require('./models/Local');
const Traduccion_producto = require('./models/Traduccion_producto');


// Foreign Keys
Local.hasMany(Usuario, { foreignKey: 'local_id' });
Usuario.belongsTo(Local, { foreignKey: 'local_id' });

Local.hasMany(Producto, { foreignKey: 'local_id' });
Producto.belongsTo(Local, { foreignKey: 'local_id' });

Producto.hasMany(Traduccion_producto, { foreignKey: 'producto_id' });
Traduccion_producto.belongsTo(Producto, { foreignKey: 'producto_id' });

Usuario.hasMany(Pedido, { foreignKey: 'usuario_id' });
Pedido.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Producto.hasMany(Pedido, { foreignKey: 'producto_id' });
Pedido.belongsTo(Producto, { foreignKey: 'producto_id' });

Local.hasMany(Pedido, { foreignKey: 'local_id' });
Pedido.belongsTo(Local, { foreignKey: 'local_id' });

Pedido.belongsTo(Usuario, { as: 'staff', foreignKey: 'staff_id' });

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

const { verificarToken } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const localesRoutes = require('./routes/locales');
const productosRoutes = require('./routes/productos');
const ordersRoutes = require('./routes/orders');

app.use('/api/auth', authRoutes);

app.use('/api/locales', verificarToken, localesRoutes);

app.use('/api/productos', verificarToken, productosRoutes);

app.use('/api/orders', verificarToken, ordersRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'EcoNight Pass API' });
});

sequelize.sync().then(() => {
  console.log('Database synchronized');
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
