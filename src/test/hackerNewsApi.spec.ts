import { HackerNewsApi, Article } from '../hackerNewsApi';
import axios from 'axios';

jest.mock('axios');

describe('Hacker News API', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  const mockedArticleIds = {
    data: [1, 2],
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
    request: {},
  };

  const mockedArticles = [
    {
      config: {},
      data: {
        by: 'AUTHOR_1',
        descendants: 1,
        id: 1,
        kids: [2],
        score: 1,
        time: 1175714200,
        title: 'TITLE_1',
        type: 'story',
        url: 'http://www.example.com/',
      },
      headers: {},
      request: {},
      status: 200,
      statusText: 'OK',
    },
    {
      by: 'AUTHOR_2',
      descendants: 1,
      id: 2,
      kids: [2],
      score: 1,
      time: 1175714201,
      title: 'TITLE_2',
      type: 'story',
      url: 'http://www.example.com/',
    },
  ];

  beforeEach(() => {
    mockedAxios.create = jest.fn(() => mockedAxios);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Successfully fetch mutiple articles', async () => {
    mockedAxios.get
      .mockResolvedValueOnce(mockedArticleIds)
      .mockResolvedValueOnce(mockedArticles[0])
      .mockResolvedValueOnce(mockedArticles[1]);

    const articles: Article[] = await HackerNewsApi.getTopStories();

    expect(mockedAxios.get).toHaveBeenCalledWith('topstories.json');
    expect(mockedAxios.get).toHaveBeenCalledWith('item/1.json');
    expect(mockedAxios.get).toHaveBeenCalledWith('item/2.json');

    expect(articles).toMatchInlineSnapshot(`
      [
        {
          "by": "AUTHOR_1",
          "descendants": 1,
          "id": 1,
          "kids": [
            2,
          ],
          "score": 1,
          "time": 1175714200,
          "title": "TITLE_1",
          "type": "story",
          "url": "http://www.example.com/",
        },
        undefined,
      ]
    `);
  });

  it('Successfully fetch single article', async () => {
    mockedAxios.get.mockResolvedValueOnce(mockedArticleIds).mockResolvedValueOnce(mockedArticles[0]);

    const articles: Article[] = await HackerNewsApi.getTopStories(1);
    expect(mockedAxios.get).toHaveBeenCalledWith('topstories.json');
    expect(mockedAxios.get).toHaveBeenCalledWith('item/1.json');

    expect(articles).toMatchInlineSnapshot(`
      [
        {
          "by": "AUTHOR_1",
          "descendants": 1,
          "id": 1,
          "kids": [
            2,
          ],
          "score": 1,
          "time": 1175714200,
          "title": "TITLE_1",
          "type": "story",
          "url": "http://www.example.com/",
        },
      ]
    `);
  });

  it('Successfully handle no articles ids being returned', async () => {
    const mockedArticleIdsResponse = { ...mockedArticles, data: [] };
    mockedAxios.get.mockResolvedValueOnce(mockedArticleIdsResponse);

    const articles: Article[] = await HackerNewsApi.getTopStories();
    expect(mockedAxios.get).toHaveBeenCalledWith('topstories.json');
    expect(articles).toMatchInlineSnapshot(`[]`);
  });

  it('Successfully handle error whilst retrieving article ids', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('404 - Not found'));
    return expect(async () => await HackerNewsApi.getTopStories()).rejects.toThrow('Failed to retrieve Hacker News articles');
  });

  it('Successfully handle timeout whilst retrieving articles', async () => {
    const timeout = 1;
    mockedAxios.get.mockRejectedValueOnce(new Error(`timeout of ${timeout}ms exceeded`));
    return expect(async () => await HackerNewsApi.getTopStories(30, timeout)).rejects.toThrow(
      'Failed to retrieve Hacker News articles (timed out)'
    );
  });
});
