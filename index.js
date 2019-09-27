const http = require('http');
const SlackBot = require('slackbots');
const axios = require('axios')
const dotenv = require('dotenv')
const uuidv4 = require('uuid/v4');

dotenv.config()

const port = process.env.PORT || 3000;

// Create a simple server
const server = http.createServer(function (req, res) {
  res.writeHead(200, {
    "Content-type": "text/plain"
  });
  res.end(`Pontus reporting...... The decepticons are live at port: ${port}. The revolution will be televised`);
});

server.listen(port, function () {
  console.log(`Pontus reporting...... The decepticons are live at port: ${port}. The revolution will be televised`)
});



// Initialize conversations to empty
let conversations = [];

const bot = new SlackBot({
  token: `${process.env.BOT_TOKEN}`,
  name: 'saveconvo',
});

// Need a function to determine the current channel


bot.on('start', () => {
  const params = {
    icon_emoji: ':robot_face:',
  };

  bot.postMessageToChannel('general', 'Here to save your convo', params);
});




// Error Handler
bot.on('error', (err) => console.log(err))

// Message Handler
bot.on('message', (data) => {
  if (data.type !== 'message') {
    return
  }

  handleMessage(data)
})


// Reaponse to data
const handleMessage = async (data) => {
  let message = data.text;


  if (message.includes(' save my convo')) {
    let id = data.user;
    let userConvo = message.replace(' save my convo', '')
    const users = await bot.users;
    const user = users.find(user => {
      return user.id == id
    })

    const useremail = user.profile.email

    console.log(getUser(useremail));

    if (getUser(useremail) != "") {
      let newMessage = {
        id: uuidv4(),
        token: `${process.env.SERVER_TOKEN}`,
        message: userConvo,
        email: useremail
      }

      conversations.push(newMessage)
      sendConvo(newMessage)
      messageSaved()
    } else {
      notSaved()
    }
  } else if (message.includes(' help')) {
    runHelp()
  }
  return console.log(conversations)
}

// Get channel
const getChannel = () => {

}

// Push messages to server
const sendConvo = (data) => {
  let url = 'https://www.gjengineer.com/pontus/pontusdrive.com/api/slackbot.php'
  let axiosConfig = {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      "Access-Control-Allow-Origin": "*",
    }
  };

  axios.post(`${url}`, data, axiosConfig)
    .then((res) => {
      console.log("RESPONSE RECEIVED: ", res);
    })
    .catch((err) => {
      console.log("AXIOS ERROR: ", err);
    })
}

// Get User from drive
const getUser = (email) => {
  let url = 'https://www.gjengineer.com/pontus/pontusdrive.com/api/slackbot.php'
  const user = axios({
    url: `${url}?email=${email}&token=${process.env.SERVER_TOKEN}`,
    method: 'get'
  }).then(res => {
    res.email
  })
  return user
}

// Show Help
const runHelp = () => {
  const params = {
    icon_emoji: ':question:'
  }

  bot.postMessageToChannel(
    'general',
    `Type *@saveconvo* with *save my convo* then paste the contents you want to save and *help* to get this instruction again`,
    params
  );
}

// Prompt on save
const messageSaved = () => {
  const params = {
    icon_emoji: ':smile:'
  }

  bot.postMessageToChannel(
    'general',
    `Your message has been saved successfully`,
    params
  );
}

const notSaved = () => {
  const params = {
    icon_emoji: ':smile:'
  }

  bot.postMessageToChannel(
    'general',
    `Your message was not saved. Please sign up with us!`,
    params
  );
}