import axios, { AxiosResponse, AxiosPromise } from 'axios';

export class HackerNewsApi {
  private baseUrl = 'https://hacker-news.firebaseio.com/v0/';

  public async getTopStories(): Promise<Article[]> {
    const topStoriesEndpoint = 'topstories.json';
    const storiesToFetch = 30;

    // TODO: Add Try/Catch blocks to handle errors/rejects.
    const topStoriesResponse: AxiosResponse = await axios.get(`${this.baseUrl}${topStoriesEndpoint}`);
    const articleIds: number[] =
      topStoriesResponse.data.length > storiesToFetch ? topStoriesResponse.data.splice(0, storiesToFetch) : topStoriesResponse.data;

    const articleRequests: AxiosPromise[] = articleIds.map((articleId) => {
      return axios({ url: `${this.baseUrl}item/${articleId}.json`, method: 'GET' });
    });

    const articleResponses = await Promise.all<AxiosResponse>(articleRequests);
    const articles: Article[] = articleResponses.map((article) => {
      return article.data;
    });

    return Promise.resolve(articles);
  }
}

export interface Article {
  by: string;
  descendants: number;
  id: number;
  kids: number[];
  score: number;
  time: number;
  title: string;
  type: string;
  url: string;
  read: boolean;
}
