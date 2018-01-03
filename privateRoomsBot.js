const fs = require('fs');
const timePath = './timer.txt';
const Discord = require('discord.js');
const prefix = ".pri "
const client = new Discord.Client();

const tickLengthVar = 5;
// in seconds

const invited = [];
exports.invitedArray = invited;
var login = fs.readFileSync('login.txt', 'utf8');
console.log('Attempting login with' + login + '....');
client.login(login);

client.on('ready' function () {
  console.log(`Logged in as ${client.user.tag}.`);
});

const storageDelegate = require('./roomStorage.js');

var names = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau'];
console.log(names);
exports.nameArray = names;

var time = parseInt(fs.readFileSync(timePath, 'utf8'));
console.log('Time at startup is ' + time);
// setup


function count() {
  time += 1;
  fs.writeFileSync(timePath, time);
  console.log('Writing time: ' + time);

  storageDelegate.deleteChannels(time, client);

}

// Adjust Interval
setInterval(count, 1000*tickLengthVar);
// Clock

function identifier() {
  var seq = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
  return seq;
}

function randomName() {
  var name = names[Math.floor(Math.random()*names.length)];
  //names.splice(names.indexOf(name), 1);
  return name + '.' + identifier();
}

function formatTime(timeCode) {
  var currentTimeInSeconds = time*tickLengthVar;

  var returnTime = new Date(timeCode/tickLengthVar).toISOString().substr(11, 8);

  console.log('Up for ' + currentTimeInSeconds + ' seconds.')
  console.log(returnTime)
  return returnTime;

}


function setupRoom(name, channel, message, guildMember, upTime) {
  var guildChannel = message.guild.channels.find("id", channel.id);

  var deleteTick = time + upTime;

  guildMember.setVoiceChannel(channel);
  storageDelegate.newNotifyChannel(name, message.author.id, channel.id, message.guild.id, deleteTick);

  message.channel.send(name + ' created. Will stay up for ' + formatTime(deleteTick * tickLengthVar));

  guildChannel.overwritePermissions(message.guild.roles.find('name', '@everyone'), (
    {
      'CONNECT': false,
    }
  ));


}


client.on('message', message => {

  if(message.content.substring(0, prefix.length) != prefix) {
    return;
  }

  var command = message.content.split(" ")[1];
  var properArgs = message.content.substring(prefix.length + command.length + 1);
  var args = message.content.substring(prefix.length + command.length + 1).toLowerCase();
  console.log(command);
  console.log(args);




  if(command == "room") {
    if(names.length == 0) {
      console.log('Out of names.');
      message.reply("Sorry, I'm out of rooms at the moment.");
      return;
    }

    var roomUpTime = parseInt(args)/tickLengthVar;

    if(args == '') {
      roomUpTime = 45/tickLengthVar;
    }

    var guildMember = message.guild.member(message.author);

    if(guildMember.voiceChannel == null) {
      message.reply('You need to be in a voice channel for me to move you.')
      return;
    }

    var name = randomName();
    message.guild.createChannel(name, 'voice')
    .then(channel =>
      setupRoom(name, channel, message, guildMember, roomUpTime)
      // created room Zeta
      // should move user
    )
    .catch(console.error);
  }


  if(command == "invite") {
    console.log('This is who:');
    if(message.mentions.users.first() == undefined) {
      return;
    }

    storageDelegate.invite(client, message, time);
  }

  if(command == "join") {
    var roomName = args;

    console.log(invited);
    console.log('Looking::')
    invited.forEach( function (invite, index) {
      console.log(invite);
      if(invite.user == message.author.id && invite.room == roomName) {
        console.log('Valid Invite.');

        var guildMember = message.guild.member(message.author);;
        var channel = message.guild.channels.find('id', invite.channel);
        if(channel == null) {
          message.channel.send('That channel has expired.');
          return;

        }

        if(guildMember.voiceChannel == null) {
          message.channel.send('Please move to a voice channel, so I can move you.');
          return;
        } else {
          guildMember.setVoiceChannel(channel);
        }

      }
    });

  }

})
