const mysql = require('mysql');
const util = require('util');

let connection;

function connect() {
  connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hotel'
  });

  connection.connect((err) => {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('connected as id ' + connection.threadId);
  });

  // Promisify the query method
  connection.query = util.promisify(connection.query);

  return connection;
}

function destroy() {
  if (connection) {
    connection.destroy();
  }
}

module.exports = {
  connect,
  destroy,
};
