const { Browser } = require("puppeteer");
const {
  clickElement,
  putText,
  getText,
  getDays,
  getMovieTime,
  getSeatSelector,
} = require("./lib/commands.js");
const {
  bookTickets,
  selectedTickets,
  getBookingCode,
} = require("./lib/selectors");

let page;

beforeEach(async () => {
  page = await browser.newPage();
  await page.goto("http://qamid.tmweb.ru/client/index.php");
  await page.setDefaultNavigationTimeout(80000);
});

afterEach(() => {
  page.close();
});

describe("Film booking tests", () => {
  test("Should book available ticket", async () => {
    await getDays(page, 5); //выбираем дату
    await getMovieTime(page, 2, 2); //выбираем время
    await page.waitForSelector("h1"); //ждем загрузки страницы
    await getSeatSelector(page, 1, 1); //выбираем место
    await clickElement(page, bookTickets); // нажимаем забронировать
    await page.waitForSelector(selectedTickets); //ждем загрузки страницы
    const actual = await getText(page, "h2");
    expect(actual).toContain("Вы выбрали билеты:");
  }, 90000);

  test("Should two tickets be booked", async () => {
    await getDays(page, 4); //выбираем дату
    await getMovieTime(page, 1, 2); //выбираем время
    await page.waitForSelector("h1");
    await getSeatSelector(page, 7, 5); //выбираем место
    await getSeatSelector(page, 7, 6); //выбираем 2 место
    await clickElement(page, bookTickets); // нажимаем забронировать
    await page.waitForSelector(selectedTickets); //ждем загрузки страницы
    const actual = await getText(page, "h2");
    expect(actual).toContain("Вы выбрали билеты:");
  }, 90000);

  test("Should try to book unavailable ticket", async () => {
    await getDays(page, 4); //выбираем дату
    await getMovieTime(page, 1, 2); //выбираем время
    await getSeatSelector(page, 2, 5); //выбираем место
    await getSeatSelector(page, 2, 5); //выбираем второй раз то же место
    const actual = await page.$eval("button", (link) =>
      link.hasAttribute("disabled")
    );
    expect(actual).toBe(true);
  }, 80000);
});
