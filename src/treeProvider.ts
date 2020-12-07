import * as vscode from 'vscode';
import { Article, HackerNewsApi } from './hackerNewsApi';
import path = require('path');
import moment = require('moment');

export class NodeDependenciesProvider implements vscode.TreeDataProvider<TreeItem> {
  private hackerNewsUrl = 'https://news.ycombinator.com/item?id=';
  private hackerNewsApi: HackerNewsApi = new HackerNewsApi();
  private articleList: Article[] = [];
  private history: History = new History();

  constructor(private context: vscode.ExtensionContext) { }

  async populateArticleTree(articles: Article[]): Promise<TreeItem[]> {
    const tree: TreeItem[] = [];
    for (const article of articles) {
      const url = article.url ? article.url : `${this.hackerNewsUrl}${article.id}`;
      const timeSince = moment.unix(article.time).fromNow();

      const childNode: TreeItem = new TreeItem(`${article.score} points by ${article.by} ${timeSince} - ${article.descendants} comments`);
      childNode.description = `${this.hackerNewsUrl}${article.id}`;
      childNode.iconPath = new vscode.ThemeIcon('comment-discussion');
      childNode.command = {
        command: 'hack-news.openArticle',
        title: 'Open Article',
        arguments: [`${this.hackerNewsUrl}${article.id}`],
      };

      const treeNode: TreeItem = new TreeItem(article.title, [childNode]);
      const iconColor = this.isArticleRead(article.id) ? 'newsHack.read' : 'newsHack.unread';
      treeNode.tooltip = `${article.title} - ${url}`;
      treeNode.description = `${url}`;
      treeNode.iconPath = new vscode.ThemeIcon('link', new vscode.ThemeColor(iconColor));
      treeNode.command = {
        command: 'hack-news.openArticle',
        title: 'Open Article',
        arguments: [url, article.id],
      };
      tree.push(treeNode);
    }
    return tree;
  }

  private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
  readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }

  async getChildren(element?: TreeItem): Promise<TreeItem[] | undefined> {
    if (element === undefined) {
      this.articleList = await this.hackerNewsApi.getTopStories();
      return this.populateArticleTree(this.articleList);
    }

    return Promise.resolve(element.children || undefined);
  }

  isArticleRead(articleId: number): boolean {
    if (this.history.articlesRead && this.history.articlesRead.length > 0) {
      console.log(this.history.articlesRead.includes(articleId));
      return this.history.articlesRead.includes(articleId);
    }
    return false;
  }

  async markArticleRead(articleId: number) {
    this.history.articlesRead = await this.context.globalState.get('articleHistory');
    if (this.history.articlesRead && this.history.articlesRead.length > 0) {

      if (this.history.articlesRead.length > 200) {
        this.history.articlesRead.shift();
      }

      this.history.articlesRead.push(articleId);
      await this.context.globalState.update('articleHistory', this.history.articlesRead);
    }
  }
}

class History {
  articlesRead: number[] | undefined = [];
}
class TreeItem extends vscode.TreeItem {
  children?: TreeItem[];

  constructor(label: string, children?: TreeItem[]) {
    super(label, children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed);
    this.children = children;
  }
}
