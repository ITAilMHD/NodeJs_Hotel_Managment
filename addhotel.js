const db=require('./DBconnection');
const crypto = require('crypto');

module.exports = async (req, res) => {
  const { username, password1 } = req.body;
  const password = password1;
  const type = "owner";
  const connection=db.connect();
  connection.query('select * from users where uname=?',[username],(err,result)=>{
if(err){
  throw err;
}
if(result){
  db.destroy();
  res.render('addingerror.ejs');
}
  });

  if (!password) {
    console.error('Password is undefined');
    return res.status(400).send('Password is required');
  }

  try {
    const connection = db.connect();
    const hash = crypto.createHash('sha256');
    hash.update(password);
    const hashedPassword = hash.digest('hex');

    connection.query(
      'insert into users (uname, password, type) values (?,?,?)',
      [username, hashedPassword, type],
      (userError, userResult) => {
        if (userError) {
          console.error('error: ' + userError);
          db.destroy();
          return res.status(400).send('error: ' + userError);
        }
        if (userResult) {
          const addtype = "Hotel Manager";
          db.destroy();
          res.render('addsuccess.ejs', { addtype });
        }
      }
    );
  } catch (err) {
    console.error('error: ' + err);
    return res.status(400).send('error: ' + err);
  }
};