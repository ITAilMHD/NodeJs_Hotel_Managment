db=require('./DBconnection');
module.exports = async (req, res) => {
  const { servicename, servicecost,UID } = req.body;
  try {
    const connection = db.connect();
    connection.query(
      'insert into services (ServiceName,ServiceCost,HUID) values (?,?,?)',
      [servicename, servicecost,UID],
      (userError, userResult) => {
        if (userError) {
          console.error('error: ' + userError);
          db.destroy();
          return res.status(400).send('error: ' + userError);
        }
        if (userResult) {
          const addtype = 'Room Service';
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