import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import GLib from 'gi://GLib';

export const CncForm = GObject.registerClass({
    GTypeName: 'CncForm',
    Template: 'resource:///io/github/ronniedroid/concessio/ui/Form.ui',
    InternalChildren: [
        'numeric',
        'symbolic'
    ]
}, class extends Gtk.Widget {
    _validateSymbolic(symbolic) {
        return symbolic.length === 9 && /^[r-][w-][xsS-][r-][w-][xsS-][r-][w-][xtT-]$/.test(symbolic);
    }

    _validateNumeric(numeric) {
        return (numeric.length === 3 || numeric.length === 4) && /^[0-7]+$/.test(numeric);
    }

    _removeErrorClass(_entry) {
        _entry.remove_css_class("error");
    }

    _copyToClipboard(_entry) {
        if (_entry.get_text().length > 0 && !_entry.has_css_class("error")) {
            const text = GLib.Variant.new_string(_entry.get_text());
            this.activate_action("win.copyToClipboard", text);
        }
    }
});
