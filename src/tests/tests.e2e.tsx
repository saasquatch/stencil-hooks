import { newE2EPage } from '@stencil/core/testing';

describe('test-component', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<test-component></test-component>');
    const element = await page.find('test-component');
    expect(element).toHaveClass('hydrated');
  });

  it('renders correctly', async () => {
    const page = await newE2EPage();

    await page.setContent('<test-component></test-component>');
    const component = await page.find('test-component > div');
    expect(component.innerHTML).toEqualHtml(`10`);
  });

  it('runs effects on load and unload', async () => {
    const page = await newE2EPage();

    // page
    //   .on('console', message => console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
    //   .on('pageerror', ({ message }) => console.log(message))
    //   .on('response', response => console.log(`${response.status()} ${response.url()}`))
    //   .on('requestfailed', request => console.log(`${request.failure().errorText} ${request.url()}`));

    await page.setContent('<main><test-component></test-component></main>');
    const component = await page.find('test-component > div');
    expect(component.innerHTML).toEqualHtml(`10`);
    const running = await page.evaluate(() => window['running']);
    expect(running).toBe(true);
    await page.evaluate(() => {
      let dom = document.querySelector('main');
      dom.innerHTML = 'empty';
    });
    await page.waitForChanges();
    const runningAfter = await page.evaluate(() => window['running']);
    expect(runningAfter).toBe(false);
  });
});

describe('stencil-context', () => {
  it('passes context down the dom', async () => {
    const page = await newE2EPage();
    const expectProvided = async val => expect(await page.evaluate(() => window['provided'])).toBe(val);
    const expectContextWindow = async val => expect(await page.evaluate(() => window['running2'])).toBe(val);
    const expectTestChild = async val => expect((await page.find('test-child')).innerHTML).toEqualHtml(`<div>${val}</div>`);

    // page
    //   .on('console', message => console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
    //   .on('pageerror', ({ message }) => console.log(message))
    //   .on('response', response => console.log(`${response.status()} ${response.url()}`))
    //   .on('requestfailed', request => console.log(`${request.failure().errorText} ${request.url()}`));

    await page.setContent('<main><test-component><test-child></test-child></test-component></main>');

    /*
     *    Listener should be listening right away
     */
    await expectProvided(10);
    await expectContextWindow(10);

    /*
     *   Context should be available immediately
     */
    await expectTestChild(10);

    /*
     *   Increment should increment children
     */
    const incr = await page.find('test-component button');
    await incr.click();
    await page.waitForChanges();

    await expectProvided(12);
    // await expectContextWindow(12);
    await expectTestChild(12);
    /*
     *  Cleanup should leave nothing in the dom
     */
    await page.evaluate(() => {
      let dom = document.querySelector('main');
      dom.innerHTML = 'empty';
    });
    await page.waitForChanges();
    const runningAfter = await page.evaluate(() => window['running2']);
    expect(runningAfter).toBe(false);
  });
});
