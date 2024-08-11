import GObject from 'gi://GObject';
import Adw from 'gi://Adw';

export const CncWindow = GObject.registerClass({
    GTypeName: 'CncWindow',
    Template: 'resource:///io/github/ronniedroid/concessio/ui/Window.ui',
    InternalChildren: [
        'form',
        "boxedList"
    ]
}, class extends Adw.ApplicationWindow {
    constructor(params = {}) {
        super(params);

        const form = this._form;
        const boxedList = this._boxedList;

        boxedList.setForm(form);

        form._symbolic.connect('activate', () => {
            const symbolicValue = form._symbolic.get_text();
            if (form._validateSymbolic(symbolicValue)) {
                const numericValue = symbolicToNumeric(symbolicValue);
                form._numeric.set_text(numericValue);
                boxedList.updateFromSymbolic(symbolicValue);
            } else {
                form._symbolic.add_css_class("error");
            }
        });

        form._numeric.connect('activate', () => {
            const numericValue = form._numeric.get_text();
            if (form._validateNumeric(numericValue)) {
                const symbolicValue = numericToSymbolic(numericValue);
                form._symbolic.set_text(symbolicValue);
                boxedList.updateFromSymbolic(symbolicValue);
            } else {
                form._numeric.add_css_class("error");
            }
        });
    }

    vfunc_close_request() {
        super.vfunc_close_request();
        this.run_dispose();
    }
});

function symbolicToNumeric(symbolic) {
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

function numericToSymbolic(numeric) {
        const permMap = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];

        return numeric
            .toString()
            .split('')
            .map(digit => permMap[parseInt(digit)])
            .join('');
    };
