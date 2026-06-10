/* window.vala
 *
 * Copyright 2026 Ronnie Nissan Yousif
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

using Gee;

[GtkTemplate (ui = "/io/github/ronniedroid/concessio/window.ui")]
public class Concessio.Window : Adw.ApplicationWindow {
    [GtkChild] private unowned Adw.ToastOverlay toast_overlay;
    [GtkChild] private unowned Gtk.Stack stack;
    [GtkChild] private unowned Adw.ViewStack main_stack;

    private GLib.Settings settings = new GLib.Settings ("io.github.ronniedroid.concessio");

    static construct {
        typeof (Concessio.Permissions).ensure ();
    }

    public Window (Adw.Application app) {
        Object (application: app);

        setup_welcome_screen ();
        setup_actions ();
    }

    private void setup_welcome_screen () {
        if (settings.get_boolean ("welcome-screen-shown")) {
            stack.set_visible_child_name ("main_page");
        } else {
            stack.set_visible_child_name ("welcome_page");
        }
    }

    private void setup_actions () {
        var change_view_action =
            new SimpleAction ("change-view",
                              new GLib.VariantType ("s"));

        change_view_action.activate.connect ((action, param) => {
            if (param == null)
                return;

            var view = param.get_string ();
            this.stack.visible_child_name =
                view;
            settings.set_boolean ("welcome-screen-shown", true);
        });
        	this.add_action (change_view_action);
    }
}
