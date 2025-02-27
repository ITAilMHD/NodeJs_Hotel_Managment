const db=require('./DBconnection');
const crypto = require('crypto');
const checkOwner = require('./checkowner');

module.exports = async (req, res) => {
  const { username, password } = req.body;
  if (!password) {
    console.error('Password is undefined');
    return res.status(400).send('Password is required');
  }

  try {
    if (username === "admin" && password === "admin") {
      res.render('adminhome.ejs');
    } else {
      const connection = db.connect();

      const hash = crypto.createHash('sha256');
      hash.update(password);
      const hashedPassword = hash.digest('hex');

      connection.query(
        'SELECT * FROM users WHERE uname = ? AND password = ?',
        [username, hashedPassword],
        (usererror, userResult) => {
          if (usererror) {
            console.error('Error:', usererror);
            db.destroy();
            return res.status(400).send(usererror);
          }

          if (userResult.length > 0) {
            const type = userResult[0].type;
            const UID = userResult[0].ID;

            if (type === "customer") {
              const hotelquery= 'select * from hoteltable';
              connection.query(hotelquery,(err,result)=>{
                if(err) {throw err}
                connection.query('select * from customers where UID=?',UID,(err,cusres)=>{
                  if(err){
                    throw err;
                  }
                  db.destroy();
                  res.render('customerhome.ejs',{customer: cusres,hotels: result});
                })
              })
            } else if (type === "owner") {
              db.destroy();
              checkOwner(UID, res);
              
            } else {
              db.destroy();
              res.render('loginerror.ejs');
            }
          } else {
            db.destroy();
            res.render('loginerror.ejs');
          }
        }
      );
    }
  } catch (err) {
    console.error('Error:', err);
    return res.status(400).send(err);
  }
};