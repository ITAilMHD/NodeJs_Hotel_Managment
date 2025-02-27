const express = require('express');
const bodyParser = require('body-parser');
const ejs=require('ejs');
const path = require('path');
const multer = require('multer');
const connection=require('./DBconnection');
const customerRegister = require('./customerregister');
const loginpage=require('./loginpage');
const addhotel=require('./addhotel');
const addtype=require('./addroomtype');
const addservice=require('./addservices');
const addhotelowner=require('./addhotelowner');
const addrooms=require('./addrooms');
const addroomimage=require('./addroomimage');
const addroomservice=require('./addroomservice');
const confirmres=require('./confirmres');
const updateprofile=require('./updateprofile');
const allres=require('./allres');
const fs = require('fs');
const updateuserprofile=require('./updateuserprofile');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.engine('.ejs',ejs.renderFile);
app.set('view engine','ejs');
app.set('views',__dirname+'/views');
app.use('/images', express.static(path.join(__dirname, 'views/images')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.get('/',(req,res)=>{
    res.render('index.ejs');
    });

    app.get('/register', (req, res) => {
        res.render('register.ejs');
        });
        app.get('/addrooms/:UID',(req,res)=>{
            let UID=req.params.UID;
            const db=connection.connect();
            db.query('select * from roomstype where HUID=?',[UID],(err,result)=>{
                if(err){
                    console.error(err);
                    connection.destroy();
                    return res.status(500).send('Error fetching data');
                }
                let resu=result;
                //connection.destroy();
                db.query('select * from services where HUID=?',[UID],(err1,result1)=>{
                    if(err1){
                        console.error(err1);
                        connection.destroy();
                        return res.status(500).send('Error fetching data');
                    }
                    let res1=result1;
                    connection.destroy();
                
                res.render('addrooms.ejs',{UID, options:resu, services:res1});
            });
            });
            
            
        });
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
              const uploadPath = path.join(__dirname, 'views/images');
              if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath);
              }
              cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
              cb(null, Date.now() + path.extname(file.originalname));
            },
          });
          
          // Initialize multer with storage configuration
          const upload = multer({ storage: storage });
          app.post('/addrooms', upload.array('file', 10), addrooms);
        
        app.get('/allres/:UID',(req,res)=>{
            let UID=req.params.UID;
            res.render('allres.ejs',{UID});
        });
        app.get('/deleteprofile',(req,res)=>{
          let UUIDn=req.query.UID;
          let db=connection.connect();
          db.query('delete from users where ID=?',[UUIDn],(err,result)=>{
            if(err){
              throw err;
            }
            db.query('delete from customers where UID=?',[UUIDn],(err,result)=>{
              if(err){
                throw err;
              }
              connection.destroy();
              res.render('index.ejs');
            })
          })
        });
        app.post('/updateuserprofile',updateuserprofile);
        app.get('/deletehotels',(req,res)=>{
          const db=connection.connect();
          db.query('select * from hoteltable',(err,result)=>{
            if(err){
              throw err;
            }
            connection.destroy();
            res.render('showhotels.ejs',{result});
          });
        });
        
        app.get('/hotelsearch',(req,res)=>{
          const hotelname=req.query.query;
          let db=connection.connect();
          db.query('select * from hoteltable where HotelName=?',[hotelname],(err,result)=>{
            if(err){
              throw err;
            }
            connection.destroy();
            res.render('showhotels.ejs',{result});
          });
        });
        app.get('/deletehotel/:UID',(req,res)=>{
          const HUIDfordelete=req.params.UID;
          const db=connection.connect();
          db.query('delete from users where ID=?',[HUIDfordelete],(err,result)=>{
            if(err){
              throw err;
            }
            db.query('delete from rooms where HID=?',[HUIDfordelete],(err,result)=>{
              if(err){throw err}
              db.query('delete from hoteltable where UID=?',[HUIDfordelete],(err,result)=>{
                connection.destroy();
                if(err){throw err}
                res.redirect('/deletehotels');
              })
            })
          })
        });
        //app.post('/allres',allres);
        app.post('/register', customerRegister);
        app.get('/login', (req, res) => {
        res.render('login.ejs');
        });
        app.post('/login', loginpage);
        app.get('/addhotel',(req,res)=>{
            res.render('addhotel.ejs');
        });
        app.post('/addhotel',addhotel);
        app.get('/addservice/:UID',(req,res)=>{
          let UID=req.params.UID;
            res.render('addservice.ejs',{UID});
        });
        app.get('/adminhome',(req,res)=>{
            res.render('adminhome.ejs');
        });
        app.get('/addroomtype/:UID',(req,res)=>{
          let UID=req.params.UID;
            res.render('addroomtype.ejs',{UID});
        });
        app.get('/ownerhome',(req,res)=>{
            res.render('ownerhome.ejs');
        });
        app.get('/hotel_details/:id/:id1',(req,res)=>{
            const HID=req.params.id;
            const CID=req.params.id1;
            const db=connection.connect();
            db.query('select * from hoteltable where ID=?',[HID],(err,result)=>{
                if(err){
                    throw err;
                }
                const HHID=result[0]['UID'];
                console.log(HHID);
                db.query('select * from rooms where HID=?',[HHID],(err,roomresult)=>{
                    if(err){
                        throw err;
                    }
                    connection.destroy();
                    res.render('hotelDetails.ejs',{hotels: result,rooms: roomresult,CID});
                })
            })
            
        });
        app.get('/search',(req,res)=>{
            const {query,id}=req.query;
            const CID=id;
            const db=connection.connect();
            db.query('select * from hoteltable where HotelName=? or address=?',[query,query],(err,result)=>{
                if(err){
                    throw err;
                }
                db.query('select * from rooms where HID=?',[result[0].ID],(err,roomresult)=>{
                    if(err){
                        throw err;
                    }
                    connection.destroy();
                    res.render('hotelDetails.ejs',{hotels: result,rooms: roomresult,CID});
                })
            })
        });
        app.get('/roomdetails/:RID/:CID',(req,res)=>{
            const RID = req.params.RID;
            const CID = req.params.CID;
            const db=connection.connect();
            db.query('select * from rooms where ID=?',[RID],(err,result1)=>{
                if(err){
                    throw err;
                }
                db.query('select TypeName from roomstype where ID in (select RoomType from rooms where ID=?)',[RID],(err,result2)=>{
                    if(err){
                        throw err
                    }
                    db.query('SELECT ID,ServiceName,ServiceCost FROM `services` where HUID in (select HID from rooms where ID=?)',[RID],(err,result3)=>{
                        if(err){
                            throw err;
                        }
                        db.query('select imagename from roomimgs where roomimgs.RID=?',[RID],(err,result4)=>{
                            if(err){
                                throw err
                            }
                            connection.destroy();
                            res.render('roomdetails.ejs',{rooms:result1, types:result2, services:result3, images:result4, CID});
                        })
                    })
                })
            })
        });
        app.post('/reserve', (req, res) => {
          const RID = req.body.RID;
          const CID = req.body.CID;
          const checkin = req.body.checkin;
          const checkout = req.body.checkout;
          const selectedServices = req.body.roomservice; // This will be an array of selected service IDs
          const db = connection.connect();
      
          db.query('SELECT RoomCost FROM rooms WHERE ID = ?', [RID], (err, result) => {
              if (err) {
                  throw err;
              }
              const roomCost = result[0].RoomCost;
      
              // If no services are selected, handle it accordingly
              if (!selectedServices || selectedServices.length === 0) {
                  const servicecost = 0;
                  const total = parseInt(roomCost) + servicecost;
                  console.log(total);
                  const state = 0;
      
                  db.query('INSERT INTO reservations (state, CID, RID, RCost, TSCost, TotalCost, Checkindate, CheckoutDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                      [state, CID, RID, roomCost, servicecost, total, checkin, checkout], (err, resultf) => {
                          if (err) {
                              throw err;
                          }
                          db.query('UPDATE rooms SET RoomState = "Reserved" WHERE ID = ?', [RID], (err, finalresult) => {
                              if (err) {
                                  throw err;
                              }
                              connection.destroy();
                              res.render('reservations.ejs', { state, CID, RID, roomCost, servicecost, total, checkin, checkout });
                          });
                      });
              } else {
                  // Convert selectedServices to a format suitable for SQL query
                  const serviceIDs = Array.isArray(selectedServices) ? selectedServices : [selectedServices];
                  console.log(serviceIDs);
                  db.query('SELECT SUM(ServiceCost) AS ServiceCost FROM services WHERE ID IN (?)', [serviceIDs], (err, result1) => {
                      if (err) {
                          throw err;
                      }
                      const servicecost = result1[0].ServiceCost;
                      console.log(servicecost);
                      const total = parseInt(roomCost) + parseInt(servicecost);
                      console.log(total);
                      const state = 0;
                      db.query('INSERT INTO reservations (state, CID, RID, RCost, TSCost, TotalCost, Checkindate, CheckoutDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                          [state, CID, RID, roomCost, servicecost, total, checkin, checkout], (err, resultf) => {
                              if (err) {
                                  throw err;
                              }
                              db.query('UPDATE rooms SET RoomState = "Reserved" WHERE ID = ?', [RID], (err, finalresult) => {
                                  if (err) {
                                      throw err;
                                  }
                                  connection.destroy();
                                  res.render('reservations.ejs', { state, CID, RID, roomCost, servicecost, total, checkin, checkout });
                              });
                          });
                  });
              }
          });
      });
        app.get('/profile/:UID',(req,res)=>{
          const UID=req.params.UID;
          const db=connection.connect();
          db.query('select * from Users where ID=?',[UID],(err,result)=>{
            if(err){
              throw err;
            }
            const type=result[0]['type'];
            if(type=='customer'){
              db.query('select * from customers where UID=?',[UID],(err,result1)=>{
                if(err){
                  throw err
                }
                db.destroy();
                console.log(result1);
                res.render('updateprofileuser.ejs',{details:result1,UID:UID, userdetails:result});
              });
            }
            else{
              db.query('select * from hoteltable where UID=?',[UID],(err,result2)=>{
                db.destroy();
                res.render('updateprofilehotel.ejs',{details:result2,UID:UID, userdetails:result});
              });
            }
          });
        });
        app.post('/updateprofile',updateprofile);
        app.get('/confirmres/:UID',(req,res)=>{
            const UID=req.params.UID;
            const db=connection.connect();
            db.query('select reservations.* from reservations,rooms,hoteltable where reservations.RID = rooms.ID and rooms.HID=hoteltable.UID and hoteltable.UID=?',[UID],(err,result)=>{
                if(err){
                    throw err;
                }
                connection.destroy();
                res.render('showallreservationowner.ejs',{result,UID});
            });
        });
        app.get('/searchreservation',(req,res)=>{
          let name=req.query.query;
          let db=connection.connect();
          db.query('select reservations.* from reservations,rooms,hoteltable where reservations.RID = rooms.ID and rooms.HID=hoteltable.UID and reservations.CID=(select ID from customers where firstname=? or lastname=?)',[name,name],(err,result)=>{
            if(err){
                throw err;
            }
            connection.destroy();
            res.render('showallreservationowner.ejs',{result});
        });
        });
        app.get('/conres/:ID',(req,res)=>{
            const ID=req.params.ID;
            const db=connection.connect();
            db.query('update reservations set state=1 where ID=?',[ID],(err,result)=>{
                if(err){
                    throw err;
                }
                connection.destroy();
                res.send(`<!DOCTYPE html>
                <html>
                  <head>
                    <title>Reservations</title>
                    <style>
                      body {
                        font-family: Arial, sans-serif;
                        background-color: #f2f2f2;
                        margin: 0;
                        padding: 0;
                      }
                
                      .container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                      }
                
                      .success-message {
                        background-color: #4CAF50;
                        color: white;
                        padding: 20px;
                        border-radius: 5px;
                        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
                        text-align: center;
                      }
                
                      .success-message h2 {
                        margin-top: 0;
                      }
                
                      .success-message a {
                        color: white;
                        text-decoration: none;
                        font-weight: bold;
                      }
                
                      .success-message a:hover {
                        text-decoration: underline;
                      }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="success-message">
                        <h2>Reservation confirmed Successfully!</h2>
                        <p>Click <a href="/">here</a> to go back to the login page.</p>
                      </div>
                    </div>
                  </body>
                </html>`);
            })
        });
        app.get('/cancelres/:CID/:RID',(req,res)=>{
            const CID = req.params.CID;
            const RID=req.params.RID;
            const db=connection.connect();
            db.query(`update rooms set RoomState='Available' where ID=?`,[RID],(err,result)=>{
              if(err){
                throw err;
              }
              db.query('delete from reservations where state=0 and CID=?',[CID],(err,result)=>{
                if(err){
                    throw err;
                }
                connection.destroy();
                res.send(`<!DOCTYPE html>
                <html>
                  <head>
                    <title>Reservations</title>
                    <style>
                      body {
                        font-family: Arial, sans-serif;
                        background-color: #f2f2f2;
                        margin: 0;
                        padding: 0;
                      }
                
                      .container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                      }
                
                      .success-message {
                        background-color: #4CAF50;
                        color: white;
                        padding: 20px;
                        border-radius: 5px;
                        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
                        text-align: center;
                      }
                
                      .success-message h2 {
                        margin-top: 0;
                      }
                
                      .success-message a {
                        color: white;
                        text-decoration: none;
                        font-weight: bold;
                      }
                
                      .success-message a:hover {
                        text-decoration: underline;
                      }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="success-message">
                        <h2>Reservation Canceled Successfully!</h2>
                        <p>Click <a href="/">here</a> to go back to the reservations page.</p>
                      </div>
                    </div>
                  </body>
                </html>`);
            });
            });
        });
        app.get('/reservations/:CID',(req,res)=>{
            const CID=req.params.CID;
            const db=connection.connect();
            db.query('select * from reservations where CID=?',[CID],(err,result)=>{
                if(err){
                    throw err
                }
                connection.destroy();
                res.render('showallreservations.ejs',{reservation: result});
            })
        });
        app.get('/ownerhome/:UID',(req,res)=>{
          const UID=req.params.UID;
          res.render('ownerhome.ejs',{UID});
        });
        app.post('/addroomtype',addtype);
        app.post('/addservice',addservice);
        app.post('/addhotelowner', upload.single('file'), addhotelowner);

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        });

