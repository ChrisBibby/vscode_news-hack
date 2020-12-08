import * as vscode from 'vscode';
import { Article, HackerNewsApi } from './hackerNewsApi';
import moment = require('moment');

export class NodeDependenciesProvider implements vscode.TreeDataProvider<TreeItem> {
  private hackerNewsUrl = 'https://news.ycombinator.com/item?id=';
  private hackerNewsApi: HackerNewsApi = new HackerNewsApi();
  private articleList: Article[] = [];
  private history: number[] = [];

  constructor(private context: vscode.ExtensionContext) {}

  async populateArticleTree(articles: Article[]): Promise<TreeItem[]> {
    this.history = (await this.context.globalState.get('articleHistory')) || [];

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
      treeNode.tooltip = `${article.title} - ${url}`;
      treeNode.description = `${url}`;
      treeNode.iconPath = new vscode.ThemeIcon(
        'link',
        new vscode.ThemeColor(this.isArticleRead(article.id) ? 'newsHack.read' : 'newsHack.unread')
      );
      treeNode.command = {
        command: 'hack-news.openArticle',
        title: 'Open Article',
        arguments: [url, article.id],
      };
      tree.push(treeNode);
    }
    return tree;
  }

  private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined> = new vscode.EventEmitter<TreeItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined> = this._onDidChangeTreeData.event;

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

  async markArticleRead(articleId: number): Promise<void> {
    this.history = (await this.context.globalState.get('articleHistory')) || [];
    if (this.history?.length > 200) {
      this.history.shift();
    }
    this.history.push(articleId);
    await this.context.globalState.update('articleHistory', this.history);
  }

  async clearArticleHistory(): Promise<void> {
    await this.context.globalState.update('articleHistory', []);
  }

  isArticleRead(articleId: number): boolean {
    if (this.history?.length > 0) {
      return this.history.includes(articleId);
    }
    return false;
  }
}

class TreeItem extends vscode.TreeItem {
  children?: TreeItem[];

  constructor(label: string, children?: TreeItem[]) {
    super(label, children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed);
    this.children = children;
  }
}
