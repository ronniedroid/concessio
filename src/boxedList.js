import GObject from 'gi://GObject';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';

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

            this._u1.set_active(u.includes('x'));
            this._u2.set_active(u.includes('w'));
            this._u4.set_active(u.includes('r'));

            this._g1.set_active(g.includes('x'));
            this._g2.set_active(g.includes('w'));
            this._g4.set_active(g.includes('r'));

            this._o1.set_active(o.includes('x'));
            this._o2.set_active(o.includes('w'));
            this._o4.set_active(o.includes('r'));
        }
    }
});
