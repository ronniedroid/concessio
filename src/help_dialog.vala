/* help_dialog.vala
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

[GtkTemplate (ui = "/io/github/ronniedroid/concessio/help-dialog.ui")]
public class Concessio.HelpDialog : Adw.Dialog {

    [GtkChild]
    private unowned Adw.HeaderBar help_header_bar;

    [GtkChild]
    private unowned Gtk.ScrolledWindow scrolled_window;

    [GtkChild]
    private unowned Gtk.Label unix_perms_header;

    [GtkChild]
    private unowned Gtk.Label special_perms_header;

    [GtkChild]
    private unowned Gtk.Label umask_header;

    public HelpDialog () {
        var vadj = scrolled_window.get_vadjustment ();

        vadj.value_changed.connect (() => {
            help_header_bar.show_title = vadj.value > 1;
        });
    }

    private void scroll_to (Gtk.Widget widget) {
        var vadj = scrolled_window.get_vadjustment ();

        Graphene.Rect bounds;
        if (widget.compute_bounds (scrolled_window, out bounds)) {
            vadj.value = bounds.origin.y - 18;
        }
    }

    [GtkCallback]
    private void scroll_to_unix_perms () {
        scroll_to (unix_perms_header);
    }

    [GtkCallback]
    private void scroll_to_special_perms () {
        scroll_to (special_perms_header);
    }

    [GtkCallback]
    private void scroll_to_umask () {
        scroll_to (umask_header);
    }
}
