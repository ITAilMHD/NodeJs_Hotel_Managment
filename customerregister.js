
const crypto = require('crypto');

module.exports = async (req, res) => {
  const { name, lname, cc, username, email, birthdate, address, phone, password1 } = req.body;
  const password = password1;
  const type = "customer";
  const connection = db.connect();
  connection.query('select * from users where uname=?',[username],(err,result)=>{
    if(err){
      throw err;
    }
    if(result){
      db.destroy();
      res.render('addingerrorcustomer.ejs');
    }
    else{
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
          'INSERT INTO users (uname, password, type) VALUES (?, ?, ?)',
          [username, hashedPassword, type],
          (userError, userResult) => {
            if (userError) {
              console.error('Transaction Error:', userError);
              db.destroy();
              return res.status(500).send('An error occurred while processing your request.');
            }
    
            const UID = userResult.insertId;
    
            // Insert into customers table
            connection.query(
              'INSERT INTO customers (UID, firstName, lastName, birthdate, CreditCard, phone, address, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [UID, name, lname, birthdate, cc, phone, address, email],
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
    }
      });

  
};