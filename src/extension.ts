import * as vscode from 'vscode';
import { NodeDependenciesProvider } from './treeProvider';

export async function activate(_context: vscode.ExtensionContext) {
  const treeDataProvider: NodeDependenciesProvider = new NodeDependenciesProvider();
  vscode.window.registerTreeDataProvider('hacker-news-top-stories', treeDataProvider);

  vscode.commands.registerCommand('hack-news.openArticle', (resource) => {
    if (vscode.env.openExternal) {
      vscode.env.openExternal(vscode.Uri.parse(resource));
    } else {
      vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(resource));
    }
  });

  vscode.commands.registerCommand('hacker-news.refresh-stories', () => {
    vscode.window.showInformationMessage('Refreshing Hacker News Stories');
    treeDataProvider.refresh();
  });
}

export function deactivate() {}
