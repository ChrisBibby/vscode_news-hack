import { HackerNewsApi, Article } from '../hackerNewsApi';
import axios, { AxiosResponse } from 'axios';
import * as articleResponseFixture from './fixtures/article-responses-fixture.json';
import * as articleListFixture from './fixtures/article-list-response-fixture.json';

jest.mock('axios');

describe('Hacker News API', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Fetch Articles Successfully', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    const mockedArticleIdsResponse: AxiosResponse = articleListFixture;
    const mockedArticlesResponse: AxiosResponse<Article>[] = articleResponseFixture;

    mockedAxios.get
      .mockResolvedValueOnce(mockedArticleIdsResponse)
      .mockResolvedValueOnce(mockedArticlesResponse[0])
      .mockResolvedValueOnce(mockedArticlesResponse[1]);

    const articles: Article[] = await HackerNewsApi.getTopStories();

    expect(mockedAxios.get).toHaveBeenCalledWith('https://hacker-news.firebaseio.com/v0/topstories.json');
    expect(mockedAxios.get).toHaveBeenCalledWith('https://hacker-news.firebaseio.com/v0/item/1.json');
    expect(mockedAxios.get).toHaveBeenCalledWith('https://hacker-news.firebaseio.com/v0/item/2.json');
    expect(articles.length).toEqual(2);
    expect(articles[0].title).toEqual('TITLE_1');
    expect(articles[0].by).toEqual('AUTHOR_1');

    expect(articles[1].title).toEqual('TITLE_2');
    expect(articles[1].by).toEqual('AUTHOR_2');
  });
});
