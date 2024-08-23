import GObject from 'gi://GObject';
import Adw from 'gi://Adw';

export const CncHelpDialog = GObject.registerClass({
    GTypeName: 'CncHelpDialog',
    Template: 'resource:///io/github/ronniedroid/concessio/ui/HelpDialog.ui',
    InternalChildren: [
        "helpHeaderBar",
        "scrolledWindow"
    ]
}, class extends Adw.Dialog {
    constructor() {
        super();

        const vadjustment = this._scrolledWindow.get_vadjustment();

        vadjustment.connect('value-changed', () => {
            if (vadjustment.value > 1) {
                this._helpHeaderBar.show_title = true;
            } else {
                this._helpHeaderBar.show_title = false;
            }
        });

    }
});
