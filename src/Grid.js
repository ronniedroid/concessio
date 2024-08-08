import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

export const CncGrid = GObject.registerClass({
    GTypeName: 'CncGrid',
    Template: 'resource:///io/github/ronniedroid/concessio/ui/Grid.ui'
}, class extends Gtk.Widget { })
