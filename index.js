const puppeteer = require('puppeteer');

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

const creds = {
  username: 'xxxxxxxxxx',
  password: 'xxxxxxxxxx',
};

async function main() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 720 });

  await page.goto('https://id.churchofjesuschrist.org/', {
    waitUntil: 'networkidle0',
  });

  await page.type('#okta-signin-username', creds.username);
  await Promise.all([page.click('#okta-signin-submit'), delay(2000)]);

  await page.type('input:nth-child(1)', creds.password);
  await Promise.all([
    page.click('.button-primary'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);

  await page.goto('https://www.churchofjesuschrist.org/notes', {
    waitUntil: 'networkidle0',
  });

  await page.evaluate(async () => {
    const url =
      'https://www.churchofjesuschrist.org/notes/api/v3/annotations?numberToReturn=500&setId=all&start=1&type=highlight,journal,reference';
    const response = await fetch(url, {
      credentials: 'include',
    });
    const content = (await response.json()).map((i) => i.annotationId);
    console.log(content);
    let exitCondition = false;
    let iterator = 0;
    do {
      const response = await fetch(
        `https://www.churchofjesuschrist.org/notes/api/v3/annotations/${content[iterator]}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      );
      console.log(`Deleted ${content[iterator]}`);
      iterator++;
      if (iterator > content.length - 1) {
        exitCondition = true;
      }
    } while (!exitCondition);
  });

  // const cookies = await page.cookies();

  // console.log(JSON.stringify(cookies));

  // const url =
  //   'https://www.churchofjesuschrist.org/notes/api/v3/annotations?numberToReturn=500&setId=all&start=1&type=highlight,journal,reference';

  // const response = await fetch(url, {
  //   headers: {
  //     cookie: JSON.stringify(cookies),
  //   },
  // });
  // console.log(response);

  //////////

  // do {
  //   await page.waitForSelector('.button-1P1nj:nth-child(3)');
  //   await page.click('.button-1P1nj:nth-child(3)');

  //   await page.waitForSelector('.hbCbtC');
  //   await page.click('.hbCbtC');

  //   await delay(1000);
  //   await page.click('.item-36ei2');

  //   const listCount = (await page.$$('.item-36ei2')).length;
  //   console.log(listCount);
  //   if (listCount < 10) {
  //     await page.click('.button-1P1nj');
  //     await delay(5000);
  //   }
  // } while (true);
}

main();
