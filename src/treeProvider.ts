import * as vscode from 'vscode';
import { Article, HackerNewsApi } from './hackerNewsApi';
import path = require('path');
import moment = require('moment');

export class NodeDependenciesProvider implements vscode.TreeDataProvider<TreeItem> {
  private hackerNewsUrl = 'https://news.ycombinator.com/item?id=';
  private hackerNewsApi: HackerNewsApi = new HackerNewsApi();

  constructor() { }

  async populateArticleTree(articles: Article[]): Promise<TreeItem[]> {
    const tree: TreeItem[] = [];
    for (const article of articles) {
      const url = article.url ? article.url : `${this.hackerNewsUrl}${article.id}`;

      const childNode: TreeItem = new TreeItem(`${article.descendants} comments`);
      childNode.description = `${this.hackerNewsUrl}${article.id}`;
      childNode.iconPath = new vscode.ThemeIcon('comment-discussion');
      childNode.command = {
        command: 'hack-news.openArticle',
        title: 'Open Article',
        arguments: [`${this.hackerNewsUrl}${article.id}`],
      };

      const treeNode: TreeItem = new TreeItem(article.title, [childNode]);
      const timeSince = moment.unix(article.time).fromNow();
      treeNode.tooltip = `${article.title} - ${url}`;
      treeNode.description = `${timeSince} - ${url}`;
      treeNode.iconPath = new vscode.ThemeIcon('link');
      treeNode.command = {
        command: 'hack-news.openArticle',
        title: 'Open Article',
        arguments: [url],
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
      return this.populateArticleTree(await this.hackerNewsApi.getTopStories());
    }

    return Promise.resolve(element.children || undefined);
  }

  // TODO: Dispose - need some cleanup for the extension.
}

class TreeItem extends vscode.TreeItem {
  children?: TreeItem[];

  constructor(label: string, children?: TreeItem[]) {
    super(label, children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed);
    this.children = children;
  }
}
