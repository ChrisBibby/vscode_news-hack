import * as vscode from 'vscode';
import { Article, HackerNewsApi } from './hackerNewsApi';
import path = require('path');

export class NodeDependenciesProvider implements vscode.TreeDataProvider<TreeItem> {
  private hackerNewsInternal = 'https://news.ycombinator.com/item?id=';
  private hackerNewsApi: HackerNewsApi = new HackerNewsApi();

  constructor() {}

  async populateArticleTree(articles: Article[]): Promise<TreeItem[]> {
    const tree: TreeItem[] = [];
    for (const article of articles) {
      const url = article.url ? article.url : `${this.hackerNewsInternal}${article.id}`;
      const childNode: TreeItem = new TreeItem(url);
      childNode.iconPath = new vscode.ThemeIcon('link');
      childNode.command = {
        command: 'hack-news.openArticle',
        title: 'Open Article',
        arguments: [url],
      };

      const treeNode: TreeItem = new TreeItem(article.title, [childNode]);
      treeNode.tooltip = article.title;
      treeNode.description = url;
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
