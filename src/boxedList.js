import GObject from 'gi://GObject';
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import GLib from 'gi://GLib';

export const CncBoxedList = GObject.registerClass({
    GTypeName: 'CncBoxedList',
    Template: 'resource:///io/github/ronniedroid/concessio/ui/BoxedList.ui',
    InternalChildren: [
        'u1', 'u2', 'u4', 'suid',  // User permissions buttons
        'g1', 'g2', 'g4', 'sgid',  // Group permissions buttons
        'o1', 'o2', 'o4', 'sticky'   // Other permissions buttons
    ]
}, class extends Adw.Bin {
    _getSpecial(xbtn, special) {
        if (xbtn.get_active() && special.get_active()) {
            return 's';
        } else if (!xbtn.get_active() && special.get_active()) {
            return 'S';
        } else if (xbtn.get_active() && !special.get_active()) {
            return 'x';
        } else {
            return '-';
        }
    };

    _getSticky(xbtn, sticky) {
        if (xbtn.get_active() && sticky.get_active()) {
            return 't';
        } else if (!xbtn.get_active() && sticky.get_active()) {
            return 'T';
        }  else if (xbtn.get_active() && !sticky.get_active()) {
            return 'x';
        } else {
            return '-';
        }
    };

    getSymbolicValue() {
        return [
            this._u4.get_active() ? 'r' : '-',
            this._u2.get_active() ? 'w' : '-',
            this._getSpecial(this._u1, this._suid),
            this._g4.get_active() ? 'r' : '-',
            this._g2.get_active() ? 'w' : '-',
            this._getSpecial(this._g1, this._sgid),
            this._o4.get_active() ? 'r' : '-',
            this._o2.get_active() ? 'w' : '-',
            this._getSticky(this._o1, this._sticky)
        ].join('');
    }

    updateFromSymbolic(symbolic) {
        if (symbolic.length === 9) {
            const [u, g, o] = [
                symbolic.slice(0, 3),  // User
                symbolic.slice(3, 6),  // Group
                symbolic.slice(6, 9)   // Other
            ];

            this._updateButtonState(this._u1, u.includes('x') || u.includes('s'));
            this._updateButtonState(this._u2, u.includes('w'));
            this._updateButtonState(this._u4, u.includes('r'));
            this._updateButtonState(this._suid, u.includes('s') || u.includes('S'));

            this._updateButtonState(this._g1, g.includes('x') || g.includes('s'));
            this._updateButtonState(this._g2, g.includes('w'));
            this._updateButtonState(this._g4, g.includes('r'));
            this._updateButtonState(this._sgid, g.includes('s') || g.includes('S'));

            this._updateButtonState(this._o1, o.includes('x') || o.includes('t'));
            this._updateButtonState(this._o2, o.includes('w'));
            this._updateButtonState(this._o4, o.includes('r'));
            this._updateButtonState(this._sticky, o.includes('t') || o.includes('T'));
        }
    }

    _updateButtonState(button, state) {
        const window = this.get_ancestor(Gtk.Window);
        const actionId = button.get_action_name().split('.').pop();
        const action = window.lookup_action(actionId);

        if (button.get_active() !== state) {
            button.set_active(state);
        }

        if (action && action.state.get_boolean() !== state) {
            action.change_state(new GLib.Variant('b', state));
        }
    }
});
