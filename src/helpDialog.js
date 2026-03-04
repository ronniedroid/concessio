import GObject from 'gi://GObject';
import Adw from 'gi://Adw';

export const CncHelpDialog = GObject.registerClass({
    GTypeName: 'CncHelpDialog',
    Template: 'resource:///io/github/ronniedroid/concessio/ui/HelpDialog.ui',
    InternalChildren: [
        "helpHeaderBar",
        "scrolledWindow",
        "unixPermsHeader",
        "specialPermsHeader",
        "umaskHeader"
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

    _scrollTo(widget) {
        const adjustment = this._scrolledWindow.get_vadjustment();
        const allocation = widget.get_allocation();

        // Smooth scroll to the widget's Y position
        adjustment.set_value(allocation.y - 18); // Subtract a bit for margin
    }

    _scrollToUnixPerms() {
        this._scrollTo(this._unixPermsHeader);
    }

    _scrollToSpecialPerms() {
        this._scrollTo(this._specialPermsHeader);
    }

    _scrollToUmask() {
        this._scrollTo(this._umaskHeader);
    }
});
