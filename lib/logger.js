'use babel';

import LoggerView from './logger-view';
import { CompositeDisposable } from 'atom';

let pathName;

export default {

    loggerView: null,
    modalPanel: null,
    subscriptions: null,

    activate(state) {
        this.loggerView = new LoggerView(state.loggerViewState);
        this.modalPanel = atom.workspace.addModalPanel({
            item: this.loggerView.getElement(),
            visible: false
        });

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'logger:toggle': () => this.toggle()
        }));

        // 1分ごとのソースコードの収集
        function perMinCode() {
            // ファイル名の取得
            let fileName = atom.workspace.getTitle();
            let progName = fileName.split(".");
            let now = getNow();
            let path = atom.workspace.getPath();
            pathName = path + "/logs/" + progName[0] + now + "." + progName[1];

            atom.workspace.observeTextEditors(editor => {
                Promise.resolve(editor.saveAs(pathName)).then(() =>
                atom.notifications.addSuccess("Saved.")).catch((error) =>
                atom.notifications.addError(error));
            });

            setTimeout(perMinCode, 60000);
        }

        // コンパイルごとのソースコードの収集
        function perComCode() {}

        // コンパイルログの収集
        function comLog() {}

        // 実行ログの収集
        function execLog() {}

        // 現在時刻の取得
        function getNow() {
            let date = new Date();
            let now = "_" +
                      date.getYear() + "_" +
                      date.getMonth() + "_" +
                      date.getDate() + "_" +
                      date.getHours() + "_" +
                      date.getMinutes();
            return now;
        }

        // logsディレクトリの作成
        function createLogs() {
            const fs = require('fs');

            const filePath = atom.workspace.getPath() + "logs";
            if (!fs.existsSync(filePath)) {
                fs.mkdir(filePath, (err) => {
                    console.log(err.toString());
                    return;
                })
            }
        }
    },

    deactivate() {
        this.modalPanel.destroy();
        this.subscriptions.dispose();
        this.loggerView.destroy();
    },

    serialize() {
        return {
            loggerViewState: this.loggerView.serialize()
        };
    },

    toggle() {
        console.log('Logger was toggled!');
        return (
            this.modalPanel.isVisible() ?
            this.modalPanel.hide() :
            this.modalPanel.show()
        );
    }
};
