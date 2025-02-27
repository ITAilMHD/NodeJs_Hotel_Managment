const db = require('./DBconnection');
const path = require('path');
const fs = require('fs');

module.exports = async (req, res) => {
  const { rstate, rcost, dropdown, rawSelectedIds, UID } = req.body;
  console.log('Request body:', req.body);
  const files = req.files;
  console.log('Files:', files);

  if (!rstate || !rcost || !dropdown) {
    return res.status(400).send('Room state, cost, and type are required');
  }

  // Ensure rawSelectedIds is an array
  let selectedIds;
  try {
    if (Array.isArray(rawSelectedIds)) {
      selectedIds = rawSelectedIds;
    } else {
      throw new Error('selectedIds is not an array');
    }
  } catch (err) {
    console.error('Error processing selectedIds:', err);
    selectedIds = [];
  }
  console.log('Selected IDs:', selectedIds);

  if (!Array.isArray(files)) {
    return res.status(400).send('Files must be an array');
  }

  let connection;

  try {
    connection = await db.connect(); // Ensure connection is awaited
    console.log('Database connected successfully');
    await connection.beginTransaction(); // Start a transaction
    console.log('Transaction started');

    // Insert into rooms table
    const roomResult = await connection.query(
      'INSERT INTO rooms (HID, RoomType, RoomState, RoomCost) VALUES (?, ?, ?, ?)',
      [UID, dropdown, rstate, rcost]
    );
    console.log('Room insert result:', roomResult);

    const roomId = roomResult.insertId;

    // Insert into roomservice table
    const servicePromises = selectedIds.map(async (serviceId) => {
      console.log('Inserting service:', serviceId);
      const result = await connection.query(
        'INSERT INTO roomservice (ServiceID, RoomID) VALUES (?, ?)',
        [serviceId, roomId]
      );
      console.log('Room service insert result:', result);
      return result;
    });

    // Insert into RoomImgs table and save files
    const imagePromises = files.map(async (file) => {
      const fileName = file.filename;
      console.log('Inserting image:', fileName);
      const result = await connection.query(
        'INSERT INTO roomimgs (RID, imagename) VALUES (?, ?)',
        [roomId, fileName]
      );
      console.log('Room image insert result:', result);
      return result;
    });

    console.log('Service promises:', servicePromises);
    console.log('Image promises:', imagePromises);

    await Promise.all([...servicePromises, ...imagePromises]);

    await connection.commit();
    console.log('Transaction committed');
    connection.destroy(); // Close the connection
    res.render('addroomsucss.ejs', { addtype: 'Room', UID });
  } catch (err) {
    console.error('Error in try-catch block:', err);

    if (connection) {
      await connection.rollback();
      connection.destroy(); // Close the connection
    }

    return res.status(400).send('Error: ' + err);
  }
};
