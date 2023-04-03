import * as vscode from "vscode";
import * as R from "remeda";

interface Mark {
  key: string;
  line: number;
}

export class NavMarks implements vscode.Disposable {
  private localMarks = new Map<vscode.TextDocument, Mark[]>();

  constructor() {}

  public createLocalMark(key: string, editor: vscode.TextEditor) {
    const document = editor.document;
    let marks = this.localMarks.get(document);
    if (!marks) {
      marks = [];
      this.localMarks.set(document, marks);
    } else {
      const index = marks.findIndex((m) => m.key === key);
      if (index >= 0) {
        marks.splice(index, 1);
      }

      marks.push({ key, line: editor.selection.active.line });
    }
  }

  public async jumpToLocalMark(key: string, editor: vscode.TextEditor) {
    let mark;
    let document = editor.document;

    mark = R.pipe(
      Array.from(this.localMarks.entries()),
      R.filter(([doc, _]) => doc === document),
      R.flatMap(([_, marks]) => marks),
      R.find((m) => m.key === key)
    );

    if (mark) {
      await this.jumpToMark(mark, document);
    }
  }

  private async jumpToMark(mark: Mark, document: vscode.TextDocument) {
    await vscode.window.showTextDocument(document);
    if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document === document) {
      const position = new vscode.Position(mark.line, 0);
      const selection = new vscode.Selection(position, position);
      vscode.window.activeTextEditor.selection = selection;
      vscode.window.activeTextEditor.revealRange(selection, vscode.TextEditorRevealType.AtTop);
    }
  }

  dispose() {
    throw new Error("Method not implemented.");
  }
}
