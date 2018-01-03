const fs = require('fs');
const Discord = require('discord.js');
const main = require('./privateRoomsBot.js');


exports.newNotifyChannel = function (name, owner, channelID, guildID, time) {
  fs.appendFileSync('./privateRooms/' + name, owner + '|' + time + '|' + channelID + '|' + guildID);
};



exports.deleteChannels = function(time, client) {

  fs.readdir('./privateRooms', function ( err, files) {
    if(err) {
      console.log("Sorry, I couldn't get the directory. ", err );
      process.exit( 1 );
    }

    files.forEach( function (file, index) {
      if(file != '.DS_Store') {

        console.log("\nNow Reading File: '" + file + "' ::'");
        var data = fs.readFileSync('./privateRooms/' + file, 'utf8').split('|');
        if(time > parseInt(data[1])) {
          console.log(data);
          var theGuild = client.guilds.find('id', data[3]);
          var guildChannel = theGuild.channels.find('id', data[2]);
          guildChannel.delete();

          //main.nameArray.push(file);

          fs.unlink('./privateRooms/' + file, function(err) {
            if(err) {
              console.log('Error unlinking file. Please check ' + file + '.', err);
            }
          });
        }


      }
    })
  })
}


exports.invite = function(client, message) {
  fs.readdir('./privateRooms', function ( err, files) {
    if(err) {
      console.log("Sorry, I couldn't get the directory. ", err );
      process.exit( 1 );
    }

    var found = false;
    files.forEach( function (file, index) {
      if(file != '.DS_Store') {
        console.log("\nDo you own this file? : '" + file + "' ::'");
        var data = fs.readFileSync('./privateRooms/' + file, 'utf8').split('|');

        if(data[0] == message.author.id) {
          console.log('Yes.')

          var toRemove = [];

          main.invitedArray.forEach( function (invite, index) {
            if(invite.user == message.mentions.users.first().id) {
              console.log("Replacing old invite...");
              toRemove.push(invite);
            }
          });

          toRemove.forEach( function (invite, index) {
            main.invitedArray.splice(main.invitedArray.indexOf(invite, 1) );
          });

          console.log(main.invitedArray);

          main.invitedArray.push({room: file.toLowerCase(), user: message.mentions.users.first().id, channel: data[2]});
          message.channel.send(message.mentions.users.first() + ' has been invited to ' + file + ' by ' + message.author + '.');
          console.log(main.invitedArray);


          found = true;
          return;

        } else {
          console.log(data[0] + ' != ' + ownerID);
        }
      }
    })

    if(found == false) {
      message.reply("You haven't opened any rooms.")
    }

  })


}
