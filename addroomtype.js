db=require('./DBconnection');
module.exports = async (req, res) => {
  const { tname,UID } = req.body;

  try {
    const connection = db.connect();
    connection.query(
      'insert into roomstype (TypeName,HUID) values (?,?)',
      [tname,UID],
      (userError, userResult) => {
        if (userError) {
          console.error('error: ' + userError);
          db.destroy();
          return res.status(400).send('error: ' + userError);
        }
        if (userResult) {
          const addtype = 'Room Type';
          db.destroy();
          res.render('addsuccessowner.ejs', { addtype });
        }
      }
    );
  } catch (err) {
    console.error('error: ' + err);
    return res.status(400).send('error: ' + err);
  }
};