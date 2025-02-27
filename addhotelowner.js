const db = require('./DBconnection');

module.exports = async (req, res) => {
    const { name, cc, address, phone, stars, UID } = req.body;
    const file = req.file; // Access the uploaded file

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    const imageUrl = `images/${file.filename}`;

    try {
        const connection = db.connect();
        connection.query('INSERT INTO hoteltable (UID, HotelName, RoomNum, address, phone, stars, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [UID, name, cc, address, phone, stars, imageUrl],
            (err, result) => {
                if (err) {
                    console.error('error: ' + err);
                    db.destroy();
                    return res.status(400).send('error: ' + err);
                }
                if (result) {
                    const addtype = 'Hotel Information';
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
