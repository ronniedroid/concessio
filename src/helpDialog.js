import GObject from 'gi://GObject';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';

export const CncHelpDialog = GObject.registerClass({
    GTypeName: 'CncHelpDialog',
    Template: 'resource:///io/github/ronniedroid/concessio/ui/HelpDialog.ui',
}, class extends Adw.Dialog {});
