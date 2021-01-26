import * as vscode from 'vscode';
import { NodeDependenciesProvider } from './treeProvider';

export async function activate(_context: vscode.ExtensionContext): Promise<void> {
  const treeDataProvider: NodeDependenciesProvider = new NodeDependenciesProvider(_context);
  vscode.window.registerTreeDataProvider('news-hack-top-stories', treeDataProvider);

  vscode.commands.registerCommand('hack-news.openArticle', (resource, articleId) => {
    if (vscode.env.openExternal) {
      treeDataProvider.markArticleRead(articleId);
      treeDataProvider.refresh();
      vscode.env.openExternal(vscode.Uri.parse(resource));
    } else {
      vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(resource));
    }
  });

  vscode.commands.registerCommand('news-hack.refresh-stories', () => {
    treeDataProvider.refresh();
  });

  vscode.commands.registerCommand('news-hack.clear-history', () => {
    treeDataProvider.clearArticleHistory();
    treeDataProvider.refresh();
    vscode.window.showInformationMessage(`News-Hack history has been cleared.`);
  });

  vscode.commands.registerCommand('news-hack.visit-website', () => {
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
