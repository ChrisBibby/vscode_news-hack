import { HackerNewsApi, Article } from '../hackerNewsApi';
import axios, { AxiosResponse } from 'axios';
import * as articleResponseFixture from './fixtures/article-responses-fixture.json';
import * as articleListFixture from './fixtures/article-list-response-fixture.json';

jest.mock('axios');

describe('Hacker News API', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios.create = jest.fn(() => mockedAxios);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Successfully fetch mutiple articles', async () => {
    const mockedArticleIdsResponse: AxiosResponse = articleListFixture;
    const mockedArticlesResponse: AxiosResponse<Article>[] = articleResponseFixture;

    mockedAxios.get
      .mockResolvedValueOnce(mockedArticleIdsResponse)
      .mockResolvedValueOnce(mockedArticlesResponse[0])
      .mockResolvedValueOnce(mockedArticlesResponse[1]);

    const articles: Article[] = await HackerNewsApi.getTopStories();

    expect(mockedAxios.get).toHaveBeenCalledWith('topstories.json');
    expect(mockedAxios.get).toHaveBeenCalledWith('item/1.json');
    expect(mockedAxios.get).toHaveBeenCalledWith('item/2.json');
    expect(articles.length).toEqual(2);
    expect(articles[0].title).toEqual('TITLE_1');
    expect(articles[0].by).toEqual('AUTHOR_1');

    expect(articles[1].title).toEqual('TITLE_2');
    expect(articles[1].by).toEqual('AUTHOR_2');
  });

  it('Successfully fetch single article', async () => {
    const mockedArticleIdsResponse: AxiosResponse = articleListFixture;
    const mockedArticlesResponse: AxiosResponse<Article>[] = articleResponseFixture;
    mockedAxios.get.mockResolvedValueOnce(mockedArticleIdsResponse).mockResolvedValueOnce(mockedArticlesResponse[0]);

    const articles: Article[] = await HackerNewsApi.getTopStories(1);
    expect(mockedAxios.get).toHaveBeenCalledWith('topstories.json');
    expect(mockedAxios.get).toHaveBeenCalledWith('item/1.json');
    expect(articles.length).toEqual(1);
    expect(articles[0].title).toEqual('TITLE_1');
    expect(articles[0].by).toEqual('AUTHOR_1');
  });

  it('Successfully handle no articles ids being returned', async () => {
    const mockedArticleIdsResponse: AxiosResponse = { ...articleListFixture, data: [] };
    mockedAxios.get.mockResolvedValueOnce(mockedArticleIdsResponse);

    const articles: Article[] = await HackerNewsApi.getTopStories();
    expect(mockedAxios.get).toHaveBeenCalledWith('topstories.json');
    expect(mockedAxios.get);
    expect(articles.length).toEqual(0);
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
