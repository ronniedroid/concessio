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

[GtkTemplate (ui = "/io/github/ronniedroid/concessio/permissions.ui")]
public class Concessio.Permissions : Gtk.Box {

    [GtkChild] private unowned Gtk.Entry numeric_entry;
    [GtkChild] private unowned Gtk.Entry symbolic_entry;
    [GtkChild] private unowned Gtk.Entry chmod_command_entry;

    [GtkChild] private unowned Gtk.ToggleButton u4;
    [GtkChild] private unowned Gtk.ToggleButton u2;
    [GtkChild] private unowned Gtk.ToggleButton u1;

    [GtkChild] private unowned Gtk.ToggleButton g4;
    [GtkChild] private unowned Gtk.ToggleButton g2;
    [GtkChild] private unowned Gtk.ToggleButton g1;

    [GtkChild] private unowned Gtk.ToggleButton o4;
    [GtkChild] private unowned Gtk.ToggleButton o2;
    [GtkChild] private unowned Gtk.ToggleButton o1;

    [GtkChild] private unowned Gtk.Switch suid;
    [GtkChild] private unowned Gtk.Switch sgid;
    [GtkChild] private unowned Gtk.Switch sticky;

    public uint mode { get; set; default = 0644; }

    private bool updating = false;

    private const string[] PERM_MAP = {
        "---",
        "--x",
        "-w-",
        "-wx",
        "r--",
        "r-x",
        "rw-",
        "rwx"
    };

    public Permissions () {

        notify["mode"].connect (() => {
            update_ui_from_mode ();
        });

        numeric_entry.changed.connect (() => {
            update_mode_from_numeric ();
        });

        symbolic_entry.changed.connect (() => {
            update_mode_from_symbolic ();
        });

        connect_toggle_signals ();

        update_ui_from_mode ();
    }

    private void connect_toggle_signals () {

        u4.toggled.connect (update_mode_from_buttons);
        u2.toggled.connect (update_mode_from_buttons);
        u1.toggled.connect (update_mode_from_buttons);

        g4.toggled.connect (update_mode_from_buttons);
        g2.toggled.connect (update_mode_from_buttons);
        g1.toggled.connect (update_mode_from_buttons);

        o4.toggled.connect (update_mode_from_buttons);
        o2.toggled.connect (update_mode_from_buttons);
        o1.toggled.connect (update_mode_from_buttons);

        suid.notify["active"].connect (update_mode_from_buttons);
        sgid.notify["active"].connect (update_mode_from_buttons);
        sticky.notify["active"].connect (update_mode_from_buttons);
    }

    private void update_mode_from_buttons () {

        if (updating)
            return;

        uint mode = 0;

        if (u4.active)mode |= 0400;
        if (u2.active)mode |= 0200;
        if (u1.active)mode |= 0100;

        if (g4.active)mode |= 0040;
        if (g2.active)mode |= 0020;
        if (g1.active)mode |= 0010;

        if (o4.active)mode |= 0004;
        if (o2.active)mode |= 0002;
        if (o1.active)mode |= 0001;

        if (suid.active)mode |= 04000;
        if (sgid.active)mode |= 02000;
        if (sticky.active)mode |= 01000;

        this.mode = mode;
    }

    private void update_mode_from_numeric () {

        if (updating)
            return;

        try {
            mode = uint.parse (
                               numeric_entry.text.strip (),
                               8
            );
        } catch (Error e) {
        }
    }

    private uint triplet_to_octal (string triplet) {

        uint value = 0;

        if (triplet[0] != '-')
            value += 4;

        if (triplet[1] != '-')
            value += 2;

        if (triplet[2] == 'x' ||
            triplet[2] == 's' ||
            triplet[2] == 't')
            value += 1;

        return value;
    }

    private void update_mode_from_symbolic () {

        if (updating)
            return;

        string text = symbolic_entry.text.strip ();

        if (text.length != 9)
            return;

        uint special = 0;

        if (text[2] == 's' || text[2] == 'S')
            special |= 4;

        if (text[5] == 's' || text[5] == 'S')
            special |= 2;

        if (text[8] == 't' || text[8] == 'T')
            special |= 1;

        uint user = triplet_to_octal (text.substring (0, 3));
        uint group = triplet_to_octal (text.substring (3, 3));
        uint other = triplet_to_octal (text.substring (6, 3));

        mode =
            (special << 9)
            | (user << 6)
            | (group << 3)
            | other;
    }

    private string mode_to_symbolic () {

        uint special = (mode >> 9) & 7;
        uint user = (mode >> 6) & 7;
        uint group = (mode >> 3) & 7;
        uint other = mode & 7;

        string u = PERM_MAP[user];
        string g = PERM_MAP[group];
        string o = PERM_MAP[other];

        char ux = u[2];
        char gx = g[2];
        char ox = o[2];

        if ((special & 4) != 0)
            ux = (ux == 'x') ? 's' : 'S';

        if ((special & 2) != 0)
            gx = (gx == 'x') ? 's' : 'S';

        if ((special & 1) != 0)
            ox = (ox == 'x') ? 't' : 'T';

        return @"$(u[0])$(u[1])$ux$(g[0])$(g[1])$gx$(o[0])$(o[1])$ox";
    }

    private string mode_to_numeric () {

        uint special = (mode >> 9) & 7;

        if (special == 0)
            return "%03o".printf (mode & 0777);

        return "%04o".printf (mode);
    }

    private void update_ui_from_mode () {

        updating = true;

        numeric_entry.text = mode_to_numeric ();
        symbolic_entry.text = mode_to_symbolic ();

        u4.active = (mode & 0400) != 0;
        u2.active = (mode & 0200) != 0;
        u1.active = (mode & 0100) != 0;

        g4.active = (mode & 0040) != 0;
        g2.active = (mode & 0020) != 0;
        g1.active = (mode & 0010) != 0;

        o4.active = (mode & 0004) != 0;
        o2.active = (mode & 0002) != 0;
        o1.active = (mode & 0001) != 0;

        suid.active = (mode & 04000) != 0;
        sgid.active = (mode & 02000) != 0;
        sticky.active = (mode & 01000) != 0;

        chmod_command_entry.text =
            "chmod %s filename".printf (mode_to_numeric ());

        updating = false;
    }
}
