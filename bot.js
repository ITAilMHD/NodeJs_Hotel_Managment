const TelegramBot = require('node-telegram-bot-api');
const connection=require('./DBconnection');
const token='6905616794:AAGI0-IKIBYexqGf6hDXpZIG4E7-5IDLxDE';
const bot = new TelegramBot(token, { polling: true });

const db=connection.connect();

const getHotelData=async ()=>{
    try{
        const result=await db.query('select * from hoteltable');
        return result;
    }
    catch(err){console.log(err);}
};

const getHotelroomstype=async ()=>{
    try{
        const result=await db.query('select HotelName, TypeName from hoteltable,roomstype where hoteltable.UID=roomstype.HUID');
        return result;
    }
    catch(err){console.log(err);}
};

const getHotelservices=async ()=>{
    try{
        const result=await db.query('select HotelName, ServiceName,ServiceCost from hoteltable,services where hoteltable.UID=services.HUID');
        return result;
    }
    catch(err){console.log(err);}
};

bot.onText(/\/hotels/,async(msg)=>{
    const chatId = msg.chat.id;
    try{
        const hotels = await getHotelData();
    if (hotels.length > 0) {
      let response = 'Here are the available hotels:\n\n';
      hotels.forEach(hotel => {
        response += `Name: ${hotel.HotelName}\nLocation: ${hotel.address}\nPhone: ${hotel.phone}\nStars: ${hotel.stars}\n\n`;
      });
      bot.sendMessage(chatId, response);
    } else {
      bot.sendMessage(chatId, 'No hotels found.');
    }
    }
    catch (error) {
        console.error('Error fetching hotel data:', error);
        bot.sendMessage(chatId, 'Sorry, there was an error fetching the hotel data.');
      }
});

bot.onText(/\/roomstype/,async(msg)=>{
    const chatId = msg.chat.id;
    try{
        const hotels = await getHotelroomstype();
    if (hotels.length > 0) {
      let response = 'Here are the rooms type in each hotel hotels:\n\n';
      hotels.forEach(hotel => {
        response += `Name: ${hotel.HotelName}\nTypeName: ${hotel.TypeName}\n\n`;
      });
      bot.sendMessage(chatId, response);
    } else {
      bot.sendMessage(chatId, 'No hotels found.');
    }
    }
    catch (error) {
        console.error('Error fetching hotel data:', error);
        bot.sendMessage(chatId, 'Sorry, there was an error fetching the hotel data.');
      }
});

bot.onText(/\/roomreservations/,async(msg)=>{
const chatId=msg.chat.id;
try{
let response='In order to reserve a new room, you must visit our website';
bot.sendMessage(chatId,response);
}
catch(err){
  console.log(err);
}
});

bot.onText(/\/services/,async(msg)=>{
    const chatId = msg.chat.id;
    try{
        const hotels = await getHotelservices();
    if (hotels.length > 0) {
      let response = 'Here are the available Service in each hotels:\n\n';
      hotels.forEach(hotel => {
        response += `Name: ${hotel.HotelName}\nService Name: ${hotel.ServiceName}\nService Cost: ${hotel.ServiceCost}\n\n`;
      });
      bot.sendMessage(chatId, response);
    } else {
      bot.sendMessage(chatId, 'No hotels found.');
    }
    }
    catch (error) {
        console.error('Error fetching hotel data:', error);
        bot.sendMessage(chatId, 'Sorry, there was an error fetching the hotel data.');
      }
});