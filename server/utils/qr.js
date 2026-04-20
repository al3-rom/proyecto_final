const crypto = require('crypto');

const generarQr = (pedidoId) => {
    const hash = crypto.randomBytes(4).toString('hex');
    return `${pedidoId}-${hash}`;
};

module.exports = { generarQr };
