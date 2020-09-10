import * as vscode from 'vscode';
import { NodeDependenciesProvider } from './treeProvider';
import { Article, HackerNewsApi } from './hackerNewsApi';

export async function activate(_context: vscode.ExtensionContext) {
  vscode.commands.registerCommand('hack-news.openArticle', (resource) => {
    if (vscode.env.openExternal) {
      vscode.env.openExternal(vscode.Uri.parse(resource));
    } else {
      vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(resource));
    }
  });

  const hackerNewsApi = new HackerNewsApi();
  const articles: Article[] = await hackerNewsApi.getTopStories();

  const treeDataProvider: NodeDependenciesProvider = new NodeDependenciesProvider(articles);
  
  vscode.window.registerTreeDataProvider('hacker-news-top-stories', treeDataProvider);

  vscode.commands.registerCommand('hacker-news.refresh-stories', () => {
    vscode.window.showInformationMessage('Refreshing Hacker News Stories');
    treeDataProvider.refresh();
  });
}

export function deactivate() {}
