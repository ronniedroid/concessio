import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import GLib from 'gi://GLib';
import Adw from 'gi://Adw';

export const CncUmaskForm = GObject.registerClass({
    GTypeName: 'CncUmaskForm',
    Template: 'resource:///io/github/ronniedroid/concessio/ui/UmaskForm.ui',
    InternalChildren: [
        'target',
        'umask',
        'base',
        'command'
    ]
}, class extends Gtk.Widget {
    _locked = false;

    _onTargetChanged() {
        if (this._locked || !this._target || !this._base || !this._command || !this._umask) return;

        this._removeErrorClass(this._target);
        const targetValue = this._target.get_text();

        if (targetValue.length === 0) {
            this._locked = true;
            this._umask.set_text("");
            this._command.set_text("");
            this._locked = false;
            return;
        }

        if (this._validateNumeric(targetValue)) {
            const baseValue = this._base.active === 0 ? 0o666 : 0o777;
            const target = parseInt(targetValue, 8);
            const umask = (baseValue & ~target) & 0o777;
            const umaskStr = umask.toString(8).padStart(3, '0');

            this._locked = true;
            this._umask.set_text(umaskStr);
            this._command.set_text(`umask ${umaskStr}`);
            this._locked = false;
        } else {
            this._target.add_css_class("error");
            this._locked = true;
            this._umask.set_text("");
            this._command.set_text("");
            this._locked = false;
        }
    }

    _onUmaskChanged() {
        if (this._locked || !this._target || !this._base || !this._command || !this._umask) return;

        this._removeErrorClass(this._umask);
        const umaskValue = this._umask.get_text();

        if (umaskValue.length === 0) {
            this._locked = true;
            this._target.set_text("");
            this._command.set_text("");
            this._locked = false;
            return;
        }

        if (this._validateNumeric(umaskValue)) {
            const baseValue = this._base.active === 0 ? 0o666 : 0o777;
            const umask = parseInt(umaskValue, 8);
            const target = (baseValue & ~umask) & 0o777;
            const targetStr = target.toString(8).padStart(3, '0');
            const umaskStr = (umask & 0o777).toString(8).padStart(3, '0');

            this._locked = true;
            this._target.set_text(targetStr);
            this._command.set_text(`umask ${umaskStr}`);
            this._locked = false;
        } else {
            this._umask.add_css_class("error");
            this._locked = true;
            this._target.set_text("");
            this._command.set_text("");
            this._locked = false;
        }
    }

    _onBaseChanged() {
        // When base changes, we prioritize recalculating from target
        this._onTargetChanged();
    }

    _validateNumeric(numeric) {
        return numeric.length === 3 && /^[0-7]+$/.test(numeric);
    }

    _removeErrorClass(_entry) {
        _entry.remove_css_class("error");
    }

    _copyTarget() {
        this._copyToClipboard(this._target);
    }

    _copyUmask() {
        this._copyToClipboard(this._umask);
    }

    _copyCommand() {
        this._copyToClipboard(this._command);
    }

    _copyToClipboard(_entry) {
        if (_entry.get_text().length > 0) {
            const text = GLib.Variant.new_string(_entry.get_text());
            this.activate_action("win.copyToClipboard", text);
        }
    }
});
