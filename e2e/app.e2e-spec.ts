import { PizzaShakerPage } from './app.po';

describe('pizza-shaker App', () => {
  let page: PizzaShakerPage;

  beforeEach(() => {
    page = new PizzaShakerPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
