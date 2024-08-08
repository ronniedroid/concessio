import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

export const CncCell = GObject.registerClass({
    GTypeName: 'CncCell',
    Template: 'resource:///io/github/ronniedroid/concessio/ui/Cell.ui',
    Properties: {
        label: GObject.ParamSpec.string(
	    'label',
	    'Label',
	    'Cell Label',
	    GObject.ParamFlags.READWRITE,
	    ''
	),
    },
}, class extends Gtk.ToggleButton { });
