

const USER1_JWT = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MTU2NDQ0ODQsImp0aSI6Ijg3ODAyZmMwLTg0MDUtMTFlYi1iNzcyLWQ3M2FkNDAyZTBlNyIsImV4cCI6MTYxNTczMDg4MywiYWNsIjp7InBhdGhzIjp7Ii8qL3VzZXJzLyoqIjp7fSwiLyovY29udmVyc2F0aW9ucy8qKiI6e30sIi8qL3Nlc3Npb25zLyoqIjp7fSwiLyovZGV2aWNlcy8qKiI6e30sIi8qL2ltYWdlLyoqIjp7fSwiLyovbWVkaWEvKioiOnt9LCIvKi9hcHBsaWNhdGlvbnMvKioiOnt9LCIvKi9wdXNoLyoqIjp7fSwiLyova25vY2tpbmcvKioiOnt9LCIvKi9sZWdzLyoqIjp7fX19LCJhcHBsaWNhdGlvbl9pZCI6ImM4OGFjYWI3LTU3NjItNDYyYy1iZTJlLTdjMjc5ZTY2YjBjOCIsInN1YiI6IlVTRVIxX05BTUUifQ.OcpmMlkl3ka66BAxx3l5Z9el-vi2pQXO6mfj6rYJsn6CIUO_KfSNmFGjWgAnNtCEVuNTKeEbvGad84j85wKKupKKlxKgjh0RSZE9TBNDlm7545C9VSlqXq6szEcrq8MGvvW-f1gjbLbU6p12MhTwIiQDqrM_qOu33N9hafNAbjmKoSBw89gEbDAAPJbdTZ7naS9OSMBlmUwgo4JzpwtCGxIQonW3MQZoicaBnZBcs1Oxo7orWArfkYp6FUQOt4gB4jcuzXjvOYZhg4aH9Oxeub63R35OFfdhuowXMaxy5eCNCdzF07vAQOWttECExKhyX6fnlgAJM5gdKE9-OaKSdg';
const USER2_JWT = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MTU2NDQ1MjgsImp0aSI6ImExNmYyMjEwLTg0MDUtMTFlYi1iMTVlLWQ5OTMxNmRhZWQ5OSIsImV4cCI6MTYxNTczMDkyNywiYWNsIjp7InBhdGhzIjp7Ii8qL3VzZXJzLyoqIjp7fSwiLyovY29udmVyc2F0aW9ucy8qKiI6e30sIi8qL3Nlc3Npb25zLyoqIjp7fSwiLyovZGV2aWNlcy8qKiI6e30sIi8qL2ltYWdlLyoqIjp7fSwiLyovbWVkaWEvKioiOnt9LCIvKi9hcHBsaWNhdGlvbnMvKioiOnt9LCIvKi9wdXNoLyoqIjp7fSwiLyova25vY2tpbmcvKioiOnt9LCIvKi9sZWdzLyoqIjp7fX19LCJhcHBsaWNhdGlvbl9pZCI6ImM4OGFjYWI3LTU3NjItNDYyYy1iZTJlLTdjMjc5ZTY2YjBjOCIsInN1YiI6IlVTRVIyX05BTUUifQ.br3uei1eGZPybAy8euA8O2s6CDsB37CA1917bNkMT3rXLVsPo2kpiC1yM25TwfhshgF5jA6Zhp8S25EBRdXVIkpP3UeNt6sMGGGRGi5YmNpQBYECMqNfbdWHyhgAEu9bH-v2nJjWGqWghsFCDadgW6p6KKH9BLQoowJ1jrRgyIvraPigSyVc_ebOaA4rGfubgYPkJjkbkXKTwa9vba8Kc054xfrRcs0jKp8sv3bhJ9G3l2VEiNwBLxNRUupIDSLwjLbpTfa6hYvzmty18o0OqywQeByoxOpsbcLQHxnCTYIEuy0Y5jbkcx6sk7z5fBlXhkqpb777HlN1wJVpuH2bLw';
const CONVERSATION_ID = 'CON-643b75ce-90a5-4922-ae64-11a878eef088';

const nexmoClient = new NexmoClient(config);
const messageTextarea = document.getElementById('messageTextarea');
const messageFeed = document.getElementById('messageFeed');
const sendButton = document.getElementById('send');
const loginForm = document.getElementById('login');
const status = document.getElementById('status');

const loadMessagesButton = document.getElementById('loadMessages');
const messagesCountSpan = document.getElementById('messagesCount');
const messageDateSpan = document.getElementById('messageDate');

let conversation;
let listedEvents;
let messagesCount = 0;
let messageDate;

function authenticate(username) {
  if (username == "USER1_NAME") {
    return USER1_JWT;
  }
  if (username == "USER2_NAME") {
    return USER2_JWT;
  }
  alert("User not recognized");
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const userToken = authenticate(document.getElementById('username').value);
  if (userToken) {
    document.getElementById('messages').style.display = 'block';
    document.getElementById('login').style.display = 'none';
    run(userToken);
  }
});
loadMessagesButton.addEventListener('click', async (event)=>{
  // Get next page of events
  let nextEvents = await listedEvents.getNext();
  listMessages(nextEvents);

});

async function run(userToken){
  var client = nexmoClient({ debug: true });
  let app = await client.login(userToken);
  conversation = await app.getConversation(CONVERSATION_ID);

  // Update the UI to show which user we are
document.getElementById('sessionName').innerHTML = conversation.me.user.name + "'s messages"

// Load events that happened before the page loaded
  let initialEvents = await conversation.getEvents({ event_type: "text", page_size: 10, order:"desc" });
  listMessages(initialEvents);

  // Any time there's a new text event, add it as a message
  conversation.on('text', (sender, event) => {
    const formattedMessage = formatMessage(sender, event, conversation.me);
    messageFeed.innerHTML = messageFeed.innerHTML +  formattedMessage;
    messagesCountSpan.textContent = `${messagesCount}`;
  });
// Listen for clicks on the submit button and send the existing text value
sendButton.addEventListener('click', async () => {
  await conversation.sendText(messageTextarea.value);
  messageTextarea.value = '';
});
messageTextarea.addEventListener('keypress', (event) => {
  conversation.startTyping();
});

var timeout = null;
messageTextarea.addEventListener('keyup', (event) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    conversation.stopTyping();
  }, 500);
});
conversation.on("text:typing:on", (data) => {
  if (data.user.id !== data.conversation.me.user.id) {
    status.innerHTML = data.user.name + " is typing...";
  }
});

conversation.on("text:typing:off", (data) => {
  status.innerHTML = "";
});

}

function listMessages(events) {
  let messages = '';

  // If there is a next page, display the Load Previous Messages button
  if (events.hasNext()){
    loadMessagesButton.style.display = "block";
  } else {
    loadMessagesButton.style.display = "none";
  }

  // Replace current with new page of events
  listedEvents = events;

  events.items.forEach(event => {
    const formattedMessage = formatMessage(conversation.members.get(event.from), event, conversation.me);
    messages = formattedMessage + messages;
  });

  // Update UI
  messageFeed.innerHTML = messages + messageFeed.innerHTML;
  messagesCountSpan.textContent = `${messagesCount}`;
  messageDateSpan.textContent = messageDate;
}
function formatMessage(sender, message, me) {
  const rawDate = new Date(Date.parse(message.timestamp));
  const formattedDate = moment(rawDate).calendar();
  let text = '';
  messagesCount++;
  messageDate = formattedDate;

  if (message.from !== me.id) {
    text = `<span style="color:red">${sender.user.name} (${formattedDate}): <b>${message.body.text}</b></span>`;
  } else {
    text = `me (${formattedDate}): <b>${message.body.text}</b>`;
  }

  return text + '<br />';

}
