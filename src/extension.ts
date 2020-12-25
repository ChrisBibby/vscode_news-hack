import * as vscode from 'vscode';
import { NodeDependenciesProvider } from './treeProvider';

export async function activate(_context: vscode.ExtensionContext): Promise<void> {
  const treeDataProvider: NodeDependenciesProvider = new NodeDependenciesProvider(_context);
  vscode.window.registerTreeDataProvider('hacker-news-top-stories', treeDataProvider);

  vscode.commands.registerCommand('hack-news.openArticle', (resource, articleId) => {
    if (vscode.env.openExternal) {
      treeDataProvider.markArticleRead(articleId);
      treeDataProvider.refresh();
      vscode.env.openExternal(vscode.Uri.parse(resource));
    } else {
      vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(resource));
    }
  });

  vscode.commands.registerCommand('hacker-news.refresh-stories', () => {
    treeDataProvider.refresh();
  });

  vscode.commands.registerCommand('hacker-news.clear-history', () => {
    treeDataProvider.clearArticleHistory();
    treeDataProvider.refresh();
    vscode.window.showInformationMessage(`Hacker News Article History has been cleared.`);
  });

  vscode.commands.registerCommand('hacker-news.visit-website', () => {
    const hackerNewsUrl = 'https://news.ycombinator.com/';
    if (vscode.env.openExternal) {
      vscode.env.openExternal(vscode.Uri.parse(hackerNewsUrl));
    } else {
      vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(hackerNewsUrl));
    }
  });
}

export function deactivate(): void {
  // no-op.
}
