const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const sequelize = require('./config/database');

// Importar modelos
const Usuario = require('./models/Usuario');
const Producto = require('./models/Producto');
const Pedido = require('./models/Pedido');
const Local = require('./models/Local');
const Traduccion_producto = require('./models/Traduccion_producto');


// Foreign Keys
Local.hasMany(Usuario, { as: 'usuarios', foreignKey: 'local_id' });
Usuario.belongsTo(Local, { as: 'local', foreignKey: 'local_id' });

Local.hasMany(Producto, { as: 'productos', foreignKey: 'local_id' });
Producto.belongsTo(Local, { as: 'local', foreignKey: 'local_id' });

Producto.hasMany(Traduccion_producto, { as: 'Traduccion_productos', foreignKey: 'producto_id' });
Traduccion_producto.belongsTo(Producto, { as: 'producto', foreignKey: 'producto_id' });

Usuario.hasMany(Pedido, { as: 'pedidos', foreignKey: 'usuario_id' });
Pedido.belongsTo(Usuario, { as: 'usuario', foreignKey: 'usuario_id' });

Producto.hasMany(Pedido, { as: 'pedidos', foreignKey: 'producto_id' });
Pedido.belongsTo(Producto, { as: 'producto', foreignKey: 'producto_id' });

Local.hasMany(Pedido, { as: 'pedidos', foreignKey: 'local_id' });
Pedido.belongsTo(Local, { as: 'local', foreignKey: 'local_id' });

Pedido.belongsTo(Usuario, { as: 'staff', foreignKey: 'staff_id' });

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const { verificarToken } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const localesRoutes = require('./routes/locales');
const productosRoutes = require('./routes/productos');
const ordersRoutes = require('./routes/orders');
const staffRoutes = require('./routes/staff');
const saldoRoutes = require('./routes/saldo');
const usuarioRoutes = require('./routes/usuario');

app.use('/api/auth', authRoutes);

app.use('/api/locales', verificarToken, localesRoutes);

app.use('/api/productos', verificarToken, productosRoutes);

app.use('/api/orders', verificarToken, ordersRoutes);

app.use('/api/staff', verificarToken, staffRoutes);

app.use('/api/saldo', verificarToken, saldoRoutes);

app.use('/api/usuario', verificarToken, usuarioRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'EcoNight Pass API' });
});

sequelize.sync().then(() => {
  console.log('Database synchronized');
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
