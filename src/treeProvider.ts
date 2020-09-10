import * as vscode from 'vscode';
import { Article, HackerNewsApi } from './hackerNewsApi';
import path = require('path');

export class NodeDependenciesProvider implements vscode.TreeDataProvider<TreeItem> {
  private hackerNewsInternal = 'https://news.ycombinator.com/item?id=';
  private articleTree: TreeItem[] = [];

  constructor(articles: Article[]) {
    this.articleTree = this.populateArticleTree(articles);
  }

  populateArticleTree(articles: Article[]): TreeItem[] {
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
      treeNode.tooltip = `${article.title} - ${url} <h1>test</h1>`;
      treeNode.description = url;
      tree.push(treeNode);
    }

    return tree;
  }

  // onDidChangeTreeData?: vscode.Event<void | TreeItem | null | undefined> | undefined;
  private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined> = new vscode.EventEmitter<TreeItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: TreeItem | undefined): vscode.ProviderResult<TreeItem[]> {
    if (element === undefined) {
      return this.articleTree;
    }

    return element.children;
  }
}

class TreeItem extends vscode.TreeItem {
  children: TreeItem[] | undefined;

  constructor(label: string, children?: TreeItem[]) {
    super(label, children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed);
    this.children = children;
  }
}
