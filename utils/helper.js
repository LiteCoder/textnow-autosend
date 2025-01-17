/**
 * Log into TextNow and get cookies
 * @param {object} page Puppeteer browser page
 * @param {object} client Puppeteer CDPSession
 * @param {string} username Optional account credential
 * @param {string} password Optional account credential
 * @return {object} Updated login cookies
 */
module.exports.logIn = async (page, client, username, password) => {
  await Promise.all([
    page.goto("https://www.textnow.com/login"),
    page.waitForNavigation({ waitUtil: "networkidle2" }),
  ]);

  if (username && password) {
    await page.type("#txt-username", username);
    await page.type("#txt-password", password);

    const logInButton = await page.waitForSelector("#btn-login");
    await Promise.all([logInButton.click(), page.waitForNavigation()]);

    const cookies = (await client.send("Network.getAllCookies")).cookies;

    return cookies;
  }

  const isLoggedIn = page.url().includes("/messaging");
  if (!isLoggedIn) {
    throw new Error("Deteacted invalid or expires cookies");
  }

  const cookies = (await client.send("Network.getAllCookies")).cookies;

  return cookies;
};

/**
 * Select a conversation using recipient info
 * @param {object} page Puppeteer browser page
 * @param {string} recipient Recipient info
 */
module.exports.selectConversation = async (page, recipient) => {
  await Promise.all([
    page.goto("https://www.textnow.com/messaging"),
    page.waitForNavigation({ waitUtil: "networkidle2" }),
  ]);

  await page.waitForTimeout(5000);

  await page.$eval("#newText", (element) => element.click());
  await page.waitForTimeout(500);

  const recipientField = await page.waitForSelector(
    ".newConversationTextField"
  );
  await page.waitForTimeout(500);
  await recipientField.type(recipient);
  await page.waitForTimeout(500);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(3000);
};

/**
 * Send a message to the current recipient
 * @param {object} page Puppeteer browser page
 * @param {string } message Message content
 */
module.exports.sendMessage = async (page, message) => {
  const messageField = await page.waitForSelector("#text-input");
  await page.waitForTimeout(500);
  await messageField.type(message);
  await page.waitForTimeout(500);
  //按下Shift+Enter换行
  await page.keyboard.down('Shift');
  await page.keyboard.press('Enter');
  await page.keyboard.up('Shift');
  await page.waitForTimeout(200);
  //输入当前时间
  await messageField.type(new Date().toLocaleString());
  await page.waitForTimeout(200);
  //按下Enter发送消息
  await page.keyboard.press("Enter");
  await page.waitForTimeout(5000);
};
