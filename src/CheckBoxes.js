import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

export const CncCheckBoxes = GObject.registerClass({
    GTypeName: 'CncCheckBoxes',
    Template: 'resource:///io/github/ronniedroid/concessio/ui/CheckBoxes.ui'
}, class extends Gtk.Widget { })