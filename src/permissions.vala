/* permissions.vala
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
    [GtkChild]
    private unowned Gtk.Entry numeric_entry;
    [GtkChild]
    private unowned Gtk.Entry symbolic_entry;
    [GtkChild]
    private unowned Gtk.ToggleButton u4;
    [GtkChild]
    private unowned Gtk.ToggleButton u2;
    [GtkChild]
    private unowned Gtk.ToggleButton u1;
    [GtkChild]
    private unowned Gtk.ToggleButton g4;
    [GtkChild]
    private unowned Gtk.ToggleButton g2;
    [GtkChild]
    private unowned Gtk.ToggleButton g1;
    [GtkChild]
    private unowned Gtk.ToggleButton o4;
    [GtkChild]
    private unowned Gtk.ToggleButton o2;
    [GtkChild]
    private unowned Gtk.ToggleButton o1;
    [GtkChild]
    private unowned Gtk.Switch suid;
    [GtkChild]
    private unowned Gtk.Switch sgid;
    [GtkChild]
    private unowned Gtk.Switch sticky;
    [GtkChild]
    private unowned Gtk.Stack file_stack;
    [GtkChild]
    private unowned Gtk.Label file_name_label;
    [GtkChild]
    private unowned Gtk.Label file_path_label;

    public uint mode { get; set; default = 00644; }
    public File? current_file { get; set; default = null; }
    public signal void copied (string text);

    private bool updating = false;

    private const uint MODE_USER_READ = 00400;
    private const uint MODE_USER_WRITE = 00200;
    private const uint MODE_USER_EXECUTE = 00100;
    private const uint MODE_GROUP_READ = 00040;
    private const uint MODE_GROUP_WRITE = 00020;
    private const uint MODE_GROUP_EXECUTE = 00010;
    private const uint MODE_OTHER_READ = 00004;
    private const uint MODE_OTHER_WRITE = 00002;
    private const uint MODE_OTHER_EXECUTE = 00001;
    private const uint MODE_SUID = 04000;
    private const uint MODE_SGID = 02000;
    private const uint MODE_STICKY = 01000;
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

    construct {
        notify["mode"].connect (() => {
            update_ui_from_mode ();
        });
        notify["current-file"].connect (() => {
            update_ui_from_file ();
        });
        connect_toggle_signals ();
        numeric_entry.activate.connect (update_mode_from_numeric);
        symbolic_entry.activate.connect (update_mode_from_symbolic);
        update_ui_from_mode ();
        update_ui_from_file ();
    }

    private void update_ui_from_mode () {
        updating = true;
        numeric_entry.text = mode_to_numeric ();
        numeric_entry.remove_css_class ("error");
        symbolic_entry.text = mode_to_symbolic ();
        symbolic_entry.remove_css_class ("error");

        u4.active = (mode & MODE_USER_READ) != 0;
        u2.active = (mode & MODE_USER_WRITE) != 0;
        u1.active = (mode & MODE_USER_EXECUTE) != 0;

        g4.active = (mode & MODE_GROUP_READ) != 0;
        g2.active = (mode & MODE_GROUP_WRITE) != 0;
        g1.active = (mode & MODE_GROUP_EXECUTE) != 0;

        o4.active = (mode & MODE_OTHER_READ) != 0;
        o2.active = (mode & MODE_OTHER_WRITE) != 0;
        o1.active = (mode & MODE_OTHER_EXECUTE) != 0;

        suid.active = (mode & MODE_SUID) != 0;
        sgid.active = (mode & MODE_SGID) != 0;
        sticky.active = (mode & MODE_STICKY) != 0;

        updating = false;
    }

    private void update_ui_from_file () {
        if (current_file == null) {
            file_name_label.label = "";
            file_path_label.label = "";
            file_stack.visible_child_name = "empty";
        } else {
            file_name_label.label = current_file.get_basename ();
            file_path_label.label = current_file.get_path ();
            file_stack.visible_child_name = "loaded";
        }
    }

    // Toggle buttons

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

        uint new_mode = 0;

        if (u4.active) { new_mode |= MODE_USER_READ; }
        if (u2.active) { new_mode |= MODE_USER_WRITE; }
        if (u1.active) { new_mode |= MODE_USER_EXECUTE; }

        if (g4.active) { new_mode |= MODE_GROUP_READ; }
        if (g2.active) { new_mode |= MODE_GROUP_WRITE; }
        if (g1.active) { new_mode |= MODE_GROUP_EXECUTE; }

        if (o4.active) { new_mode |= MODE_OTHER_READ; }
        if (o2.active) { new_mode |= MODE_OTHER_WRITE; }
        if (o1.active) { new_mode |= MODE_OTHER_EXECUTE; }

        if (suid.active) { new_mode |= MODE_SUID; }
        if (sgid.active) { new_mode |= MODE_SGID; }
        if (sticky.active) { new_mode |= MODE_STICKY; }

        mode = new_mode;
    }

    // Numeric entry

    private string mode_to_numeric () {
        return "%03o".printf (mode);
    }

    private void update_mode_from_numeric () {
        if (updating) {
            return;
        }

        uint parsed;
        if (Concessio.Util.try_parse_octal (numeric_entry.text, out parsed)) {
            mode = parsed;
            numeric_entry.remove_css_class ("error");
        } else {
            numeric_entry.add_css_class ("error");
        }
    }

    // Symbolic entry

    private string mode_to_symbolic () {
        uint user = (mode >> 6) & 7;
        uint group = (mode >> 3) & 7;
        uint other = mode & 7;

        string u = PERM_MAP[user];
        string g = PERM_MAP[group];
        string o = PERM_MAP[other];

        char ux = u[2];
        char gx = g[2];
        char ox = o[2];

        if ((mode & MODE_SUID) != 0) {
            ux = (ux == 'x') ? 's' : 'S';
        }
        if ((mode & MODE_SGID) != 0) {
            gx = (gx == 'x') ? 's' : 'S';
        }
        if ((mode & MODE_STICKY) != 0) {
            ox = (ox == 'x') ? 't' : 'T';
        }

        string user_str = u.substring (0, 2) + ux.to_string ();
        string group_str = g.substring (0, 2) + gx.to_string ();
        string other_str = o.substring (0, 2) + ox.to_string ();

        return user_str + group_str + other_str;
    }

    private void update_mode_from_symbolic () {
        if (updating) {
            return;
        }

        string text = symbolic_entry.text.strip ();

        if (text.length != 9) {
            symbolic_entry.add_css_class ("error");
            return;
        }

        uint user, group, other;
        bool user_ok = triplet_to_octal (text.substring (0, 3), out user);
        bool group_ok = triplet_to_octal (text.substring (3, 3), out group);
        bool other_ok = triplet_to_octal (text.substring (6, 3), out other);

        if (!user_ok || !group_ok || !other_ok) {
            symbolic_entry.add_css_class ("error");
            return;
        }

        uint special = 0;
        if (text[2] == 's' || text[2] == 'S') {
            special |= 4;
        }
        if (text[5] == 's' || text[5] == 'S') {
            special |= 2;
        }
        if (text[8] == 't' || text[8] == 'T') {
            special |= 1;
        }

        mode = (special << 9) | (user << 6) | (group << 3) | other;
        symbolic_entry.remove_css_class ("error");
    }

    private bool triplet_to_octal (string triplet, out uint value) {
        value = 0;

        if (triplet.length != 3) {
            return false;
        }

        char r = triplet[0];
        char w = triplet[1];
        char x = triplet[2];

        uint result = 0;

        if (r == 'r') {
            result += 4;
        } else if (r != '-') {
            return false;
        }

        if (w == 'w') {
            result += 2;
        } else if (w != '-') {
            return false;
        }

        if (x == 'x' || x == 's' || x == 't') {
            result += 1;
        } else if (x != '-' && x != 'S' && x != 'T') {
            return false;
        }

        value = result;
        return true;
    }

    // Callbacks

    [GtkCallback]
    private void commit_numeric () {
        numeric_entry.activate ();
    }

    [GtkCallback]
    private void commit_symbolic () {
        symbolic_entry.activate ();
    }

    [GtkCallback]
    private void copy_numeric () {
        Concessio.Util.copy_to_clipboard (this, numeric_entry.text);
    }

    [GtkCallback]
    private void copy_symbolic () {
        Concessio.Util.copy_to_clipboard (this, symbolic_entry.text);
    }

    [GtkCallback]
    private void close_file () {
        current_file = null;
    }

    public void load_file (File file) throws Error {
        FileInfo info = file.query_info (
                                         FileAttribute.UNIX_MODE,
                                         FileQueryInfoFlags.NONE,
                                         null
        );

        mode = info.get_attribute_uint32 (FileAttribute.UNIX_MODE) & 07777;
        current_file = file;
    }
}
