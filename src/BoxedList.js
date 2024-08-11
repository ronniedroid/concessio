import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';

export const CncBoxedList = GObject.registerClass({
    GTypeName: 'CncBoxedList',
    Template: 'resource:///io/github/ronniedroid/concessio/ui/BoxedList.ui',
    InternalChildren: [
        'u1', 'u2', 'u4',  // User permissions buttons
        'g1', 'g2', 'g4',  // Group permissions buttons
        'o1', 'o2', 'o4'   // Other permissions buttons
    ]
}, class extends Gtk.ListBox {
    _init() {
        super._init();

        const actionGroup = this._createActions();
        this._connectActions(actionGroup);
    }

    _createActions() {
        const actionGroup = new Gio.SimpleActionGroup();
        this.insert_action_group('toggle', actionGroup);

        ['u1', 'u2', 'u4', 'g1', 'g2', 'g4', 'o1', 'o2', 'o4'].forEach(id => {
            const action = new Gio.SimpleAction({ name: id });
            action.connect('activate', () => this._onActionActivated(id));
            actionGroup.add_action(action);
        });

        return actionGroup;
    }

    _connectActions(actionGroup) {
        const toggleButtons = { u1: this._u1, u2: this._u2, u4: this._u4, g1: this._g1, g2: this._g2, g4: this._g4, o1: this._o1, o2: this._o2, o4: this._o4 };
        
        Object.keys(toggleButtons).forEach(id => {
            toggleButtons[id].connect('toggled', () => {
                const action = actionGroup.lookup_action(id);
                action.activate(null);
            });
        });
    }

    _onActionActivated(id) {
        const toggleButtons = { u1: this._u1, u2: this._u2, u4: this._u4, g1: this._g1, g2: this._g2, g4: this._g4, o1: this._o1, o2: this._o2, o4: this._o4 };
        
        const formValues = this.calculateFormValues();
        this._form._symbolic.set_text(formValues.symbolic);
        this._form._numeric.set_text(formValues.numeric);
    }

    calculateFormValues() {
        const symbolic = [
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

        const numeric = symbolicToNumeric(symbolic);

        return { symbolic, numeric };
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

    setForm(form) {
        this._form = form;
    }
});

// Conversion functions
const symbolicToNumeric = (symbolic) => {
    const permMap = { 'r': 4, 'w': 2, 'x': 1, '-': 0 };

    return symbolic
        .split('')
        .map(char => permMap[char])
        .reduce((acc, curr, idx) => {
            if (idx % 3 === 0) acc.push(0);
            acc[acc.length - 1] += curr;
            return acc;
        }, [])
        .join('');
};
