
const crypto = require('crypto');

module.exports = async (req, res) => {
  const { UID,username,password,firstname,lastname,phone,address,email } = req.body;

  if (!password) {
    console.error('Password is undefined');
    return res.status(400).send('Password is required');
  }

  try {
    const connection = db.connect();

    // Hash the password using SHA-256
    const hash = crypto.createHash('sha256');
    hash.update(password);
    const hashedPassword = hash.digest('hex');

    // Insert into users table
    connection.query(
      'UPDATE users set uname=?, password=? where ID=?',
      [username, hashedPassword, UID],
      (userError, userResult) => {
        if (userError) {
          console.error('Transaction Error:', userError);
          db.destroy();
          return res.status(500).send('An error occurred while processing your request.');
        }

        //const UID = userResult.insertId;

        // Insert into customers table
        connection.query(
          'UPDATE hoteltable set HotelName=?, RoomNum=?, address=?, phone=?, stars=? where UID=?',
          [firstname,lastname,address,phone,email,UID],
          (customerError) => {
            if (customerError) {
              console.error('Transaction Error:', customerError);
              db.destroy();
              return res.status(500).send('An error occurred while processing your request.');
            }

            db.destroy();
            res.render('finishregistration.ejs');
          }
        );
      }
    );
  } catch (error) {
    console.error('Unexpected Error:', error);
    res.status(500).send('An unexpected error occurred.');
  }
};