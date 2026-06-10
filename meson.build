# Define our project
project(
       'concessio', ['c', 'vala'],
	version: '1.0.0',
	license: ['GPL-3.0-or-later'],
	default_options: [ 'warning_level=2', 'werror=false', ],
	meson_version: '>= 1.0.0'
)

APP_ID = 'io.github.ronniedroid.concessio'

# Import the modules
gnome = import('gnome')
i18n = import('i18n')
valac = meson.get_compiler('vala')

srcdir = meson.project_source_root() / 'src'

config_h = configuration_data()
config_h.set_quoted('PACKAGE_VERSION', meson.project_version ())
config_h.set_quoted('GETTEXT_PACKAGE', 'io.github.ronniedroid.concessio')
config_h.set_quoted('LOCALEDIR', get_option('prefix') / get_option('localedir'))
configure_file(output: 'config.h', configuration: config_h)

config_dep = valac.find_library ('config', dirs: srcdir)
config_inc = include_directories('.')

add_project_arguments('-DGETTEXT_PACKAGE="io.github.ronniedroid.concessio"', language: 'c')

concessio_sources = files()
subdir('data')
subdir('src')
subdir('po')

gnome.post_install(
	gtk_update_icon_cache: true,
        update_desktop_database: true,
        glib_compile_schemas: true
)

