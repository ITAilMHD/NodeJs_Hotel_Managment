const db=require('./DBconnection');
module.exports = (UID, res) => {
  const connection = db.connect();

  connection.query(
    'SELECT * FROM hoteltable WHERE UID = ?',
    [UID],
    (error, result) => {
      if (error) {
        console.error('Error:', error);
        db.destroy();
        return res.status(400).send(error);
      }

      if (result.length > 0) {
        db.destroy();
        res.render('ownerhome.ejs',{UID});
      } else {
        db.destroy();
        res.render('addhotelowner.ejs',{UID});
      }
    }
  );
};