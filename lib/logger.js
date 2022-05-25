'use babel';

import LoggerView from './logger-view';
import { CompositeDisposable } from 'atom';

export default {

    config: {
      "interval": {
        "type": "integer",
        "default": 60
      }
    },

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

        // get file fileName
        let fileName = atom.workspace.getActiveTextEditor().getTitle();
        let progName = fileName.split('.');
        let fullPath = atom.workspace.getActiveTextEditor().getPath();
        let path = fullPath.split('/').reverse().slice(1).reverse().join('/');

        // 1分ごとのソースコードの収集
        function perMinCode() {
            let now = getNow();
            let interval_seconds = atom.config.get('logger.interval');
            let logsPath = path + "/logs";
            let pathName = path + "/logs/" + progName[0] + now + "." + progName[1];

            let text = atom.workspace.getActiveTextEditor().getText();

            const fs = require('fs');

            // logsディレクトリの作成
            if (!fs.existsSync(logsPath)) {
              fs.mkdir(logsPath, (err) => {
                if (err) { throw err; }
              });
            }

            fs.writeFile(pathName, text, function (err) {
              if (err) { throw err; }
            });

            setTimeout(perMinCode, interval_seconds * 1000);
        }

        // 現在時刻の取得
        function getNow() {
            let date = new Date();
            let month = Number(date.getMonth() + 1);
            if (month < 10) {
                month = '0' + month;
            }
            let date = Number(date.getDate());
            let now = "_" +
                      Number(date.getFullYear() - 2000) + "_" +
                      month + "_" +
                      date.getDate() + "_" +
                      date.getHours() + "_" +
                      date.getMinutes();
            return now;
        }

        perMinCode();
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
      atom.notifications.addInfo("Start of Logging", {dismissable: true});
    }
};
