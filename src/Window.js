import GObject from 'gi://GObject';
import Adw from 'gi://Adw';

export const CncWindow = GObject.registerClass({
    GTypeName: 'CncWindow',
    Template: 'resource:///io/github/ronniedroid/concessio/ui/Window.ui',
}, class extends Adw.ApplicationWindow {
    constructor(params = {}) {
        super(params);
    }

    vfunc_close_request() {
        super.vfunc_close_request();
        this.run_dispose();
    }
});
