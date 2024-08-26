import GObject from 'gi://GObject';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import GLib from 'gi://GLib';

export const CncBoxedList = GObject.registerClass({
    GTypeName: 'CncBoxedList',
    Template: 'resource:///io/github/ronniedroid/concessio/ui/BoxedList.ui',
    InternalChildren: [
        'u1', 'u2', 'u4',  // User permissions buttons
        'g1', 'g2', 'g4',  // Group permissions buttons
        'o1', 'o2', 'o4'   // Other permissions buttons
    ]
}, class extends Adw.Bin {
    getSymbolicValue() {
        return [
            this._u4.get_active() ? 'r' : '-',
            this._u2.get_active() ? 'w' : '-',
            this._u1.get_active() ? 'x' : '-',
            this._g4.get_active() ? 'r' : '-',
            this._g2.get_active() ? 'w' : '-',
            this._g1.get_active() ? 'x' : '-',
            this._o4.get_active() ? 'r' : '-',
            this._o2.get_active() ? 'w' : '-',
            this._o1.get_active() ? 'x' : '-',
        ].join('');
    }

    updateFromSymbolic(symbolic) {
        if (symbolic.length === 9) {
            const [u, g, o] = [
                symbolic.slice(0, 3),  // User
                symbolic.slice(3, 6),  // Group
                symbolic.slice(6, 9)   // Other
            ];

            this._updateButtonState(this._u1, u.includes('x'));
            this._updateButtonState(this._u2, u.includes('w'));
            this._updateButtonState(this._u4, u.includes('r'));

            this._updateButtonState(this._g1, g.includes('x'));
            this._updateButtonState(this._g2, g.includes('w'));
            this._updateButtonState(this._g4, g.includes('r'));

            this._updateButtonState(this._o1, o.includes('x'));
            this._updateButtonState(this._o2, o.includes('w'));
            this._updateButtonState(this._o4, o.includes('r'));
        }
    }

    _updateButtonState(button, state) {
        const window = this.get_ancestor(Gtk.Window);
        const actionId = button.get_action_name().split('.').pop();
        const action = window.lookup_action(actionId);

        if (button.active !== state) {
            button.active = state;
        }

        // Ensure the associated action's state is synchronized
        if (action && action.state.get_boolean() !== state) {
            action.change_state(new GLib.Variant('b', state));
        }
    }
});
