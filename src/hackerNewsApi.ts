import axios, { AxiosResponse, AxiosPromise } from 'axios';

export class HackerNewsApi {
  public static async getTopStories(): Promise<Article[]> {
    const baseUrl = 'https://hacker-news.firebaseio.com/v0/';
    const topStoriesEndpoint = 'topstories.json';
    const storiesToFetch = 30;

    // TODO: Add Try/Catch blocks to handle errors/rejects.
    const topStoriesResponse: AxiosResponse = await axios.get(`${baseUrl}${topStoriesEndpoint}`);
    const articleIds: number[] =
      topStoriesResponse.data.length > storiesToFetch ? topStoriesResponse.data.splice(0, storiesToFetch) : topStoriesResponse.data;

    const articleRequests: AxiosPromise[] = articleIds.map((articleId) => {
      return axios.get(`${baseUrl}item/${articleId}.json`);
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
  read?: boolean;
}
