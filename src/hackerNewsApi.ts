import axios, { AxiosResponse, AxiosPromise } from 'axios';

export class HackerNewsApi {
  public static async getTopStories(articleLimit = 30, timeout = 30 * 1000): Promise<Article[]> {
    const http = axios.create({
      timeout,
      baseURL: 'https://hacker-news.firebaseio.com/v0/',
    });

    let articles: Article[] = [];
    try {
      const topStoriesResponse: AxiosResponse = await http.get('topstories.json');
      const articleIds: number[] =
        topStoriesResponse.data.length > articleLimit ? topStoriesResponse.data.splice(0, articleLimit) : topStoriesResponse.data;

      const articleRequests: AxiosPromise[] = articleIds.map((articleId) => {
        return http.get(`item/${articleId}.json`);
      });

      const articleResponses = await Promise.all<AxiosResponse>(articleRequests);
      articles = articleResponses.map((article) => {
        return article.data;
      });

      return Promise.resolve(articles);
    } catch (error : unknown) {
      if (error instanceof Error && error.message === `timeout of ${timeout}ms exceeded`) {
        throw new Error('Failed to retrieve Hacker News articles (timed out)');
      } 

      throw new Error('Failed to retrieve Hacker News articles');
    }
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
