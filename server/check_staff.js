const sequelize = require('./config/database');
const Usuario = require('./models/Usuario');

async function checkStaff() {
    try {
        const staff = await Usuario.findAll({
            where: { rol: 'staff' },
            attributes: ['id', 'nombre', 'email', 'local_id']
        });
        console.log('--- STAFF MEMBERS ---');
        console.table(staff.map(s => s.toJSON()));

        const admins = await Usuario.findAll({
            where: { rol: 'admin' },
            attributes: ['id', 'nombre', 'email', 'local_id']
        });
        console.log('--- ADMINS ---');
        console.table(admins.map(a => a.toJSON()));
        
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkStaff();
